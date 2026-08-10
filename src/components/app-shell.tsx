import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  Bell,
  ClipboardList,
  Cog,
  FileClock,
  Gauge,
  History,
  LayoutGrid,
  ListOrdered,
  MonitorDot,
  PlusCircle,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { Logo } from "./logo";
import { LiveDot } from "./priority-badge";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type NavItem = {
  to:
    | "/app"
    | "/app/new-request"
    | "/app/queue"
    | "/app/history"
    | "/app/notifications"
    | "/ops"
    | "/ops/triage"
    | "/ops/counters"
    | "/admin"
    | "/admin/staff"
    | "/admin/queues"
    | "/admin/rules"
    | "/admin/analytics"
    | "/admin/audit"
    | "/admin/settings";
  label: string;
  short: string;
  icon: ComponentType<{ className?: string }>;
};

export const USER_NAV: NavItem[] = [
  { to: "/app", label: "Dashboard", short: "Home", icon: Gauge },
  { to: "/app/new-request", label: "New request", short: "New", icon: PlusCircle },
  { to: "/app/queue", label: "My queue", short: "Queue", icon: ListOrdered },
  { to: "/app/history", label: "History", short: "History", icon: History },
  { to: "/app/notifications", label: "Notifications", short: "Alerts", icon: Bell },
];

export const OPS_NAV: NavItem[] = [
  { to: "/ops", label: "Operations center", short: "Ops", icon: LayoutGrid },
  { to: "/ops/triage", label: "Priority review", short: "Triage", icon: ShieldCheck },
  { to: "/ops/counters", label: "Counters & staff", short: "Counters", icon: MonitorDot },
];

export const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Users", short: "Users", icon: Users },
  { to: "/admin/staff", label: "Staff", short: "Staff", icon: ClipboardList },
  { to: "/admin/queues", label: "Queue configuration", short: "Queues", icon: SlidersHorizontal },
  { to: "/admin/rules", label: "Priority rules", short: "Rules", icon: ShieldCheck },
  { to: "/admin/analytics", label: "Analytics", short: "Charts", icon: Activity },
  { to: "/admin/audit", label: "Audit log", short: "Audit", icon: ScrollText },
  { to: "/admin/settings", label: "System settings", short: "Settings", icon: Cog },
];

const SECTIONS = [
  { key: "user", label: "User", to: "/app" as const },
  { key: "staff", label: "Staff", to: "/ops" as const },
  { key: "admin", label: "Admin", to: "/admin" as const },
];

function SidebarLink({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      activeOptions={{ exact: item.to === "/app" || item.to === "/ops" || item.to === "/admin" }}
      className="group relative flex items-center gap-2.5 px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground"
    >
      {({ isActive }) => (
        <>
          {isActive ? (
            <motion.span
              layoutId="sidebar-active"
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 -z-10 border-l-2 border-primary bg-accent/60"
            />
          ) : null}
          <Icon className="size-4 shrink-0" />
          <span className="min-w-0 truncate font-medium">{item.label}</span>
        </>
      )}
    </Link>
  );
}

export function AppShell({
  nav,
  sectionLabel,
  who,
  children,
}: {
  nav: NavItem[];
  sectionLabel: string;
  who: { name: string; role: string };
  children?: ReactNode;
}) {
  const { metrics, notifications } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-surface/40 lg:flex">
          <div className="flex h-14 items-center border-b border-border px-4">
            <Logo />
          </div>
          <div className="px-4 py-4">
            <div className="eyebrow">{sectionLabel}</div>
          </div>
          <nav className="flex flex-col">
            {nav.map((item) => (
              <SidebarLink key={item.to} item={item} />
            ))}
          </nav>
          <div className="mt-auto space-y-3 border-t border-border p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Waiting now</span>
              <span className="num text-foreground">{metrics.waiting}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Serving</span>
              <span className="num text-foreground">{metrics.serving}</span>
            </div>
            <LiveDot label="SOCKET CONNECTED" />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 grid h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="lg:hidden">
                <Logo />
              </div>
              <div className="hidden min-w-0 items-center gap-2 text-xs text-muted-foreground lg:flex">
                <span className="truncate">{sectionLabel}</span>
                <span className="text-border-strong">/</span>
                <span className="truncate text-foreground">
                  {nav.find((n) => n.to === pathname)?.label ?? nav[0]?.label}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center border border-border p-0.5 sm:flex">
                {SECTIONS.map((s) => (
                  <Link
                    key={s.key}
                    to={s.to}
                    className="px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-foreground"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
              <Link
                to="/app/notifications"
                className="relative grid size-8 place-items-center border border-border text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="size-4" />
                <AnimatePresence>
                  {unread > 0 ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="num absolute -right-1.5 -top-1.5 grid size-4 place-items-center rounded-full bg-critical text-[9px] font-bold text-critical-foreground"
                    >
                      {unread}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </Link>
              <div className="flex items-center gap-2 border border-border px-2 py-1">
                <span className="grid size-6 place-items-center bg-accent text-[10px] font-semibold">
                  {who.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </span>
                <span className="hidden text-xs leading-tight sm:block">
                  <span className="block font-medium">{who.name}</span>
                  <span className="block text-[10px] text-muted-foreground">{who.role}</span>
                </span>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 pb-24 lg:pb-10">{children ?? <Outlet />}</main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-xl">
          {nav.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{
                  exact: item.to === "/app" || item.to === "/ops" || item.to === "/admin",
                }}
                className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] text-muted-foreground transition-colors data-[status=active]:text-foreground"
              >
                <Icon className="size-[18px]" />
                {item.short}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
  meta,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-b border-border px-4 py-5 sm:px-6 sm:py-6">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold sm:text-2xl">{title}</h1>
        {subtitle ? (
          <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">{subtitle}</p>
        ) : null}
        {meta}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Disclaimer({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 border border-border bg-muted/30 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground",
        className,
      )}
    >
      <FileClock className="mt-0.5 size-3.5 shrink-0" />
      Priority suggestions assist staff workflow and do not replace professional judgement.
      PriorityQ does not diagnose conditions.
    </p>
  );
}
