import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

export function Logo({ className, to = "/" }: { className?: string; to?: string }) {
  return (
    <Link to={to} className={cn("group flex items-center gap-2.5", className)}>
      <span className="relative grid size-7 place-items-center border border-border-strong bg-surface-raised">
        <span className="flex flex-col gap-[2px]">
          <span className="block h-[2px] w-3 bg-critical transition-all duration-300 group-hover:w-3.5" />
          <span className="block h-[2px] w-2.5 bg-high transition-all duration-300 group-hover:w-3" />
          <span className="block h-[2px] w-2 bg-normal transition-all duration-300 group-hover:w-2.5" />
        </span>
      </span>
      <span className="font-display text-[15px] font-semibold tracking-[-0.02em]">
        PriorityQ
      </span>
    </Link>
  );
}
