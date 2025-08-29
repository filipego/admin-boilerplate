"use client";

import React, { useMemo } from "react";
import NumberUnitInput from "./NumberUnitInput";
import TokenColorInput from "./TokenColorInput";

export interface SimpleShadowEditorProps {
  value: string; // single-layer box-shadow or 'none'
  tokens?: string[];
  disabled?: boolean;
  onChange: (css: string) => void;
}

type Layer = { inset?: boolean; x: string; y: string; blur: string; spread: string; color: string };

function parseFirstLayer(input: string): Layer {
  const css = (input || "").trim();
  if (!css || css === "none") return { inset: false, x: "0px", y: "2px", blur: "6px", spread: "0px", color: "var(--border)" };
  let depth = 0, start = 0; const layers: string[] = [];
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    else if (ch === ',' && depth === 0) { layers.push(css.slice(start, i)); start = i + 1; }
  }
  layers.push(css.slice(start));
  const first = (layers[0] || '').trim();
  const parts = first.split(/\s+(?![^()]*\))/);
  let inset = false, idx = 0;
  if (parts[0] === 'inset') { inset = true; idx = 1; }
  const x = parts[idx] || '0px';
  const y = parts[idx+1] || '2px';
  const blur = parts[idx+2] || '6px';
  const spread = parts[idx+3] || '0px';
  const color = parts.slice(idx+4).join(' ') || 'rgba(0,0,0,0.12)';
  return { inset, x, y, blur, spread, color };
}

function toCss(l: Layer): string {
  const segs: string[] = [];
  if (l.inset) segs.push('inset');
  segs.push(l.x, l.y, l.blur, l.spread, l.color);
  return segs.join(' ');
}

export default function SimpleShadowEditor({ value, tokens = [], disabled, onChange }: SimpleShadowEditorProps) {
  const layer = useMemo(() => parseFirstLayer(value), [value]);
  const emit = (patch: Partial<Layer>) => onChange(toCss({ ...layer, ...patch }));

  return (
    <div className="rounded-md border p-3 bg-background space-y-3">
      <div className="space-y-2">
        <NumberUnitInput label="X" value={layer.x} onChange={(v) => emit({ x: v })} disabled={disabled} allowNegative />
        <NumberUnitInput label="Y" value={layer.y} onChange={(v) => emit({ y: v })} disabled={disabled} allowNegative />
        <NumberUnitInput label="Blur" value={layer.blur} onChange={(v) => emit({ blur: v })} disabled={disabled} />
        <NumberUnitInput label="Spread" value={layer.spread} onChange={(v) => emit({ spread: v })} disabled={disabled} allowNegative />
      </div>
      <TokenColorInput label="Color" value={layer.color} onChange={(v) => emit({ color: v })} tokens={tokens} disabled={disabled} />
      <div className="flex items-center gap-2 text-xs">
        <input type="checkbox" id="shadow-inset" checked={!!layer.inset} disabled={disabled} onChange={(e) => emit({ inset: e.target.checked })} />
        <label htmlFor="shadow-inset">Inset</label>
      </div>
    </div>
  );
}
