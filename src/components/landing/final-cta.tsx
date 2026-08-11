import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { RevealWords, Reveal } from "./motion-primitives";
import { ActionButton } from "./ui-kit";

export function FinalCta() {
  const navigate = useNavigate();

  return (
    <section className="glow-top relative overflow-hidden border-t border-border px-6 py-36 text-center md:py-48">
      <div className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(60%_60%_at_50%_50%,black,transparent)]" />
      <div className="relative mx-auto max-w-4xl">
        <span className="text-eyebrow">07 / 07</span>
        <h2 className="text-display mt-8 text-[clamp(2.5rem,6vw,5rem)]">
          <RevealWords text="Turn waiting into an" />
          <br />
          <RevealWords text="intelligent process." wordClassName="italic text-muted-foreground" />
        </h2>
        <Reveal delay={0.2} className="mt-12 flex flex-wrap justify-center gap-3">
          <ActionButton onClick={() => navigate({ to: "/app" })}>
            Open operations dashboard
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </ActionButton>
        </Reveal>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
          className="mx-auto mt-24 h-px w-full max-w-2xl origin-center bg-border-strong"
        />
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="px-6 py-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
        <span>PriorityQ — priority queue operations</span>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}

export function SiteNav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-md"
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="font-mono text-xs uppercase tracking-[0.28em]">PriorityQ</span>
        <div className="flex items-center gap-2">
          <Link
            to="/ops"
            className="px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Staff
          </Link>
          <Link
            to="/admin"
            className="px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Admin
          </Link>
          <Link to="/app">
            <motion.span
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-block rounded-full border border-border-strong px-4 py-2 text-xs tracking-tight transition-colors hover:bg-accent"
            >
              Dashboard
            </motion.span>
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}