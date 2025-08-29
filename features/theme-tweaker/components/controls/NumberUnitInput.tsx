"use client";

import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Unit = "px" | "rem";

export interface NumberUnitInputProps {
  label?: string;
  value: string; // e.g., "12px" or "0.75rem"
  onChange: (next: string) => void;
  disabled?: boolean;
  allowNegative?: boolean;
  stepPx?: number; // default 1
  stepRem?: number; // default 0.125
  min?: number;
  max?: number;
}

function parseValue(v: string): { num: number; unit: Unit } {
  const m = String(v).trim().match(/^(-?[\d.]+)\s*(px|rem)$/i);
  if (m) return { num: parseFloat(m[1]), unit: m[2].toLowerCase() as Unit };
  // default
  return { num: parseFloat(v) || 0, unit: "px" };
}

export const NumberUnitInput: React.FC<NumberUnitInputProps> = ({
  label,
  value,
  onChange,
  disabled,
  allowNegative,
  stepPx = 1,
  stepRem = 0.125,
  min,
  max,
}) => {
  const { num, unit } = useMemo(() => parseValue(value), [value]);
  const step = unit === "px" ? stepPx : stepRem;

  const clamp = (n: number) => {
    let x = n;
    if (!allowNegative) x = Math.max(0, x);
    if (typeof min === "number") x = Math.max(min, x);
    if (typeof max === "number") x = Math.min(max, x);
    return x;
  };

  const emit = (n: number, u: Unit) => onChange(`${n}${u}`);

  return (
    <div className="flex items-center gap-2">
      {label && <div className="text-xs text-muted-foreground w-16">{label}</div>}
      <div className="flex items-center gap-1 flex-1 flex-nowrap">
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-9 w-9"
          disabled={disabled}
          onClick={() => emit(clamp(num - step), unit)}
        >
          –
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-9 w-9"
          disabled={disabled}
          onClick={() => emit(clamp(num + step), unit)}
        >
          +
        </Button>
        <Input
          className="h-9 w-20 text-right font-mono text-xs"
          value={Number.isFinite(num) ? String(num) : "0"}
          disabled={disabled}
          onChange={(e) => {
            const n = parseFloat(e.target.value);
            if (Number.isFinite(n)) emit(clamp(n), unit);
          }}
        />
        <select
          className="h-9 w-16 rounded-md border bg-background px-2 text-sm"
          value={unit}
          disabled={disabled}
          onChange={(e) => emit(num, e.target.value as Unit)}
        >
          <option value="px">px</option>
          <option value="rem">rem</option>
        </select>
      </div>
    </div>
  );
};

export default NumberUnitInput;
