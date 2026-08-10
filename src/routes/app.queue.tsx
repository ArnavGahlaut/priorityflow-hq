import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { LogOut, X } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/metric-card";
import { LiveDot, PriorityBadge, StatusPill } from "@/components/priority-badge";
import { queueName } from "@/lib/demo-data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/app/queue")({
  head: () => ({
    meta: [
      { title: "My queue — PriorityQ" },
      {
        name: "description",
        content: "See your token, live position, priority flag, queue and estimated wait.",
      },
      { property: "og:title", content: "My queue — PriorityQ" },
      {
        property: "og:description",
        content: "Live position, priority flag and estimated wait for your active request.",
      },
    ],
  }),
  component: MyQueue,
});

function MyQueue() {
  const { myRequest, positionOf, etaMinutesFor, leaveQueue } = useStore();
  const [detail, setDetail] = useState(false);

  return (
    <>
      <PageHeader
        title="My queue"
        subtitle="Your active request across all queues."
        actions={<LiveDot />}
      />

      <div className="p-4 sm:p-6">
        {!myRequest ? (
          <Panel className="p-8 text-center text-sm text-muted-foreground">
            No active request.{" "}
            <Link to="/app/new-request" className="text-primary hover:underline">
              Join a queue
            </Link>
            .
          </Panel>
        ) : (
          <Panel dense>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    {["Token", "Position", "Priority", "Queue", "Est. wait", "Status", ""].map(
                      (h) => (
                        <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  <motion.tr layout className="border-b border-border/60">
                    <td className="num px-4 py-4 text-base font-semibold">#{myRequest.token}</td>
                    <td className="num px-4 py-4">#{positionOf(myRequest.id)}</td>
                    <td className="px-4 py-4">
                      <PriorityBadge priority={myRequest.priority} />
                    </td>
                    <td className="px-4 py-4">{queueName(myRequest.queueId)}</td>
                    <td className="num px-4 py-4 text-high">{etaMinutesFor(myRequest.id)} min</td>
                    <td className="px-4 py-4">
                      <StatusPill status={myRequest.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setDetail(true)}
                          className="border border-border px-2.5 py-1 text-xs transition-colors hover:bg-accent"
                        >
                          View details
                        </button>
                        <button
                          onClick={() => leaveQueue(myRequest.id)}
                          className="inline-flex items-center gap-1.5 border border-critical/40 px-2.5 py-1 text-xs text-critical transition-colors hover:bg-critical-soft"
                        >
                          <LogOut className="size-3" /> Leave queue
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                </tbody>
              </table>
            </div>
          </Panel>
        )}
      </div>

      <AnimatePresence>
        {detail && myRequest ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm"
            onClick={() => setDetail(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg border border-border-strong bg-surface shadow-lift"
            >
              <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-5 py-3">
                <div className="num min-w-0 truncate text-sm font-semibold">
                  Token #{myRequest.token} · {myRequest.id}
                </div>
                <button onClick={() => setDetail(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground">
                  <X className="size-4" />
                </button>
              </header>
              <div className="space-y-4 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <PriorityBadge priority={myRequest.priority} size="md" />
                  <StatusPill status={myRequest.status} />
                  <span className="text-xs text-muted-foreground">{myRequest.service}</span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {myRequest.description}
                </p>
                <dl className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
                  <div>
                    <dt className="eyebrow">Submitted</dt>
                    <dd className="num mt-1">{myRequest.submittedAt}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Channel</dt>
                    <dd className="mt-1">{myRequest.channel}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="eyebrow">Priority reason</dt>
                    <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {myRequest.reason}
                    </dd>
                  </div>
                </dl>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
