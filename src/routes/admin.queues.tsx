import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/metric-card";
import { getToken } from "@/lib/auth";

interface QueueItem {
  _id: string;
  id: string;
  name: string;
  code: string;
  paused: boolean;
  slaMinutes: number;
}

export const Route = createFileRoute("/admin/queues")({
  head: () => ({
    meta: [
      { title: "Queue configuration — PriorityQ" },
      { name: "description", content: "Queues, service codes and SLA targets used for priority routing." },
      { property: "og:title", content: "Queue configuration — PriorityQ" },
      { property: "og:description", content: "Queues, service codes and SLA targets used for priority routing." },
    ],
  }),
  component: Page,
});

function Page() {
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://10.233.230.170:5000/api/queue/queues", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) setQueues(await res.json());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <PageHeader title="Queue configuration" subtitle="Queues, service codes and SLA targets used for priority routing." />
      <div className="space-y-4 p-4 sm:p-6">
        <Panel dense>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Queue</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Code</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">SLA target</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : (
                  queues.map((q) => (
                    <tr key={q._id} className="border-b border-border/50 transition-colors hover:bg-accent/40">
                      <td className="px-4 py-3">{q.name}</td>
                      <td className="px-4 py-3">{q.code}</td>
                      <td className="px-4 py-3">{q.slaMinutes} min</td>
                      <td className="px-4 py-3">{q.paused ? "Paused" : "Active"}</td>
                    </tr>
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
