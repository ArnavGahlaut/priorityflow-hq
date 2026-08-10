import { createFileRoute, Outlet } from "@tanstack/react-router";

import { ADMIN_NAV, AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AppShell
      nav={ADMIN_NAV}
      sectionLabel="Administration"
      who={{ name: "Dana Ortiz", role: "System admin" }}
    >
      <Outlet />
    </AppShell>
  );
}
