"use client";

import { cn } from "@/lib/utils";
import StatusBadge from "./StatusBadge";

type StatCardProps = {
  label: string;
  value: string | number;
  deltaLabel?: string; // e.g., +12% vs last week
  deltaStatus?: "success" | "warning" | "destructive" | "info" | "default";
  icon?: React.ReactNode;
  className?: string;
};

export default function StatCard({ label, value, deltaLabel, deltaStatus = "default", icon, className }: StatCardProps) {
  return (
    <div className={cn("rounded-lg border p-4 bg-card", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold leading-none tracking-tight">{value}</div>
        </div>
        {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      </div>
      {deltaLabel ? (
        <div className="pt-2">
          <StatusBadge size="sm" status={deltaStatus}>{deltaLabel}</StatusBadge>
        </div>
      ) : null}
    </div>
  );
}


