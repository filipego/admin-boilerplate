"use client";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useState } from "react";
import UIButton from "@/components/common/UIButton";

type Range = { from?: Date; to?: Date };

export default function DateRangePicker({ value, onChange }: { value?: Range; onChange?: (r: Range) => void }) {
  const [range, setRange] = useState<Range>(value ?? {});
  return (
    <div className="rounded-lg border p-2">
      <DayPicker mode="range" selected={range} onSelect={(r) => { setRange(r ?? {}); onChange?.(r ?? {}); }} />
      <div className="flex justify-end">
        <UIButton uiSize="sm" variant="outline" onClick={() => { setRange({}); onChange?.({}); }}>Reset</UIButton>
      </div>
    </div>
  );
}


