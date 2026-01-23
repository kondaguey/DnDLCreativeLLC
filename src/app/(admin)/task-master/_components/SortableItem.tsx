"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SortableItem({
  id,
  children,
  className = "",
  disabled = false,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    pointerEvents: isDragging ? "none" : "auto",
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : 1,
    // THE FIX: "pan-y" allows the user to scroll the page vertically on mobile.
    // If disabled is true, it returns full standard touch control ("auto").
    touchAction: disabled ? "auto" : "pan-y",
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative outline-none ${!disabled && isDragging ? "cursor-grabbing" : ""} ${className}`}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}
