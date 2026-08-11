import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Counter, Reveal, RevealWords } from "./motion-primitives";
import { SectionShell } from "./ui-kit";

const waitSeries = [42, 38, 33, 29, 24, 19, 14, 11];
const lengthSeries = [18, 24, 21, 30, 26, 17, 12, 9];

function AreaChart() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const w = 320;
  const h = 120;
  const max = Math.max(...waitSeries);
  const pts = waitSeries.map((v, i) => [
    (i / (waitSeries.length - 1)) * w,
    h - (v / max) * (h - 12),
  ]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");

  return (
    <svg ref={ref} viewBox={`0 0 ${w} ${h}`} className="h-32 w-full overflow-visible">
      <motion.path
        d={`${line} L${w},${h} L0,${h} Z`}
        fill="var(--success)"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 0.08 } : {}}
        transition={{ duration: 0.8, delay: 0.5 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke="var(--success)"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={inView ? { pathLength: 1 } : {}}
        transition={{ duration: 1.4, ease: [0.22, 0.61, 0.36, 1] }}
      />
      {pts.map((p, i) => (
        <motion.circle
          key={i}
          cx={p[0]}
          cy={p[1]}
          r="2"
          fill="var(--success)"
          initial={{ opacity: 0, scale: 0 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.4 + i * 0.08, duration: 0.35 }}
        />
      ))}
    </svg>
  );
}

function Bars() {
  return (
    <div className="flex h-32 items-end gap-2">
      {lengthSeries.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0, opacity: 0 }}
          whileInView={{ height: `${(v / 32) * 100}%`, opacity: 1 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.7, delay: i * 0.07, ease: [0.22, 0.61, 0.36, 1] }}
          className={`flex-1 rounded-t-sm ${i >= lengthSeries.length - 2 ? "bg-high" : "bg-muted-foreground/25"}`}
        />
      ))}
    </div>
  );
}

function Utilization({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
        <span className="font-mono text-xs">
          <Counter to={value} suffix="%" duration={1.4} />
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className={`h-full rounded-full ${tone}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

export function Analytics() {
  return (
    <SectionShell eyebrow="analytics" index="06 / 07">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
        <h2 className="text-display text-[clamp(2rem,4.2vw,3.5rem)]">
          <RevealWords text="Proof, not" />{" "}
          <RevealWords text="anecdotes." wordClassName="italic text-muted-foreground" />
        </h2>
        <Reveal delay={0.1}>
          <p className="max-w-md text-muted-foreground lg:ml-auto">
            Every call, escalation and handover is measured — so operations decisions come from the
            floor's real behaviour.
          </p>
        </Reveal>
      </div>

      <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2">
        <Reveal className="bg-surface p-7">
          <span className="text-eyebrow">average waiting time</span>
          <p className="mt-2 font-mono text-4xl tracking-tighter text-success">
            <Counter to={11} suffix=" min" />
          </p>
          <div className="mt-6">
            <AreaChart />
          </div>
        </Reveal>

        <Reveal delay={0.08} className="bg-surface p-7">
          <span className="text-eyebrow">queue length</span>
          <p className="mt-2 font-mono text-4xl tracking-tighter">
            <Counter to={9} />
          </p>
          <div className="mt-6">
            <Bars />
          </div>
        </Reveal>

        <Reveal delay={0.12} className="bg-surface p-7">
          <span className="text-eyebrow">requests served today</span>
          <p className="mt-2 font-mono text-4xl tracking-tighter">
            <Counter to={1284} />
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { l: "critical", v: 46, c: "text-critical" },
              { l: "high", v: 318, c: "text-high" },
              { l: "normal", v: 920, c: "text-muted-foreground" },
            ].map((s) => (
              <div key={s.l}>
                <p className={`font-mono text-lg ${s.c}`}>
                  <Counter to={s.v} />
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.16} className="bg-surface p-7">
          <span className="text-eyebrow">counter utilisation</span>
          <div className="mt-7 space-y-5">
            <Utilization label="counter 01" value={92} tone="bg-success" />
            <Utilization label="counter 02" value={78} tone="bg-success" />
            <Utilization label="counter 03" value={64} tone="bg-high" />
            <Utilization label="counter 04" value={41} tone="bg-muted-foreground/50" />
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
