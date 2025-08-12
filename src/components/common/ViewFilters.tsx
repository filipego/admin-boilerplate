"use client";

import UIButton from "@/components/common/UIButton";
import { cn } from "@/lib/utils";
import { List, LayoutGrid } from "lucide-react";

type GridMode = "list" | "grid-2" | "grid-3" | "grid-4" | "masonry";

type ViewFiltersProps = {
  mode: GridMode;
  onModeChange: (m: GridMode) => void;
  className?: string;
};

export default function ViewFilters({ mode, onModeChange, className }: ViewFiltersProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <UIButton
        uiSize="sm"
        variant={mode === "list" ? "default" : "outline"}
        onClick={() => onModeChange("list")}
        aria-pressed={mode === "list"}
        aria-label="List view"
      >
        <List className="h-4 w-4" />
      </UIButton>
      <UIButton
        uiSize="sm"
        variant={mode === "grid-2" ? "default" : "outline"}
        onClick={() => onModeChange("grid-2")}
        aria-pressed={mode === "grid-2"}
        aria-label="2 columns"
      >
        <IconCols2 />
      </UIButton>
      <UIButton
        uiSize="sm"
        variant={mode === "grid-3" ? "default" : "outline"}
        onClick={() => onModeChange("grid-3")}
        aria-pressed={mode === "grid-3"}
        aria-label="3 columns"
      >
        <IconCols3 />
      </UIButton>
      <UIButton
        uiSize="sm"
        variant={mode === "grid-4" ? "default" : "outline"}
        onClick={() => onModeChange("grid-4")}
        aria-pressed={mode === "grid-4"}
        aria-label="4 columns"
      >
        <IconCols4 />
      </UIButton>
      <UIButton
        uiSize="sm"
        variant={mode === "masonry" ? "default" : "outline"}
        onClick={() => onModeChange("masonry")}
        aria-pressed={mode === "masonry"}
        aria-label="Masonry"
      >
        <LayoutGrid className="h-4 w-4" />
      </UIButton>
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


