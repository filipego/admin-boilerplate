"use client";

import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import UIButton from "@/components/common/UIButton";
import { useEffect, useState } from "react";

type Card = { id: string; title: string };
type Column = { id: string; title: string; cards: Card[] };

function SortableCard({ card }: { card: Card }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: card.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="rounded-md border bg-card px-3 py-2 text-sm cursor-grab">
      {card.title}
    </div>
  );
}

export default function KanbanBoard({ initial }: { initial: Column[] }) {
  const [columns, setColumns] = useState<Column[]>(initial);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const findCard = (id: string) => {
    for (const col of columns) {
      const idx = col.cards.findIndex((c) => c.id === id);
      if (idx >= 0) return { colId: col.id, colIndex: columns.findIndex((c) => c.id === col.id), cardIndex: idx };
    }
    return null;
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = findCard(String(active.id));
    const to = findCard(String(over.id));
    // Same column reorder
    if (from && to && from.colId === to.colId) {
      setColumns((prev) => {
        const next = prev.map((c) => ({ ...c, cards: [...c.cards] }));
        const col = next[from.colIndex];
        col.cards = arrayMove(col.cards, from.cardIndex, to.cardIndex);
        return next;
      });
      return;
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {columns.map((col) => (
          <div key={col.id} className="rounded-lg border p-3 bg-background">
            <div className="mb-2 text-sm font-medium">{col.title}</div>
            <SortableContext items={col.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {col.cards.map((card) => (
                  <SortableCard key={card.id} card={card} />
                ))}
              </div>
            </SortableContext>
            <div className="pt-2">
              <UIButton uiSize="sm" variant="outline">Add Card</UIButton>
            </div>
          </div>
        ))}
      </div>
    </DndContext>
  );
}


