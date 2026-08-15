import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/metric-card";
import { PriorityBadge } from "@/components/priority-badge";
import { getToken } from "@/lib/auth";

interface HistoryRow {
  _id: string;
  token: number;
  priority: string;
  queueId: string;
  waitedMinutes: number;
  status: string;
  submittedAt: string;
}

export const Route = createFileRoute("/app/history")({
  head: () => ({
    meta: [
      { title: "Request history — PriorityQ" },
      { name: "description", content: "Previous requests with wait time, service time and outcome." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("https://priorityflow-api.onrender.com/api/queue/requests/history", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) setHistory(await res.json());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <PageHeader title="History" subtitle="Every request you have submitted through PriorityQ." />
      <div className="p-4 sm:p-6">
        <Panel dense>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Token", "Priority", "Queue", "Wait time", "Status", "Date"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                      No past requests yet
                    </td>
                  </tr>
                ) : (
                  history.map((h, i) => (
                    <motion.tr
                      key={h._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.35 }}
                      className="border-b border-border/50 transition-colors hover:bg-accent/40"
                    >
                      <td className="num px-4 py-3">#{h.token}</td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={h.priority as any} size="xs" />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{h.queueId}</td>
                      <td className="num px-4 py-3">{h.waitedMinutes}m</td>
                      <td className="px-4 py-3 text-muted-foreground">{h.status}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(h.submittedAt).toLocaleDateString()}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}
