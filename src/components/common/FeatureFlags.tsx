"use client";

import { useEffect, useState } from "react";

type Flag = { key: string; label: string; description?: string };

export default function FeatureFlags({ flags, storageKey = "feature-flags", onChange }: { flags: Flag[]; storageKey?: string; onChange?: (state: Record<string, boolean>) => void }) {
  const [state, setState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setState(JSON.parse(raw));
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
    onChange?.(state);
  }, [state, storageKey, onChange]);

  const toggle = (k: string) => setState((s) => ({ ...s, [k]: !s[k] }));

  return (
    <div className="space-y-2">
      {flags.map((f) => (
        <label key={f.key} className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={Boolean(state[f.key])} onChange={() => toggle(f.key)} />
          <span className="font-medium">{f.label}</span>
          {f.description ? <span className="text-muted-foreground">– {f.description}</span> : null}
        </label>
      ))}
    </div>
  );
}


