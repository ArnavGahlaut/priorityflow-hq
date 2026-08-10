import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import {
  INITIAL_AUDIT,
  INITIAL_COUNTERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REQUESTS,
  INITIAL_RULES,
  PRIORITY_ORDER,
  QUEUES,
  STAFF,
  queueName,
} from "./demo-data";
import { evaluatePriority } from "./priority-engine";
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
  startService: (counterId: string) => void;
  complete: (counterId: string) => void;
  transfer: (requestId: string, queueId: QueueId) => void;
  toggleQueuePause: (queueId: QueueId) => void;
  toggleCounterPause: (counterId: string) => void;
  setPriority: (requestId: string, priority: Priority, actor?: string) => void;
  confirmPriority: (requestId: string) => void;
  sendForReview: (requestId: string) => void;
  submitRequest: (payload: SubmitPayload) => ServiceRequest;
  leaveQueue: (requestId: string) => void;
  toggleRule: (ruleId: string) => void;
  updateRule: (ruleId: string, patch: Partial<PriorityRule>) => void;
  markNotificationsRead: () => void;
}

const StoreContext = createContext<Store | null>(null);

let seq = 9000;
const uid = (prefix: string) => `${prefix}-${++seq}`;

function stamp(offsetSeconds = 0) {
  const d = new Date(Date.now() + offsetSeconds * 1000);
  return d.toTimeString().slice(0, 8);
}

function priorityRank(p: Priority) {
  return PRIORITY_ORDER.indexOf(p);
}

const INCOMING_POOL: { description: string; service: string }[] = [
  { description: "Routine prescription renewal, no new symptoms.", service: "General Consultation" },
  { description: "Pain in lower back getting worse since yesterday.", service: "Priority Assessment" },
  { description: "Needs opening hours and a copy of last visit records.", service: "Support Desk" },
  { description: "Passport and proof of address for verification.", service: "Document Verification" },
  { description: "Shortness of breath after walking short distances.", service: "Priority Assessment" },
  { description: "Annual check-in, feeling well.", service: "General Consultation" },
  { description: "Wound from three days ago now spreading redness.", service: "Priority Assessment" },
  { description: "Follow-up on physiotherapy plan.", service: "General Consultation" },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  const [counters, setCounters] = useState<Counter[]>(INITIAL_COUNTERS);
  const [queues, setQueues] = useState<Queue[]>(QUEUES);
  const [rules, setRules] = useState<PriorityRule[]>(INITIAL_RULES);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [audit, setAudit] = useState<AuditEvent[]>(INITIAL_AUDIT);
  const [nextToken, setNextToken] = useState(148);
  const [servedToday, setServedToday] = useState(186);
  const incomingIndex = useRef(0);

  const log = useCallback((e: Omit<AuditEvent, "id" | "time">) => {
    setAudit((prev) => [{ id: uid("aud"), time: stamp(), ...e }, ...prev].slice(0, 120));
  }, []);

  const notify = useCallback((n: Omit<AppNotification, "id" | "time" | "unread">) => {
    setNotifications((prev) =>
      [{ id: uid("ntf"), time: stamp(), unread: true, ...n }, ...prev].slice(0, 40),
    );
  }, []);

  /* ---- live simulation: service timers, arrivals, waiting clocks ---- */
  useEffect(() => {
    const tick = setInterval(() => {
      setCounters((prev) =>
        prev.map((c) =>
          c.status === "SERVING" ? { ...c, elapsedSeconds: c.elapsedSeconds + 1 } : c,
        ),
      );
    }, 1000);

    const waitClock = setInterval(() => {
      setRequests((prev) =>
        prev.map((r) =>
          r.status === "WAITING" ? { ...r, waitedMinutes: r.waitedMinutes + 1 } : r,
        ),
      );
    }, 20000);

    const arrivals = setInterval(() => {
      const seed = INCOMING_POOL[incomingIndex.current % INCOMING_POOL.length]!;
      incomingIndex.current += 1;
      const evaluation = evaluatePriority(seed.description, seed.service, rules);
      setNextToken((t) => {
        const token = t + 1;
        setRequests((prev) => [
          ...prev,
          {
            id: uid("REQ"),
            token,
            priority: evaluation.priority,
            suggestedPriority: evaluation.priority,
            queueId: evaluation.queueId,
            service: seed.service,
            description: seed.description,
            status: "WAITING",
            waitedMinutes: 0,
            submittedAt: stamp(),
            reason: evaluation.reason,
            reviewed: evaluation.priority === "NORMAL" || evaluation.priority === "LOW",
            channel: "Web",
          },
        ]);
        return token;
      });
    }, 14000);

    return () => {
      clearInterval(tick);
      clearInterval(waitClock);
      clearInterval(arrivals);
    };
  }, [rules]);

  const waiting = useMemo(
    () =>
      requests
        .filter((r) => r.status === "WAITING" || r.status === "CALLED")
        .sort(
          (a, b) =>
            priorityRank(a.priority) - priorityRank(b.priority) ||
            b.waitedMinutes - a.waitedMinutes ||
            a.token - b.token,
        ),
    [requests],
  );

  const serving = useMemo(() => requests.filter((r) => r.status === "SERVING"), [requests]);
  const myRequest = useMemo(
    () => requests.find((r) => r.mine && r.status !== "COMPLETED" && r.status !== "LEFT"),
    [requests],
  );

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
    (counterId: string) => {
      const counter = counters.find((c) => c.id === counterId);
      if (!counter) return;
      if (counter.status === "PAUSED") {
        toast.error(`${counter.name} is paused`, { description: "Resume the counter to call next." });
        return;
      }
      if (counter.status === "SERVING") {
        toast.error(`${counter.name} is busy`, { description: "Complete the active service first." });
        return;
      }
      const activeQueues = counter.queues.filter(
        (q) => !queues.find((qq) => qq.id === q)?.paused,
      );
      const next = waiting.find((r) => r.status === "WAITING" && activeQueues.includes(r.queueId));
      if (!next) {
        toast.message("Nothing to call", { description: "No waiting requests match this counter." });
        return;
      }
      setRequests((prev) =>
        prev.map((r) => (r.id === next.id ? { ...r, status: "CALLED", counterId } : r)),
      );
      setCounters((prev) =>
        prev.map((c) => (c.id === counterId ? { ...c, servingToken: next.token } : c)),
      );
      log({
        actor: "Staff · Operations",
        action: "Called next",
        requestId: next.id,
        from: "WAITING",
        to: "CALLED",
      });
      toast.success(`Token #${next.token} called`, {
        description: `${next.priority} · ${counter.name}`,
      });
      if (next.mine) {
        notify({
          title: `Please proceed to ${counter.name}`,
          body: `Token #${next.token} has been called.`,
          kind: "counter",
        });
      }
    },
    [counters, queues, waiting, log, notify],
  );

  const startService = useCallback(
    (counterId: string) => {
      const counter = counters.find((c) => c.id === counterId);
      const called = requests.find((r) => r.counterId === counterId && r.status === "CALLED");
      if (!counter || !called) {
        toast.error("No called request", { description: "Call next before starting service." });
        return;
      }
      setRequests((prev) =>
        prev.map((r) => (r.id === called.id ? { ...r, status: "SERVING" } : r)),
      );
      setCounters((prev) =>
        prev.map((c) =>
          c.id === counterId ? { ...c, status: "SERVING", elapsedSeconds: 0 } : c,
        ),
      );
      log({
        actor: "Staff · Operations",
        action: "Service started",
        requestId: called.id,
        from: "CALLED",
        to: "SERVING",
      });
    },
    [counters, requests, log],
  );

  const complete = useCallback(
    (counterId: string) => {
      const counter = counters.find((c) => c.id === counterId);
      const active = requests.find(
        (r) => r.counterId === counterId && (r.status === "SERVING" || r.status === "CALLED"),
      );
      if (!counter || !active) {
        toast.error("Nothing in service at this counter");
        return;
      }
      setRequests((prev) =>
        prev.map((r) => (r.id === active.id ? { ...r, status: "COMPLETED" } : r)),
      );
      setCounters((prev) =>
        prev.map((c) =>
          c.id === counterId
            ? {
                ...c,
                status: "AVAILABLE",
                servingToken: undefined,
                elapsedSeconds: 0,
                servedToday: c.servedToday + 1,
              }
            : c,
        ),
      );
      setServedToday((n) => n + 1);
      log({
        actor: "Staff · Operations",
        action: "Service completed",
        requestId: active.id,
        from: "SERVING",
        to: "COMPLETED",
      });
      toast.success(`Token #${active.token} completed`, { description: counter.name });
    },
    [counters, requests, log],
  );

  const transfer = useCallback(
    (requestId: string, queueId: QueueId) => {
      const target = requests.find((r) => r.id === requestId);
      if (!target) return;
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, queueId, status: "WAITING", counterId: undefined, waitedMinutes: 0 }
            : r,
        ),
      );
      setCounters((prev) =>
        prev.map((c) =>
          c.servingToken === target.token
            ? { ...c, status: "AVAILABLE", servingToken: undefined, elapsedSeconds: 0 }
            : c,
        ),
      );
      log({
        actor: "Staff · Operations",
        action: "Request transferred",
        requestId,
        from: queueName(target.queueId),
        to: queueName(queueId),
      });
      toast.success(`Token #${target.token} transferred`, { description: queueName(queueId) });
    },
    [requests, log],
  );

  const toggleQueuePause = useCallback(
    (queueId: QueueId) => {
      setQueues((prev) => {
        const next = prev.map((q) => (q.id === queueId ? { ...q, paused: !q.paused } : q));
        const q = next.find((x) => x.id === queueId)!;
        log({
          actor: "Staff · Operations",
          action: q.paused ? "Queue paused" : "Queue resumed",
          requestId: `QUEUE-${q.code}`,
          from: q.paused ? "active" : "paused",
          to: q.paused ? "paused" : "active",
        });
        toast.message(`${q.name} ${q.paused ? "paused" : "resumed"}`);
        return next;
      });
    },
    [log],
  );

  const toggleCounterPause = useCallback(
    (counterId: string) => {
      setCounters((prev) =>
        prev.map((c) =>
          c.id === counterId
            ? { ...c, status: c.status === "PAUSED" ? "AVAILABLE" : "PAUSED" }
            : c,
        ),
      );
    },
    [],
  );

  const setPriority = useCallback(
    (requestId: string, priority: Priority, actor = "Staff #24 · Lena Fischer") => {
      const target = requests.find((r) => r.id === requestId);
      if (!target || target.priority === priority) return;
      const targetQueue: QueueId =
        priority === "CRITICAL" ? "critical" : priority === "HIGH" ? "priority" : target.queueId;
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, priority, queueId: targetQueue, reviewed: true } : r,
        ),
      );
      log({
        actor,
        action: "Priority changed",
        requestId,
        from: target.priority,
        to: priority,
      });
      toast.success(`Token #${target.token} set to ${priority}`);
      if (target.mine) {
        notify({
          title: "Your priority request has been reviewed",
          body: `Priority updated to ${priority} by a triage lead.`,
          kind: "review",
        });
      }
    },
    [requests, log, notify],
  );

  const confirmPriority = useCallback(
    (requestId: string) => {
      const target = requests.find((r) => r.id === requestId);
      if (!target) return;
      setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, reviewed: true } : r)));
      log({
        actor: "Staff #24 · Lena Fischer",
        action: "Priority confirmed",
        requestId,
        from: "suggested",
        to: target.priority,
      });
      toast.success(`Priority confirmed for #${target.token}`);
    },
    [requests, log],
  );

  const sendForReview = useCallback(
    (requestId: string) => {
      const target = requests.find((r) => r.id === requestId);
      if (!target) return;
      setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, reviewed: false } : r)));
      log({
        actor: "Staff · Operations",
        action: "Sent for supervisor review",
        requestId,
        from: "operator",
        to: "supervisor",
      });
      toast.message(`#${target.token} sent for supervisor review`);
    },
    [requests, log],
  );

  const submitRequest = useCallback(
    (payload: SubmitPayload) => {
      const token = nextToken + 1;
      setNextToken(token);
      const created: ServiceRequest = {
        id: uid("REQ"),
        token,
        priority: payload.priority,
        suggestedPriority: payload.priority,
        queueId: payload.queueId,
        service: payload.service,
        description: payload.description,
        status: "WAITING",
        waitedMinutes: 0,
        submittedAt: stamp(),
        reason: payload.reason,
        reviewed: payload.priority === "NORMAL" || payload.priority === "LOW",
        mine: true,
        channel: "Mobile",
      };
      setRequests((prev) => [
        ...prev.map((r) => (r.mine && r.status === "WAITING" ? { ...r, mine: false } : r)),
        created,
      ]);
      log({
        actor: "User · Jordan Avery",
        action: "Request submitted",
        requestId: created.id,
        from: "unrouted",
        to: queueName(payload.queueId),
      });
      notify({
        title: "Request received",
        body: `Token #${token} routed to ${queueName(payload.queueId)}.`,
        kind: "system",
      });
      return created;
    },
    [nextToken, log, notify],
  );

  const leaveQueue = useCallback(
    (requestId: string) => {
      const target = requests.find((r) => r.id === requestId);
      if (!target) return;
      setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: "LEFT" } : r)));
      log({
        actor: "User · Jordan Avery",
        action: "Left queue",
        requestId,
        from: target.status,
        to: "LEFT",
      });
      toast.message(`You left the queue`, { description: `Token #${target.token} released.` });
    },
    [requests, log],
  );

  const toggleRule = useCallback(
    (ruleId: string) => {
      setRules((prev) => {
        const next = prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
        const rule = next.find((r) => r.id === ruleId)!;
        log({
          actor: "Admin · Priya Raghavan",
          action: rule.enabled ? "Rule enabled" : "Rule disabled",
          requestId: `RULE-${rule.id}`,
          from: rule.enabled ? "disabled" : "enabled",
          to: rule.enabled ? "enabled" : "disabled",
        });
        return next;
      });
    },
    [log],
  );

  const updateRule = useCallback((ruleId: string, patch: Partial<PriorityRule>) => {
    setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, ...patch } : r)));
  }, []);

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
    nextToken,
    myRequest,
    waiting,
    serving,
    metrics,
    waitingByQueue,
    waitingByPriority,
    positionOf,
    etaMinutesFor,
    callNext,
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
