import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/metric-card";
import { getToken } from "@/lib/auth";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  tier: string;
  requests: number;
  status: string;
  role: string;
}

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
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("https://priorityflow-api.onrender.com/api/admin/users", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) setUsers(await res.json());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <PageHeader title="Users" subtitle="Registered users, roles and access status across the platform." />
      <div className="space-y-4 p-4 sm:p-6">
        <Panel dense>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Tier</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Requests</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((r) => (
                    <tr key={r._id} className="border-b border-border/50 transition-colors hover:bg-accent/40">
                      <td className="px-4 py-3">{r.name}</td>
                      <td className="px-4 py-3">{r.email}</td>
                      <td className="px-4 py-3">{r.role}</td>
                      <td className="px-4 py-3">{r.tier}</td>
                      <td className="num px-4 py-3">{r.requests}</td>
                      <td className="px-4 py-3">{r.status}</td>
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
