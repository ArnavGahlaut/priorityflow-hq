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
const CONTACT = ["SMS", "Email", "Push notification", "Screen display only"];
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
  const [contact, setContact] = useState(CONTACT[2]!);
  const [access, setAccess] = useState<string[]>([]);
  const [referredBy, setReferredBy] = useState("");
  const [created, setCreated] = useState<ServiceRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // SMS OTP state
  const [phone, setPhone] = useState("");
  const [smsOtpSent, setSmsOtpSent] = useState(false);
  const [smsOtpInput, setSmsOtpInput] = useState("");
  const [smsVerified, setSmsVerified] = useState(false);
  const [smsMessage, setSmsMessage] = useState("");
  const [smsLoading, setSmsLoading] = useState(false);

  // Email OTP state
  const [email, setEmail] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpInput, setEmailOtpInput] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailPreviewUrl, setEmailPreviewUrl] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const evaluation = useMemo(
    () => evaluatePriority(description, service, rules),
    [description, service, rules],
  );

  const needsVerification = contact === "SMS" || contact === "Email";
  const verificationDone =
    contact === "SMS" ? smsVerified : contact === "Email" ? emailVerified : true;

  const canAdvance =
    step === 0
      ? Boolean(service)
      : step === 1
        ? description.trim().length > 12
        : step === 2
          ? !needsVerification || verificationDone
          : true;

  async function sendSmsOtp() {
    if (!phone.trim()) {
      setSmsMessage("Enter a phone number first");
      return;
    }
    setSmsLoading(true);
    setSmsMessage("");
    try {
      const res = await fetch("https://priorityflow-api.onrender.com/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setSmsOtpSent(true);
        setSmsMessage(`OTP sent (demo — code: ${data.demoOtp})`);
      } else {
        setSmsMessage(data.error || "Failed to send OTP");
      }
    } catch {
      setSmsMessage("Network error");
    } finally {
      setSmsLoading(false);
    }
  }

  async function verifySmsOtp() {
    setSmsLoading(true);
    setSmsMessage("");
    try {
      const res = await fetch("https://priorityflow-api.onrender.com/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: smsOtpInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setSmsVerified(true);
        setSmsMessage("Phone verified");
      } else {
        setSmsMessage(data.error || "Invalid OTP");
      }
    } catch {
      setSmsMessage("Network error");
    } finally {
      setSmsLoading(false);
    }
  }

  async function sendEmailOtp() {
    if (!email.trim()) {
      setEmailMessage("Enter an email address first");
      return;
    }
    setEmailLoading(true);
    setEmailMessage("");
    try {
      const res = await fetch("https://priorityflow-api.onrender.com/api/otp/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
            const data = await res.json();
      if (res.ok) {
        setEmailOtpSent(true);
        setEmailPreviewUrl(data.previewUrl || "");
        setEmailMessage(
          data.demoOtp
            ? `Demo mode — your code is: ${data.demoOtp}`
            : "OTP sent — check your email",
        );
      } else {
        setEmailMessage(data.error || "Failed to send OTP");
      }
    } catch {
      setEmailMessage("Network error");
    } finally {
      setEmailLoading(false);
    }
  }

  async function verifyEmailOtp() {
    setEmailLoading(true);
    setEmailMessage("");
    try {
      const res = await fetch("https://priorityflow-api.onrender.com/api/otp/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: emailOtpInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailVerified(true);
        setEmailMessage("Email verified");
      } else {
        setEmailMessage(data.error || "Invalid OTP");
      }
    } catch {
      setEmailMessage("Network error");
    } finally {
      setEmailLoading(false);
    }
  }

  async function submit() {
    setSubmitting(true);
    const req = await submitRequest({
      service,
      description: description.trim(),
      queueId: evaluation.queueId,
      priority: evaluation.priority,
      reason: evaluation.reason,
      contactPreference: contact,
      accessibility: access,
      referredBy,
    });
    setSubmitting(false);
    if (req) setCreated(req);
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
                    setSmsOtpSent(false);
                    setSmsVerified(false);
                    setPhone("");
                    setSmsOtpInput("");
                    setEmailOtpSent(false);
                    setEmailVerified(false);
                    setEmail("");
                    setEmailOtpInput("");
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

                  {contact === "SMS" ? (
                    <div className="border border-border bg-background/60 p-4">
                      <span className="eyebrow">Verify phone number</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={smsVerified}
                          placeholder="Phone number"
                          className="focus-ring min-w-0 flex-1 border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70 disabled:opacity-60"
                        />
                        <button
                          type="button"
                          onClick={sendSmsOtp}
                          disabled={smsLoading || smsVerified}
                          className="border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-50"
                        >
                          {smsOtpSent ? "Resend OTP" : "Send OTP"}
                        </button>
                      </div>
                      {smsOtpSent && !smsVerified ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <input
                            value={smsOtpInput}
                            onChange={(e) => setSmsOtpInput(e.target.value)}
                            placeholder="Enter OTP"
                            maxLength={4}
                            className="focus-ring w-32 border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70"
                          />
                          <button
                            type="button"
                            onClick={verifySmsOtp}
                            disabled={smsLoading || smsOtpInput.length < 4}
                            className="bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                          >
                            Verify
                          </button>
                        </div>
                      ) : null}
                      {smsMessage ? (
                        <p
                          className={cn(
                            "mt-2 text-xs",
                            smsVerified ? "text-success" : "text-muted-foreground",
                          )}
                        >
                          {smsVerified ? "✓ " : ""}
                          {smsMessage}
                        </p>
                      ) : null}
                      {!smsVerified ? (
                        <p className="mt-2 text-[11px] text-high">
                          Verification required before continuing.
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {contact === "Email" ? (
                    <div className="border border-border bg-background/60 p-4">
                      <span className="eyebrow">Verify email address</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={emailVerified}
                          placeholder="you@example.com"
                          className="focus-ring min-w-0 flex-1 border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70 disabled:opacity-60"
                        />
                        <button
                          type="button"
                          onClick={sendEmailOtp}
                          disabled={emailLoading || emailVerified}
                          className="border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-50"
                        >
                          {emailOtpSent ? "Resend OTP" : "Send OTP"}
                        </button>
                      </div>
                      {emailOtpSent && !emailVerified ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <input
                            value={emailOtpInput}
                            onChange={(e) => setEmailOtpInput(e.target.value)}
                            placeholder="Enter OTP"
                            maxLength={4}
                            className="focus-ring w-32 border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70"
                          />
                          <button
                            type="button"
                            onClick={verifyEmailOtp}
                            disabled={emailLoading || emailOtpInput.length < 4}
                            className="bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                          >
                            Verify
                          </button>
                        </div>
                      ) : null}
                      {emailPreviewUrl && !emailVerified ? (
                        <a
                          href={emailPreviewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 block text-xs text-primary underline"
                        >
                          Open sent email (test inbox)
                        </a>
                      ) : null}
                      {emailMessage ? (
                        <p
                          className={cn(
                            "mt-2 text-xs",
                            emailVerified ? "text-success" : "text-muted-foreground",
                          )}
                        >
                          {emailVerified ? "✓ " : ""}
                          {emailMessage}
                        </p>
                      ) : null}
                      {!emailVerified ? (
                        <p className="mt-2 text-[11px] text-high">
                          Verification required before continuing.
                        </p>
                      ) : null}
                    </div>
                  ) : null}

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
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit request"} <Check className="size-4" />
            </motion.button>
          )}
        </div>
      </div>
    </>
  );
}
