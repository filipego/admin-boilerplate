"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type KbdProps = {
  keys?: string[];
  children?: React.ReactNode;
  platformAware?: boolean; // map Mod → ⌘ on macOS, Ctrl elsewhere
  size?: "xs" | "sm";
  className?: string;
};

function normalizeKey(key: string, platform: "mod" | "mac" | "win"): string {
  const k = key.trim();
  if (k.toLowerCase() === "mod") {
    if (platform === "mac") return "⌘";
    if (platform === "win") return "Ctrl";
    return "Mod";
  }
  if (k.toLowerCase() === "option") return "⌥";
  if (k.toLowerCase() === "cmd" || k === "⌘") return "⌘";
  if (k.toLowerCase() === "ctrl") return "Ctrl";
  if (k.toLowerCase() === "shift") return "Shift";
  if (k.toLowerCase() === "enter") return "Enter";
  if (k.toLowerCase() === "esc" || k.toLowerCase() === "escape") return "Esc";
  if (k.toLowerCase() === "alt") return platform === "mac" ? "⌥" : "Alt";
  return k;
}

export default function Kbd({ keys, children, platformAware = true, size = "xs", className }: KbdProps) {
  const [platform, setPlatform] = useState<"mod" | "mac" | "win">(platformAware ? "mod" : "win");
  useEffect(() => {
    if (!platformAware) return;
    const isMac = typeof window !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
    setPlatform(isMac ? "mac" : "win");
  }, [platformAware]);

  const content = useMemo(() => {
    if (children) return children;
    if (keys && keys.length > 0) {
      return keys.map((k, i) => (
        <span key={`${k}-${i}`} className={cn("inline-flex items-center justify-center rounded border bg-muted text-muted-foreground font-medium", size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs")}>{normalizeKey(k, platform)}</span>
      ));
    }
    return null;
  }, [children, keys, platform, size]);

  if (Array.isArray(content)) {
    return (
      <span className={cn("inline-flex items-center gap-1 align-baseline", className)}>
        {content.map((el, idx) => (
          <span key={idx} className="inline-flex items-center gap-1">
            {el}
            {idx < content.length - 1 ? <span className="text-muted-foreground text-[10px]">+</span> : null}
          </span>
        ))}
      </span>
    );
  }

  return (
    <kbd className={cn("inline-flex items-center justify-center rounded border bg-muted text-muted-foreground font-medium", size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs", className)}>
      {content}
    </kbd>
  );
}


