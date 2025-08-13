"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";

type CommandItem = { id: string; label: string; hint?: string; action?: () => void; href?: string };

export default function CommandPalette({ items }: { items: CommandItem[] }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 overflow-hidden">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <Command label="Command Menu">
          <Command.Input placeholder="Type a command or search..." />
          <Command.List>
            <Command.Empty>No results found.</Command.Empty>
            <Command.Group heading="Navigation">
              {items.map((it) => (
                <Command.Item
                  key={it.id}
                  onSelect={() => {
                    setOpen(false);
                    if (it.action) it.action();
                    if (it.href) router.push(it.href);
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{it.label}</span>
                    {it.hint ? <span className="text-xs text-muted-foreground">{it.hint}</span> : null}
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}


