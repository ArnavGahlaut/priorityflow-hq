import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Activity, ShieldCheck, Timer } from "lucide-react";

import { Logo } from "@/components/logo";
import { Reveal } from "@/components/reveal";
import { PriorityBadge } from "@/components/priority-badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PriorityQ — Priority-aware queue management" },
      {
        name: "description",
        content:
          "PriorityQ replaces first-come-first-served lines with transparent, priority-aware queueing: live positions, honest ETAs and staff-confirmed urgency.",
      },
      { property: "og:title", content: "PriorityQ — Priority-aware queue management" },
      {
        property: "og:description",
        content: "Live positions, honest ETAs and staff-confirmed urgency for high-volume service teams.",
      },
    ],
  }),
  component: Landing,
});

const STEPS = [
  {
    icon: ShieldCheck,
    title: "Describe the need",
    body: "A request captures what is wrong, not just who arrived first. Rules read the description and suggest a priority.",
  },
  {
    icon: Activity,
    title: "Staff confirm urgency",
    body: "Every suggestion is reviewed. Staff confirm, change or escalate, and each decision is written to the audit log.",
  },
  {
    icon: Timer,
    title: "Everyone sees the truth",
    body: "Position, counter and ETA update live, with anti-starvation escalation so ordinary requests are never buried.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-2 text-xs">
            <Link to="/ops" className="px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground">
              Staff
            </Link>
            <Link to="/admin" className="px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground">
              Admin
            </Link>
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 bg-primary px-3 py-1.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Open app <ArrowRight className="size-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      <section className="grid-lines border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <span className="eyebrow">Priority-aware queue management</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              The queue should reflect urgency, not arrival time.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              PriorityQ gives service teams a live, explainable queue: rules suggest priority, staff
              confirm it, and every person waiting sees their real position and estimated time.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-wrap gap-2">
              <Link
                to="/app"
                className="inline-flex items-center gap-2 bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Join a queue <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/ops"
                className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-sm transition-colors hover:bg-accent"
              >
                Operations center
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.32}>
            <div className="mt-14 flex flex-wrap items-center gap-2 border-t border-border pt-6">
              <span className="mr-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Serving order
              </span>
              {(["CRITICAL", "HIGH", "NORMAL", "LOW"] as const).map((p, i) => (
                <motion.span
                  key={p}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
                >
                  <PriorityBadge priority={p} size="xs" />
                </motion.span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-px bg-border px-4 py-16 sm:px-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="h-full bg-background p-6">
                <s.icon className="size-4 text-muted-foreground" />
                <h2 className="mt-4 text-base font-semibold">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <footer className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-8 sm:px-6">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Demonstration data. Priority suggestions are decision support only and never replace
          professional judgement.
        </p>
        <Link to="/app" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
          Open app
        </Link>
      </footer>
    </div>
  );
}
