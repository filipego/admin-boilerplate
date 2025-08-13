"use client";

import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState } from "react";
import UIButton from "@/components/common/UIButton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

type Note = { id: string; text: string };

function SortableNote({ note, onDelete, onChange }: { note: Note; onDelete: (id: string) => void; onChange: (id: string, text: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: note.id });
  const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note.text);
  return (
    <div ref={setNodeRef} style={style} className="relative rounded-lg border bg-card p-3 cursor-grab">
      <div className="absolute right-2 top-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="rounded-md p-1 hover:bg-accent cursor-pointer" {...attributes} {...listeners}>
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer" onClick={() => { setEditing(true); setText(note.text); }}>Edit</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => onDelete(note.id)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {editing ? (
        <div className="pt-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full resize-none bg-transparent text-sm outline-none"
            rows={4}
          />
          <div className="pt-2 flex justify-end gap-2">
            <UIButton uiSize="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</UIButton>
            <UIButton uiSize="sm" onClick={() => { onChange(note.id, text); setEditing(false); }}>Save</UIButton>
          </div>
        </div>
      ) : (
        <div className="min-h-16 whitespace-pre-wrap text-sm pt-4" {...attributes} {...listeners}>{note.text}</div>
      )}
    </div>
  );
}

export default function NotesBoard({ initial }: { initial: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initial);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = notes.findIndex((n) => n.id === active.id);
    const newIndex = notes.findIndex((n) => n.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    setNotes((items) => arrayMove(items, oldIndex, newIndex));
  };

  const addNote = () => {
    setNotes((prev) => [{ id: crypto.randomUUID(), text: "New note" }, ...prev]);
  };

  const deleteNote = (id: string) => setNotes((prev) => prev.filter((n) => n.id !== id));
  const changeNote = (id: string, text: string) => setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)));

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <UIButton uiSize="sm" onClick={addNote}>Add Note</UIButton>
      </div>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <SortableContext items={notes.map((n) => n.id)} strategy={rectSortingStrategy}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <SortableNote key={note.id} note={note} onDelete={deleteNote} onChange={changeNote} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}


