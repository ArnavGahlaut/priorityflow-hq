import { INITIAL_RULES, SERVICES } from "./demo-data";
import type { Priority, PriorityRule, QueueId } from "./types";

const CRITICAL_TERMS = [
  "unresponsive",
  "collapsed",
  "severe bleeding",
  "not breathing",
  "unconscious",
  "emergency",
];

const HIGH_TERMS = [
  "worse",
  "worsening",
  "severe",
  "urgent",
  "chest",
  "shortness of breath",
  "breathing",
  "abnormal result",
  "bleeding",
  "pain",
  "fever",
  "spreading",
  "cannot",
  "can't",
];

export interface Evaluation {
  priority: Priority;
  queueId: QueueId;
  ruleId: string;
  reason: string;
  matched: string[];
  confidence: number;
}

/**
 * Deterministic, rule-based priority evaluation. This is a workflow/triage aid:
 * it never asserts a diagnosis, it only flags requests for staff review.
 */
export function evaluatePriority(
  description: string,
  service: string,
  rules: PriorityRule[] = INITIAL_RULES,
): Evaluation {
  const text = description.toLowerCase();
  const serviceQueue = SERVICES.find((s) => s.name === service)?.queueId ?? "general";
  const active = rules.filter((r) => r.enabled);

  const criticalHits = CRITICAL_TERMS.filter((t) => text.includes(t));
  const criticalRule = active.find((r) => r.priority === "CRITICAL");
  if (criticalHits.length > 0 && criticalRule) {
    return {
      priority: "CRITICAL",
      queueId: criticalRule.queueId,
      ruleId: criticalRule.id,
      reason: "Request contains configured escalation indicators. Flagged for immediate staff review.",
      matched: criticalHits,
      confidence: 0.96,
    };
  }

  const highHits = HIGH_TERMS.filter((t) => text.includes(t));
  const highRule = active.find((r) => r.priority === "HIGH");
  if (highHits.length > 0 && highRule) {
    return {
      priority: "HIGH",
      queueId: service === "Document Verification" ? serviceQueue : highRule.queueId,
      ruleId: highRule.id,
      reason: "Request contains configured high-priority indicators. Flagged for staff review.",
      matched: highHits,
      confidence: Math.min(0.94, 0.68 + highHits.length * 0.07),
    };
  }

  const lowRule = active.find((r) => r.priority === "LOW");
  if (lowRule && /hours|copy|records|contact detail|address|invoice|receipt/.test(text)) {
    return {
      priority: "LOW",
      queueId: lowRule.queueId,
      ruleId: lowRule.id,
      reason: "Informational request with no service dependency.",
      matched: ["informational"],
      confidence: 0.72,
    };
  }

  return {
    priority: "NORMAL",
    queueId: serviceQueue,
    ruleId: active.find((r) => r.priority === "NORMAL" && r.queueId === serviceQueue)?.id ?? "GEN-01",
    reason: "No priority indicators matched. Routed by selected service.",
    matched: [],
    confidence: 0.81,
  };
}
