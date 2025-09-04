"use client";

import { cn } from "@/lib/utils";

export type Chip = { id: string; label: string };
export type ToolbarChipsProps = { chips: Chip[]; onRemove: (id: string) => void; onClear?: () => void; className?: string };

export default function ToolbarChips({ chips, onRemove, onClear, className }: ToolbarChipsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {chips.map((c) => (
        <button key={c.id} className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs hover:bg-accent" onClick={() => onRemove(c.id)}>
          {c.label}
          <span className="text-muted-foreground">✕</span>
        </button>
      ))}
      {chips.length > 0 && onClear ? (
        <button className="text-xs text-muted-foreground hover:underline" onClick={onClear}>Clear all</button>
      ) : null}
    </div>
  );
}

