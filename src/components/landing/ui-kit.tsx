import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type Priority = "critical" | "high" | "normal";

export const priorityChip = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em]",
  {
    variants: {
      tone: {
        critical: "border-critical/40 bg-critical-muted text-critical",
        high: "border-high/40 bg-high-muted text-high",
        normal: "border-border-strong bg-normal-muted text-muted-foreground",
        success: "border-success/40 bg-success-muted text-success",
      },
    },
    defaultVariants: { tone: "normal" },
  },
);

export function Chip({
  tone,
  children,
  className,
  dot = true,
}: VariantProps<typeof priorityChip> & { children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn(priorityChip({ tone }), className)}>
      {dot && (
        <span
          className={cn(
            "size-1.5 rounded-full",
            tone === "critical" && "bg-critical",
            tone === "high" && "bg-high",
            tone === "success" && "bg-success",
            (!tone || tone === "normal") && "bg-muted-foreground",
          )}
        />
      )}
      {children}
    </span>
  );
}

export const buttonMotion = {
  whileHover: { y: -2 },
  whileTap: { scale: 0.975, y: 0 },
  transition: { type: "spring" as const, stiffness: 420, damping: 28 },
};

export function ActionButton({
  children,
  variant = "solid",
  className,
  onClick,
}: {
  children: ReactNode;
  variant?: "solid" | "ghost";
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      {...buttonMotion}
      onClick={onClick}
      className={cn(
        "group relative inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-tight transition-colors",
        variant === "solid" &&
          "bg-primary text-primary-foreground shadow-[0_16px_40px_-20px_oklch(0_0_0/0.9)] hover:bg-primary/90",
        variant === "ghost" && "border border-border-strong text-foreground hover:bg-accent",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

export function SectionShell({
  eyebrow,
  index,
  children,
  className,
  id,
}: {
  eyebrow?: string;
  index?: string;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("relative border-t border-border px-6 py-28 md:py-40", className)}>
      <div className="mx-auto w-full max-w-6xl">
        {(eyebrow || index) && (
          <div className="mb-14 flex items-baseline justify-between gap-6 md:mb-20">
            <span className="text-eyebrow">{eyebrow}</span>
            <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground/60">
              {index}
            </span>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
