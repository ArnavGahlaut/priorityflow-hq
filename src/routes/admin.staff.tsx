import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/metric-card";
import { STAFF } from "@/lib/demo-data";

export const Route = createFileRoute("/admin/staff")({
  head: () => ({
    meta: [
      { title: "Staff — PriorityQ" },
      { name: "description", content: "Staff directory, shifts, assigned roles and service performance." },
      { property: "og:title", content: "Staff — PriorityQ" },
      { property: "og:description", content: "Staff directory, shifts, assigned roles and service performance." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Staff" subtitle="Staff directory, shifts, assigned roles and service performance." />
      <div className="space-y-4 p-4 sm:p-6">
        <Panel dense>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th key="Name" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Name</th>
                  <th key="Role" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Role</th>
                  <th key="Shift" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Shift</th>
                  <th key="Status" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Status</th>
                  <th key="Served today" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Served today</th>
                  <th key="Avg service" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Avg service</th>
                </tr>
              </thead>
              <tbody>
                {STAFF.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 transition-colors hover:bg-accent/40">
                    <td className="px-4 py-3">{r.name}</td>
                    <td className="px-4 py-3">{r.role}</td>
                    <td className="num px-4 py-3">{r.shift}</td>
                    <td className="px-4 py-3">{r.status}</td>
                    <td className="num px-4 py-3">{r.servedToday}</td>
                    <td className="num px-4 py-3">{`${r.avgServiceMin}m`}</td>
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
