"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function SidePanel({ open, onOpenChange, children, width = 420 }: { open: boolean; onOpenChange: (o: boolean) => void; children: React.ReactNode; width?: number }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0" style={{ width }}>
        <div className="p-4 overflow-y-auto h-full">{children}</div>
      </SheetContent>
    </Sheet>
  );
}


