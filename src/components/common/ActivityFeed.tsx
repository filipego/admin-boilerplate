"use client";

import { cn } from "@/lib/utils";

export type ActivityItem = {
  id: string;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  time: string;
};

export default function ActivityFeed({ items, className }: { items: ActivityItem[]; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute left-[10px] top-0 bottom-0 w-px bg-border" />
      <ul className="space-y-4">
        {items.map((it) => (
          <li key={it.id} className="relative pl-8">
            <span className="absolute left-0 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full border bg-background">{it.icon}</span>
            <div className="text-sm font-medium">{it.title}</div>
            {it.description ? <div className="text-xs text-muted-foreground">{it.description}</div> : null}
            <div className="text-[11px] text-muted-foreground mt-1">{it.time}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}


