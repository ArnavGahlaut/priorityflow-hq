import { animate, useInView, useMotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface Props {
  value: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  /** Animate only when scrolled into view. */
  onView?: boolean;
}

export function AnimatedNumber({
  value,
  decimals = 0,
  duration = 1.1,
  prefix = "",
  suffix = "",
  className,
  onView = true,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (onView && !inView) return;
    const from = started.current ? mv.get() : 0;
    started.current = true;
    const controls = animate(mv, value, {
      duration: from === 0 ? duration : 0.45,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, inView, onView, duration, mv]);

  return (
    <span ref={ref} className={cn("num", className)}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/** mm ss formatted animated duration, e.g. 11m 24s */
export function AnimatedDuration({
  seconds,
  className,
}: {
  seconds: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, seconds, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [seconds, inView, mv]);

  const m = Math.floor(display / 60);
  const s = Math.floor(display % 60);

  return (
    <span ref={ref} className={cn("num", className)}>
      {m}m {s.toString().padStart(2, "0")}s
    </span>
  );
}
