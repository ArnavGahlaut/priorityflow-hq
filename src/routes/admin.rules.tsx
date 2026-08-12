import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/metric-card";
import { getToken } from "@/lib/auth";

interface Rule {
  _id: string;
  condition: string;
  detail: string;
  priority: string;
  weight: number;
  enabled: boolean;
}

export const Route = createFileRoute("/admin/rules")({
  head: () => ({
    meta: [
      { title: "Priority rules — PriorityQ" },
      { name: "description", content: "Transparent, editable rules the engine uses to suggest a priority. Staff always confirm." },
    ],
  }),
  component: Page,
});

function Page() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch("http://localhost:5000/api/admin/rules", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setRules(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleRule(id: string) {
    await fetch(`http://localhost:5000/api/admin/rules/${id}/toggle`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    load();
  }

  async function updateWeight(id: string, weight: number) {
    await fetch(`http://localhost:5000/api/admin/rules/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ weight }),
    });
    load();
  }

  return (
    <>
      <PageHeader title="Priority rules" subtitle="Transparent, editable rules the engine uses to suggest a priority. Staff always confirm." />
      <div className="space-y-4 p-4 sm:p-6">
        <Panel dense>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Condition</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Detail</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Suggests</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Weight</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">Loading...</td>
                  </tr>
                ) : (
                  rules.map((r) => (
                    <tr key={r._id} className="border-b border-border/50 transition-colors hover:bg-accent/40">
                      <td className="px-4 py-3">{r.condition}</td>
                      <td className="px-4 py-3">{r.detail}</td>
                      <td className="px-4 py-3">{r.priority}</td>
                      <td className="num px-4 py-3">
                        <input
                          type="number"
                          defaultValue={r.weight}
                          onBlur={(e) => updateWeight(r._id, Number(e.target.value))}
                          className="w-16 border border-border bg-background px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleRule(r._id)}
                          className={`border px-2 py-1 text-xs transition-colors ${
                            r.enabled
                              ? "border-success/40 text-success hover:bg-success/10"
                              : "border-border text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          {r.enabled ? "Enabled" : "Disabled"}
                        </button>
                      </td>
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
