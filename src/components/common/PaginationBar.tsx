"use client";

import UIButton from "@/components/common/UIButton";
import { cn } from "@/lib/utils";
export type PaginationBarProps = { page: number; pageCount: number; onPrev: () => void; onNext: () => void; className?: string };
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PaginationBar({ page, pageCount, onPrev, onNext, className }: PaginationBarProps) {
  return (
    <div className={cn("flex items-center justify-between text-sm", className)}>
      <div className="text-muted-foreground">Page {page} of {pageCount}</div>
      <div className="flex items-center gap-2">
        <UIButton uiSize="sm" variant="outline" onClick={onPrev} disabled={page <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </UIButton>
        <UIButton uiSize="sm" variant="outline" onClick={onNext} disabled={page >= pageCount}>
          <ChevronRight className="h-4 w-4" />
        </UIButton>
      </div>
    </div>
  );
}

