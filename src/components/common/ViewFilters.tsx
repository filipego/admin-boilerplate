"use client";

import UIButton from "@/components/common/UIButton";
import { cn } from "@/lib/utils";
import { List, LayoutGrid } from "lucide-react";
type LayoutMode = "list" | "grid" | "masonry";
type Columns = 2 | 3 | 4;

type ViewFiltersProps = {
  layout: LayoutMode;
  onLayoutChange: (m: LayoutMode) => void;
  columns: Columns;
  onColumnsChange: (c: Columns) => void;
  // Visibility toggles (defaults: list + 3 cols only)
  enableList?: boolean; // default true
  enableGrid?: boolean; // default false
  enableMasonry?: boolean; // default false
  enableCols2?: boolean; // default false
  enableCols3?: boolean; // default true
  enableCols4?: boolean; // default false
  className?: string;
};

export default function ViewFilters({
  layout,
  onLayoutChange,
  columns,
  onColumnsChange,
  enableList = true,
  enableGrid = false,
  enableMasonry = false,
  enableCols2 = false,
  enableCols3 = true,
  enableCols4 = false,
  className,
}: ViewFiltersProps) {
  const columnsDisabled = layout === "list";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1">
        {enableList && (
          <UIButton
            uiSize="sm"
            variant={layout === "list" ? "default" : "outline"}
            onClick={() => onLayoutChange("list")}
            aria-pressed={layout === "list"}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </UIButton>
        )}
        {enableGrid && (
          <UIButton
            uiSize="sm"
            variant={layout === "grid" ? "default" : "outline"}
            onClick={() => onLayoutChange("grid")}
            aria-pressed={layout === "grid"}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </UIButton>
        )}
        {enableMasonry && (
          <UIButton
            uiSize="sm"
            variant={layout === "masonry" ? "default" : "outline"}
            onClick={() => onLayoutChange("masonry")}
            aria-pressed={layout === "masonry"}
            aria-label="Masonry view"
          >
            <IconMasonry />
          </UIButton>
        )}
      </div>
      <div className="h-6 w-px bg-border hidden sm:block" />
      <div className={cn("flex items-center gap-1", columnsDisabled && "opacity-50 pointer-events-none")}> 
        {enableCols2 && (
          <UIButton
            uiSize="sm"
            variant={columns === 2 ? "default" : "outline"}
            onClick={() => onColumnsChange(2)}
            aria-pressed={columns === 2}
            aria-label="2 columns"
          >
            <IconCols2 />
          </UIButton>
        )}
        {enableCols3 && (
          <UIButton
            uiSize="sm"
            variant={columns === 3 ? "default" : "outline"}
            onClick={() => onColumnsChange(3)}
            aria-pressed={columns === 3}
            aria-label="3 columns"
          >
            <IconCols3 />
          </UIButton>
        )}
        {enableCols4 && (
          <UIButton
            uiSize="sm"
            variant={columns === 4 ? "default" : "outline"}
            onClick={() => onColumnsChange(4)}
            aria-pressed={columns === 4}
            aria-label="4 columns"
          >
            <IconCols4 />
          </UIButton>
        )}
      </div>
    </div>
  );
}

function IconCols2() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="8" height="14" rx="2" />
      <rect x="13" y="5" width="8" height="14" rx="2" />
    </svg>
  );
}

function IconCols3() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="5" height="14" rx="2" />
      <rect x="9.5" y="5" width="5" height="14" rx="2" />
      <rect x="16" y="5" width="5" height="14" rx="2" />
    </svg>
  );
}

function IconCols4() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="3.5" height="14" rx="2" />
      <rect x="7.5" y="5" width="3.5" height="14" rx="2" />
      <rect x="12" y="5" width="3.5" height="14" rx="2" />
      <rect x="16.5" y="5" width="3.5" height="14" rx="2" />
    </svg>
  );
}

function IconMasonry() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="6" height="10" rx="2" />
      <rect x="11" y="4" width="10" height="6" rx="2" />
      <rect x="11" y="12" width="5" height="8" rx="2" />
      <rect x="17" y="12" width="4" height="8" rx="2" />
    </svg>
  );
}


