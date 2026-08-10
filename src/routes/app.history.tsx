import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";

import { PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/metric-card";
import { PriorityBadge } from "@/components/priority-badge";
import { HISTORY } from "@/lib/demo-data";

export const Route = createFileRoute("/app/history")({
  head: () => ({
    meta: [
      { title: "Request history — PriorityQ" },
      { name: "description", content: "Previous requests with wait time, service time and outcome." },
      { property: "og:title", content: "Request history — PriorityQ" },
      { property: "og:description", content: "Past requests, wait times, service times and outcomes." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <>
      <PageHeader title="History" subtitle="Every request you have submitted through PriorityQ." />
      <div className="p-4 sm:p-6">
        <Panel dense>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Request ID", "Priority", "Queue", "Wait time", "Service time", "Status", "Date"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {HISTORY.map((h, i) => (
                  <motion.tr
                    key={h.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.35 }}
                    className="border-b border-border/50 transition-colors hover:bg-accent/40"
                  >
                    <td className="num px-4 py-3">{h.id}</td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={h.priority} size="xs" />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{h.queue}</td>
                    <td className="num px-4 py-3">{h.waitMinutes}m</td>
                    <td className="num px-4 py-3">{h.serviceMinutes}m</td>
                    <td className="px-4 py-3 text-muted-foreground">{h.status}</td>
                    <td className="px-4 py-3 text-muted-foreground">{h.date}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}
