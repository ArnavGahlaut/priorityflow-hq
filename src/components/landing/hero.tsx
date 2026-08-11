import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, Activity } from "lucide-react";
import { RevealWords, EASE } from "./motion-primitives";
import { ActionButton, Chip } from "./ui-kit";
import { useNavigate } from "@tanstack/react-router";

type Ticket = { id: string; tone: "critical" | "high" | "normal" };

const initial: Ticket[] = [
  { id: "#201", tone: "critical" },
  { id: "#107", tone: "high" },
  { id: "#108", tone: "high" },
  { id: "#114", tone: "normal" },
  { id: "#115", tone: "normal" },
  { id: "#116", tone: "normal" },
];

function useLiveQueue() {
  const [tickets, setTickets] = useState(initial);
  const [serving, setServing] = useState("#201");
  const [counter, setCounter] = useState(117);

  useEffect(() => {
    const t = setInterval(() => {
      setTickets((prev) => {
        const next = prev.slice(1);
        const n = counter + 1;
        setCounter(n);
        const tone: Ticket["tone"] = n % 7 === 0 ? "critical" : n % 3 === 0 ? "high" : "normal";
        const incoming = { id: `#${n}`, tone };
        setServing(prev[0]?.id ?? "#000");
        const merged = [...next, incoming];
        const rank = { critical: 0, high: 1, normal: 2 } as const;
        return merged.sort((a, b) => rank[a.tone] - rank[b.tone]);
      });
    }, 2600);
    return () => clearInterval(t);
  }, [counter]);

  return { tickets, serving };
}

function QueueRow({ ticket, first }: { ticket: Ticket; first: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24, filter: "blur(4px)" }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="flex items-center justify-between border-b border-border px-5 py-3.5 last:border-b-0"
    >
      <div className="flex items-center gap-3">
        <span
          className={
            "h-6 w-[2px] rounded-full " +
            (ticket.tone === "critical"
              ? "bg-critical"
              : ticket.tone === "high"
                ? "bg-high"
                : "bg-muted-foreground/40")
          }
        />
        <span className="font-mono text-sm tracking-tight">{ticket.id}</span>
      </div>
      {first ? (
        <motion.span layout className="font-mono text-[10px] uppercase tracking-[0.16em] text-success">
          now serving
        </motion.span>
      ) : (
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
          {ticket.tone}
        </span>
      )}
    </motion.div>
  );
}

export function Hero() {
  const { tickets, serving } = useLiveQueue();
  const navigate = useNavigate();

  return (
    <section className="glow-top relative overflow-hidden px-6 pb-28 pt-36 md:pt-44">
      <div className="hairline-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(70%_60%_at_50%_20%,black,transparent)]" />
      <div className="relative mx-auto grid w-full max-w-6xl gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mb-8"
          >
            <Chip tone="success">
              <Activity className="size-3" /> live queue orchestration
            </Chip>
          </motion.div>

          <h1 className="text-display text-[clamp(2.75rem,6.4vw,5.25rem)]">
            <RevealWords text="Queues shouldn't decide" animateOnMount delay={0.12} />
            <br />
            <RevealWords
              text="who waits."
              animateOnMount
              delay={0.34}
              wordClassName="italic text-muted-foreground"
            />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.6 }}
            className="mt-8 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            Priority-aware queue management that routes urgent requests, coordinates staff, and keeps
            everyone updated in real time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.75 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
          <ActionButton onClick={() => navigate({ to: "/app" })}>
           Open operations dashboard
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </ActionButton>
          <ActionButton variant="ghost" onClick={() => document.getElementById("operations")?.scrollIntoView({ behavior: "smooth" })}>
            See the priority engine
          </ActionButton>
          </motion.div>
          
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
          className="panel relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <span className="text-eyebrow">counter 03 · main hall</span>
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <motion.span
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="size-1.5 rounded-full bg-success"
              />
              live
            </span>
          </div>

          <div className="border-b border-border px-5 py-6">
            <span className="text-eyebrow">now serving</span>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={serving}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="mt-2 font-mono text-4xl tracking-tight"
              >
                {serving}
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div layout className="max-h-[22rem] overflow-hidden">
            <AnimatePresence initial={false} mode="popLayout">
              {tickets.map((t, i) => (
                <QueueRow key={t.id} ticket={t} first={i === 0} />
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
