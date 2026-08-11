import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Reveal, RevealWords } from "./motion-primitives";
import { SectionShell } from "./ui-kit";

const stack = Array.from({ length: 14 }, (_, i) => i);

export function Problem() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 30%"] });

  const chaos = useTransform(scrollYProgress, [0, 0.55, 1], [1, 1, 0]);
  const order = useTransform(scrollYProgress, [0.5, 1], [0, 1]);
  const wait = useTransform(scrollYProgress, [0, 0.55], [4, 47]);
  const skew = useTransform(scrollYProgress, [0, 0.55, 1], [0, -6, 0]);

  return (
    <SectionShell eyebrow="the problem" index="02 / 07">
      <div ref={ref} className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
        <div>
          <h2 className="text-display text-[clamp(2rem,4.2vw,3.5rem)]">
            <RevealWords text="First in line is not" />
            <br />
            <RevealWords text="the same as" />{" "}
            <RevealWords text="first in need." wordClassName="italic text-muted-foreground" />
          </h2>
          <Reveal delay={0.15}>
            <p className="mt-8 max-w-md text-muted-foreground">
              A single ordered line treats a routine renewal exactly like a medical emergency. Tickets
              stack, wait time compounds, and staff spend the day negotiating exceptions instead of
              serving people.
            </p>
          </Reveal>

          <Reveal delay={0.25} className="mt-10 flex items-baseline gap-3">
            <motion.span className="font-mono text-5xl tracking-tighter text-critical">
              <MotionNumber value={wait} />
            </motion.span>
            <span className="text-eyebrow">min average wait · unmanaged</span>
          </Reveal>
        </div>

        <div className="panel relative min-h-[26rem] overflow-hidden p-6">
          <motion.div style={{ opacity: chaos }} className="absolute inset-0 p-6">
            <span className="text-eyebrow">traditional queue</span>
            <div className="mt-6 flex flex-wrap gap-2">
              {stack.map((i) => (
                <motion.div
                  key={i}
                  style={{ rotate: skew }}
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.055, duration: 0.4 }}
                  className="h-11 w-24 rounded-md border border-border bg-surface-raised"
                >
                  <span className="flex h-full items-center justify-center font-mono text-[11px] text-muted-foreground">
                    #{120 + i}
                  </span>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 h-px w-full bg-border" />
            <div className="mt-6 space-y-3">
              {["escalations handled manually", "urgent cases invisible", "staff load unbalanced"].map(
                (t) => (
                  <div key={t} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="size-1 rounded-full bg-critical" />
                    {t}
                  </div>
                ),
              )}
            </div>
          </motion.div>

          <motion.div
            style={{ opacity: order }}
            className="absolute inset-0 flex flex-col justify-center p-10"
          >
            <span className="text-eyebrow">resolution</span>
            <p className="text-display mt-4 text-[clamp(1.75rem,3vw,2.75rem)]">
              Priority changes everything.
            </p>
            <div className="mt-10 space-y-3">
              {[
                { l: "critical", w: "22%", c: "bg-critical" },
                { l: "high", w: "38%", c: "bg-high" },
                { l: "normal", w: "72%", c: "bg-muted-foreground/40" },
              ].map((r) => (
                <div key={r.l} className="flex items-center gap-4">
                  <span className="w-16 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {r.l}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      style={{ scaleX: order, transformOrigin: "left" }}
                      className={`h-full rounded-full ${r.c}`}
                      initial={false}
                      animate={{ width: r.w }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </SectionShell>
  );
}

function MotionNumber({ value }: { value: ReturnType<typeof useTransform<number, number>> }) {
  const rounded = useTransform(value, (v) => Math.round(v).toString());
  return <motion.span>{rounded}</motion.span>;
}
