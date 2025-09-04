"use client";

import { DayPicker, type DateRange as RdpDateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useState } from "react";
import UIButton from "@/components/common/UIButton";
import { cn } from "@/lib/utils";

export type DateRangePickerProps = { value?: RdpDateRange | undefined; onChange?: (r: RdpDateRange | undefined) => void; className?: string };

export default function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [range, setRange] = useState<RdpDateRange | undefined>(value);
  return (
    <div className={cn("rounded-lg border p-2", className)}>
      <DayPicker mode="range" selected={range} onSelect={(r) => { setRange(r); onChange?.(r); }} />
      <div className="flex justify-end">
        <UIButton uiSize="sm" variant="outline" onClick={() => { setRange(undefined); onChange?.(undefined); }}>Reset</UIButton>
      </div>
    </div>
  );
}
