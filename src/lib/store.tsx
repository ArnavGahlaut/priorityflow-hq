import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import {
  INITIAL_AUDIT,
  INITIAL_NOTIFICATIONS,
  INITIAL_RULES,
  PRIORITY_ORDER,
  STAFF,
  queueName,
} from "./demo-data";
import { getToken, getUser } from "./auth";
import type {
  AppNotification,
  AuditEvent,
  Counter,
  Priority,
  PriorityRule,
  Queue,
  QueueId,
  ServiceRequest,
} from "./types";

interface SubmitPayload {
  service: string;
  description: string;
  queueId: QueueId;
  priority: Priority;
  reason: string;
  contactPreference: string;
  accessibility: string[];
  referredBy: string;
}

interface Store {
  requests: ServiceRequest[];
  counters: Counter[];
  queues: Queue[];
  rules: PriorityRule[];
  notifications: AppNotification[];
  audit: AuditEvent[];
  nextToken: number;
  myRequest?: ServiceRequest | undefined;
  waiting: ServiceRequest[];
  serving: ServiceRequest[];
  metrics: {
    waiting: number;
    highPriority: number;
    serving: number;
    avgWaitSeconds: number;
    servedToday: number;
  };
  waitingByQueue: (id: QueueId) => ServiceRequest[];
  waitingByPriority: (p: Priority) => ServiceRequest[];
  positionOf: (id: string) => number;
  etaMinutesFor: (id: string) => number;
  callNext: (counterId: string) => void;
  callByToken: (counterId: string, token: number) => void;
  startService: (counterId: string) => void;
  complete: (counterId: string) => void;
  transfer: (requestId: string, queueId: QueueId) => void;
  toggleQueuePause: (queueId: QueueId) => void;
  toggleCounterPause: (counterId: string) => void;
  setPriority: (requestId: string, priority: Priority, actor?: string) => void;
  confirmPriority: (requestId: string) => void;
  sendForReview: (requestId: string) => void;
  submitRequest: (payload: SubmitPayload) => Promise<ServiceRequest | undefined>;
  leaveQueue: (requestId: string) => void;
  toggleRule: (ruleId: string) => void;
  updateRule: (ruleId: string, patch: Partial<PriorityRule>) => void;
  markNotificationsRead: () => void;
  loading: boolean;
}

const StoreContext = createContext<Store | null>(null);
const API_BASE = "https://priorityflow-api.onrender.com/api/queue";

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function priorityRank(p: Priority) {
  return PRIORITY_ORDER.indexOf(p);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [rules] = useState<PriorityRule[]>(INITIAL_RULES);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [audit] = useState<AuditEvent[]>(INITIAL_AUDIT);
  const [servedToday] = useState(186);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const [reqRes, counterRes, queueRes] = await Promise.all([
        fetch(`${API_BASE}/requests`, { headers: authHeaders() }),
        fetch(`${API_BASE}/counters`, { headers: authHeaders() }),
        fetch(`${API_BASE}/queues`, { headers: authHeaders() }),
      ]);
      if (reqRes.ok) {
        const data = await reqRes.json();
        setRequests(data.map((r: any) => ({ ...r, id: r._id })));
      }
      if (counterRes.ok) {
        const data = await counterRes.json();
        setCounters((prev) =>
          data.map((c: any) => {
            const existing = prev.find((p) => p.id === c._id);
            const keepElapsed =
              existing && existing.status === "SERVING" && c.status === "SERVING";
            return {
              ...c,
              id: c._id,
              elapsedSeconds: keepElapsed ? existing.elapsedSeconds : c.elapsedSeconds,
            };
          }),
        );
      }
      if (queueRes.ok) setQueues(await queueRes.json());
    } catch (err) {
      console.error("Failed to fetch queue data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const poll = setInterval(fetchAll, 4000);
    return () => clearInterval(poll);
  }, [fetchAll]);

  useEffect(() => {
    const tick = setInterval(() => {
      setCounters((prev) =>
        prev.map((c) =>
          c.status === "SERVING" ? { ...c, elapsedSeconds: c.elapsedSeconds + 1 } : c,
        ),
      );
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const waiting = useMemo(
    () =>
      requests
        .filter((r) => r.status === "WAITING" || r.status === "CALLED")
        .map((r) => ({
          ...r,
          waitedMinutes: Math.floor(
            (Date.now() - new Date(r.submittedAt).getTime()) / 60000,
          ),
        }))
        .sort(
          (a, b) =>
            priorityRank(a.priority) - priorityRank(b.priority) ||
            b.waitedMinutes - a.waitedMinutes ||
            a.token - b.token,
        ),
    [requests],
  );

  const serving = useMemo(() => requests.filter((r) => r.status === "SERVING"), [requests]);

  const myRequest = useMemo(() => {
    const user = getUser();
    return requests.find(
      (r) => r.owner === user?.id && r.status !== "COMPLETED" && r.status !== "LEFT",
    );
  }, [requests]);

  const metrics = useMemo(() => {
    const waitSum = waiting.reduce((acc, r) => acc + r.waitedMinutes, 0);
    return {
      waiting: waiting.length,
      highPriority: waiting.filter((r) => r.priority === "HIGH" || r.priority === "CRITICAL").length,
      serving: serving.length,
      avgWaitSeconds: waiting.length ? Math.round((waitSum / waiting.length) * 60) : 0,
      servedToday,
    };
  }, [waiting, serving, servedToday]);

  const waitingByQueue = useCallback(
    (id: QueueId) => waiting.filter((r) => r.queueId === id),
    [waiting],
  );
  const waitingByPriority = useCallback(
    (p: Priority) => waiting.filter((r) => r.priority === p),
    [waiting],
  );

  const positionOf = useCallback(
    (id: string) => {
      const target = waiting.find((r) => r.id === id);
      if (!target) return 0;
      return waiting.filter((r) => r.queueId === target.queueId).findIndex((r) => r.id === id) + 1;
    },
    [waiting],
  );

  const etaMinutesFor = useCallback(
    (id: string) => {
      const pos = positionOf(id);
      const target = waiting.find((r) => r.id === id);
      if (!pos || !target) return 0;
      const openCounters =
        counters.filter((c) => c.queues.includes(target.queueId) && c.status !== "PAUSED").length ||
        1;
      const perService = target.priority === "CRITICAL" ? 3 : target.priority === "HIGH" ? 6 : 9;
      return Math.max(1, Math.round(((pos - 1) * perService) / openCounters) + 2);
    },
    [waiting, counters, positionOf],
  );

  const callNext = useCallback(
    async (counterId: string) => {
      try {
        const res = await fetch(`${API_BASE}/counters/${counterId}/call-next`, {
          method: "PATCH",
          headers: authHeaders(),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Could not call next");
          return;
        }
        toast.success(`Token #${data.request.token} called`);
        fetchAll();
      } catch {
        toast.error("Network error");
      }
    },
    [fetchAll],
  );

  const callByToken = useCallback(
    async (counterId: string, token: number) => {
      try {
        const res = await fetch(`${API_BASE}/counters/${counterId}/call-token`, {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Could not call token");
          return;
        }
        toast.success(`Token #${data.request.token} called`);
        fetchAll();
      } catch {
        toast.error("Network error");
      }
    },
    [fetchAll],
  );

  const startService = useCallback(
    async (counterId: string) => {
      try {
        const res = await fetch(`${API_BASE}/counters/${counterId}/start`, {
          method: "PATCH",
          headers: authHeaders(),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Could not start service");
          return;
        }
        fetchAll();
      } catch {
        toast.error("Network error");
      }
    },
    [fetchAll],
  );

  const complete = useCallback(
    async (counterId: string) => {
      try {
        const res = await fetch(`${API_BASE}/counters/${counterId}/complete`, {
          method: "PATCH",
          headers: authHeaders(),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Could not complete");
          return;
        }
        toast.success(`Token #${data.request.token} completed`);
        fetchAll();
      } catch {
        toast.error("Network error");
      }
    },
    [fetchAll],
  );

  const submitRequest = useCallback(
    async (payload: SubmitPayload) => {
      try {
        const res = await fetch(`${API_BASE}/requests`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            service: payload.service,
            description: payload.description,
            queueId: payload.queueId,
            priority: payload.priority,
            reason: payload.reason,
            channel: "Web",
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Could not submit request");
          return undefined;
        }
        toast.success(`Token #${data.token} submitted`);
        fetchAll();
        return data as ServiceRequest;
      } catch {
        toast.error("Network error");
        return undefined;
      }
    },
    [fetchAll],
  );

  const transfer = useCallback(
    async (requestId: string, queueId: QueueId) => {
      const res = await fetch(`${API_BASE}/requests/${requestId}/transfer`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ queueId }),
      });
      if (res.ok) {
        toast.success("Transferred");
        fetchAll();
      } else toast.error("Transfer failed");
    },
    [fetchAll],
  );

  const toggleQueuePause = useCallback(
    async (queueId: QueueId) => {
      const res = await fetch(`${API_BASE}/queues/${queueId}/toggle-pause`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (res.ok) {
        toast.success("Queue updated");
        fetchAll();
      } else toast.error("Failed");
    },
    [fetchAll],
  );

  const toggleCounterPause = useCallback((_counterId: string) => {
    toast.message("Counter pause coming soon");
  }, []);

  const setPriority = useCallback(
    async (requestId: string, priority: Priority) => {
      const res = await fetch(`${API_BASE}/requests/${requestId}/priority`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ priority }),
      });
      if (res.ok) {
        toast.success(`Priority set to ${priority}`);
        fetchAll();
      } else toast.error("Failed");
    },
    [fetchAll],
  );

  const confirmPriority = useCallback(
    async (requestId: string) => {
      const res = await fetch(`${API_BASE}/requests/${requestId}/confirm`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (res.ok) {
        toast.success("Confirmed");
        fetchAll();
      } else toast.error("Failed");
    },
    [fetchAll],
  );

  const sendForReview = useCallback(
    async (requestId: string) => {
      const res = await fetch(`${API_BASE}/requests/${requestId}/review`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (res.ok) {
        toast.success("Sent for review");
        fetchAll();
      } else toast.error("Failed");
    },
    [fetchAll],
  );

  const leaveQueue = useCallback(
    async (requestId: string) => {
      const res = await fetch(`${API_BASE}/requests/${requestId}/leave`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (res.ok) {
        toast.success("Left queue");
        fetchAll();
      } else toast.error("Failed");
    },
    [fetchAll],
  );

  const toggleRule = useCallback((_ruleId: string) => {}, []);
  const updateRule = useCallback((_ruleId: string, _patch: Partial<PriorityRule>) => {}, []);
  const markNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const value: Store = {
    requests,
    counters,
    queues,
    rules,
    notifications,
    audit,
    nextToken: 0,
    myRequest,
    waiting,
    serving,
    metrics,
    waitingByQueue,
    waitingByPriority,
    positionOf,
    etaMinutesFor,
    callNext,
    callByToken,
    startService,
    complete,
    transfer,
    toggleQueuePause,
    toggleCounterPause,
    setPriority,
    confirmPriority,
    sendForReview,
    submitRequest,
    leaveQueue,
    toggleRule,
    updateRule,
    markNotificationsRead,
    loading,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function staffFor(staffId: string) {
  return STAFF.find((s) => s.id === staffId);
}

export function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function formatWait(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}
