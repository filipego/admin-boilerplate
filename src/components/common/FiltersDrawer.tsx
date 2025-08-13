"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import UIButton from "@/components/common/UIButton";

export default function FiltersDrawer({ open, onOpenChange, children, onApply, onReset }: { open: boolean; onOpenChange: (o: boolean) => void; children: React.ReactNode; onApply: () => void; onReset: () => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[360px] sm:w-[420px]">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-4 grid gap-3 overflow-y-auto max-h-[70vh] pr-1">
          {children}
        </div>
        <SheetFooter className="mt-4">
          <div className="flex w-full justify-between">
            <UIButton variant="outline" onClick={onReset}>Reset</UIButton>
            <UIButton onClick={onApply}>Apply</UIButton>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}


