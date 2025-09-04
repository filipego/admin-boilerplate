"use client";

import UIButton from "@/components/common/UIButton";
import { Heading } from "@/components/common/Heading";
import { cn } from "@/lib/utils";

export type Step = {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
};

export default function Stepper({ steps, active, onActiveChange, className }: { steps: Step[]; active: number; onActiveChange: (i: number) => void; className?: string }) {
  const atStart = active <= 0;
  const atEnd = active >= steps.length - 1;

  return (
    <div className={cn("space-y-4", className)}>
      <ol className="flex flex-wrap items-center gap-3">
        {steps.map((s, idx) => (
          <li key={s.id} className={cn("flex items-center gap-2", idx === active ? "text-foreground" : "text-muted-foreground")}> 
            <button type="button" onClick={() => onActiveChange(idx)} className={cn("h-6 w-6 rounded-full border text-xs flex items-center justify-center", idx <= active ? "bg-primary text-primary-foreground border-primary" : "bg-background")}>{idx + 1}</button>
            <span className="text-sm">{s.title}</span>
          </li>
        ))}
      </ol>
      <div className="rounded-lg border p-4 min-h-40">
        <Heading as="h3" size="sm">{steps[active]?.title}</Heading>
        {steps[active]?.description ? (
          <p className="text-xs text-muted-foreground mt-1">{steps[active]?.description}</p>
        ) : null}
        <div className="mt-3">{steps[active]?.content}</div>
      </div>
      <div className="flex justify-between">
        <UIButton variant="outline" onClick={() => onActiveChange(active - 1)} disabled={atStart}>Back</UIButton>
        <UIButton onClick={() => onActiveChange(active + 1)} disabled={atEnd}>Next</UIButton>
      </div>
    </div>
  );
}

