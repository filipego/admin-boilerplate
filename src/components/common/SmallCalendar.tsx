"use client";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function SmallCalendar({ selected, onSelect }: { selected?: Date; onSelect?: (date?: Date) => void }) {
  return (
    <div className="rounded-lg border p-2 bg-card">
      <DayPicker mode="single" selected={selected} onSelect={onSelect} className="text-sm" />
    </div>
  );
}


