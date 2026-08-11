import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Radio } from "lucide-react";
import { Reveal, RevealWords, EASE } from "./motion-primitives";
import { SectionShell } from "./ui-kit";

export function Realtime() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-25%" });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const t1 = setTimeout(() => setStep(1), 1600);
    const t2 = setTimeout(() => setStep(2), 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [inView]);

  const position = step >= 2 ? 2 : 3;
  const eta = step >= 2 ? 8 : 12;

  return (
    <SectionShell eyebrow="real-time" index="05 / 07">
      <div className="max-w-2xl">
        <h2 className="text-display text-[clamp(2rem,4.2vw,3.5rem)]">
          <RevealWords text="One call on the floor." />
          <br />
          <RevealWords
            text="Every screen already knows."
            wordClassName="italic text-muted-foreground"
          />
        </h2>
        <Reveal delay={0.12}>
          <p className="mt-6 text-muted-foreground">
            When staff serve a token, positions and ETAs recalculate across every device instantly —
            no polling, no stale boards.
          </p>
        </Reveal>
      </div>

      <div ref={ref} className="mt-16 grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="panel relative mx-auto w-full max-w-sm p-7"
        >
          <div className="flex items-center justify-between">
            <span className="text-eyebrow">user screen</span>
            <AnimatePresence>
              {step >= 2 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 26 }}
                  className="flex items-center gap-1.5 rounded-full border border-success/40 bg-success-muted px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-success"
                >
                  <Radio className="size-3" /> live update
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-7 font-mono text-5xl tracking-tighter">Token #107</p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <Metric label="position" value={`#${position}`} />
            <Metric label="eta" value={`${eta} min`} />
          </div>

          <div className="mt-8 h-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-success"
              animate={{ width: step >= 2 ? "72%" : "48%" }}
              transition={{ duration: 0.8, ease: EASE }}
            />
          </div>
        </motion.div>

        <div className="relative flex h-24 items-center justify-center lg:h-64 lg:w-24">
          <div className="absolute h-px w-full bg-border lg:h-full lg:w-px" />
          <AnimatePresence>
            {step >= 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="relative rounded-full border border-border-strong bg-popover px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
              >
                sync
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="panel mx-auto w-full max-w-sm p-7"
        >
          <span className="text-eyebrow">staff dashboard · counter 02</span>
          <div className="mt-6 space-y-2">
            {["#106", "#107", "#108"].map((t) => {
              const called = step >= 1 && t === "#106";
              return (
                <motion.div
                  key={t}
                  animate={
                    called
                      ? { opacity: 0.35, x: -10, filter: "blur(1px)" }
                      : { opacity: 1, x: 0, filter: "blur(0px)" }
                  }
                  transition={{ duration: 0.5, ease: EASE }}
                  className="flex items-center justify-between rounded-md border border-border bg-surface-raised px-4 py-3"
                >
                  <span className="font-mono text-sm">{t}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {called ? "served" : "waiting"}
                  </span>
                </motion.div>
              );
            })}
          </div>
          <motion.div
            animate={step >= 1 ? { borderColor: "var(--success)" } : {}}
            className="mt-7 rounded-lg border border-border px-4 py-3 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            {step >= 1 ? "called #106" : "call next"}
          </motion.div>
        </motion.div>
      </div>
    </SectionShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-eyebrow">{label}</span>
      <div className="mt-1 h-10 overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.p
            key={value}
            initial={{ y: 26, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -26, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="font-mono text-3xl tracking-tight"
          >
            {value}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
