"use client";

import { useEffect, useState } from "react";
import UIButton from "@/components/common/UIButton";
import { cn } from "@/lib/utils";

export type SavedView<T> = { id: string; name: string; state: T };

export default function SavedViews<T>({ storageKey, current, onLoad, className }: { storageKey: string; current: T; onLoad: (s: T) => void; className?: string }) {
  const [views, setViews] = useState<SavedView<T>[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SavedView<T>[];
        setViews(parsed);
      } catch {}
    }
  }, [storageKey]);

  const save = () => {
    const name = prompt("View name?");
    if (!name) return;
    const v: SavedView<T> = { id: crypto.randomUUID(), name, state: current };
    const next = [...views, v];
    setViews(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const load = (id: string) => {
    const found = views.find((v) => v.id === id);
    if (!found) return;
    setActiveId(id);
    onLoad(found.state);
  };

  const remove = (id: string) => {
    const next = views.filter((v) => v.id !== id);
    setViews(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    if (activeId === id) setActiveId(null);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <UIButton uiSize="sm" variant="outline" onClick={save}>Save View</UIButton>
      <div className="flex items-center gap-2 overflow-x-auto">
        {views.map((v) => (
          <button key={v.id} className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs", activeId === v.id && "bg-accent")}
            onClick={() => load(v.id)}
          >
            {v.name}
            <span className="text-muted-foreground" onClick={(e) => { e.stopPropagation(); remove(v.id); }}>✕</span>
          </button>
        ))}
      </div>
    </div>
  );
}


