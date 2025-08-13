"use client";

import UIModal from "@/components/common/UIModal";
import UIButton from "@/components/common/UIButton";
import { RHFForm } from "@/components/common/form/Form";
import { z } from "zod";
import { useState } from "react";
import { showSaved, showError } from "@/lib/toast";

type ModalFormProps<TSchema extends z.ZodTypeAny> = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  schema: TSchema;
  defaultValues: z.infer<TSchema>;
  onSubmit: (values: z.infer<TSchema>) => Promise<void>;
  children: React.ReactNode; // form fields
  submitLabel?: string;
  cancelLabel?: string;
};

export default function ModalForm<TSchema extends z.ZodTypeAny>({ open, onOpenChange, title, description, schema, defaultValues, onSubmit, children, submitLabel = "Save", cancelLabel = "Cancel" }: ModalFormProps<TSchema>) {
  const [pending, setPending] = useState(false);

  return (
    <UIModal open={open} onOpenChange={onOpenChange} size="content" title={title} description={description}>
      <RHFForm
        schema={schema}
        defaultValues={defaultValues}
        onSubmit={async (values) => {
          try {
            setPending(true);
            showSaved("Saving...");
            await onSubmit(values);
            showSaved("Saved");
            onOpenChange(false);
          } catch (e) {
            showError("Failed to save");
          } finally {
            setPending(false);
          }
        }}
        className="pt-2"
      >
        {children}
        <div className="mt-4 flex justify-end gap-2">
          <UIButton type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>{cancelLabel}</UIButton>
          <UIButton type="submit" disabled={pending}>{submitLabel}</UIButton>
        </div>
      </RHFForm>
    </UIModal>
  );
}


