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
  Lock,
  Unlock,
  GripVertical,
  CheckSquare,
  Plus,
  CornerDownRight,
  Check,
  ChevronDown,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { useMemo } from "react";

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
  onAddSubtask?: (parentId: string, title: string) => void;
  onToggleSubtask?: (parentId: string, subtaskId: string, currentStatus: string) => void;
  onDeleteSubtask?: (parentId: string, subtaskId: string) => void;
  onReorderSubtask?: (parentId: string, subtaskId: string, direction: "up" | "down") => void;
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
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onReorderSubtask,
}: LedgerViewProps) {
  const [ledgerSort, setLedgerSort] = useState<
    "priority" | "newest" | "oldest" | "manual"
  >("priority");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [activePeriod, setActivePeriod] = useState<string>("all");
  const [showCompleted, setShowCompleted] = useState(false);

  // --- TIMELINE LOGIC ---
  const timeline = useMemo(() => {
    const periods = new Set<string>();
    items.forEach((item) => {
      // Ledger items use created_at
      const date = new Date(item.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      periods.add(key);
    });
    return Array.from(periods).sort().reverse();
  }, [items]);

  const formatPeriod = (key: string) => {
    const [year, month] = key.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString(undefined, {
      month: "short",
      year: "2-digit",
    });
  };

  const processedItems = items
    .filter((item) => {
      if (item.status === "archived") return false;

      const itemPriority = item.metadata?.priority || "normal";
      const itemType = item.metadata?.ticket_type || "task";

      if (filterPriority !== "all" && itemPriority !== filterPriority)
        return false;
      if (filterType !== "all" && itemType !== filterType) return false;

      // Date Filter
      if (activePeriod !== "all") {
        const date = new Date(item.created_at);
        const itemKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (itemKey !== activePeriod) return false;
      }

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

  const activeTickets = processedItems.filter((i) => i.status !== "completed");
  const completedTickets = processedItems.filter((i) => i.status === "completed");

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

        <div className="h-px bg-white/5 w-full" />

        {/* TIMELINE TABS */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mask-linear-fade pb-1">
          <span className="hidden sm:flex text-[10px] uppercase font-bold text-slate-500 tracking-widest items-center gap-1 shrink-0">
            <CalendarDays size={12} /> Date:
          </span>
          <button
            onClick={() => setActivePeriod("all")}
            className={`shrink-0 px-4 py-2 md:py-1.5 rounded-full text-xs md:text-[10px] font-bold uppercase tracking-wider transition-all ${activePeriod === "all"
              ? "bg-white text-black shadow-lg shadow-white/20"
              : "bg-white/5 text-slate-400 hover:text-white"
              }`}
          >
            All Time
          </button>
          {timeline.map((period) => (
            <button
              key={period}
              onClick={() => setActivePeriod(period)}
              className={`shrink-0 px-4 py-2 md:py-1.5 rounded-full text-xs md:text-[10px] font-bold uppercase tracking-wider transition-all ${activePeriod === period
                ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
                : "bg-white/5 text-slate-400 hover:text-white"
                }`}
            >
              {formatPeriod(period)}
            </button>
          ))}
        </div>
      </div>

      {activeTickets.length === 0 && completedTickets.length === 0 ? (
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
            items={activeTickets.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4 pb-20 w-full">
              {activeTickets.map((item, index) => (
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
                    isLast={index === activeTickets.length - 1}
                    onUpdateMetadata={onUpdateMetadata}
                    onUpdateTitle={onUpdateTitle}
                    onUpdateTags={onUpdateTags}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                    onArchive={onArchive}
                    onEdit={onEdit}
                    onManualMove={onManualMove}
                    onAddSubtask={onAddSubtask}
                    onToggleSubtask={onToggleSubtask}
                    onDeleteSubtask={onDeleteSubtask}
                    onReorderSubtask={onReorderSubtask}
                  />
                </SortableItem>
              ))}
            </div>
          </SortableContext>

          {/* COMPLETED SECTION */}
          {completedTickets.length > 0 && (
            <div className="mt-8 border-t border-white/10 pt-8 opacity-80">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors mb-6"
              >
                {showCompleted ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
                Completed Entries ({completedTickets.length})
              </button>

              {showCompleted && (
                <div className="space-y-4">
                  {completedTickets.map((item) => (
                    <div key={item.id} className="opacity-60 hover:opacity-100 transition-opacity">
                      <TicketCard
                        item={item}
                        allSystemTags={allSystemTags}
                        isManualSort={false} // Disable Sort for Completed
                        isFirst={false}
                        isLast={false}
                        onUpdateMetadata={onUpdateMetadata}
                        onUpdateTitle={onUpdateTitle}
                        onUpdateTags={onUpdateTags}
                        onDelete={onDelete}
                        onToggleStatus={onToggleStatus}
                        onArchive={onArchive}
                        onEdit={onEdit}
                        onManualMove={onManualMove}
                        onAddSubtask={onAddSubtask}
                        onToggleSubtask={onToggleSubtask}
                        onDeleteSubtask={onDeleteSubtask}
                        onReorderSubtask={onReorderSubtask}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onReorderSubtask,
}: any) {
  const meta = item.metadata || {};
  const [title, setTitle] = useState(item.title);
  const [expanded, setExpanded] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [isLocked, setIsLocked] = useState(true);

  // Sync internal title state if prop changes
  if (item.title !== title && document.activeElement?.id !== `title-${item.id}`) {
    setTitle(item.title);
  }

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

  const handleSubmitSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtaskTitle.trim() || !onAddSubtask) return;
    onAddSubtask(item.id, subtaskTitle);
    setSubtaskTitle("");
  };

  const safeSubtasks = item.subtasks || [];
  const totalSub = safeSubtasks.length;
  const completedSub = safeSubtasks.filter(
    (s: any) => s.status === "completed"
  ).length;

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
      className={`group relative flex flex-col gap-3 md:gap-4 rounded-2xl md:rounded-3xl backdrop-blur-xl border border-white/5 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-0.5 ${priorityColors[priority as keyof typeof priorityColors]} border-l-4 w-full p-3 md:p-6`}
    >
      {/* LEFT: STATUS */}
      <div className="flex flex-row items-center gap-2 md:gap-3 shrink-0">
        {/* DRAG HANDLE */}
        {isManualSort && (
          <DragHandle className="text-slate-600 hover:text-white cursor-grab active:cursor-grabbing">
            <GripVertical size={16} className="md:w-5 md:h-5" />
          </DragHandle>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus(item.id, item.status);
          }}
          className={`w-5 h-5 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center transition-all shadow-inner ${isCompleted ? "bg-emerald-500 border-emerald-500 text-slate-900" : "border-slate-500 hover:border-emerald-500 text-transparent"}`}
        >
          <CheckCircle2 size={12} className="md:w-3.5 md:h-3.5" />
        </button>
      </div>

      {/* CENTER: CONTENT */}
      <div className="flex-1 min-w-0 flex flex-col gap-2 md:gap-3 w-full">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:justify-between">
          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
            <div
              className={`flex items-center gap-1 px-2 py-0.5 md:px-2.5 md:py-1 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-widest border ${typeConfig.bg} ${typeConfig.color} ${typeConfig.border}`}
            >
              <Icon size={10} className="md:w-3 md:h-3" /> {typeConfig.label}
            </div>
            {priority !== "normal" && priority !== "low" && (
              <div
                className={`flex items-center gap-0.5 md:gap-1 px-2 py-0.5 md:px-2.5 md:py-1 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-widest border bg-black/40 ${priority === "critical" ? "text-rose-500 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]" : "text-orange-400 border-orange-500/50"}`}
              >
                <AlertTriangle size={10} className="md:w-3 md:h-3" /> {priority}
              </div>
            )}
          </div>
          <span className="text-[9px] font-mono text-slate-500 bg-black/40 px-2 py-1 rounded-md flex items-center gap-1 whitespace-nowrap shrink-0 border border-white/5 w-fit">
            <Clock size={9} className="md:w-2.5 md:h-2.5" /> {dateStr}
          </span>
        </div>

        {isLocked ? (
          <h3
            className={`text-xs md:text-xl font-black w-full min-w-0 pb-1 cursor-pointer transition-colors leading-tight ${isCompleted ? "text-slate-600 line-through" : "text-slate-100 hover:text-white"}`}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {title}
          </h3>
        ) : (
          <input
            id={`title-${item.id}`}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              if (title !== item.title) onUpdateTitle(item.id, title);
            }}
            onPointerDown={stopProp}
            onKeyDown={stopProp}
            className={`bg-transparent text-xs md:text-xl font-black w-full min-w-0 focus:outline-none focus:border-b focus:border-purple-500/50 pb-1 transition-colors ${isCompleted ? "text-slate-600 line-through" : "text-slate-100"}`}
            autoFocus
          />
        )}

        {/* TAGS & CONTROLS ROW */}
        <div className="flex flex-col gap-2 md:gap-3 mt-1 w-full">
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

          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 w-full">
            <div
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className={`flex items-center gap-1 text-[9px] md:text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all w-full md:w-fit rounded-md select-none shrink-0 border border-transparent px-2 py-1.5 md:py-1 ${expanded
                ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                : "text-slate-500 hover:text-white bg-white/5"
                }`}
            >
              {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              {totalSub > 0 ? (
                <>
                  {completedSub}/{totalSub} Subtasks
                </>
              ) : (
                "Add Subtasks"
              )}
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={type}
                onChange={(e) => handleMetaChange("ticket_type", e.target.value)}
                className="appearance-none bg-black/40 text-xs md:text-xs font-bold uppercase tracking-wider text-slate-400 border border-white/10 rounded-xl px-2 py-2 md:px-2 md:py-1 focus:outline-none focus:border-purple-500 hover:bg-white/5 transition-colors cursor-pointer text-center flex-1 md:flex-initial"
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
                className={`appearance-none bg-black/40 text-xs md:text-xs font-bold uppercase tracking-wider border border-white/10 rounded-xl px-2 py-2 md:px-2 md:py-1 focus:outline-none focus:border-purple-500 hover:bg-white/5 transition-colors cursor-pointer text-center flex-1 md:flex-initial
                    ${priority === "critical"
                    ? "text-rose-400"
                    : priority === "high"
                      ? "text-orange-400"
                      : "text-slate-400"
                  }
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

        {/* --- EXPANDABLE SUBTASK SECTION --- */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
              <CheckSquare size={12} className="text-purple-500" /> Checklist
            </h5>

            <div className="space-y-2 mb-4">
              {safeSubtasks.map((sub: any, idx: number) => (
                <div
                  key={sub.id}
                  className="flex items-start gap-3 group/sub relative bg-white/5 p-2 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex flex-col gap-0.5 mt-0.5 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                    <button
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onReorderSubtask && onReorderSubtask(item.id, sub.id, "up");
                      }}
                      className="text-slate-600 hover:text-white disabled:opacity-20"
                    >
                      <ArrowUp size={8} />
                    </button>
                    <button
                      disabled={idx === safeSubtasks.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onReorderSubtask && onReorderSubtask(item.id, sub.id, "down");
                      }}
                      className="text-slate-600 hover:text-white disabled:opacity-20"
                    >
                      <ArrowDown size={8} />
                    </button>
                  </div>

                  <button
                    onClick={() => onToggleSubtask && onToggleSubtask(item.id, sub.id, sub.status)}
                    className={`w-4 h-4 mt-0.5 rounded-md border flex items-center justify-center shrink-0 transition-all ${sub.status === "completed"
                      ? "bg-indigo-500 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                      : "border-slate-500 hover:border-indigo-400"
                      }`}
                  >
                    {sub.status === "completed" && (
                      <Check size={10} className="text-white font-black" />
                    )}
                  </button>
                  <span
                    className={`text-sm break-words leading-relaxed pt-0.5 transition-all ${sub.status === "completed"
                      ? "line-through text-slate-600"
                      : "text-slate-200 font-medium"
                      }`}
                  >
                    {sub.title}
                  </span>
                  <button
                    onClick={() => onDeleteSubtask && onDeleteSubtask(item.id, sub.id)}
                    className="md:opacity-0 group-hover/sub:opacity-100 text-slate-600 hover:text-rose-400 ml-auto p-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            {item.status !== "archived" && onAddSubtask && (
              <form
                onSubmit={handleSubmitSub}
                className="flex items-center gap-2 relative bg-black/20 border border-white/10 focus-within:bg-purple-500/5 focus-within:border-purple-500/50 rounded-xl transition-all"
              >
                <CornerDownRight
                  size={14}
                  className="text-slate-600 shrink-0 ml-3"
                />
                <input
                  type="text"
                  value={subtaskTitle}
                  onChange={(e) => setSubtaskTitle(e.target.value)}
                  placeholder="New step..."
                  className="bg-transparent text-sm text-white font-medium w-full px-2 py-2.5 focus:outline-none placeholder:text-slate-600"
                />
                <button
                  type="submit"
                  className="text-slate-500 hover:text-purple-400 p-2 pr-3 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </form>
            )}
          </div>
        )}
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLocked(!isLocked);
          }}
          className={`p-3 md:p-1.5 rounded-lg bg-cyan-500/10 md:bg-transparent hover:bg-cyan-500/20 md:hover:bg-white/10 transition-colors ${!isLocked ? "text-cyan-400" : "text-slate-500 md:text-slate-600 md:hover:text-cyan-400"}`}
          title={isLocked ? "Unlock to Edit" : "Lock Task"}
        >
          {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
        </button>
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
