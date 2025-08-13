"use client";

import { Bell } from "lucide-react";
import UIButton from "@/components/common/UIButton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";

export type NotificationItem = { id: string; title: string; time: string; read?: boolean };

export default function NotificationBell({ items = [] }: { items?: NotificationItem[] }) {
  const unread = items.filter((i) => !i.read).length;
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Open notifications" className="relative inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-accent cursor-pointer">
        <Bell className="h-4 w-4" />
        {unread > 0 ? (
          <span className="absolute inline-flex h-3 w-3 items-center justify-center rounded-full bg-blue-500 [top:4px] [right:4px]" />
        ) : null}
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[360px]">
          <SheetHeader>
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          <ul className="mt-4 space-y-3">
            {items.map((n) => (
              <li key={n.id} className="rounded-md border p-2">
                <div className="text-sm">{n.title}</div>
                <div className="text-xs text-muted-foreground">{n.time}</div>
              </li>
            ))}
            {items.length === 0 ? (
              <li className="text-sm text-muted-foreground">You're all caught up.</li>
            ) : null}
          </ul>
        </SheetContent>
      </Sheet>
    </>
  );
}


