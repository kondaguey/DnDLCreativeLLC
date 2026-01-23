"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// 1. CREATE ISOLATED CONTEXT
// This prevents DND props from bleeding into the rest of your app.
const SortableItemContext = createContext<any>(null);

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

// 2. COMPONENT ONE: THE PHYSICS WRAPPER
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
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  // Memoize context to prevent re-render loops
  const contextValue = useMemo(
    () => ({ attributes, listeners, setActivatorNodeRef }),
    [attributes, listeners, setActivatorNodeRef],
  );

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 1,
    opacity: isDragging ? 0.6 : 1, // Visual indicator when dragged
  } as React.CSSProperties;

  return (
    <SortableItemContext.Provider value={contextValue}>
      <div ref={setNodeRef} style={style} className={className}>
        {children}
      </div>
    </SortableItemContext.Provider>
  );
}

interface DragHandleProps {
  children: React.ReactNode;
  className?: string;
}

// 3. COMPONENT TWO: THE DEDICATED GRIP
export function DragHandle({ children, className = "" }: DragHandleProps) {
  const { attributes, listeners, setActivatorNodeRef } =
    useContext(SortableItemContext);

  return (
    <div
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      className={`${className} cursor-grab active:cursor-grabbing touch-none`}
    >
      {children}
    </div>
  );
}
