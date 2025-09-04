"use client";

import { cn } from "@/lib/utils";
import { Heading } from "@/components/common/Heading";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode; // typically a UIButton or Link
  className?: string;
};

export default function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="space-y-1">
        <Heading as="h2" size="lg" className="leading-tight">{title}</Heading>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
