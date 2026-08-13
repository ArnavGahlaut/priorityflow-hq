import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/metric-card";
import { getToken } from "@/lib/auth";

interface StaffUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

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
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("https://priorityflow-api.onrender.com/api/admin/staff", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) setStaff(await res.json());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <PageHeader title="Staff" subtitle="Staff directory, shifts, assigned roles and service performance." />
      <div className="space-y-4 p-4 sm:p-6">
        <Panel dense>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Role</th>
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
                ) : staff.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                      No staff found
                    </td>
                  </tr>
                ) : (
                  staff.map((r) => (
                    <tr key={r._id} className="border-b border-border/50 transition-colors hover:bg-accent/40">
                      <td className="px-4 py-3">{r.name}</td>
                      <td className="px-4 py-3">{r.email}</td>
                      <td className="px-4 py-3">{r.role}</td>
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
