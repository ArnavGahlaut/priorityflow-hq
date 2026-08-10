import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Bell, CheckCheck, MapPin, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect } from "react";

import { PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/metric-card";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — PriorityQ" },
      { name: "description", content: "Live position, counter and priority-review updates for your request." },
      { property: "og:title", content: "Notifications — PriorityQ" },
      { property: "og:description", content: "Real-time queue updates delivered as you wait." },
    ],
  }),
  component: NotificationsPage,
});

const ICONS = {
  position: RefreshCw,
  counter: MapPin,
  eta: RefreshCw,
  review: ShieldCheck,
  system: Bell,
} as const;

function NotificationsPage() {
  const { notifications, markNotificationsRead } = useStore();

  useEffect(() => {
    const t = setTimeout(markNotificationsRead, 1200);
    return () => clearTimeout(t);
  }, [markNotificationsRead]);

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Every live update pushed to you while you wait."
        actions={
          <button
            onClick={markNotificationsRead}
            className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs transition-colors hover:bg-accent"
          >
            <CheckCheck className="size-3.5" /> Mark all read
          </button>
        }
      />
      <div className="p-4 sm:p-6">
        <Panel dense>
          <ul>
            <AnimatePresence initial={false}>
              {notifications.map((n) => {
                const Icon = ICONS[n.kind];
                return (
                  <motion.li
                    key={n.id}
                    layout
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 border-b border-border/50 px-4 py-3.5 last:border-b-0"
                  >
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center border border-border bg-background/60">
                      <Icon className="size-3.5 text-muted-foreground" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-[13px] font-medium">{n.title}</span>
                        {n.unread ? <span className="size-1.5 shrink-0 rounded-full bg-primary" /> : null}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{n.body}</p>
                    </div>
                    <span className="num shrink-0 text-[11px] text-muted-foreground">{n.time}</span>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </Panel>
      </div>
    </>
  );
}
