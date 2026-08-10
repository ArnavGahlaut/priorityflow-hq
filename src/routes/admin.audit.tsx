import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/metric-card";
import { INITIAL_AUDIT } from "@/lib/demo-data";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({
    meta: [
      { title: "Audit log — PriorityQ" },
      { name: "description", content: "Every priority change, transfer and configuration action with actor and reason." },
      { property: "og:title", content: "Audit log — PriorityQ" },
      { property: "og:description", content: "Every priority change, transfer and configuration action with actor and reason." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Audit log" subtitle="Every priority change, transfer and configuration action with actor and reason." />
      <div className="space-y-4 p-4 sm:p-6">
        <Panel dense>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th key="Time" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Time</th>
                  <th key="Actor" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Actor</th>
                  <th key="Action" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Action</th>
                  <th key="Target" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Request</th>
                  <th key="Reason" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Change</th>
                </tr>
              </thead>
              <tbody>
                {INITIAL_AUDIT.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 transition-colors hover:bg-accent/40">
                    <td className="num px-4 py-3">{r.time}</td>
                    <td className="px-4 py-3">{r.actor}</td>
                    <td className="px-4 py-3">{r.action}</td>
                    <td className="num px-4 py-3">{r.requestId}</td>
                    <td className="px-4 py-3">{`${r.from} → ${r.to}`}</td>
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
