"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, type DefaultValues, type FieldValues, type Resolver, type SubmitHandler } from "react-hook-form";
import { cn } from "@/lib/utils";

type FormSchema<TValues extends FieldValues> = z.ZodType<TValues>;

export type FormProps<TValues extends FieldValues> = {
  schema: FormSchema<TValues>;
  defaultValues: DefaultValues<TValues>;
  onSubmit: (values: TValues) => Promise<void> | void;
  className?: string;
  children: React.ReactNode;
};

export function RHFForm<TValues extends FieldValues>({ schema, defaultValues, onSubmit, className, children }: FormProps<TValues>) {
  const methods = useForm<TValues>({
    resolver: zodResolver(schema) as Resolver<TValues>,
    defaultValues,
    mode: "onSubmit",
  });

  const handleSubmit: SubmitHandler<TValues> = async (values) => {
    await onSubmit(values);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className={cn("grid gap-4", className)}>
        {children}
      </form>
    </FormProvider>
  );
}
