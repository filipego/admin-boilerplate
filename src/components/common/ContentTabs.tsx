"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type TabItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  content: React.ReactNode;
};

type ContentTabsProps = {
  items: TabItem[];
  value: string;
  onValueChange: (id: string) => void;
  className?: string;
  listClassName?: string;
  fullWidthList?: boolean;
};

export default function ContentTabs({ items, value, onValueChange, className, listClassName, fullWidthList }: ContentTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange} className={className}>
      <TabsList className={cn("w-full justify-start gap-1", listClassName, fullWidthList && "grid grid-cols-2 sm:inline-flex")}> 
        {items.map((it) => (
          <TabsTrigger key={it.id} value={it.id} className="gap-2 cursor-pointer">
            {it.icon}
            <span>{it.label}</span>
            {typeof it.count === "number" ? (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1 text-[11px] text-muted-foreground">
                {it.count}
              </span>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((it) => (
        <TabsContent key={it.id} value={it.id} className="pt-4">
          {it.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}


