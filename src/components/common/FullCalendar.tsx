"use client";

import { useMemo, useState } from "react";
import UIButton from "@/components/common/UIButton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Event = { id: string; title: string; date: Date };

type Props = {
  events: Event[];
  current?: Date; // month to show
  onCurrentChange?: (d: Date) => void;
  selectedDate?: Date;
  onSelectDate?: (d: Date) => void;
};

export default function FullCalendar({ events, current, onCurrentChange, selectedDate, onSelectDate }: Props) {
  const [internalCurrent, setInternalCurrent] = useState(() => startOfMonth(current ?? new Date()));
  const viewDate = current ? startOfMonth(current) : internalCurrent;

  const setMonth = (offset: number) => {
    const next = new Date(viewDate);
    next.setMonth(viewDate.getMonth() + offset);
    next.setDate(1);
    if (onCurrentChange) onCurrentChange(next);
    else setInternalCurrent(next);
  };

  const gridDays = useMemo(() => buildMonthGrid(viewDate), [viewDate]);
  const weekdayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium">
          {viewDate.toLocaleString(undefined, { month: "long", year: "numeric" })}
        </div>
        <div className="flex items-center gap-2">
          <UIButton uiSize="sm" variant="outline" onClick={() => setMonth(-1)} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </UIButton>
          <UIButton uiSize="sm" variant="outline" onClick={() => setMonth(1)} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </UIButton>
        </div>
      </div>

      {/* Weekday headings */}
      <div className="grid grid-cols-7 text-xs text-muted-foreground mb-2">
        {weekdayLabels.map((d) => (
          <div key={d} className="px-2 py-1">{d}</div>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-7 gap-2 text-sm">
        {gridDays.map((day) => {
          const isCurrentMonth = day.getMonth() === viewDate.getMonth();
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const isToday = isSameDay(day, new Date());
          const dayEvents = events.filter((e) => isSameDay(e.date, day));
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDate?.(day)}
              className={cn(
                "w-full aspect-square rounded-md border p-2 text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                !isCurrentMonth && "opacity-50",
                isSelected && "ring-2 ring-ring",
                isToday && "border-blue-500"
              )}
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">{day.toLocaleDateString(undefined, { weekday: "short" })}</div>
                  <div className="text-xs font-medium">{day.getDate()}</div>
                </div>
                <div className="mt-2 flex-1 min-h-0 space-y-1 overflow-auto">
                  {dayEvents.map((e) => (
                    <div key={e.id} className="rounded bg-muted px-2 py-1 truncate" title={e.title}>
                      {e.title}
                    </div>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function startOfMonth(d: Date) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function buildMonthGrid(viewDate: Date): Date[] {
  const firstOfMonth = startOfMonth(viewDate);
  const startWeekday = firstOfMonth.getDay(); // 0-6
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();

  const prevMonthDays = startWeekday; // number of days to show from previous month
  const totalCells = 42; // 6 weeks * 7 days

  const days: Date[] = [];

  // previous month tail
  for (let i = prevMonthDays; i > 0; i--) {
    days.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), 1 - i));
  }

  // current month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));
  }

  // next month head
  while (days.length < totalCells) {
    const last = days[days.length - 1];
    const next = new Date(last);
    next.setDate(last.getDate() + 1);
    days.push(next);
  }

  return days;
}


