"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function FieldWrapper({
  id,
  label,
  description,
  error,
  children,
}: {
  id?: string;
  label?: string;
  description?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      {label ? <label htmlFor={id} className="text-sm font-medium">{label}</label> : null}
      {children}
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function TextField({ name, label, placeholder, description, className, type = "text" }: { name: string; label?: string; placeholder?: string; description?: string; className?: string; type?: string }) {
  const { control } = useFormContext();
  const id = `field-${name}`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FieldWrapper id={id} label={label} description={description} error={fieldState.error?.message}>
          <Input
            {...field}
            id={id}
            type={type}
            placeholder={placeholder}
            aria-invalid={fieldState.invalid}
            className={className}
          />
        </FieldWrapper>
      )}
    />
  );
}

export function TextAreaField({ name, label, placeholder, description, className, rows = 4 }: { name: string; label?: string; placeholder?: string; description?: string; className?: string; rows?: number }) {
  const { control } = useFormContext();
  const id = `field-${name}`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FieldWrapper id={id} label={label} description={description} error={fieldState.error?.message}>
          <textarea
            {...field}
            id={id}
            placeholder={placeholder}
            rows={rows}
            aria-invalid={fieldState.invalid}
            className={cn(
              "flex min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
              className
            )}
          />
        </FieldWrapper>
      )}
    />
  );
}

