import { cn } from "@/lib/utils";
import type { Priority, RequestStatus } from "@/lib/types";

const PRIORITY_STYLES: Record<Priority, string> = {
  CRITICAL: "text-critical bg-critical-soft border-critical/35",
  HIGH: "text-high bg-high-soft border-high/35",
  NORMAL: "text-normal bg-normal-soft border-normal/30",
  LOW: "text-low bg-low-soft border-low/25",
};

export const PRIORITY_DOT: Record<Priority, string> = {
  CRITICAL: "bg-critical",
  HIGH: "bg-high",
  NORMAL: "bg-normal",
  LOW: "bg-low",
};

export const PRIORITY_TEXT: Record<Priority, string> = {
  CRITICAL: "text-critical",
  HIGH: "text-high",
  NORMAL: "text-normal",
  LOW: "text-low",
};

export function PriorityBadge({
  priority,
  size = "sm",
  className,
}: {
  priority: Priority;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border font-semibold uppercase tracking-[0.12em]",
        PRIORITY_STYLES[priority],
        size === "xs" && "px-1.5 py-0.5 text-[9px]",
        size === "sm" && "px-2 py-0.5 text-[10px]",
        size === "md" && "px-2.5 py-1 text-[11px]",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", PRIORITY_DOT[priority])} />
      {priority}
    </span>
  );
}

const STATUS_STYLES: Record<RequestStatus, string> = {
  WAITING: "text-muted-foreground bg-muted/60 border-border",
  CALLED: "text-high bg-high-soft border-high/30",
  SERVING: "text-success bg-success-soft border-success/30",
  COMPLETED: "text-muted-foreground bg-muted/40 border-border",
  LEFT: "text-muted-foreground bg-muted/40 border-border",
};

export function StatusPill({ status, className }: { status: RequestStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
        STATUS_STYLES[status],
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "SERVING" && "bg-success",
          status === "CALLED" && "bg-high",
          (status === "WAITING" || status === "COMPLETED" || status === "LEFT") &&
            "bg-muted-foreground",
        )}
      />
      {status}
    </span>
  );
}

export function LiveDot({ label = "LIVE", className }: { label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.16em] text-success",
        className,
      )}
    >
      <span className="relative flex size-1.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-success/70" />
        <span className="relative size-1.5 rounded-full bg-success" />
      </span>
      {label}
    </span>
  );
}
