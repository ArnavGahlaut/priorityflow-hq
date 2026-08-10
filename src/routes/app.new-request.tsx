import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { Disclaimer, PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/metric-card";
import { PriorityBadge } from "@/components/priority-badge";
import { SERVICES, queueName } from "@/lib/demo-data";
import { evaluatePriority } from "@/lib/priority-engine";
import { useStore } from "@/lib/store";
import type { ServiceRequest } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/new-request")({
  head: () => ({
    meta: [
      { title: "New request — PriorityQ" },
      {
        name: "description",
        content:
          "Describe your request in four steps. PriorityQ evaluates configurable rules and routes you to the right queue.",
      },
      { property: "og:title", content: "New request — PriorityQ" },
      {
        property: "og:description",
        content: "Four-step intake with rule-based priority evaluation and queue routing.",
      },
    ],
  }),
  component: NewRequest,
});

const STEPS = ["Select service", "Describe request", "Additional information", "Review"];
const CONTACT = ["SMS", "Push notification", "Screen display only"];
const ACCESSIBILITY = [
  "Wheelchair access",
  "Interpreter needed",
  "Accompanied by carer",
  "Prefers quiet area",
];

function NewRequest() {
  const { submitRequest, rules, positionOf, etaMinutesFor } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [service, setService] = useState(SERVICES[1]!.name);
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState(CONTACT[1]!);
  const [access, setAccess] = useState<string[]>([]);
  const [referredBy, setReferredBy] = useState("");
  const [created, setCreated] = useState<ServiceRequest | null>(null);

  const evaluation = useMemo(
    () => evaluatePriority(description, service, rules),
    [description, service, rules],
  );

  const canAdvance = step === 0 ? Boolean(service) : step === 1 ? description.trim().length > 12 : true;

  function submit() {
    const req = submitRequest({
      service,
      description: description.trim(),
      queueId: evaluation.queueId,
      priority: evaluation.priority,
      reason: evaluation.reason,
      contactPreference: contact,
      accessibility: access,
      referredBy,
    });
    setCreated(req);
  }

  if (created) {
    return (
      <>
        <PageHeader title="Request received" subtitle="Your token has been created and routed." />
        <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="border border-border bg-surface"
          >
            <div className="flex items-center gap-2 border-b border-border px-5 py-3 text-success">
              <Check className="size-4" />
              <span className="text-sm font-medium">Request received</span>
            </div>
            <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
              <div>
                <div className="eyebrow">Token</div>
                <div className="num mt-1 text-5xl font-semibold tracking-[-0.05em]">
                  #{created.token}
                </div>
                <div className="mt-3">
                  <PriorityBadge priority={created.priority} size="md" />
                </div>
              </div>
              <dl className="grid gap-4 self-center">
                <div>
                  <dt className="eyebrow">Queue</dt>
                  <dd className="mt-1 text-sm font-medium">{queueName(created.queueId)}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Position</dt>
                  <dd className="num mt-1 text-sm font-medium">#{positionOf(created.id)}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Estimated wait</dt>
                  <dd className="mt-1 text-sm font-medium text-high">
                    {etaMinutesFor(created.id)} minutes
                  </dd>
                </div>
              </dl>
            </div>
            {created.priority === "HIGH" || created.priority === "CRITICAL" ? (
              <div className="border-t border-border bg-high-soft px-5 py-3 text-sm text-high sm:px-6">
                Priority flagged for staff review.
              </div>
            ) : null}
            <div className="border-t border-border px-5 py-4 sm:px-6">
              <Disclaimer />
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => navigate({ to: "/app" })}
                  className="bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Track my request
                </button>
                <button
                  onClick={() => {
                    setCreated(null);
                    setStep(0);
                    setDescription("");
                  }}
                  className="border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  Submit another
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="New request"
        subtitle="Four short steps. The priority engine evaluates your description against configured rules."
      />

      <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <ol className="mb-6 grid grid-cols-4 gap-2">
          {STEPS.map((label, i) => (
            <li key={label} className="min-w-0">
              <div className="relative h-0.5 w-full bg-border">
                <motion.div
                  initial={false}
                  animate={{ scaleX: i <= step ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{ originX: 0 }}
                  className={cn("absolute inset-0", i <= step ? "bg-primary" : "")}
                />
              </div>
              <div
                className={cn(
                  "mt-2 truncate text-[11px]",
                  i === step ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {i + 1}. {label}
              </div>
            </li>
          ))}
        </ol>

        <Panel className="min-h-[340px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {step === 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {SERVICES.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => setService(s.name)}
                      className={cn(
                        "border p-4 text-left transition-colors",
                        service === s.name
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-accent/60",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{s.name}</span>
                        <span className="num text-[10px] text-muted-foreground">
                          ~{s.avgMinutes}m
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        {s.blurb}
                      </p>
                    </button>
                  ))}
                </div>
              ) : null}

              {step === 1 ? (
                <div>
                  <label htmlFor="desc" className="eyebrow">
                    Describe your request
                  </label>
                  <textarea
                    id="desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={7}
                    placeholder="Tell us what you need help with today, and how long it has been going on."
                    className="focus-ring mt-2 w-full resize-none border border-input bg-background p-3 text-sm outline-none placeholder:text-muted-foreground/70"
                  />
                  <div className="mt-3 flex items-start gap-2 border border-border bg-background/60 p-3">
                    <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <div className="min-w-0 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-muted-foreground">Live evaluation:</span>
                        <PriorityBadge priority={evaluation.priority} size="xs" />
                        <span className="text-muted-foreground">
                          → {queueName(evaluation.queueId)}
                        </span>
                      </div>
                      <p className="mt-1.5 leading-relaxed text-muted-foreground">
                        {description.trim().length > 12
                          ? evaluation.reason
                          : "Add a little more detail so rules can be evaluated."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-5">
                  <div>
                    <span className="eyebrow">How should we reach you?</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {CONTACT.map((c) => (
                        <button
                          key={c}
                          onClick={() => setContact(c)}
                          className={cn(
                            "border px-3 py-1.5 text-xs transition-colors",
                            contact === c
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border text-muted-foreground hover:bg-accent/60",
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="eyebrow">Accessibility & support</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {ACCESSIBILITY.map((a) => {
                        const on = access.includes(a);
                        return (
                          <button
                            key={a}
                            onClick={() =>
                              setAccess((prev) =>
                                on ? prev.filter((x) => x !== a) : [...prev, a],
                              )
                            }
                            className={cn(
                              "border px-3 py-1.5 text-xs transition-colors",
                              on
                                ? "border-primary bg-primary/10 text-foreground"
                                : "border-border text-muted-foreground hover:bg-accent/60",
                            )}
                          >
                            {a}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="ref" className="eyebrow">
                      Referred by (optional)
                    </label>
                    <input
                      id="ref"
                      value={referredBy}
                      onChange={(e) => setReferredBy(e.target.value)}
                      placeholder="Clinic, department or staff name"
                      className="focus-ring mt-2 w-full border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70"
                    />
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-4">
                  <dl className="divide-y divide-border border border-border">
                    {[
                      ["Service", service],
                      ["Routed queue", queueName(evaluation.queueId)],
                      ["Contact", contact],
                      ["Accessibility", access.length ? access.join(", ") : "None selected"],
                      ["Referred by", referredBy || "—"],
                    ].map(([k, v]) => (
                      <div key={k} className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 px-3 py-2.5">
                        <dt className="text-xs text-muted-foreground">{k}</dt>
                        <dd className="min-w-0 text-[13px]">{v}</dd>
                      </div>
                    ))}
                    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 px-3 py-2.5">
                      <dt className="text-xs text-muted-foreground">Description</dt>
                      <dd className="min-w-0 text-[13px] leading-relaxed">{description}</dd>
                    </div>
                    <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-3 px-3 py-2.5">
                      <dt className="text-xs text-muted-foreground">Priority flag</dt>
                      <dd className="flex flex-wrap items-center gap-2">
                        <PriorityBadge priority={evaluation.priority} />
                        <span className="text-[11px] text-muted-foreground">
                          Rule {evaluation.ruleId}
                        </span>
                      </dd>
                    </div>
                  </dl>
                  <Disclaimer />
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </Panel>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-2 border border-border px-4 py-2 text-sm transition-colors hover:bg-accent disabled:opacity-40"
          >
            <ArrowLeft className="size-4" /> Back
          </button>
          {step < 3 ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => canAdvance && setStep((s) => s + 1)}
              disabled={!canAdvance}
              className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Continue <ArrowRight className="size-4" />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={submit}
              className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Submit request <Check className="size-4" />
            </motion.button>
          )}
        </div>
      </div>
    </>
  );
}
