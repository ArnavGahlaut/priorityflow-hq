import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/metric-card";
import { USERS } from "@/lib/demo-data";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Users — PriorityQ" },
      { name: "description", content: "Registered users, roles and access status across the platform." },
      { property: "og:title", content: "Users — PriorityQ" },
      { property: "og:description", content: "Registered users, roles and access status across the platform." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Users" subtitle="Registered users, roles and access status across the platform." />
      <div className="space-y-4 p-4 sm:p-6">
        <Panel dense>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th key="Name" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Name</th>
                  <th key="Email" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Email</th>
                  <th key="Role" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Tier</th>
                  <th key="Requests" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Requests</th>
                  <th key="Status" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {USERS.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 transition-colors hover:bg-accent/40">
                    <td className="px-4 py-3">{r.name}</td>
                    <td className="px-4 py-3">{r.email}</td>
                    <td className="px-4 py-3">{r.tier}</td>
                    <td className="num px-4 py-3">{r.requests}</td>
                    <td className="px-4 py-3">{r.status}</td>
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
