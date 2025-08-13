"use client";

import { useFormContext, Controller } from "react-hook-form";
import { cn } from "@/lib/utils";

export function FieldWrapper({ label, description, error, children }: { label?: string; description?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      {label ? <label className="text-sm font-medium">{label}</label> : null}
      {children}
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function TextField({ name, label, placeholder, description, className, type = "text" }: { name: string; label?: string; placeholder?: string; description?: string; className?: string; type?: string }) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FieldWrapper label={label} description={description} error={fieldState.error?.message}>
          <input
            {...field}
            type={type}
            placeholder={placeholder}
            className={cn("px-3 py-2 rounded-md border bg-background", className)}
          />
        </FieldWrapper>
      )}
    />
  );
}

export function TextAreaField({ name, label, placeholder, description, className, rows = 4 }: { name: string; label?: string; placeholder?: string; description?: string; className?: string; rows?: number }) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FieldWrapper label={label} description={description} error={fieldState.error?.message}>
          <textarea
            {...field}
            placeholder={placeholder}
            rows={rows}
            className={cn("px-3 py-2 rounded-md border bg-background", className)}
          />
        </FieldWrapper>
      )}
    />
  );
}


