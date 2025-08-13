"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, type SubmitHandler } from "react-hook-form";
import { cn } from "@/lib/utils";

export type FormProps<TSchema extends z.ZodTypeAny> = {
  schema: TSchema;
  defaultValues: z.infer<TSchema>;
  onSubmit: (values: z.infer<TSchema>) => Promise<void> | void;
  className?: string;
  children: React.ReactNode;
};

export function RHFForm<TSchema extends z.ZodTypeAny>({ schema, defaultValues, onSubmit, className, children }: FormProps<TSchema>) {
  const methods = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onSubmit",
  });

  const handleSubmit: SubmitHandler<z.infer<TSchema>> = async (values) => {
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


