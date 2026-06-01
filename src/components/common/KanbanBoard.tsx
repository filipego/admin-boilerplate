"use client";

import { DndContext, DragEndEvent, DragOverEvent, PointerSensor, closestCorners, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import UIButton from "@/components/common/UIButton";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type Card = { id: string; title: string };
type Column = { id: string; title: string; cards: Card[] };
type CardLocation = { colIndex: number; cardIndex: number };

function findCardLocation(columns: Column[], cardId: string): CardLocation | null {
  for (const [colIndex, col] of columns.entries()) {
    const cardIndex = col.cards.findIndex((card) => card.id === cardId);
    if (cardIndex >= 0) return { colIndex, cardIndex };
  }

  return null;
}

function moveCard(columns: Column[], activeId: string, overId: string): Column[] {
  if (activeId === overId) return columns;

  const from = findCardLocation(columns, activeId);
  if (!from) return columns;

  const overCard = findCardLocation(columns, overId);
  const overColumnIndex = overCard?.colIndex ?? columns.findIndex((col) => col.id === overId);
  if (overColumnIndex < 0) return columns;

  const next = columns.map((col) => ({ ...col, cards: [...col.cards] }));
  const [movingCard] = next[from.colIndex].cards.splice(from.cardIndex, 1);
  const targetIndex = overCard ? overCard.cardIndex : next[overColumnIndex].cards.length;

  next[overColumnIndex].cards.splice(targetIndex, 0, movingCard);

  return next;
}

function SortableCard({ card }: { card: Card }) {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({ id: card.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn("rounded-md border bg-card px-3 py-2 text-sm cursor-grab", isDragging && "border-primary/60 opacity-70")}
    >
      {card.title}
    </div>
  );
}

function KanbanColumn({ column, highlighted, children }: { column: Column; highlighted: boolean; children: ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id: column.id });

  return (
    <div ref={setNodeRef} className={cn("rounded-lg border p-3 bg-background", (isOver || highlighted) && "border-primary/60 bg-accent/40")}>
      <div className="mb-2 text-sm font-medium">{column.title}</div>
      {children}
    </div>
  );
}

export default function KanbanBoard({ initial }: { initial: Column[] }) {
  const [columns, setColumns] = useState<Column[]>(initial);
  const [overId, setOverId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const onDragOver = (event: DragOverEvent) => {
    setOverId(event.over ? String(event.over.id) : null);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setOverId(null);
    if (!over) return;

    setColumns((prev) => moveCard(prev, String(active.id), String(over.id)));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragOver={onDragOver} onDragCancel={() => setOverId(null)} onDragEnd={onDragEnd}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {columns.map((col) => (
          <KanbanColumn key={col.id} column={col} highlighted={overId === col.id || col.cards.some((card) => card.id === overId)}>
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
          </KanbanColumn>
        ))}
      </div>
    </DndContext>
  );
}
