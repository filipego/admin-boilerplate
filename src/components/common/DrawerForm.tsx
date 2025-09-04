"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import UIButton from "@/components/common/UIButton";
import { RHFForm } from "@/components/common/form/Form";
import { cn } from "@/lib/utils";
import { z } from "zod";

export type DrawerFormProps<TSchema extends z.ZodTypeAny> = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  schema: TSchema;
  defaultValues: z.infer<TSchema>;
  onSubmit: (v: z.infer<TSchema>) => Promise<void>;
  children: React.ReactNode;
  className?: string;
};

export default function DrawerForm<TSchema extends z.ZodTypeAny>({ open, onOpenChange, title, schema, defaultValues, onSubmit, children, className }: DrawerFormProps<TSchema>) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={cn("w-[420px]", className)}>
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

