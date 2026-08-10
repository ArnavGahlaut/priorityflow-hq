import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRightLeft, Check, Pause, PhoneCall, Play } from "lucide-react";

import type { ComponentType } from "react";
import { PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/metric-card";
import { PriorityBadge } from "@/components/priority-badge";
import { STAFF } from "@/lib/demo-data";
import { formatElapsed, staffFor, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ops/counters")({
  head: () => ({
    meta: [
      { title: "Counters & staff — PriorityQ" },
      { name: "description", content: "Service station status, elapsed service timers and staff assignment." },
      { property: "og:title", content: "Counters & staff — PriorityQ" },
      { property: "og:description", content: "Live counter status, timers and staff coordination." },
    ],
  }),
  component: Counters,
});

const STATUS_TONE = {
  AVAILABLE: "text-success",
  SERVING: "text-normal",
  PAUSED: "text-high",
  OFFLINE: "text-muted-foreground",
} as const;

function Counters() {
  const { counters, requests, callNext, startService, complete, transfer, toggleCounterPause } =
    useStore();

  return (
    <>
      <PageHeader title="Counters & staff" subtitle="Service stations, live timers and assignment." />
      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
        {counters.map((c, i) => {
          const active = requests.find(
            (r) => r.counterId === c.id && (r.status === "CALLED" || r.status === "SERVING"),
          );
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="border border-border bg-surface"
            >
              <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{c.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {staffFor(c.staffId)?.name} · {staffFor(c.staffId)?.role}
                  </div>
                </div>
                <span
                  className={cn(
                    "flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
                    STATUS_TONE[c.status],
                  )}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  {c.status}
                </span>
              </header>
              <div className="space-y-3 p-4">
                {active ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="num text-2xl font-semibold">#{active.token}</span>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={active.priority} size="xs" />
                      <span className="num text-xs text-muted-foreground">
                        {formatElapsed(c.elapsedSeconds)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No active request</div>
                )}
                <div className="num flex justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
                  <span>Served today</span>
                  <span className="text-foreground">{c.servedToday}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Btn onClick={() => callNext(c.id)} icon={PhoneCall} label="Call next" />
                  <Btn onClick={() => startService(c.id)} icon={Play} label="Start" />
                  <Btn onClick={() => complete(c.id)} icon={Check} label="Complete" />
                  {active ? (
                    <Btn
                      onClick={() => transfer(active.id, "general")}
                      icon={ArrowRightLeft}
                      label="Transfer"
                    />
                  ) : null}
                  <Btn
                    onClick={() => toggleCounterPause(c.id)}
                    icon={c.status === "PAUSED" ? Play : Pause}
                    label={c.status === "PAUSED" ? "Resume" : "Pause"}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="px-4 pb-8 sm:px-6">
        <Panel title="Staff on shift" dense>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Name", "Role", "Shift", "Status", "Served today", "Avg service"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STAFF.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-accent/40">
                    <td className="px-4 py-3">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.role}</td>
                    <td className="num px-4 py-3 text-muted-foreground">{s.shift}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.status}</td>
                    <td className="num px-4 py-3">{s.servedToday}</td>
                    <td className="num px-4 py-3">{s.avgServiceMin}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}

function Btn({
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
