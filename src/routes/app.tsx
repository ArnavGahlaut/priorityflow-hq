import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell, USER_NAV } from "@/components/app-shell";
import { getToken, getUser } from "@/lib/auth";

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    if (!getToken()) throw redirect({ to: "/login" });
  },
  component: UserLayout,
});

function UserLayout() {
  const user = getUser();
  return (
    <AppShell
      nav={USER_NAV}
      sectionLabel="User workspace"
      who={{ name: user?.name ?? "User", role: user?.role ?? "USER" }}
    >
      <Outlet />
    </AppShell>
  );
}
