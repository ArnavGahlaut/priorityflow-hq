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
  keywords: string[];
}

export const Route = createFileRoute("/admin/rules")({
  head: () => ({
    meta: [
      { title: "Priority rules — PriorityQ" },
      {
        name: "description",
        content:
          "Transparent, editable rules the engine uses to suggest a priority. Staff always confirm.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch("http://10.233.230.170:5000/api/admin/rules", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (res.ok) {
        setRules(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleRule(id: string) {
    const res = await fetch(
      `http://10.233.230.170:5000/api/admin/rules/${id}/toggle`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );

    if (res.ok) {
      const updated = await res.json();
      setRules((current) =>
        current.map((rule) => (rule._id === id ? updated : rule)),
      );
    }
  }

  async function updateRule(
    id: string,
    updates: Partial<Pick<Rule, "weight" | "keywords">>,
  ) {
    const res = await fetch(`http://10.233.230.170:5000/api/admin/rules/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(updates),
    });

    if (res.ok) {
      const updated = await res.json();
      setRules((current) =>
        current.map((rule) => (rule._id === id ? updated : rule)),
      );
    }
  }

  function parseKeywords(value: string) {
    return [...new Set(
      value
        .split(",")
        .map((keyword) => keyword.trim().toLowerCase())
        .filter(Boolean),
    )];
  }

  return (
    <>
      <PageHeader
        title="Priority rules"
        subtitle="Transparent, editable rules the engine uses to suggest a priority. Staff always confirm."
      />

      <div className="space-y-4 p-4 sm:p-6">
        <Panel dense>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Condition
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Detail
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Keywords
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Suggests
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Weight
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-muted-foreground"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : rules.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No priority rules found.
                    </td>
                  </tr>
                ) : (
                  rules.map((r) => (
                    <tr
                      key={r._id}
                      className="border-b border-border/50 transition-colors hover:bg-accent/40"
                    >
                      <td className="px-4 py-3 font-medium">{r.condition}</td>

                      <td className="max-w-[280px] px-4 py-3 text-muted-foreground">
                        {r.detail}
                      </td>

                      <td className="px-4 py-3">
                        <input
                          type="text"
                          defaultValue={(r.keywords || []).join(", ")}
                          placeholder="keyword1, keyword2..."
                          onBlur={(e) =>
                            updateRule(r._id, {
                              keywords: parseKeywords(e.target.value),
                            })
                          }
                          className="w-[240px] border border-border bg-background px-2.5 py-1.5 text-xs outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary"
                        />
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          Separate keywords with commas
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-medium">{r.priority}</span>
                      </td>

                      <td className="num px-4 py-3">
                        <input
                          type="number"
                          defaultValue={r.weight}
                          onBlur={(e) =>
                            updateRule(r._id, {
                              weight: Number(e.target.value),
                            })
                          }
                          className="w-16 border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <button
                          type="button"
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
