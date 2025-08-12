"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";

type Tab = { id: string; label: string };

type InnerSidebarProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  initialWidth?: number; // pixels
  minWidth?: number;
  maxWidth?: number;
  className?: string;
};

export default function InnerSidebar({ tabs, activeTab, onTabChange, initialWidth = 280, minWidth = 180, maxWidth = 480, className }: InnerSidebarProps) {
  const [width, setWidth] = useState<number>(() => {
    if (typeof window === "undefined") return initialWidth;
    const saved = window.localStorage.getItem("inner-sidebar-width");
    return saved ? Number(saved) : initialWidth;
  });

  const isResizing = useRef(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const next = Math.min(maxWidth, Math.max(minWidth, e.clientX));
      setWidth(next);
    };
    const onMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        window.localStorage.setItem("inner-sidebar-width", String(width));
      }
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [width, minWidth, maxWidth]);

  return (
    <aside className={cn("border-r bg-sidebar text-sidebar-foreground", className)} style={{ width }}>
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="text-sm font-semibold">Tabs</div>
      </div>
      <nav className="p-2 space-y-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTabChange(t.id)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer",
              t.id === activeTab && "bg-accent text-accent-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <div
        className="absolute top-0 bottom-0 right-0 w-1 cursor-col-resize"
        onMouseDown={(e) => {
          e.preventDefault();
          isResizing.current = true;
        }}
        aria-label="Resize sidebar"
        role="separator"
      />
    </aside>
  );
}


