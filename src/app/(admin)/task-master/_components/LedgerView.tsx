"use client";

import { useState } from "react";
import {
  Bug,
  Lightbulb,
  Wrench,
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
  Filter,
  SortAsc,
  ArrowUp,
  ArrowDown,
  GripVertical,
} from "lucide-react";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem, DragHandle } from "./SortableItem";

import { TaskItem, SortOption } from "./types";
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
  onArchive: (id: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
  onManualMove?: (id: string, direction: "up" | "down") => void;
  onEdit?: (item: TaskItem) => void;
}

const PRIORITY_WEIGHT: Record<string, number> = {
  critical: 4,
  high: 3,
  normal: 2,
  low: 1,
};

export default function LedgerView({
  items,
  allSystemTags = [],
  onUpdateMetadata,
  onUpdateTitle,
  onUpdateTags,
  onDelete,
  onToggleStatus,
  onArchive,
  onReorder,
  onManualMove,
  onEdit,
}: LedgerViewProps) {
  const [ledgerSort, setLedgerSort] = useState<
    "priority" | "newest" | "oldest" | "manual"
  >("priority");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredItems = items
    .filter((item) => {
      if (item.status === "archived") return false;

      const itemPriority = item.metadata?.priority || "normal";
      const itemType = item.metadata?.ticket_type || "task";

      if (filterPriority !== "all" && itemPriority !== filterPriority)
        return false;
      if (filterType !== "all" && itemType !== filterType) return false;

      return true;
    })
    .sort((a, b) => {
      // STRICT MANUAL SORT
      if (ledgerSort === "manual") {
        const posDiff = (a.position || 0) - (b.position || 0);
        if (posDiff !== 0) return posDiff;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      if (ledgerSort === "priority") {
        const aWeight = PRIORITY_WEIGHT[a.metadata?.priority || "normal"] || 0;
        const bWeight = PRIORITY_WEIGHT[b.metadata?.priority || "normal"] || 0;
        if (aWeight !== bWeight) return bWeight - aWeight;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      if (ledgerSort === "oldest") {
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }

      // Default: "newest"
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(active.id, over.id);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full">
      {/* CUSTOM LEDGER CONTROL DECK */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-5 mb-8 shadow-2xl space-y-4">
        {/* TOP ROW */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex items-center gap-2 min-w-[140px]">
            <span className="hidden sm:flex text-[10px] uppercase font-bold text-slate-500 tracking-widest items-center gap-1 shrink-0">
              <SortAsc size={12} /> Sort:
            </span>
            <select
              value={ledgerSort}
              onChange={(e) => setLedgerSort(e.target.value as any)}
              className="bg-black/40 border border-white/10 rounded-xl text-base md:text-xs text-slate-200 px-4 py-3 md:py-2 focus:outline-none focus:border-purple-500 w-full transition-colors shadow-inner font-bold tracking-wide"
            >
              <option value="priority">By Urgency</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="manual">Manual Order</option>
            </select>
          </div>

          {/* PRIORITY TABS */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mask-linear-fade">
            <span className="hidden sm:flex text-[10px] uppercase font-bold text-slate-500 tracking-widest items-center gap-1 shrink-0">
              <AlertTriangle size={12} /> Priority:
            </span>
            {["all", "critical", "high", "normal", "low"].map((prio) => (
              <button
                key={prio}
                onClick={() => setFilterPriority(prio)}
                className={`shrink-0 px-4 py-3 md:px-3 md:py-1.5 rounded-xl text-xs md:text-[10px] font-black uppercase tracking-wider transition-all shadow-inner ${filterPriority === prio
                  ? prio === "critical"
                    ? "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                    : prio === "high"
                      ? "bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                      : "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  : "bg-black/40 text-slate-400 border border-white/5 hover:text-white"
                  }`}
              >
                {prio}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-white/5 w-full" />

        {/* BOTTOM ROW: Ticket Type */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mask-linear-fade pb-1">
          <span className="hidden sm:flex text-[10px] uppercase font-bold text-slate-500 tracking-widest items-center gap-1 shrink-0">
            <Filter size={12} /> Type:
          </span>
          {[
            "all",
            "bug",
            "feature",
            "refactor",
            "security",
            "performance",
            "design",
            "devops",
          ].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`shrink-0 px-3 py-2 md:py-1.5 rounded-lg text-xs md:text-[10px] font-bold uppercase tracking-wider transition-all border ${filterType === type
                ? "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-lg"
                : "bg-transparent text-slate-500 border-transparent hover:bg-white/5 hover:text-slate-300"
                }`}
            >
              {type === "performance" ? "Perf" : type}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-20 opacity-30 animate-in fade-in zoom-in-95">
          <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
          <p className="text-sm font-bold uppercase tracking-widest text-white">
            Ledger clear. All systems nominal.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredItems.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4 pb-20 w-full">
              {filteredItems.map((item, index) => (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  disabled={ledgerSort !== "manual"}
                >
                  <TicketCard
                    item={item}
                    allSystemTags={allSystemTags}
                    isManualSort={ledgerSort === "manual"}
                    isFirst={index === 0}
                    isLast={index === filteredItems.length - 1}
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
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

// --- TICKET CARD COMPONENT ---
function TicketCard({
  item,
  allSystemTags = [],
  isManualSort,
  isFirst,
  isLast,
  onUpdateMetadata,
  onUpdateTitle,
  onUpdateTags,
  onDelete,
  onToggleStatus,
  onArchive,
  onEdit,
  onManualMove,
}: any) {
  const meta = item.metadata || {};
  const [title, setTitle] = useState(item.title);

  const dateStr = new Date(item.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
  const isCompleted = item.status === "completed";

  const type = meta.ticket_type || "task";
  const priority = meta.priority || "normal";

  const handleMetaChange = (field: string, value: string) => {
    onUpdateMetadata(item.id, { ...meta, [field]: value });
  };

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

  // Generic prevent default for internal inputs
  const stopProp = (e: any) => e.stopPropagation();

  return (
    <div
      className={`group relative flex flex-col md:flex-row gap-4 rounded-3xl backdrop-blur-xl border border-white/5 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-0.5 ${priorityColors[priority as keyof typeof priorityColors]} border-l-4 w-full p-5 md:p-6`}
    >
      {/* LEFT: STATUS */}
      <div className="flex flex-row md:flex-col items-center gap-3 shrink-0">
        {/* DRAG HANDLE */}
        {isManualSort && (
          <DragHandle className="text-slate-600 hover:text-white cursor-grab active:cursor-grabbing">
            <GripVertical size={20} />
          </DragHandle>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus(item.id, item.status);
          }}
          className={`w-6 h-6 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center transition-all shadow-inner ${isCompleted ? "bg-emerald-500 border-emerald-500 text-slate-900" : "border-slate-500 hover:border-emerald-500 text-transparent"}`}
        >
          <CheckCircle2 size={14} />
        </button>
      </div>

      {/* CENTER: CONTENT */}
      <div className="flex-1 min-w-0 flex flex-col gap-3 w-full">
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
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border bg-black/40 ${priority === "critical" ? "text-rose-500 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]" : "text-orange-400 border-orange-500/50"}`}
              >
                <AlertTriangle size={12} /> {priority}
              </div>
            )}
          </div>
          <span className="text-[9px] font-mono text-slate-500 bg-black/40 px-2 py-1 rounded-md flex items-center gap-1 whitespace-nowrap shrink-0 border border-white/5">
            <Clock size={10} /> {dateStr}
          </span>
        </div>

        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            if (title !== item.title) onUpdateTitle(item.id, title);
          }}
          onPointerDown={stopProp}
          onKeyDown={stopProp}
          className={`bg-transparent text-lg md:text-xl font-black w-full min-w-0 focus:outline-none focus:border-b focus:border-purple-500/50 pb-1 transition-colors ${isCompleted ? "text-slate-600 line-through" : "text-slate-100"}`}
        />

        {/* TAGS & CONTROLS ROW */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mt-1 w-full">
          <div
            className="flex-1 overflow-x-auto no-scrollbar mask-linear-fade w-full"
            onPointerDown={stopProp}
          >
            {onUpdateTags && (
              <TagManager
                selectedTags={item.tags || []}
                allSystemTags={allSystemTags}
                onUpdateTags={(t) => onUpdateTags(item.id, t)}
              />
            )}
          </div>

          <div className="flex gap-2 shrink-0">
            <select
              value={type}
              onChange={(e) => handleMetaChange("ticket_type", e.target.value)}
              className="appearance-none bg-black/40 text-base md:text-xs font-bold uppercase tracking-wider text-slate-400 border border-white/10 rounded-xl px-3 py-2 md:px-2 md:py-1 focus:outline-none focus:border-purple-500 hover:bg-white/5 transition-colors cursor-pointer text-center"
            >
              <option value="task">Task</option>
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
              <option value="refactor">Refactor</option>
              <option value="security">Security</option>
              <option value="performance">Perf</option>
              <option value="design">Design</option>
              <option value="devops">DevOps</option>
            </select>

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

      {/* ACTIONS ROW (No more parent event-blockers here) */}
      <div className="flex flex-row md:flex-col gap-2 items-center justify-end md:justify-start pt-4 md:pt-0 md:pl-5 md:border-l md:border-white/5 shrink-0 flex-wrap">
        {/* THE FIX: BULLETPROOF CLICK HANDLERS */}
        {isManualSort && onManualMove && (
          <div className="flex items-center md:flex-col bg-white/5 rounded-lg border border-white/10 shadow-inner mr-auto md:mr-0 md:mb-auto">
            <button
              disabled={isFirst}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onManualMove(item.id, "up");
              }}
              className="p-3 md:p-1.5 text-slate-500 hover:text-white disabled:opacity-20 transition-all active:scale-95"
              title="Move Up"
            >
              <ArrowUp size={16} />
            </button>
            <div className="w-px h-6 bg-white/10 md:w-6 md:h-px" />
            <button
              disabled={isLast}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onManualMove(item.id, "down");
              }}
              className="p-3 md:p-1.5 text-slate-500 hover:text-white disabled:opacity-20 transition-all active:scale-95"
              title="Move Down"
            >
              <ArrowDown size={16} />
            </button>
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onArchive(item.id);
          }}
          className="p-3 md:p-1.5 rounded-lg bg-purple-500/10 md:bg-transparent hover:bg-purple-500/20 md:hover:bg-white/10 text-purple-400 md:text-slate-600 md:hover:text-purple-400 transition-colors"
          title="Archive"
        >
          <Archive size={16} />
        </button>
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            className="p-3 md:p-1.5 rounded-lg bg-cyan-500/10 md:bg-transparent hover:bg-cyan-500/20 md:hover:bg-white/10 text-cyan-400 md:text-slate-600 md:hover:text-cyan-400 transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          className="p-3 md:p-1.5 rounded-lg bg-rose-500/10 md:bg-transparent hover:bg-rose-500/20 md:hover:bg-white/10 text-rose-400 md:text-slate-600 md:hover:text-rose-400 transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
