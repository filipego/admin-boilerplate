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
  success: "bg-success-subtle text-success-subtle-foreground",
  warning: "bg-warning-subtle text-warning-subtle-foreground",
  destructive: "bg-error-subtle text-error-subtle-foreground",
  info: "bg-info-subtle text-info-subtle-foreground",
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
      return "bg-success";
    case "warning":
      return "bg-warning";
    case "destructive":
      return "bg-error";
    case "info":
      return "bg-info";
    default:
      return "bg-foreground/50";
  }
}


