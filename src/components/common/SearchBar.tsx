"use client";

import { cn } from "@/lib/utils";

type SearchBarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  placeholder?: string;
  rightContent?: React.ReactNode; // view filters or custom actions
  className?: string;
};

export default function SearchBar({ query, onQueryChange, placeholder = "Search...", rightContent, className }: SearchBarProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex-1">
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 rounded-md border bg-background px-3 pr-10 text-sm"
          aria-label="Search"
        />
        <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-3.9-3.9" />
        </svg>
      </div>
      {rightContent ? <div className="shrink-0">{rightContent}</div> : null}
    </div>
  );
}


