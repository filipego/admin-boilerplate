"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type SidePanelProps = { open: boolean; onOpenChange: (o: boolean) => void; children: React.ReactNode; width?: number; className?: string };

export default function SidePanel({ open, onOpenChange, children, width = 420, className }: SidePanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={cn("p-0", className)} style={{ width }}>
        <div className="p-4 overflow-y-auto h-full">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

