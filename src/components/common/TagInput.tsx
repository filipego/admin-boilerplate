"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TagInput({ value = [], onChange, placeholder = "Add tag and press Enter", className }: { value?: string[]; onChange?: (v: string[]) => void; placeholder?: string; className?: string }) {
  const [tags, setTags] = useState<string[]>(value);
  const [text, setText] = useState("");

  const commit = (t: string) => {
    const v = t.trim();
    if (!v) return;
    const next = Array.from(new Set([...tags, v]));
    setTags(next);
    onChange?.(next);
    setText("");
  };

  const remove = (t: string) => {
    const next = tags.filter((x) => x !== t);
    setTags(next);
    onChange?.(next);
  };

  return (
    <div className={cn("rounded-md border bg-background p-2", className)}>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs">
            {t}
            <button type="button" className="hover:text-destructive" onClick={() => remove(t)}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit(text);
            }
          }}
          placeholder={placeholder}
          className="flex-1 min-w-[160px] bg-transparent outline-none text-sm px-1"
        />
      </div>
    </div>
  );
}


