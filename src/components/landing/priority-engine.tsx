import { motion } from "motion/react";
import { Reveal, RevealWords, StaggerGroup } from "./motion-primitives";
import { SectionShell } from "./ui-kit";

const lanes = [
  {
    key: "normal",
    label: "Normal queue",
    desc: "Batched into the widest lane, served in order.",
    accent: "bg-muted-foreground/40",
    text: "text-muted-foreground",
    border: "border-border",
    tickets: ["#114", "#115", "#116", "#117"],
    sla: "≤ 18 min",
  },
  {
    key: "high",
    label: "High queue",
    desc: "Skips ahead of routine traffic, capped by fairness rules.",
    accent: "bg-high",
    text: "text-high",
    border: "border-high/35",
    tickets: ["#107", "#108"],
    sla: "≤ 6 min",
  },
  {
    key: "critical",
    label: "Critical queue",
    desc: "Pre-empts everything and pages the nearest free counter.",
    accent: "bg-critical",
    text: "text-critical",
    border: "border-critical/40",
    tickets: ["#201"],
    sla: "immediate",
  },
] as const;

function Connector({ delay, tone }: { delay: number; tone: string }) {
  return (
    <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="h-14 w-full">
      <motion.path
        d="M50 0 V26 H8 V60"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
        className="text-border-strong"
      />
      <motion.circle
        r="1.6"
        className={tone}
        fill="currentColor"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay }}
      >
        <animateMotion dur="2.4s" repeatCount="indefinite" path="M50 0 V26 H8 V60" begin={`${delay}s`} />
      </motion.circle>
    </svg>
  );
}

export function PriorityEngine() {
  return (
    <SectionShell eyebrow="intelligent priority" index="03 / 07">
      <div className="max-w-2xl">
        <h2 className="text-display text-[clamp(2rem,4.2vw,3.5rem)]">
          <RevealWords text="One intake." />{" "}
          <RevealWords text="Three destinies." wordClassName="italic text-muted-foreground" />
        </h2>
        <Reveal delay={0.12}>
          <p className="mt-6 text-muted-foreground">
            Every request passes through the priority engine — scored on urgency, service type, wait
            debt and staff availability — then routed into the lane that respects both need and
            fairness.
          </p>
        </Reveal>
      </div>

      <div className="mt-20">
        <StaggerGroup className="mx-auto grid max-w-md gap-3 sm:grid-cols-3">
          {["Normal", "High", "Critical"].map((r, i) => (
            <motion.div
              key={r}
              variants={{
                hidden: { opacity: 0, y: -18 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              className="rounded-lg border border-border bg-surface px-4 py-3 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
            >
              request · {r}
              <span className="sr-only">{i}</span>
            </motion.div>
          ))}
        </StaggerGroup>

        <Reveal delay={0.1} className="mx-auto mt-6 flex max-w-md justify-center">
          <div className="h-14 w-px bg-gradient-to-b from-border-strong to-transparent" />
        </Reveal>

        <Reveal delay={0.15}>
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="panel mx-auto flex max-w-xl items-center justify-between px-7 py-6"
          >
            <div>
              <span className="text-eyebrow">priority engine</span>
              <p className="mt-1 text-lg tracking-tight">Scoring · routing · rebalancing</p>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
              className="size-9 rounded-full border border-dashed border-border-strong"
            />
          </motion.div>
        </Reveal>

        <div className="mx-auto mt-2 grid max-w-5xl gap-4 md:grid-cols-3">
          {lanes.map((lane, i) => (
            <div key={lane.key}>
              <Connector delay={i * 0.4} tone={lane.text} />
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.65, delay: 0.15 + i * 0.12 }}
                whileHover={{ y: -6 }}
                className={`panel border ${lane.border} p-6`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[11px] uppercase tracking-[0.16em] ${lane.text}`}>
                    {lane.label}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">{lane.sla}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{lane.desc}</p>
                <div className="mt-6 space-y-2">
                  {lane.tickets.map((t, ti) => (
                    <motion.div
                      key={t}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + ti * 0.09, duration: 0.45 }}
                      className="flex items-center gap-3 rounded-md border border-border bg-surface-raised px-3 py-2"
                    >
                      <span className={`h-4 w-[2px] rounded-full ${lane.accent}`} />
                      <span className="font-mono text-xs">{t}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
