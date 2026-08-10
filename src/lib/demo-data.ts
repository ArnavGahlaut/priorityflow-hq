import type {
  AppNotification,
  AppUser,
  AuditEvent,
  Counter,
  HistoryRecord,
  PriorityRule,
  Priority,
  Queue,
  QueueId,
  ServiceRequest,
  StaffMember,
} from "./types";

/** Deterministic pseudo-random so SSR and client render identical demo data. */
function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export const QUEUES: Queue[] = [
  { id: "critical", name: "Critical Response", code: "CRT", paused: false, slaMinutes: 2 },
  { id: "priority", name: "Priority Assessment", code: "PRA", paused: false, slaMinutes: 10 },
  { id: "general", name: "General Consultation", code: "GEN", paused: false, slaMinutes: 25 },
  { id: "documents", name: "Document Verification", code: "DOC", paused: false, slaMinutes: 20 },
  { id: "support", name: "Support Desk", code: "SUP", paused: true, slaMinutes: 18 },
];

export const SERVICES: { name: string; queueId: QueueId; blurb: string; avgMinutes: number }[] = [
  {
    name: "General Consultation",
    queueId: "general",
    blurb: "Standard walk-in consultation with the next available provider.",
    avgMinutes: 12,
  },
  {
    name: "Priority Assessment",
    queueId: "priority",
    blurb: "Fast-tracked review when your request contains urgency indicators.",
    avgMinutes: 8,
  },
  {
    name: "Support Desk",
    queueId: "support",
    blurb: "Account, billing and follow-up questions.",
    avgMinutes: 9,
  },
  {
    name: "Document Verification",
    queueId: "documents",
    blurb: "Identity and paperwork checks at a verification counter.",
    avgMinutes: 6,
  },
];

const DESCRIPTIONS: Record<Priority, string[]> = {
  CRITICAL: [
    "Reported sudden severe symptoms and cannot wait — escalation requested at front desk.",
    "Accompanying person reports the requester became unresponsive in the waiting area.",
    "Requester flagged as deteriorating during pre-screening; asked for immediate staff review.",
  ],
  HIGH: [
    "Severe pain since this morning, getting worse over the last hour.",
    "Follow-up after abnormal result, was told to return urgently if symptoms returned.",
    "Symptoms escalated overnight; unable to keep fluids down.",
    "Chest tightness after climbing stairs, resolved but wants to be checked today.",
    "Wound from two days ago now warm and spreading redness.",
  ],
  NORMAL: [
    "Routine consultation for an ongoing prescription review.",
    "Annual check-in, no new complaints.",
    "Needs a referral letter renewed before next month.",
    "Mild recurring headaches, wants advice on next steps.",
    "Follow-up on physiotherapy plan progress.",
  ],
  LOW: [
    "General enquiry about opening hours and available services.",
    "Requesting a copy of a previous visit summary.",
    "Wants to update contact details on file.",
  ],
};

const REASONS: Record<Priority, string> = {
  CRITICAL: "Rule CRT-01 matched: escalation keyword + staff-initiated flag.",
  HIGH: "Rule PRA-02 matched: request contains configured high-priority indicators.",
  NORMAL: "No priority indicators matched; routed by selected service.",
  LOW: "Rule LOW-01 matched: informational request, no service dependency.",
};

const CHANNELS = ["Web", "Mobile", "Kiosk", "Front desk"] as const;

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

/** Clock strings are fixed to a demo shift so SSR output is stable. */
export const DEMO_CLOCK_START = { h: 13, m: 4 };

function clock(offsetMinutes: number) {
  const total = DEMO_CLOCK_START.h * 60 + DEMO_CLOCK_START.m + offsetMinutes;
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
}

function buildRequests(): ServiceRequest[] {
  const rand = lcg(20260810);
  const rows: ServiceRequest[] = [];

  const spec: { priority: Priority; count: number; queueId: QueueId; service: string }[] = [
    { priority: "CRITICAL", count: 2, queueId: "critical", service: "Priority Assessment" },
    { priority: "HIGH", count: 6, queueId: "priority", service: "Priority Assessment" },
    { priority: "NORMAL", count: 17, queueId: "general", service: "General Consultation" },
    { priority: "NORMAL", count: 6, queueId: "documents", service: "Document Verification" },
    { priority: "LOW", count: 5, queueId: "support", service: "Support Desk" },
  ];

  let token = 101;
  let i = 0;
  for (const group of spec) {
    for (let k = 0; k < group.count; k++) {
      const pool = DESCRIPTIONS[group.priority];
      const t = group.priority === "CRITICAL" ? 201 + k : token++;
      const waited =
        group.priority === "CRITICAL"
          ? 1 + Math.floor(rand() * 2)
          : group.priority === "HIGH"
            ? 4 + Math.floor(rand() * 12)
            : 6 + Math.floor(rand() * 34);
      rows.push({
        id: `REQ-${4180 + i}`,
        token: t,
        priority: group.priority,
        suggestedPriority: group.priority,
        queueId: group.queueId,
        service: group.service,
        description: pool[Math.floor(rand() * pool.length)]!,
        status: "WAITING",
        waitedMinutes: waited,
        submittedAt: clock(-waited),
        reason: REASONS[group.priority],
        reviewed: group.priority === "NORMAL" || group.priority === "LOW" ? true : rand() > 0.6,
        channel: CHANNELS[Math.floor(rand() * CHANNELS.length)]!,
      });
      i++;
    }
  }

  // The signed-in demo user's own live request.
  rows.unshift({
    id: "REQ-4179",
    token: 107,
    priority: "HIGH",
    suggestedPriority: "HIGH",
    queueId: "priority",
    service: "Priority Assessment",
    description:
      "Persistent shortness of breath since last night, worse when lying down. Was advised to come in if it did not settle.",
    status: "WAITING",
    waitedMinutes: 9,
    submittedAt: clock(-9),
    reason: REASONS.HIGH,
    reviewed: false,
    mine: true,
    channel: "Mobile",
  });

  // Currently being served at counters.
  const serving: ServiceRequest[] = [
    { token: 104, counterId: "c2", elapsed: 6, queueId: "general" as QueueId, priority: "NORMAL" as Priority },
    { token: 105, counterId: "c3", elapsed: 3, queueId: "priority" as QueueId, priority: "HIGH" as Priority },
    { token: 106, counterId: "c5", elapsed: 11, queueId: "documents" as QueueId, priority: "NORMAL" as Priority },
    { token: 200, counterId: "c6", elapsed: 2, queueId: "critical" as QueueId, priority: "CRITICAL" as Priority },
  ].map((s, idx) => ({
    id: `REQ-${4160 + idx}`,
    token: s.token,
    priority: s.priority,
    suggestedPriority: s.priority,
    queueId: s.queueId,
    service: QUEUES.find((q) => q.id === s.queueId)!.name,
    description: DESCRIPTIONS[s.priority][0]!,
    status: "SERVING" as const,
    waitedMinutes: 8 + idx * 3,
    submittedAt: clock(-(8 + idx * 3 + s.elapsed)),
    counterId: s.counterId,
    reason: REASONS[s.priority],
    reviewed: true,
    channel: CHANNELS[idx % 4]!,
  }));

  return [...serving, ...rows];
}

export const INITIAL_REQUESTS = buildRequests();

export const INITIAL_COUNTERS: Counter[] = [
  {
    id: "c1",
    name: "Counter 1",
    staffId: "s1",
    status: "AVAILABLE",
    elapsedSeconds: 0,
    queues: ["critical", "priority", "general"],
    servedToday: 31,
  },
  {
    id: "c2",
    name: "Counter 2",
    staffId: "s2",
    status: "SERVING",
    servingToken: 104,
    elapsedSeconds: 381,
    queues: ["general", "documents"],
    servedToday: 28,
  },
  {
    id: "c3",
    name: "Counter 3",
    staffId: "s3",
    status: "SERVING",
    servingToken: 105,
    elapsedSeconds: 222,
    queues: ["priority", "general"],
    servedToday: 34,
  },
  {
    id: "c4",
    name: "Counter 4",
    staffId: "s4",
    status: "PAUSED",
    elapsedSeconds: 0,
    queues: ["general", "support"],
    servedToday: 19,
  },
  {
    id: "c5",
    name: "Counter 5",
    staffId: "s5",
    status: "SERVING",
    servingToken: 106,
    elapsedSeconds: 664,
    queues: ["documents"],
    servedToday: 22,
  },
  {
    id: "c6",
    name: "Triage Bay",
    staffId: "s6",
    status: "SERVING",
    servingToken: 200,
    elapsedSeconds: 138,
    queues: ["critical", "priority"],
    servedToday: 12,
  },
];

export const STAFF: StaffMember[] = [
  { id: "s1", name: "Amara Okonkwo", role: "Operator", shift: "07:00 – 15:00", status: "On duty", servedToday: 31, avgServiceMin: 7.4 },
  { id: "s2", name: "Ravi Menon", role: "Operator", shift: "07:00 – 15:00", status: "On duty", servedToday: 28, avgServiceMin: 8.9 },
  { id: "s3", name: "Lena Fischer", role: "Triage lead", shift: "08:00 – 16:00", status: "On duty", servedToday: 34, avgServiceMin: 6.2 },
  { id: "s4", name: "Diego Salas", role: "Operator", shift: "09:00 – 17:00", status: "Break", servedToday: 19, avgServiceMin: 9.6 },
  { id: "s5", name: "Yuki Tanaka", role: "Operator", shift: "09:00 – 17:00", status: "On duty", servedToday: 22, avgServiceMin: 5.8 },
  { id: "s6", name: "Nadia Haddad", role: "Supervisor", shift: "06:00 – 14:00", status: "On duty", servedToday: 12, avgServiceMin: 12.1 },
  { id: "s7", name: "Tom Beckett", role: "Operator", shift: "15:00 – 23:00", status: "Off duty", servedToday: 0, avgServiceMin: 8.1 },
  { id: "s8", name: "Priya Raghavan", role: "Admin", shift: "08:00 – 16:00", status: "On duty", servedToday: 0, avgServiceMin: 0 },
];

export const INITIAL_RULES: PriorityRule[] = [
  {
    id: "CRT-01",
    condition: "Escalation keyword detected",
    detail: "unresponsive, severe bleeding, chest pain + collapse, staff escalation flag",
    priority: "CRITICAL",
    queueId: "critical",
    enabled: true,
    weight: 100,
    matchesToday: 4,
  },
  {
    id: "PRA-02",
    condition: "Urgency indicators detected",
    detail: "worsening, severe pain, shortness of breath, abnormal result follow-up",
    priority: "HIGH",
    queueId: "priority",
    enabled: true,
    weight: 70,
    matchesToday: 18,
  },
  {
    id: "PRA-03",
    condition: "Wait exceeds queue SLA by 50%",
    detail: "Auto-escalates a waiting request one priority level",
    priority: "HIGH",
    queueId: "priority",
    enabled: true,
    weight: 55,
    matchesToday: 6,
  },
  {
    id: "GEN-01",
    condition: "Routine request",
    detail: "No indicators matched; routed by selected service",
    priority: "NORMAL",
    queueId: "general",
    enabled: true,
    weight: 20,
    matchesToday: 121,
  },
  {
    id: "DOC-01",
    condition: "Document verification selected",
    detail: "Routes to verification counters with document capability",
    priority: "NORMAL",
    queueId: "documents",
    enabled: true,
    weight: 20,
    matchesToday: 37,
  },
  {
    id: "LOW-01",
    condition: "Informational request",
    detail: "opening hours, copy of records, contact detail change",
    priority: "LOW",
    queueId: "support",
    enabled: false,
    weight: 10,
    matchesToday: 9,
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    title: "Your request is now #2 in queue",
    body: "Token #107 · Priority Assessment. Please stay within the waiting area.",
    time: clock(-2),
    kind: "position",
    unread: true,
  },
  {
    id: "n2",
    title: "Your priority request has been reviewed",
    body: "A triage lead confirmed HIGH priority for token #107.",
    time: clock(-5),
    kind: "review",
    unread: true,
  },
  {
    id: "n3",
    title: "Your estimated wait has changed to 8 minutes",
    body: "A counter opened on Priority Assessment.",
    time: clock(-7),
    kind: "eta",
    unread: false,
  },
  {
    id: "n4",
    title: "Request received",
    body: "Token #107 created and routed to Priority Assessment.",
    time: clock(-9),
    kind: "system",
    unread: false,
  },
];

export const INITIAL_AUDIT: AuditEvent[] = [
  { id: "a1", time: "14:32:08", actor: "Staff #24 · Lena Fischer", action: "Priority changed", requestId: "REQ-4179", from: "NORMAL", to: "HIGH" },
  { id: "a2", time: "14:31:44", actor: "System · Priority engine", action: "Rule matched PRA-02", requestId: "REQ-4179", from: "unrouted", to: "Priority Assessment" },
  { id: "a3", time: "14:29:12", actor: "Staff #18 · Ravi Menon", action: "Service completed", requestId: "REQ-4155", from: "SERVING", to: "COMPLETED" },
  { id: "a4", time: "14:27:03", actor: "Staff #11 · Nadia Haddad", action: "Request transferred", requestId: "REQ-4162", from: "General Consultation", to: "Priority Assessment" },
  { id: "a5", time: "14:24:51", actor: "Staff #24 · Lena Fischer", action: "Called next", requestId: "REQ-4161", from: "WAITING", to: "CALLED" },
  { id: "a6", time: "14:19:37", actor: "Admin · Priya Raghavan", action: "Rule enabled", requestId: "RULE-PRA-03", from: "disabled", to: "enabled" },
  { id: "a7", time: "14:12:20", actor: "Staff #31 · Diego Salas", action: "Queue paused", requestId: "QUEUE-SUP", from: "active", to: "paused" },
  { id: "a8", time: "14:04:09", actor: "System · Priority engine", action: "SLA escalation", requestId: "REQ-4171", from: "NORMAL", to: "HIGH" },
];

export const HISTORY: HistoryRecord[] = [
  { id: "REQ-4098", priority: "HIGH", queue: "Priority Assessment", waitMinutes: 6, serviceMinutes: 14, status: "Completed", date: "Aug 4, 2026" },
  { id: "REQ-3987", priority: "NORMAL", queue: "General Consultation", waitMinutes: 22, serviceMinutes: 11, status: "Completed", date: "Jul 21, 2026" },
  { id: "REQ-3921", priority: "NORMAL", queue: "Document Verification", waitMinutes: 17, serviceMinutes: 5, status: "Completed", date: "Jul 9, 2026" },
  { id: "REQ-3844", priority: "LOW", queue: "Support Desk", waitMinutes: 31, serviceMinutes: 4, status: "No-show", date: "Jun 28, 2026" },
  { id: "REQ-3790", priority: "CRITICAL", queue: "Critical Response", waitMinutes: 1, serviceMinutes: 26, status: "Completed", date: "Jun 12, 2026" },
  { id: "REQ-3712", priority: "NORMAL", queue: "General Consultation", waitMinutes: 19, serviceMinutes: 9, status: "Transferred", date: "May 30, 2026" },
];

export const USERS: AppUser[] = [
  { id: "USR-2041", name: "Jordan Avery", email: "jordan.avery@mail.com", requests: 7, lastVisit: "Today", status: "Active", tier: "Priority" },
  { id: "USR-1988", name: "Marcus Lindqvist", email: "m.lindqvist@mail.com", requests: 3, lastVisit: "Today", status: "Active", tier: "Standard" },
  { id: "USR-1954", name: "Chinwe Adeyemi", email: "chinwe.a@mail.com", requests: 12, lastVisit: "Yesterday", status: "Active", tier: "Priority" },
  { id: "USR-1902", name: "Sofia Marchetti", email: "sofia.m@mail.com", requests: 2, lastVisit: "Aug 6", status: "Invited", tier: "Standard" },
  { id: "USR-1877", name: "Elias Novak", email: "e.novak@mail.com", requests: 9, lastVisit: "Aug 5", status: "Active", tier: "Standard" },
  { id: "USR-1830", name: "Hana Kobayashi", email: "hana.k@mail.com", requests: 5, lastVisit: "Aug 2", status: "Active", tier: "Standard" },
  { id: "USR-1799", name: "Omar Farouk", email: "omar.f@mail.com", requests: 1, lastVisit: "Jul 29", status: "Suspended", tier: "Standard" },
];

export const QUEUE_LENGTH_SERIES = [
  { t: "08:00", general: 6, priority: 2, critical: 0 },
  { t: "09:00", general: 12, priority: 4, critical: 1 },
  { t: "10:00", general: 19, priority: 6, critical: 1 },
  { t: "11:00", general: 24, priority: 5, critical: 2 },
  { t: "12:00", general: 21, priority: 7, critical: 1 },
  { t: "13:00", general: 27, priority: 6, critical: 2 },
  { t: "14:00", general: 23, priority: 5, critical: 2 },
  { t: "15:00", general: 17, priority: 4, critical: 1 },
];

export const WAIT_SERIES = [
  { t: "08:00", wait: 6.2, sla: 12 },
  { t: "09:00", wait: 8.9, sla: 12 },
  { t: "10:00", wait: 13.4, sla: 12 },
  { t: "11:00", wait: 15.1, sla: 12 },
  { t: "12:00", wait: 11.8, sla: 12 },
  { t: "13:00", wait: 11.4, sla: 12 },
  { t: "14:00", wait: 9.7, sla: 12 },
  { t: "15:00", wait: 7.5, sla: 12 },
];

export const THROUGHPUT_SERIES = [
  { t: "08:00", served: 12 },
  { t: "09:00", served: 21 },
  { t: "10:00", served: 27 },
  { t: "11:00", served: 31 },
  { t: "12:00", served: 18 },
  { t: "13:00", served: 29 },
  { t: "14:00", served: 26 },
  { t: "15:00", served: 22 },
];

export const PRIORITY_DISTRIBUTION = [
  { name: "CRITICAL", value: 9, color: "var(--critical)" },
  { name: "HIGH", value: 41, color: "var(--high)" },
  { name: "NORMAL", value: 118, color: "var(--normal)" },
  { name: "LOW", value: 18, color: "var(--low)" },
];

export const COUNTER_UTILIZATION = [
  { name: "Counter 1", util: 88, idle: 12 },
  { name: "Counter 2", util: 94, idle: 6 },
  { name: "Counter 3", util: 97, idle: 3 },
  { name: "Counter 4", util: 71, idle: 29 },
  { name: "Counter 5", util: 90, idle: 10 },
  { name: "Triage Bay", util: 82, idle: 18 },
];

export const SERVICE_DURATION = [
  { name: "Critical Response", minutes: 24.6 },
  { name: "Priority Assessment", minutes: 11.2 },
  { name: "General Consultation", minutes: 8.4 },
  { name: "Document Verification", minutes: 5.1 },
  { name: "Support Desk", minutes: 6.7 },
];

export const PRIORITY_ORDER: Priority[] = ["CRITICAL", "HIGH", "NORMAL", "LOW"];

export function queueName(id: QueueId) {
  return QUEUES.find((q) => q.id === id)?.name ?? id;
}
