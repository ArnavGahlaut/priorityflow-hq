import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/metric-card";
import { INITIAL_RULES } from "@/lib/demo-data";

export const Route = createFileRoute("/admin/rules")({
  head: () => ({
    meta: [
      { title: "Priority rules — PriorityQ" },
      { name: "description", content: "Transparent, editable rules the engine uses to suggest a priority. Staff always confirm." },
      { property: "og:title", content: "Priority rules — PriorityQ" },
      { property: "og:description", content: "Transparent, editable rules the engine uses to suggest a priority. Staff always confirm." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Priority rules" subtitle="Transparent, editable rules the engine uses to suggest a priority. Staff always confirm." />
      <div className="space-y-4 p-4 sm:p-6">
        <Panel dense>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th key="Rule" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Condition</th>
                  <th key="Signals" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Detail</th>
                  <th key="Suggests" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Suggests</th>
                  <th key="Weight" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Weight</th>
                  <th key="Status" className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {INITIAL_RULES.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 transition-colors hover:bg-accent/40">
                    <td className="px-4 py-3">{r.condition}</td>
                    <td className="px-4 py-3">{r.detail}</td>
                    <td className="px-4 py-3">{r.priority}</td>
                    <td className="num px-4 py-3">{r.weight}</td>
                    <td className="px-4 py-3">{r.enabled ? "Enabled" : "Disabled"}</td>
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
