import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell, OPS_NAV } from "@/components/app-shell";
import { getToken, getUser } from "@/lib/auth";

export const Route = createFileRoute("/ops")({
  beforeLoad: () => {
    const token = getToken();
    const user = getUser();
    if (!token) throw redirect({ to: "/login" });
    if (user?.role !== "OPERATOR" && user?.role !== "TRIAGE_LEAD" && user?.role !== "ADMIN") {
      throw redirect({ to: "/app" });
    }
  },
  component: OpsLayout,
});

function OpsLayout() {
  const user = getUser();
  return (
    <AppShell
      nav={OPS_NAV}
      sectionLabel="Operations"
      who={{ name: user?.name ?? "Staff", role: user?.role ?? "OPERATOR" }}
    >
      <Outlet />
    </AppShell>
  );
}
