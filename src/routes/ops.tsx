import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AppShell, OPS_NAV } from "@/components/app-shell";

export const Route = createFileRoute("/ops")({
  component: OpsLayout,
});

function OpsLayout() {
  return (
    <AppShell
      nav={OPS_NAV}
      sectionLabel="Operations"
      who={{ name: "Lena Fischer", role: "Triage lead" }}
    >
      <Outlet />
    </AppShell>
  );
}
