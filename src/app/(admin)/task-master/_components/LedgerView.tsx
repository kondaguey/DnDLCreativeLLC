"use client";

import { useState } from "react";
import {
  Bug,
  Lightbulb,
  Wrench,
  GripVertical,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Archive,
  Edit2,
  Clock,
  Shield,
  Gauge,
  Palette,
  Server,
  Circle,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { TaskItem, SortOption } from "./types";
import { SortableItem } from "./SortableItem";
import TagManager from "./TagManager";

interface LedgerViewProps {
  items: TaskItem[];
  sortOption: SortOption;
  filterTags: string[];
  allSystemTags?: string[];
  onUpdateMetadata: (id: string, metadata: any) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onUpdateTags?: (id: string, tags: string[]) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
  onArchive: (id: string) => void;
  onManualMove?: (id: string, direction: "up" | "down") => void;
  onEdit?: (item: TaskItem) => void;
}

export default function LedgerView({
  items,
  sortOption,
  filterTags,
  allSystemTags = [],
  onUpdateMetadata,
  onUpdateTitle,
  onUpdateTags,
  onDelete,
  onToggleStatus,
  onReorder,
  onArchive,
  onManualMove,
  onEdit,
}: LedgerViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const filteredItems = items
    .filter((item) => {
      if (item.status === "archived") return false;
      if (filterTags.length > 0) {
        return filterTags.every((t) => item.tags?.includes(t));
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOption === "manual") return (a.position || 0) - (b.position || 0);
      if (sortOption === "alpha_asc") return a.title.localeCompare(b.title);
      if (sortOption === "alpha_desc") return b.title.localeCompare(a.title);
      if (sortOption === "date_asc")
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string);
    }
  };

  if (filteredItems.length === 0)
    return (
      <div className="text-center py-20 opacity-30 animate-in fade-in zoom-in-95">
        <Bug size={48} className="mx-auto mb-4 text-purple-500" />
        <p className="text-sm font-bold uppercase tracking-widest text-white">
          Systems Nominal. No open tickets.
        </p>
      </div>
    );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
        <SortableContext
          items={filteredItems.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {filteredItems.map((item) => (
            <SortableItem
              key={item.id}
              id={item.id}
              disabled={sortOption !== "manual"}
            >
              <TicketCard
                item={item}
                allSystemTags={allSystemTags}
                isManualSort={sortOption === "manual"}
                onUpdateMetadata={onUpdateMetadata}
                onUpdateTitle={onUpdateTitle}
                onUpdateTags={onUpdateTags}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
                onArchive={onArchive}
                onEdit={onEdit}
                onManualMove={onManualMove}
              />
            </SortableItem>
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
}

// --- TICKET CARD COMPONENT ---
function TicketCard({
  item,
  allSystemTags = [],
  isManualSort,
  onUpdateMetadata,
  onUpdateTitle,
  onUpdateTags,
  onDelete,
  onToggleStatus,
  onArchive,
  onEdit,
}: any) {
  const meta = item.metadata || {};
  const [title, setTitle] = useState(item.title);

  // Formatting
  const dateStr = new Date(item.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
  const isCompleted = item.status === "completed";

  // Fields
  const type = meta.ticket_type || "bug";
  const priority = meta.priority || "normal";

  const handleMetaChange = (field: string, value: string) => {
    onUpdateMetadata(item.id, { ...meta, [field]: value });
  };

  // --- INDUSTRY STANDARD TICKET CONFIG ---
  const typeConfig = {
    bug: {
      icon: Bug,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      label: "Bug",
    },
    feature: {
      icon: Lightbulb,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      label: "Feature",
    },
    refactor: {
      icon: Wrench,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      label: "Refactor",
    },
    security: {
      icon: Shield,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      label: "Security",
    },
    performance: {
      icon: Gauge,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      label: "Perf",
    },
    design: {
      icon: Palette,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
      label: "Design",
    },
    devops: {
      icon: Server,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      label: "DevOps",
    },
  }[type as string] || {
    icon: Circle,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    label: "Task",
  };

  const priorityColors = {
    critical: "border-l-rose-500 bg-rose-500/10",
    high: "border-l-orange-500 bg-orange-500/10",
    normal: "border-l-transparent bg-slate-900/40",
    low: "border-l-slate-700 bg-black/40 opacity-80",
  };

  const Icon = typeConfig.icon;
  const stopProp = (e: any) => e.stopPropagation();

  return (
    <div
      className={`group relative flex flex-col md:flex-row gap-4 p-5 md:p-6 rounded-3xl backdrop-blur-xl border border-white/5 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-0.5 ${priorityColors[priority as keyof typeof priorityColors]} border-l-4`}
    >
      {/* LEFT: STATUS & GRIP */}
      <div className="flex flex-row md:flex-col items-center gap-3 shrink-0">
        {isManualSort && (
          <GripVertical
            size={16}
            className="text-slate-600 cursor-grab hover:text-white"
          />
        )}
        <button
          onClick={() => onToggleStatus(item.id, item.status)}
          onPointerDown={stopProp}
          className={`w-6 h-6 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center transition-all shadow-inner ${isCompleted ? "bg-emerald-500 border-emerald-500 text-slate-900" : "border-slate-500 hover:border-emerald-500 text-transparent"}`}
        >
          <CheckCircle2 size={14} />
        </button>
      </div>

      {/* CENTER: CONTENT */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${typeConfig.bg} ${typeConfig.color} ${typeConfig.border}`}
            >
              <Icon size={12} /> {typeConfig.label}
            </div>
            {priority !== "normal" && priority !== "low" && (
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border bg-black/40 ${priority === "critical" ? "text-rose-500 border-rose-500/50" : "text-orange-400 border-orange-500/50"}`}
              >
                <AlertTriangle size={12} /> {priority}
              </div>
            )}
          </div>
          {/* TINY DATE TAG */}
          <span className="text-[9px] font-mono text-slate-500 bg-black/40 px-2 py-1 rounded-md flex items-center gap-1 whitespace-nowrap shrink-0 border border-white/5">
            <Clock size={10} /> {dateStr}
          </span>
        </div>

        {/* Title Input (Supersized on Mobile) */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            if (title !== item.title) onUpdateTitle(item.id, title);
          }}
          onPointerDown={stopProp}
          onKeyDown={stopProp}
          className={`bg-transparent text-lg md:text-xl font-black w-full focus:outline-none focus:border-b focus:border-purple-500/50 pb-1 transition-colors ${isCompleted ? "text-slate-600 line-through" : "text-slate-100"}`}
        />

        {/* TAGS & CONTROLS ROW */}
        <div
          className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mt-1 w-full"
          onPointerDown={stopProp}
        >
          {/* TAG MANAGER INTEGRATION (Swipeable on Mobile) */}
          <div className="flex-1 overflow-x-auto no-scrollbar mask-linear-fade">
            {onUpdateTags && (
              <TagManager
                selectedTags={item.tags || []}
                allSystemTags={allSystemTags}
                onUpdateTags={(t) => onUpdateTags(item.id, t)}
              />
            )}
          </div>

          <div className="flex gap-2 shrink-0">
            {/* Type Selector - text-base for mobile */}
            <select
              value={type}
              onChange={(e) => handleMetaChange("ticket_type", e.target.value)}
              className="appearance-none bg-black/40 text-base md:text-xs font-bold uppercase tracking-wider text-slate-400 border border-white/10 rounded-xl px-3 py-2 md:px-2 md:py-1 focus:outline-none focus:border-purple-500 hover:bg-white/5 transition-colors cursor-pointer text-center"
            >
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
              <option value="refactor">Refactor</option>
              <option value="security">Security</option>
              <option value="performance">Perf</option>
              <option value="design">Design</option>
              <option value="devops">DevOps</option>
            </select>

            {/* Priority Selector - text-base for mobile */}
            <select
              value={priority}
              onChange={(e) => handleMetaChange("priority", e.target.value)}
              className={`appearance-none bg-black/40 text-base md:text-xs font-bold uppercase tracking-wider border border-white/10 rounded-xl px-3 py-2 md:px-2 md:py-1 focus:outline-none focus:border-purple-500 hover:bg-white/5 transition-colors cursor-pointer text-center
                  ${priority === "critical" ? "text-rose-400" : priority === "high" ? "text-orange-400" : "text-slate-400"}
              `}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* ACTIONS ROW (Supersized on mobile) */}
      <div
        className="flex flex-row md:flex-col gap-2 items-center justify-end md:justify-start pt-4 md:pt-0 md:pl-5 md:border-l md:border-white/5 transition-opacity"
        onPointerDown={stopProp}
      >
        <button
          onClick={() => onArchive(item.id)}
          className="p-3 md:p-1.5 rounded-lg bg-purple-500/10 md:bg-transparent hover:bg-purple-500/20 md:hover:bg-white/10 text-purple-400 md:text-slate-600 md:hover:text-purple-400 transition-colors"
          title="Archive"
        >
          <Archive size={16} />
        </button>
        {onEdit && (
          <button
            onClick={() => onEdit(item)}
            className="p-3 md:p-1.5 rounded-lg bg-cyan-500/10 md:bg-transparent hover:bg-cyan-500/20 md:hover:bg-white/10 text-cyan-400 md:text-slate-600 md:hover:text-cyan-400 transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
        )}
        <button
          onClick={() => onDelete(item.id)}
          className="p-3 md:p-1.5 rounded-lg bg-rose-500/10 md:bg-transparent hover:bg-rose-500/20 md:hover:bg-white/10 text-rose-400 md:text-slate-600 md:hover:text-rose-400 transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
