"use client";

import { Button as ShadButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type UIButtonSize = "sm" | "md" | "lg";

type UIButtonProps = React.ComponentProps<typeof ShadButton> & {
  uiSize?: UIButtonSize;
};

const sizeToClass: Record<UIButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4",
  lg: "h-12 px-6 text-base",
};

export default function UIButton({ uiSize = "md", className, ...props }: UIButtonProps) {
  const buttonProps = props as React.ComponentProps<typeof ShadButton>;
  const type = (buttonProps.type as React.ButtonHTMLAttributes<HTMLButtonElement>["type"]) ?? "button";
  return <ShadButton {...buttonProps} type={type} className={cn(sizeToClass[uiSize], className)} />;
}


