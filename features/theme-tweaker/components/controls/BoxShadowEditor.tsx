"use client";

import React from "react";
import NumberUnitInput from "./NumberUnitInput";
import TokenColorInput from "./TokenColorInput";
import { Button } from "@/components/ui/button";

export interface ShadowLayer {
  inset?: boolean;
  x: string; // px/rem
  y: string; // px/rem
  blur: string; // px/rem
  spread: string; // px/rem
  color: string; // var(--token) or hex/rgba
}

export interface BoxShadowEditorProps {
  layers: ShadowLayer[];
  tokens?: string[];
  disabled?: boolean;
  onChange: (layers: ShadowLayer[]) => void;
}

function toCss(l: ShadowLayer): string {
  const parts: string[] = [];
  if (l.inset) parts.push("inset");
  parts.push(l.x, l.y, l.blur, l.spread, l.color);
  return parts.join(" ");
}

export const BoxShadowEditor: React.FC<BoxShadowEditorProps> = ({ layers, tokens = [], disabled, onChange }) => {
  const set = (idx: number, patch: Partial<ShadowLayer>) => {
    const next = layers.map((l, i) => (i === idx ? { ...l, ...patch } : l));
    onChange(next);
  };
  const add = () => {
    if (layers.length >= 6) return;
    onChange([...layers, { inset: false, x: "0px", y: "2px", blur: "6px", spread: "0px", color: "var(--border)" }]);
  };
  const remove = (idx: number) => onChange(layers.filter((_, i) => i !== idx));
  const up = (idx: number) => {
    if (idx === 0) return;
    const next = layers.slice();
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };
  const down = (idx: number) => {
    if (idx === layers.length - 1) return;
    const next = layers.slice();
    [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {layers.map((l, idx) => (
        <div key={idx} className="rounded-md border p-3 bg-background">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Layer {idx + 1}</div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" className="h-7" disabled={disabled || idx === 0} onClick={() => up(idx)}>
                ↑
              </Button>
              <Button size="sm" variant="outline" className="h-7" disabled={disabled || idx === layers.length - 1} onClick={() => down(idx)}>
                ↓
              </Button>
              <Button size="sm" variant="destructive" className="h-7" disabled={disabled} onClick={() => remove(idx)}>
                Remove
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <NumberUnitInput label="X" value={l.x} onChange={(v) => set(idx, { x: v })} disabled={disabled} allowNegative />
            <NumberUnitInput label="Y" value={l.y} onChange={(v) => set(idx, { y: v })} disabled={disabled} allowNegative />
            <NumberUnitInput label="Blur" value={l.blur} onChange={(v) => set(idx, { blur: v })} disabled={disabled} />
            <NumberUnitInput label="Spread" value={l.spread} onChange={(v) => set(idx, { spread: v })} disabled={disabled} allowNegative />
            <TokenColorInput label="Color" value={l.color} onChange={(v) => set(idx, { color: v })} disabled={disabled} tokens={tokens} />
            <div className="flex items-center gap-2 mt-2">
              <label className="text-xs">Inset</label>
              <input type="checkbox" checked={!!l.inset} disabled={disabled} onChange={(e) => set(idx, { inset: e.target.checked })} />
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground mt-2">{toCss(l)}</div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" disabled={disabled || layers.length >= 6} onClick={add}>
        Add layer
      </Button>
    </div>
  );
};

export default BoxShadowEditor;

