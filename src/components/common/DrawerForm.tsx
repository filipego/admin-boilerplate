"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import UIButton from "@/components/common/UIButton";
import { RHFForm } from "@/components/common/form/Form";
import { z } from "zod";

export default function DrawerForm<TSchema extends z.ZodTypeAny>({ open, onOpenChange, title, schema, defaultValues, onSubmit, children }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; schema: TSchema; defaultValues: z.infer<TSchema>; onSubmit: (v: z.infer<TSchema>) => Promise<void>; children: React.ReactNode }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px]">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <RHFForm schema={schema} defaultValues={defaultValues} onSubmit={onSubmit}>
            {children}
            <SheetFooter className="mt-4">
              <div className="flex w-full justify-end gap-2">
                <UIButton variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</UIButton>
                <UIButton type="submit">Save</UIButton>
              </div>
            </SheetFooter>
          </RHFForm>
        </div>
      </SheetContent>
    </Sheet>
  );
}


