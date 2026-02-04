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
  List,
  StretchVertical,
  LayoutGrid,
  Star,
  Loader2,
  Send,
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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem, DragHandle } from "../widgets/SortableItem";

import { TaskItem, SortOption } from "../utils/types";
import TagManager from "../navigation/TagManager";

interface LedgerViewProps {
  items: TaskItem[];
  sortOption: SortOption;
  filterTags: string[];
  allSystemTags?: string[];
  searchQuery?: string;
  activePeriod?: string;
  onUpdateMetadata: (id: string, metadata: any) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onUpdateTags?: (id: string, tags: string[]) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: string) => void;
  onArchive: (id: string) => void;
  onReorder?: (draggedId: string, targetId: string) => void;
  onManualMove?: (id: string, direction: "up" | "down") => void;
  onEdit?: (item: TaskItem) => void;
  onAddSubtask?: (parentId: string, title: string) => void;
  onToggleSubtask?: (
    parentId: string,
    subtaskId: string,
    currentStatus: string,
  ) => void;
  onDeleteSubtask?: (parentId: string, subtaskId: string) => void;
  onReorderSubtask?: (
    parentId: string,
    subtaskId: string,
    direction: "up" | "down",
  ) => void;
  onUpdateSubtaskTitle?: (
    parentId: string,
    subtaskId: string,
    title: string,
  ) => void;
  onBulkDelete?: (ids: string[]) => void;
  onAdd: (title: string, content: string, priority: string) => void;
  isAdding?: boolean;
}

const PRIORITY_WEIGHT: Record<string, number> = {
  critical: 4,
  high: 3,
  normal: 2,
  low: 1,
};

export default function LedgerView({
  items,
  sortOption,
  filterTags,
  allSystemTags = [],
  searchQuery = "",
  activePeriod = "all",
  onUpdateMetadata,
  onUpdateTitle,
  onUpdateTags,
  onDelete,
  onToggleStatus,
  onArchive,
  onReorder,
  onManualMove,
  onEdit,
  onAdd,
  isAdding = false,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onReorderSubtask,
  onUpdateSubtaskTitle,
  onBulkDelete,
}: LedgerViewProps) {
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [showCompleted, setShowCompleted] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid" | "compact">("list");
  const [selectedCompleted, setSelectedCompleted] = useState<Set<string>>(
    new Set(),
  );

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newPriority, setNewPriority] = useState("normal");

  const processedItems = items
    .filter((item) => {
      if (item.status === "archived") return false;

      const itemPriority = item.metadata?.priority || "normal";
      const itemType = item.metadata?.ticket_type || "task";

      if (filterPriority !== "all" && itemPriority !== filterPriority)
        return false;
      if (filterType !== "all" && itemType !== filterType) return false;

      if (
        filterTags.length > 0 &&
        !filterTags.every((t) => item.tags?.includes(t))
      ) {
        return false;
      }

      if (activePeriod !== "all") {
        const date = new Date(item.created_at);
        const itemKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (itemKey !== activePeriod) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = (item.title || "").toLowerCase().includes(query);
        const notesMatch = (item.content || "").toLowerCase().includes(query);
        if (!titleMatch && !notesMatch) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortOption === "manual") {
        const posDiff = (a.position || 0) - (b.position || 0);
        if (posDiff !== 0) return posDiff;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      if (sortOption === "priority_desc") {
        const aWeight = PRIORITY_WEIGHT[a.metadata?.priority || "normal"] || 0;
        const bWeight = PRIORITY_WEIGHT[b.metadata?.priority || "normal"] || 0;
        if (aWeight !== bWeight) return bWeight - aWeight;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      if (sortOption === "priority_asc") {
        const aWeight = PRIORITY_WEIGHT[a.metadata?.priority || "normal"] || 0;
        const bWeight = PRIORITY_WEIGHT[b.metadata?.priority || "normal"] || 0;
        if (aWeight !== bWeight) return aWeight - bWeight;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      if (sortOption === "created_desc" || sortOption === "date_desc") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      if (sortOption === "date_asc") {
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }

      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  const activeTickets = processedItems.filter((i) => i.status !== "completed");
  const completedTickets = processedItems.filter(
    (i) => i.status === "completed",
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder?.(active.id, over.id);
    }
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedCompleted);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCompleted(next);
  };

  const toggleSelectAll = () => {
    if (selectedCompleted.size === completedTickets.length) {
      setSelectedCompleted(new Set());
    } else {
      setSelectedCompleted(new Set(completedTickets.map((i) => i.id)));
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-32 w-full max-w-5xl mx-auto">
      {/* QUICK ADD CARD */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newTitle.trim()) return;
          onAdd(newTitle, newContent, newPriority);
          setNewTitle("");
          setNewContent("");
          setNewPriority("normal");
        }}
        className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 flex flex-col gap-4 shadow-2xl mb-8 group transition-all focus-within:border-slate-400/30"
      >
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <div className="bg-slate-500/10 p-1.5 rounded-lg border border-slate-500/20">
            <CheckCircle2 size={14} className="text-slate-400" fill="currentColor" />
          </div>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Manual Log Entry (e.g., Completed Client Report)..."
            className="bg-transparent w-full text-sm font-black text-white placeholder:text-slate-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Log details or execution notes..."
              className="w-full bg-black/20 rounded-xl p-3 text-xs text-slate-300 focus:outline-none resize-none h-20 border border-white/5 focus:border-white/10 placeholder:text-slate-700"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <AlertTriangle size={12} /> Priority
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {["low", "normal", "high", "critical"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewPriority(p)}
                  className={`px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${newPriority === p
                    ? "bg-slate-100 text-slate-900 border-white"
                    : "bg-white/5 text-slate-500 border-white/5 hover:text-white"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isAdding || !newTitle.trim()}
            className="bg-slate-100 hover:bg-white disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest grow md:grow-0 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            {isAdding ? <Loader2 className="animate-spin" size={12} /> : "Record Log"}
            {!isAdding && <Send size={12} />}
          </button>
        </div>
      </form>
      {/* CUSTOM LEDGER CONTROL DECK */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-5 mb-8 shadow-2xl space-y-4">
        {/* TOP ROW: Priority Filters + Desktop View Toggle */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Priority Filters */}
          <div className="flex-1 w-full md:w-auto overflow-x-auto no-scrollbar mask-linear-fade">
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex text-[10px] uppercase font-bold text-slate-500 tracking-widest items-center gap-1 shrink-0 ml-2">
                <AlertTriangle size={12} /> Priority:
              </span>
              {["all", "critical", "high", "normal", "low"].map((prio) => (
                <button
                  key={prio}
                  onClick={() => setFilterPriority(prio)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-inner ${filterPriority === prio
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

          {/* DESKTOP VIEW TOGGLE (HIDDEN ON MOBILE) */}
          <div className="hidden md:flex bg-black/40 p-1 rounded-xl border border-white/5 shadow-inner shrink-0 self-end md:self-auto">
            <button
              onClick={() => setViewMode("compact")}
              className={`p-2 rounded-lg transition-all ${viewMode === "compact" ? "bg-white/10 text-white shadow-md" : "text-slate-500 hover:text-white"}`}
              title="Compact View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white/10 text-white shadow-md" : "text-slate-500 hover:text-white"}`}
              title="List View"
            >
              <StretchVertical size={16} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white/10 text-white shadow-md" : "text-slate-500 hover:text-white"}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>

        <div className="h-px bg-white/5 w-full" />

        {/* BOTTOM ROW: Ticket Type (Centered on mobile) */}
        <div className="flex items-center justify-center md:justify-start gap-2 overflow-x-auto no-scrollbar mask-linear-fade pb-1">
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
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${filterType === type
                ? "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-lg"
                : "bg-transparent text-slate-500 border-transparent hover:bg-white/5 hover:text-slate-300"
                }`}
            >
              {type === "performance" ? "Perf" : type}
            </button>
          ))}
        </div>

        <div className="h-px bg-white/5 w-full md:hidden" />

        {/* MOBILE VIEW TOGGLE (STRICTLY BELOW EVERYTHING) */}
        <div className="flex md:hidden justify-center w-full pt-2">
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 shadow-inner shrink-0">
            <button
              onClick={() => setViewMode("compact")}
              className={`p-2 rounded-lg transition-all ${viewMode === "compact" ? "bg-white/10 text-white shadow-md" : "text-slate-500 hover:text-white"}`}
              title="Compact View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white/10 text-white shadow-md" : "text-slate-500 hover:text-white"}`}
              title="List View"
            >
              <StretchVertical size={16} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white/10 text-white shadow-md" : "text-slate-500 hover:text-white"}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
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
            strategy={
              viewMode === "grid"
                ? rectSortingStrategy
                : verticalListSortingStrategy
            }
          >
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch"
                  : viewMode === "compact"
                    ? "space-y-1"
                    : "space-y-4"
              }
            >
              {activeTickets.map((item, index) => (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  disabled={sortOption !== "manual"}
                >
                  <TicketCard
                    item={item}
                    viewMode={viewMode}
                    allSystemTags={allSystemTags}
                    isManualSort={sortOption === "manual"}
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
                    onUpdateSubtaskTitle={onUpdateSubtaskTitle}
                  />
                </SortableItem>
              ))}
            </div>
          </SortableContext>

          {/* COMPLETED SECTION */}
          {completedTickets.length > 0 && (
            <div className="mt-8 border-t border-white/10 pt-8 opacity-80">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                >
                  {showCompleted ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                  Completed Entries ({completedTickets.length})
                </button>

                {showCompleted && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleSelectAll}
                      className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-white transition-colors"
                    >
                      {selectedCompleted.size === completedTickets.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                    {selectedCompleted.size > 0 && onBulkDelete && (
                      <button
                        onClick={() =>
                          onBulkDelete(Array.from(selectedCompleted))
                        }
                        className="flex items-center gap-1 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                      >
                        <Trash2 size={12} />
                        Delete ({selectedCompleted.size})
                      </button>
                    )}
                  </div>
                )}
              </div>

              {showCompleted && (
                <div className="space-y-4">
                  {completedTickets.map((item) => (
                    <div
                      key={item.id}
                      className="group/item flex items-start gap-4 transition-opacity"
                    >
                      <button
                        onClick={() => toggleSelection(item.id)}
                        className={`mt-6 shrink-0 w-5 h-5 rounded border transition-all flex items-center justify-center ${selectedCompleted.has(item.id)
                          ? "bg-purple-500 border-purple-500 text-white"
                          : "border-white/10 text-transparent hover:border-white/30"
                          }`}
                      >
                        <Check size={12} />
                      </button>

                      <div className="flex-1 opacity-60 hover:opacity-100 transition-opacity">
                        <TicketCard
                          item={item}
                          viewMode={viewMode}
                          allSystemTags={allSystemTags}
                          isManualSort={false}
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
                          onUpdateSubtaskTitle={onUpdateSubtaskTitle}
                        />
                      </div>
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
  viewMode,
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
  onUpdateSubtaskTitle,
}: any) {
  const meta = item.metadata || {};
  const [title, setTitle] = useState(item.title);
  const [expanded, setExpanded] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [isLocked, setIsLocked] = useState(true);

  if (
    item.title !== title &&
    document.activeElement?.id !== `title-${item.id}`
  ) {
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
    (s: any) => s.status === "completed",
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
  const stopProp = (e: any) => e.stopPropagation();

  // DYNAMIC CLASSES BASED ON VIEW MODE
  let containerClasses = `group relative flex flex-col gap-3 md:gap-4 rounded-2xl md:rounded-3xl backdrop-blur-xl border border-white/5 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-0.5 ${priorityColors[priority as keyof typeof priorityColors]} border-l-4 w-full p-3 md:p-6`;

  if (viewMode === "compact") {
    containerClasses = `group relative flex flex-row items-center gap-3 rounded-xl border border-white/5 transition-all hover:bg-white/5 ${priorityColors[priority as keyof typeof priorityColors]} border-l-4 w-full px-3 py-2`;
  }

  // --- COMPACT RENDER ---
  if (viewMode === "compact") {
    return (
      <div className={containerClasses}>
        {isManualSort && (
          <DragHandle className="text-slate-600 hover:text-white cursor-grab active:cursor-grabbing shrink-0">
            <GripVertical size={12} />
          </DragHandle>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus(item.id, item.status);
          }}
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isCompleted ? "bg-emerald-500 border-emerald-500 text-slate-900" : "border-slate-500 hover:border-emerald-500 text-transparent"}`}
        >
          <CheckCircle2 size={10} />
        </button>
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span
            className={`text-sm font-bold truncate ${isCompleted ? "text-slate-600 line-through" : "text-slate-200"}`}
          >
            {title}
          </span>
          {item.metadata?.is_favorite && (
            <Star size={10} className="text-amber-400 fill-amber-400 shrink-0" />
          )}
          <div
            className={`hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${typeConfig.bg} ${typeConfig.color} ${typeConfig.border}`}
          >
            <Icon size={8} /> {typeConfig.label}
          </div>
          <div className="hidden lg:flex flex-1 truncate text-[11px] text-slate-500 italic opacity-60 px-4">
            {item.content || "..."}
          </div>
          {item.tags?.length > 0 && (
            <div className="hidden xl:flex items-center gap-1 shrink-0">
              {item.tags.slice(0, 1).map((t: string) => (
                <span key={t} className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-white/5 font-bold uppercase">{t}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {totalSub > 0 && (
            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
              <CheckSquare size={10} /> {completedSub}/{totalSub}
            </span>
          )}
          <span className="text-[10px] font-mono text-slate-500 hidden sm:block">
            {dateStr}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit && onEdit(item);
            }}
            className="p-1.5 text-slate-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="p-1.5 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    );
  }

  // --- STANDARD / GRID RENDER ---
  return (
    <div className={containerClasses}>
      {/* LEFT: STATUS */}
      <div className="flex flex-row items-center gap-2 shrink-0">
        {/* DRAG HANDLE */}
        {isManualSort && (
          <DragHandle className="text-slate-600 hover:text-white cursor-grab active:cursor-grabbing">
            <GripVertical size={12} />
          </DragHandle>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus(item.id, item.status);
          }}
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shadow-inner ${isCompleted ? "bg-emerald-500 border-emerald-500 text-slate-900" : "border-slate-500 hover:border-emerald-500 text-transparent"}`}
        >
          <CheckCircle2 size={10} />
        </button>
      </div>

      {/* CENTER: CONTENT */}
      <div className="flex-1 min-w-0 flex flex-col gap-2 w-full">
        {/* TITLE - BIGGER TEXT ON DESKTOP */}
        {isLocked ? (
          <h3
            className={`flex-1 text-sm md:text-lg font-bold w-full min-w-0 cursor-pointer transition-colors leading-tight line-clamp-1 ${isCompleted ? "text-slate-600 line-through" : "text-slate-100 hover:text-white"}`}
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
            className={`flex-1 bg-transparent text-sm md:text-lg font-bold w-full min-w-0 focus:outline-none focus:border-b focus:border-purple-500/50 pb-1 transition-colors ${isCompleted ? "text-slate-600 line-through" : "text-slate-100"}`}
            autoFocus
          />
        )}

        {/* METADATA ROW */}
        <div className="flex items-center gap-2 text-[10px] flex-wrap justify-between w-full">
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className={`flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${typeConfig.bg} ${typeConfig.color} ${typeConfig.border}`}
            >
              <Icon size={8} /> {typeConfig.label}
            </div>
            {priority !== "normal" && priority !== "low" && (
              <div
                className={`flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border bg-black/40 ${priority === "critical" ? "text-rose-500 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]" : "text-orange-400 border-orange-500/50"}`}
              >
                <AlertTriangle size={8} /> {priority}
              </div>
            )}
            {totalSub > 0 && (
              <span className="text-[10px] font-mono text-slate-500 bg-black/20 px-1.5 rounded flex items-center gap-1 shrink-0">
                <CheckSquare size={10} />
                {completedSub}/{totalSub}
              </span>
            )}
            <span className="text-[9px] font-mono text-slate-500 bg-black/40 px-2 py-0.5 rounded-md flex items-center gap-1 whitespace-nowrap shrink-0 border border-white/5">
              <Clock size={9} /> {dateStr}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLocked(!isLocked);
              }}
              className={`p-1.5 rounded transition-colors ${!isLocked ? "text-cyan-400 bg-cyan-500/10" : "text-slate-500 hover:text-white hover:bg-white/5"}`}
              title={isLocked ? "Unlock to Edit" : "Lock Task"}
            >
              {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onArchive(item.id);
              }}
              className="text-slate-500 hover:text-purple-400 hover:bg-purple-500/10 p-1.5 rounded transition-colors"
              title="Archive"
            >
              <Archive size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 p-1.5 rounded transition-colors"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

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
            {/* Task Type & Priority Dropdowns - FIRST */}
            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={type}
                onChange={(e) =>
                  handleMetaChange("ticket_type", e.target.value)
                }
                className="appearance-none bg-black/40 text-[9px] font-bold uppercase tracking-wide text-slate-400 border border-white/10 rounded px-1.5 py-0.5 focus:outline-none focus:border-purple-500 hover:bg-white/5 transition-colors cursor-pointer text-center flex-1 md:flex-initial"
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
                className={`appearance-none bg-black/40 text-[9px] font-bold uppercase tracking-wide border border-white/10 rounded px-1.5 py-0.5 focus:outline-none focus:border-purple-500 hover:bg-white/5 transition-colors cursor-pointer text-center flex-1 md:flex-initial
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

            {/* Subtasks Toggle - LAST */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className={`flex items-center gap-1 text-[9px] md:text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all w-full md:w-fit rounded-md select-none shrink-0 border border-transparent px-2 py-1 ${expanded
                ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                : "text-slate-500 hover:text-white bg-white/5"
                }`}
            >
              {expanded ? (
                <ChevronDown size={12} />
              ) : (
                <ChevronRight size={12} />
              )}
              {totalSub > 0 ? (
                <>
                  {completedSub}/{totalSub} Subtasks
                </>
              ) : (
                "Add Subtasks"
              )}
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
                        onReorderSubtask &&
                          onReorderSubtask(item.id, sub.id, "up");
                      }}
                      className="text-slate-600 hover:text-white disabled:opacity-20"
                    >
                      <ArrowUp size={8} />
                    </button>
                    <button
                      disabled={idx === safeSubtasks.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onReorderSubtask &&
                          onReorderSubtask(item.id, sub.id, "down");
                      }}
                      className="text-slate-600 hover:text-white disabled:opacity-20"
                    >
                      <ArrowDown size={8} />
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      onToggleSubtask &&
                      onToggleSubtask(item.id, sub.id, sub.status)
                    }
                    className={`w-4 h-4 mt-0.5 rounded-md border flex items-center justify-center shrink-0 transition-all ${sub.status === "completed"
                      ? "bg-indigo-500 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                      : "border-slate-500 hover:border-indigo-400"
                      }`}
                  >
                    {sub.status === "completed" && (
                      <Check size={10} className="text-white font-black" />
                    )}
                  </button>

                  {/* EDITABLE SUBTASK INPUT */}
                  {!isLocked && onUpdateSubtaskTitle ? (
                    <input
                      type="text"
                      defaultValue={sub.title}
                      onBlur={(e) => {
                        if (e.target.value !== sub.title) {
                          onUpdateSubtaskTitle(item.id, sub.id, e.target.value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.currentTarget.blur();
                        }
                        e.stopPropagation();
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className={`flex-1 bg-transparent text-sm border-b border-transparent focus:border-purple-500/50 focus:outline-none transition-all ${sub.status === "completed"
                        ? "line-through text-slate-600"
                        : "text-slate-200 font-medium"
                        }`}
                    />
                  ) : (
                    <span
                      className={`text-sm break-words leading-relaxed pt-0.5 transition-all ${sub.status === "completed"
                        ? "line-through text-slate-600"
                        : "text-slate-200 font-medium"
                        }`}
                    >
                      {sub.title}
                    </span>
                  )}

                  <button
                    onClick={() =>
                      onDeleteSubtask && onDeleteSubtask(item.id, sub.id)
                    }
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
                  onPointerDown={stopProp}
                  onKeyDown={stopProp}
                  // Removed isLocked check for adding subtasks - always allowed if item is not archived
                  placeholder={isLocked ? "Unlock to add..." : "New step..."}
                  className="bg-transparent text-sm text-white font-medium w-full px-2 py-2.5 focus:outline-none placeholder:text-slate-600"
                />
                <button
                  type="submit"
                  disabled={isLocked}
                  className="text-slate-500 hover:text-purple-400 p-2 pr-3 transition-colors disabled:opacity-50"
                >
                  <Plus size={16} />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
