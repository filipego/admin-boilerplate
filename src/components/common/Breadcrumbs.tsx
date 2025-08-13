"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav className={cn("text-sm text-muted-foreground", className)} aria-label="Breadcrumb">
      <ol className="flex items-center gap-1">
        {items.map((item, idx) => (
          <li key={`${item.label}-${idx}`} className="flex items-center gap-1">
            {idx > 0 ? <span className="text-muted-foreground/60">/</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:underline">{item.label}</Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}


