import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Clock, MapPin, Radio } from "lucide-react";

import { PageHeader } from "@/components/app-shell";
import { AnimatedNumber } from "@/components/animated-number";
import { Panel } from "@/components/metric-card";
import { LiveDot, PriorityBadge, StatusPill } from "@/components/priority-badge";
import { queueName } from "@/lib/demo-data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Your queue status — PriorityQ" },
      {
        name: "description",
        content:
          "Track your live token, priority flag, queue position and estimated wait in real time.",
      },
      { property: "og:title", content: "Your queue status — PriorityQ" },
      {
        property: "og:description",
        content: "Live token, priority flag, position and estimated wait — updated in real time.",
      },
    ],
  }),
  component: UserDashboard,
});

function UserDashboard() {
  const { myRequest, positionOf, etaMinutesFor, waitingByQueue, notifications, counters } =
    useStore();

  if (!myRequest) {
    return (
      <>
        <PageHeader title="Your requests" subtitle="You have no active request right now." />
        <div className="p-4 sm:p-6">
          <Panel className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Submit a request and the priority engine will route you to the right queue.
            </p>
            <Link
              to="/app/new-request"
              className="mt-5 inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              New request <ArrowUpRight className="size-4" />
            </Link>
          </Panel>
        </div>
      </>
    );
  }

  const position = positionOf(myRequest.id);
  const eta = etaMinutesFor(myRequest.id);
  const queue = waitingByQueue(myRequest.queueId);
  const ahead = queue.slice(0, Math.max(position - 1, 0));
  const calledAt = counters.find((c) => c.servingToken === myRequest.token);

  return (
    <>
      <PageHeader
        title="Your request"
        subtitle="Position and estimated wait update automatically as staff call requests."
        actions={<LiveDot />}
      />

      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden border border-border bg-surface"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-high" />
            <div className="grid gap-6 p-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:p-6">
              <div>
                <div className="eyebrow">Your token</div>
                <div className="num mt-1 text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">
                  #{myRequest.token}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <PriorityBadge priority={myRequest.priority} size="md" />
                  <StatusPill status={myRequest.status} />
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 self-center sm:border-l sm:border-border sm:pl-6">
                <div>
                  <dt className="eyebrow">Queue</dt>
                  <dd className="mt-1 text-sm font-medium">{queueName(myRequest.queueId)}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Position</dt>
                  <dd className="mt-1 text-2xl font-semibold">
                    <AnimatedNumber value={position} prefix="#" onView={false} />
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Estimated wait</dt>
                  <dd className="mt-1 text-2xl font-semibold text-high">
                    <AnimatedNumber value={eta} suffix=" min" onView={false} />
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Waiting for</dt>
                  <dd className="num mt-1 text-sm font-medium">{myRequest.waitedMinutes} min</dd>
                </div>
              </dl>
            </div>
            <AnimatePresence>
              {calledAt ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 border-t border-high/30 bg-high-soft px-5 py-3 text-sm text-high sm:px-6"
                >
                  <MapPin className="size-4" /> Please proceed to {calledAt.name}.
                </motion.div>
              ) : null}
            </AnimatePresence>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border px-5 py-3 text-[11px] text-muted-foreground sm:px-6">
              <span>Request {myRequest.id}</span>
              <span>Submitted {myRequest.submittedAt}</span>
              <span>{myRequest.channel}</span>
              <span className="text-high">Priority flagged for staff review</span>
            </div>
          </motion.div>

          <Panel title="Queue tracker" action={<span className="text-xs text-muted-foreground">{queueName(myRequest.queueId)}</span>}>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Radio className="size-3.5 text-success" /> Now serving on this queue
              </div>
              <ol className="space-y-1.5">
                <AnimatePresence initial={false}>
                  {ahead.map((r, i) => (
                    <motion.li
                      key={r.id}
                      layout
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border border-border bg-background/50 px-3 py-2"
                    >
                      <span className="num text-xs text-muted-foreground">{i + 1}</span>
                      <span className="num min-w-0 truncate text-sm">#{r.token}</span>
                      <PriorityBadge priority={r.priority} size="xs" />
                    </motion.li>
                  ))}
                </AnimatePresence>
                <motion.li
                  layout
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border border-high/40 bg-high-soft px-3 py-2"
                >
                  <span className="num text-xs text-high">{position}</span>
                  <span className="num min-w-0 truncate text-sm font-semibold text-high">
                    #{myRequest.token} · you
                  </span>
                  <PriorityBadge priority={myRequest.priority} size="xs" />
                </motion.li>
              </ol>
              {queue.length > position ? (
                <p className="pt-1 text-[11px] text-muted-foreground">
                  {queue.length - position} request{queue.length - position === 1 ? "" : "s"} behind
                  you in this queue.
                </p>
              ) : null}
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Request detail">
            <p className="text-sm leading-relaxed text-muted-foreground">{myRequest.description}</p>
            <div className="mt-4 border border-border bg-background/50 p-3">
              <div className="eyebrow">Priority reason</div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {myRequest.reason}
              </p>
            </div>
          </Panel>

          <Panel
            title="Live updates"
            action={
              <Link to="/app/notifications" className="text-xs text-primary hover:underline">
                View all
              </Link>
            }
          >
            <ul className="space-y-3">
              {notifications.slice(0, 4).map((n) => (
                <motion.li
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-[auto_minmax(0,1fr)] gap-3"
                >
                  <Clock className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium">{n.title}</div>
                    <div className="num mt-0.5 text-[11px] text-muted-foreground">{n.time}</div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </Panel>

          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/app/queue"
              className="border border-border bg-surface px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
            >
              My queue
            </Link>
            <Link
              to="/app/new-request"
              className="bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              New request
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
