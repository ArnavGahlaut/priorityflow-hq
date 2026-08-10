import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";

import { Disclaimer, PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/metric-card";
import { PriorityBadge } from "@/components/priority-badge";
import { PRIORITY_ORDER, queueName } from "@/lib/demo-data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/ops/triage")({
  head: () => ({
    meta: [
      { title: "Priority review — PriorityQ" },
      {
        name: "description",
        content:
          "Staff review queue for system priority suggestions, with confirm, change and escalate actions.",
      },
      { property: "og:title", content: "Priority review — PriorityQ" },
      {
        property: "og:description",
        content: "Confirm or change suggested priorities. Suggestions never replace staff judgement.",
      },
    ],
  }),
  component: Triage,
});

function Triage() {
  const { waiting, confirmPriority, setPriority, sendForReview } = useStore();
  const pending = waiting.filter((r) => !r.reviewed);

  return (
    <>
      <PageHeader
        title="Priority review"
        subtitle="Requests where the engine suggested an elevated priority and staff confirmation is pending."
        actions={<span className="num text-sm text-muted-foreground">{pending.length} pending</span>}
      />
      <div className="space-y-4 p-4 sm:p-6">
        <Disclaimer />
        {pending.length === 0 ? (
          <Panel className="p-8 text-center text-sm text-muted-foreground">
            No requests awaiting priority review.
          </Panel>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {pending.map((r, i) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
                className="border border-border bg-surface"
              >
                <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3">
                  <div className="num min-w-0 truncate text-sm font-semibold">
                    Request #{r.token} · {r.id}
                  </div>
                  <PriorityBadge priority={r.priority} size="xs" />
                </header>
                <div className="space-y-3 p-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{r.description}</p>
                  <dl className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs">
                    <div>
                      <dt className="eyebrow">System suggestion</dt>
                      <dd className="mt-1">
                        <PriorityBadge priority={r.suggestedPriority} size="xs" />
                      </dd>
                    </div>
                    <div>
                      <dt className="eyebrow">Routed queue</dt>
                      <dd className="mt-1">{queueName(r.queueId)}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="eyebrow">Reason</dt>
                      <dd className="mt-1 leading-relaxed text-muted-foreground">{r.reason}</dd>
                    </div>
                  </dl>
                  <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
                    <button
                      onClick={() => confirmPriority(r.id)}
                      className="bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      Confirm priority
                    </button>
                    {PRIORITY_ORDER.filter((p) => p !== r.priority).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPriority(r.id, p)}
                        className="border border-border px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        Change to {p}
                      </button>
                    ))}
                    <button
                      onClick={() => sendForReview(r.id)}
                      className="border border-border px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      Send for review
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
