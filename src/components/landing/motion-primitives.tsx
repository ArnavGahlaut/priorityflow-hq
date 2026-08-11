import { motion, useInView, useMotionValue, useSpring, type Variants } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const EASE = [0.22, 0.61, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export const stagger = (delay = 0.06, start = 0.05): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: delay, delayChildren: start } },
});

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-12% 0px -12% 0px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGroup({
  children,
  className,
  delay = 0.07,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={stagger(delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
    >
      {children}
    </motion.div>
  );
}

export const StaggerItem = motion.div;

/** Word-by-word editorial reveal. */
export function RevealWords({
  text,
  className,
  wordClassName,
  delay = 0,
  animateOnMount = false,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  animateOnMount?: boolean;
}) {
  const words = text.split(" ");
  const view = animateOnMount
    ? { animate: "show" as const }
    : { whileInView: "show" as const, viewport: { once: true, margin: "-15% 0px" } };

  return (
    <motion.span
      className={cn("inline-block", className)}
      variants={stagger(0.055, delay)}
      initial="hidden"
      {...view}
    >
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className={cn("inline-block", wordClassName)}
            variants={{
              hidden: { y: "110%", opacity: 0 },
              show: { y: "0%", opacity: 1, transition: { duration: 0.75, ease: EASE } },
            }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

export function Counter({
  to,
  decimals = 0,
  suffix = "",
  prefix = "",
  duration = 1.6,
  className,
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: duration * 1000, bounce: 0 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, to, mv]);

  useEffect(() => spring.on("change", (v) => setDisplay(v.toFixed(decimals))), [spring, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
