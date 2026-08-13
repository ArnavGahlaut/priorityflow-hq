import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/metric-card";
import { getToken } from "@/lib/auth";

interface AuditRow {
  _id: string;
  time: string;
  actor: string;
  action: string;
  requestId: string;
  from: string;
  to: string;
}

export const Route = createFileRoute("/admin/audit")({
  head: () => ({
    meta: [
      { title: "Audit log — PriorityQ" },
      { name: "description", content: "Every priority change, transfer and configuration action with actor and reason." },
    ],
  }),
  component: Page,
});

function Page() {
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("https://priorityflow-api.onrender.com/api/admin/audit", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) setAudit(await res.json());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <PageHeader title="Audit log" subtitle="Every priority change, transfer and configuration action with actor and reason." />
      <div className="space-y-4 p-4 sm:p-6">
        <Panel dense>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Time</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Actor</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Action</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Request</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Change</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">Loading...</td>
                  </tr>
                ) : audit.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">No audit events yet</td>
                  </tr>
                ) : (
                  audit.map((r) => (
                    <tr key={r._id} className="border-b border-border/50 transition-colors hover:bg-accent/40">
                      <td className="num px-4 py-3">{new Date(r.time).toLocaleTimeString()}</td>
                      <td className="px-4 py-3">{r.actor}</td>
                      <td className="px-4 py-3">{r.action}</td>
                      <td className="num px-4 py-3">{r.requestId}</td>
                      <td className="px-4 py-3">{`${r.from} → ${r.to}`}</td>
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
