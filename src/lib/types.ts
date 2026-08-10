export type Priority = "CRITICAL" | "HIGH" | "NORMAL" | "LOW";
export type RequestStatus = "WAITING" | "CALLED" | "SERVING" | "COMPLETED" | "LEFT";

export type QueueId = "critical" | "priority" | "general" | "documents" | "support";

export interface Queue {
  id: QueueId;
  name: string;
  code: string;
  paused: boolean;
  slaMinutes: number;
}

export interface ServiceRequest {
  id: string;
  token: number;
  priority: Priority;
  suggestedPriority: Priority;
  queueId: QueueId;
  service: string;
  description: string;
  status: RequestStatus;
  waitedMinutes: number;
  submittedAt: string;
  counterId?: string | undefined;
  reason?: string | undefined;
  reviewed: boolean;
  mine?: boolean | undefined;
  channel: "Web" | "Mobile" | "Kiosk" | "Front desk";
}

export interface Counter {
  id: string;
  name: string;
  staffId: string;
  status: "AVAILABLE" | "SERVING" | "PAUSED" | "OFFLINE";
  servingToken?: number | undefined;
  elapsedSeconds: number;
  queues: QueueId[];
  servedToday: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: "Operator" | "Triage lead" | "Supervisor" | "Admin";
  shift: string;
  status: "On duty" | "Break" | "Off duty";
  servedToday: number;
  avgServiceMin: number;
}

export interface PriorityRule {
  id: string;
  condition: string;
  detail: string;
  priority: Priority;
  queueId: QueueId;
  enabled: boolean;
  weight: number;
  matchesToday: number;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: "position" | "counter" | "eta" | "review" | "system";
  unread: boolean;
}

export interface AuditEvent {
  id: string;
  time: string;
  actor: string;
  action: string;
  requestId: string;
  from: string;
  to: string;
}

export interface HistoryRecord {
  id: string;
  priority: Priority;
  queue: string;
  waitMinutes: number;
  serviceMinutes: number;
  status: "Completed" | "No-show" | "Transferred";
  date: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  requests: number;
  lastVisit: string;
  status: "Active" | "Invited" | "Suspended";
  tier: "Standard" | "Priority";
}
