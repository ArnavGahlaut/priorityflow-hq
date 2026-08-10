import { motion } from "motion/react";
import type { ReactNode } from "react";

import { AnimatedDuration, AnimatedNumber } from "./animated-number";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  seconds,
  suffix,
  decimals,
  hint,
  tone = "neutral",
  icon,
  index = 0,
}: {
  label: string;
  value?: number;
  seconds?: number;
  suffix?: string;
  decimals?: number;
  hint?: ReactNode;
  tone?: "neutral" | "critical" | "high" | "normal" | "success";
  icon?: ReactNode;
  index?: number;
}) {
  const toneText =
    tone === "critical"
      ? "text-critical"
      : tone === "high"
        ? "text-high"
        : tone === "normal"
          ? "text-normal"
          : tone === "success"
            ? "text-success"
            : "text-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden border border-border bg-surface p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="eyebrow">{label}</span>
        {icon ? <span className="text-muted-foreground/70">{icon}</span> : null}
      </div>
      <div className={cn("mt-3 text-3xl font-semibold sm:text-[2rem]", toneText)}>
        {seconds !== undefined ? (
          <AnimatedDuration seconds={seconds} />
        ) : (
          <AnimatedNumber
            value={value ?? 0}
            decimals={decimals ?? 0}
            {...(suffix ? { suffix } : {})}
          />
        )}
      </div>
      {hint ? <div className="mt-2 text-xs text-muted-foreground">{hint}</div> : null}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          tone === "critical"
            ? "bg-critical"
            : tone === "high"
              ? "bg-high"
              : tone === "success"
                ? "bg-success"
                : "bg-primary",
        )}
      />
    </motion.div>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
  dense,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  dense?: boolean;
}) {
  return (
    <section className={cn("border border-border bg-surface", className)}>
      {title ? (
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="min-w-0 text-sm font-semibold tracking-[-0.01em]">{title}</div>
          {action}
        </header>
      ) : null}
      <div className={cn(dense ? "" : "p-4 sm:p-5")}>{children}</div>
    </section>
  );
}
