"use client";

import { Badge as ShadBadge, badgeVariants } from "@/components/ui/badge";

export type UIBadgeVariant = "default" | "secondary" | "destructive" | "outline";

type UIBadgeProps = React.ComponentProps<typeof ShadBadge> & {
  variant?: UIBadgeVariant;
};

export default function UIBadge({ variant = "default", className, ...props }: UIBadgeProps) {
  return <ShadBadge variant={variant} className={className} {...props} />;
}

export { badgeVariants };


