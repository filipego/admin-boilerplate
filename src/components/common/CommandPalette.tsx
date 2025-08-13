"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";

export type CommandItem = { id: string; label: string; hint?: string; action?: () => void; href?: string };

type Props = {
  items?: CommandItem[]; // static items
  onSearch?: (query: string) => Promise<CommandItem[]>; // dynamic results
  placeholder?: string;
};

export default function CommandPalette({ items = [], onSearch, placeholder = "Type to search..." }: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [dynamicItems, setDynamicItems] = React.useState<CommandItem[]>([]);
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

  React.useEffect(() => {
    if (!onSearch) return;
    const id = setTimeout(async () => {
      const results = query.trim() ? await onSearch(query.trim()) : [];
      setDynamicItems(results);
    }, 250);
    return () => clearTimeout(id);
  }, [query, onSearch]);

  const handleSelect = (it: CommandItem) => {
    setOpen(false);
    if (it.action) it.action();
    if (it.href) router.push(it.href);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 overflow-hidden max-w-xl w-[90vw] rounded-xl border shadow-xl top-16 translate-y-0">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <Command label="Command Menu" onValueChange={setQuery} className="bg-card text-foreground">
          <div className="border-b">
            <Command.Input placeholder={placeholder} className="w-full px-4 py-3 text-sm outline-none bg-transparent" />
          </div>
          <Command.List className="max-h-80 overflow-auto">
            <Command.Empty className="px-4 py-6 text-sm text-muted-foreground">No results found.</Command.Empty>
            {dynamicItems.length > 0 ? (
              <Command.Group heading="Results" className="px-2 py-2 text-xs text-muted-foreground">
                {dynamicItems.map((it) => (
                  <Command.Item key={it.id} onSelect={() => handleSelect(it)} className="px-3 py-2 rounded-md data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground cursor-pointer">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm text-foreground">{it.label}</span>
                      {it.hint ? <span className="text-xs text-muted-foreground">{it.hint}</span> : null}
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            ) : null}
            {items.length > 0 ? (
              <Command.Group heading="Navigation" className="px-2 py-2 text-xs text-muted-foreground">
                {items.map((it) => (
                  <Command.Item key={it.id} onSelect={() => handleSelect(it)} className="px-3 py-2 rounded-md data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground cursor-pointer">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm text-foreground">{it.label}</span>
                      {it.hint ? <span className="text-xs text-muted-foreground">{it.hint}</span> : null}
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            ) : null}
          </Command.List>
          <div className="border-t px-4 py-2 text-[11px] text-muted-foreground">Press Esc to close • Cmd/Ctrl + K to open</div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}


