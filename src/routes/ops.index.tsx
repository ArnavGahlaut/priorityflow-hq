import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { PhoneCall, Pause, Play, Check, ArrowRightLeft } from "lucide-react";
import { useState, type ComponentType } from "react";

import { Disclaimer, PageHeader } from "@/components/app-shell";
import { MetricCard, Panel } from "@/components/metric-card";
import { LiveDot, PRIORITY_DOT, PriorityBadge, StatusPill } from "@/components/priority-badge";
import { PRIORITY_ORDER, queueName } from "@/lib/demo-data";
import { formatElapsed, staffFor, useStore } from "@/lib/store";
import type { Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ops/")({
  head: () => ({
    meta: [
      { title: "Operations Center — PriorityQ" },
      {
        name: "description",
        content:
          "Live priority queues, counter assignment and service control for staff operations teams.",
      },
      { property: "og:title", content: "Operations Center — PriorityQ" },
      {
        property: "og:description",
        content: "Live queues, counters and call-next control in one dense operational surface.",
      },
    ],
  }),
  component: OperationsCenter,
});

function OperationsCenter() {
  const {
    metrics,
    waitingByPriority,
    counters,
    queues,
    callNext,
    callByToken,
    startService,
    complete,
    transfer,
    toggleQueuePause,
    requests,
  } = useStore();

  const [tokenInputs, setTokenInputs] = useState<Record<string, string>>({});

  return (
    <>
      <PageHeader
        title="Operations Center"
        subtitle="Priority-aware routing across every queue and counter, updating live."
        actions={<LiveDot label="REAL-TIME" />}
      />

      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
        <MetricCard label="Waiting" value={metrics.waiting} index={0} />
        <MetricCard label="High priority" value={metrics.highPriority} tone="high" index={1} />
        <MetricCard label="Currently serving" value={metrics.serving} tone="success" index={2} />
        <MetricCard label="Average wait" seconds={metrics.avgWaitSeconds} index={3} />
      </div>

      <div className="grid gap-4 px-4 pb-6 sm:px-6 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
        <div className="grid gap-3 lg:grid-cols-3">
          {(["CRITICAL", "HIGH", "NORMAL"] as Priority[]).map((p) => {
            const rows = waitingByPriority(p);
            return (
              <section key={p} className="border border-border bg-surface">
                <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em]">
                    <span className={cn("size-1.5 rounded-full", PRIORITY_DOT[p])} />
                    {p === "NORMAL" ? "Normal" : p === "HIGH" ? "High priority" : "Critical"}
                  </span>
                  <span className="num text-xs text-muted-foreground">{rows.length}</span>
                </header>
                <ul className="max-h-[420px] overflow-y-auto">
                  <AnimatePresence initial={false}>
                    {rows.map((r) => (
                      <motion.li
                        key={r.id}
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 24 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border/50 px-4 py-2.5 transition-colors hover:bg-accent/40"
                      >
                        <div className="min-w-0">
                          <div className="num text-sm font-semibold">#{r.token}</div>
                          <div className="truncate text-[11px] text-muted-foreground">
                            {p === "CRITICAL" ? "Immediate staff review" : queueName(r.queueId)}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="num text-[11px] text-muted-foreground">
                            {r.waitedMinutes}m
                          </span>
                          <StatusPill status={r.status} />
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                  {rows.length === 0 ? (
                    <li className="px-4 py-6 text-center text-xs text-muted-foreground">
                      Queue clear
                    </li>
                  ) : null}
                </ul>
              </section>
            );
          })}
        </div>

        <div className="space-y-3">
          <Panel title="Counters" dense>
            <ul>
              {counters.map((c) => {
                const active = requests.find(
                  (r) => r.counterId === c.id && (r.status === "CALLED" || r.status === "SERVING"),
                );
                return (
                  <li key={c.id} className="border-b border-border/50 px-4 py-3 last:border-b-0">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium">{c.name}</div>
                        <div className="truncate text-[11px] text-muted-foreground">
                          {staffFor(c.staffId)?.name}
                          {c.status === "SERVING" && active
                            ? ` · serving #${active.token} · ${formatElapsed(c.elapsedSeconds)}`
                            : c.status === "AVAILABLE"
                              ? " · available"
                              : c.status === "PAUSED"
                                ? " · paused"
                                : ""}
                        </div>
                      </div>
                      {active ? <PriorityBadge priority={active.priority} size="xs" /> : null}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <ActionButton onClick={() => callNext(c.id)} icon={PhoneCall} label="Call next" />
                      <input
                        value={tokenInputs[c.id] || ""}
                        onChange={(e) =>
                          setTokenInputs((prev) => ({ ...prev, [c.id]: e.target.value }))
                        }
                        placeholder="Token #"
                        className="w-20 border border-border bg-background px-2 py-1 text-xs outline-none"
                      />
                      <button
                        onClick={() => {
                          const tok = Number(tokenInputs[c.id]);
                          if (tok) {
                            callByToken(c.id, tok);
                            setTokenInputs((prev) => ({ ...prev, [c.id]: "" }));
                          }
                        }}
                        className="border border-border px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        Call token
                      </button>
                      <ActionButton onClick={() => startService(c.id)} icon={Play} label="Start" />
                      <ActionButton onClick={() => complete(c.id)} icon={Check} label="Complete" />
                      {active ? (
                        <ActionButton
                          onClick={() => transfer(active.id, "priority")}
                          icon={ArrowRightLeft}
                          label="Transfer"
                        />
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel title="Queue control" dense>
            <ul>
              {queues.map((q) => (
                <li
                  key={q.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border/50 px-4 py-2.5 last:border-b-0"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[13px]">{q.name}</div>
                    <div className="num text-[11px] text-muted-foreground">
                      SLA {q.slaMinutes}m · {q.code}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleQueuePause(q.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 border px-2 py-1 text-[11px] transition-colors",
                      q.paused
                        ? "border-high/40 text-high hover:bg-high-soft"
                        : "border-border text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {q.paused ? <Play className="size-3" /> : <Pause className="size-3" />}
                    {q.paused ? "Resume" : "Pause"}
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Disclaimer />
        </div>
      </div>

      <div className="px-4 pb-8 sm:px-6">
        <Panel title="Priority order used by Call Next" dense>
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
            {PRIORITY_ORDER.map((p, i) => (
              <span key={p} className="flex items-center gap-2">
                <PriorityBadge priority={p} size="xs" />
                {i < PRIORITY_ORDER.length - 1 ? <span>→</span> : null}
              </span>
            ))}
            <span className="ml-2">then longest wait within the same priority.</span>
          </div>
        </Panel>
      </div>
    </>
  );
}

function ActionButton({
  onClick,
  icon: Icon,
  label,
}: {
  onClick: () => void;
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 border border-border px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <Icon className="size-3" />
      {label}
    </motion.button>
  );
}
