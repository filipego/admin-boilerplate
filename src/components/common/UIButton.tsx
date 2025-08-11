"use client";

import { Button as ShadButton, type ButtonProps as ShadButtonProps } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export type UIButtonSize = "sm" | "md" | "lg";
export type UIButtonVariant = ShadButtonProps["variant"];

type UIButtonProps = {
  size?: UIButtonSize;
  className?: string;
} & Omit<ShadButtonProps, "size">;

const sizeToClass: Record<UIButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4",
  lg: "h-12 px-6 text-base",
};

export default function UIButton({ size = "md", className, ...props }: UIButtonProps) {
  return <ShadButton {...props} className={cn(sizeToClass[size], className)} />;
}


