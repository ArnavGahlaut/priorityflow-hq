import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AppShell, USER_NAV } from "@/components/app-shell";

export const Route = createFileRoute("/app")({
  component: UserLayout,
});

function UserLayout() {
  return (
    <AppShell
      nav={USER_NAV}
      sectionLabel="User workspace"
      who={{ name: "Jordan Avery", role: "Priority member" }}
    >
      <Outlet />
    </AppShell>
  );
}
