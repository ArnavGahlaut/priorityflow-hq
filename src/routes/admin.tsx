import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { ADMIN_NAV, AppShell } from "@/components/app-shell";
import { getToken, getUser } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    const token = getToken();
    const user = getUser();
    if (!token) throw redirect({ to: "/login" });
    if (user?.role !== "ADMIN") throw redirect({ to: "/app" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  const user = getUser();
  return (
    <AppShell
      nav={ADMIN_NAV}
      sectionLabel="Administration"
      who={{ name: user?.name ?? "Admin", role: user?.role ?? "ADMIN" }}
    >
      <Outlet />
    </AppShell>
  );
}
