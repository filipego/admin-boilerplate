"use client";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { cn } from "@/lib/utils";

export type SmallCalendarProps = { selected?: Date; onSelect?: (date?: Date) => void; className?: string };

export default function SmallCalendar({ selected, onSelect, className }: SmallCalendarProps) {
  return (
    <div className={cn("rounded-lg border p-2 bg-card", className)}>
      <DayPicker mode="single" selected={selected} onSelect={onSelect} className="text-sm" />
    </div>
  );
}

