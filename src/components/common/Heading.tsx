import { cn } from "@/lib/utils";

type HeadingProps = {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  size?: "2xl" | "xl" | "lg" | "md" | "sm" | "xs";
  children: React.ReactNode;
  className?: string;
};

export function Heading({ as: Comp = "h2", className, children, size = "lg" }: HeadingProps) {
  const sizeClasses: Record<NonNullable<HeadingProps["size"]>, string> = {
    "2xl": "ui-h-2xl",
    "xl": "ui-h-xl",
    "lg": "ui-h-lg",
    "md": "ui-h-md",
    "sm": "ui-h-sm",
    "xs": "ui-h-xs",
  };

  return <Comp className={cn(sizeClasses[size], className)}>{children}</Comp>;
}
