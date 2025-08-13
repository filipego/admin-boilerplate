"use client";

import { cn } from "@/lib/utils";

type Status = "default" | "success" | "warning" | "destructive" | "info";
type Size = "sm" | "md";

export type StatusBadgeProps = {
  children?: React.ReactNode;
  label?: string;
  status?: Status;
  size?: Size;
  withDot?: boolean;
  className?: string;
};

const sizeClasses: Record<Size, string> = {
  sm: "h-5 px-2 text-[11px]",
  md: "h-6 px-2.5 text-xs",
};

const variantClasses: Record<Status, string> = {
  default: "bg-muted text-foreground/80 dark:text-muted-foreground",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  destructive: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  info: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
};

export default function StatusBadge({ children, label, status = "default", size = "sm", withDot = true, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        sizeClasses[size],
        variantClasses[status],
        className
      )}
    >
      {withDot ? <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full", dotColor(status))} /> : null}
      {children ?? label}
    </span>
  );
}

function dotColor(status: Status) {
  switch (status) {
    case "success":
      return "bg-emerald-500";
    case "warning":
      return "bg-amber-500";
    case "destructive":
      return "bg-rose-500";
    case "info":
      return "bg-sky-500";
    default:
      return "bg-foreground/50";
  }
}


