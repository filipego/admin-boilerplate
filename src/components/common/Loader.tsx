"use client";

import { cn } from "@/lib/utils";

export default function Loader({ size = "md", className, label }: { size?: "xs" | "sm" | "md" | "lg"; className?: string; label?: string }) {
  const dims = size === "xs" ? "h-4 w-4" : size === "sm" ? "h-5 w-5" : size === "lg" ? "h-8 w-8" : "h-6 w-6";
  return (
    <span className={cn("inline-flex items-center gap-2", className)} role="status" aria-live="polite" aria-busy="true">
      <span className={cn("animate-spin rounded-full border-2 border-muted border-t-primary", dims)} />
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}


