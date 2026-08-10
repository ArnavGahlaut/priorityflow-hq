import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/metric-card";
import { QUEUES } from "@/lib/demo-data";

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
  return (
    <>
      <PageHeader title="Queue configuration" subtitle="Queues, service codes and SLA targets used for priority routing." />
      <div className="space-y-4 p-4 sm:p-6">
        <Panel dense>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th key="Queue" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Queue</th>
                  <th key="Code" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Code</th>
                  <th key="SLA target" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">SLA target</th>
                  <th key="Description" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {QUEUES.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 transition-colors hover:bg-accent/40">
                    <td className="px-4 py-3">{r.name}</td>
                    <td className="num px-4 py-3">{r.code}</td>
                    <td className="num px-4 py-3">{`${r.slaMinutes} min`}</td>
                    <td className="px-4 py-3">{r.paused ? "Paused" : "Active"}</td>
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
