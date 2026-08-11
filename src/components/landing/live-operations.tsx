import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import { Reveal, RevealWords } from "./motion-primitives";
import { SectionShell, Chip } from "./ui-kit";

const staffSeed = [
  { name: "Counter 01", who: "A. Meyer", status: "serving" },
  { name: "Counter 02", who: "R. Okafor", status: "available" },
  { name: "Counter 03", who: "L. Tanaka", status: "serving" },
  { name: "Counter 04", who: "—", status: "break" },
];

const statusTone: Record<string, string> = {
  serving: "text-high",
  available: "text-success",
  break: "text-muted-foreground",
};

const notifications = [
  { id: 1, text: "#201 escalated to critical", tone: "critical" as const },
  { id: 2, text: "Counter 02 now available", tone: "success" as const },
  { id: 3, text: "#108 reassigned to Counter 03", tone: "high" as const },
  { id: 4, text: "Average wait down 2.4 min", tone: "success" as const },
];

const tabs = ["Queue", "Staff", "Counters"] as const;

export function LiveOperations() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Queue");
  const [queue, setQueue] = useState(["#201", "#107", "#108", "#114", "#115"]);
  const [staff, setStaff] = useState(staffSeed);
  const [toast, setToast] = useState<(typeof notifications)[number] | null>(null);

  useEffect(() => {
    let n = 0;
    const t = setInterval(() => {
      n += 1;
      setQueue((q) => {
        const next = [...q];
        const moved = next.splice(1 + (n % 3), 1)[0];
        if (moved) next.splice(1, 0, moved);
        return next;
      });
      setStaff((s) =>
        s.map((m, i) =>
          i === n % s.length
            ? { ...m, status: m.status === "available" ? "serving" : "available" }
            : m,
        ),
      );
      const note = notifications[n % notifications.length];
      setToast(note ?? null);
      setTimeout(() => setToast(null), 2600);
    }, 3400);
    return () => clearInterval(t);
  }, []);

  return (
    <SectionShell eyebrow="live operations" index="04 / 07">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <h2 className="text-display text-[clamp(2rem,4.2vw,3.5rem)]">
          <RevealWords text="The floor," />{" "}
          <RevealWords text="in one surface." wordClassName="italic text-muted-foreground" />
        </h2>
        <Reveal delay={0.1}>
          <p className="max-w-md text-muted-foreground lg:ml-auto">
            Positions, counters, staff state and escalations move together. No refresh, no radio
            chatter, no whiteboard.
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.1} className="mt-14">
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
            <div className="flex gap-1 rounded-full border border-border p-1">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="relative rounded-full px-4 py-1.5 text-xs tracking-tight transition-colors"
                >
                  {tab === t && (
                    <motion.span
                      layoutId="ops-tab"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-accent"
                    />
                  )}
                  <span
                    className={`relative ${tab === t ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {t}
                  </span>
                </button>
              ))}
            </div>
            <Chip tone="success">operational</Chip>
          </div>

          <div className="grid gap-px bg-border md:grid-cols-[1.1fr_0.9fr]">
            <div className="bg-surface p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.32 }}
                >
                  {tab === "Queue" && (
                    <div className="space-y-2">
                      {queue.map((id, i) => (
                        <motion.div
                          key={id}
                          layout
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="flex items-center justify-between rounded-md border border-border bg-surface-raised px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[10px] text-muted-foreground/60">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="font-mono text-sm">{id}</span>
                          </div>
                          <Chip tone={i === 0 ? "critical" : i < 3 ? "high" : "normal"}>
                            {i === 0 ? "critical" : i < 3 ? "high" : "normal"}
                          </Chip>
                        </motion.div>
                      ))}
                    </div>
                  )}
                  {tab === "Staff" && (
                    <div className="space-y-2">
                      {staff.map((m) => (
                        <div
                          key={m.name}
                          className="flex items-center justify-between rounded-md border border-border bg-surface-raised px-4 py-3"
                        >
                          <div>
                            <p className="text-sm tracking-tight">{m.who}</p>
                            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
                              {m.name}
                            </p>
                          </div>
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={m.status}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.28 }}
                              className={`font-mono text-[10px] uppercase tracking-[0.16em] ${statusTone[m.status]}`}
                            >
                              {m.status}
                            </motion.span>
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  )}
                  {tab === "Counters" && (
                    <div className="grid grid-cols-2 gap-2">
                      {staff.map((m) => (
                        <motion.div
                          key={m.name}
                          whileHover={{ y: -4 }}
                          className="rounded-md border border-border bg-surface-raised p-4"
                        >
                          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
                            {m.name}
                          </p>
                          <p className="mt-3 font-mono text-2xl tracking-tight">
                            {m.status === "available" ? "—" : `#${100 + m.name.length * 3}`}
                          </p>
                          <p className={`mt-2 text-xs ${statusTone[m.status]}`}>{m.status}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative bg-surface p-6">
              <span className="text-eyebrow">activity</span>
              <div className="mt-5 space-y-2">
                {notifications.map((n, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5 text-xs text-muted-foreground"
                  >
                    <Check className="size-3 shrink-0 text-success" />
                    {n.text}
                  </motion.div>
                ))}
              </div>

              <div className="pointer-events-none absolute inset-x-6 bottom-6">
                <AnimatePresence>
                  {toast && (
                    <motion.div
                      key={toast.id}
                      initial={{ opacity: 0, y: 20, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                      className="flex items-center gap-3 rounded-lg border border-border-strong bg-popover px-4 py-3 shadow-[0_20px_50px_-24px_oklch(0_0_0/0.9)]"
                    >
                      <Bell className="size-3.5 text-high" />
                      <span className="text-xs">{toast.text}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </SectionShell>
  );
}
