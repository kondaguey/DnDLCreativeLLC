"use client";

import { useState, useRef, useEffect, useMemo, memo } from "react";
import { createPortal } from "react-dom";
import {
  CheckSquare,
  Trash2,
  ChevronDown,
  ChevronRight,
  Plus,
  CornerDownRight,
  Calendar,
  AlertCircle,
  FileText,
  Save,
  Archive,
  RefreshCcw,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  Sparkles,
  Zap,
  Repeat,
  HelpCircle,
  Clock,
  ArrowRight,
  StickyNote,
  ChevronLeft,
  ChevronUp,
  LayoutGrid,
  List,
  StretchVertical,
  Flag,
  CalendarRange,
  CalendarClock,
  Layers,
  Lock,
  Unlock,
  Search,
  X,
  Send,
  Type,
  Code,
  Loader2,
  Star,
} from "lucide-react";
import { TaskItem, RecurrenceType, SortOption } from "../utils/types";
import TagManager from "../navigation/TagManager";
import CompactRow from "../task-cards/CompactRow";
import GridCard from "../task-cards/GridCard";
import { DateControl, PrioritySwitcher } from "../task-cards/shared";
import StickyStats from "../widgets/StickyStats";
import CountdownTimer from "../widgets/CountdownTimer";
import {
  formatDate,
  toInputDate,
  getDaysUntil,
  getTodayString,
  calculateStats,
  parseSafeDate,
} from "../utils/dateUtils";
import ItemStatsModal from "../modals/ItemStatsModal";

const PRIORITY_VALUES: Record<string, number> = {
  critical: 4,
  high: 3,
  normal: 2,
  low: 1,
  no_rush: 0,
};

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

interface TaskViewProps {
  items: TaskItem[];
  activeRecurrence: RecurrenceType;
  sortOption: SortOption;
  filterTags: string[];
  allSystemTags: string[];
  searchQuery?: string;
  activePeriod?: string; // Passed from parent
  onRecurrenceChange: (type: RecurrenceType) => void;
  onToggleStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
  onAddSubtask: (parentId: string, title: string) => void;
  onUpdateDate: (id: string, date: string | null) => void;
  onUpdateTags: (id: string, tags: string[]) => void;
  onUpdateContent: (id: string, content: string) => void;
  onUpdateRecurrence: (id: string, recurrence: RecurrenceType) => void;
  onUpdatePriority: (id: string, priority: string) => void;
  onUpdateMetadata: (id: string, metadata: any) => void;
  onUpdateTitle?: (id: string, title: string) => void;
  onManualMove?: (id: string, direction: "up" | "down") => void;
  onReorderSubtask?: (
    parentId: string,
    subtaskId: string,
    direction: "up" | "down",
  ) => void;
  onEdit?: (item: TaskItem) => void;
  onUpdateSubtaskTitle?: (
    parentId: string,
    subtaskId: string,
    newTitle: string,
  ) => void;
  onToggleSubtask: (
    parentId: string,
    subtaskId: string,
    currentStatus: string,
  ) => void;
  onDeleteSubtask: (parentId: string, subtaskId: string) => void;
  onUpdateSubtasks: (parentId: string, subtasks: any[]) => void;
  onOpenRecurring: (item: TaskItem) => void;
  onBulkDelete?: (ids: string[]) => void;
  onQuickAdd?: (title: string, content: string, priority: string, dueDate: string | null, tags: string[], isFavorite: boolean) => void;
  onDeleteTag?: (tag: string) => void;
  onVoidRequest?: (id: string, dateEntry: string, onConfirm: () => void) => void;
  isAdding?: boolean;
}

function TaskView({
  items,
  activeRecurrence,
  sortOption,
  filterTags,
  allSystemTags,
  searchQuery = "",
  activePeriod = "all",
  onRecurrenceChange,
  onToggleStatus,
  onDelete,
  onArchive,
  onRestore,
  onReorder,
  onAddSubtask,
  onUpdateDate,
  onUpdateTags,
  onUpdateContent,
  onUpdateRecurrence,
  onUpdatePriority,
  onUpdateMetadata,
  onUpdateTitle,
  onManualMove,
  onReorderSubtask,
  onEdit,
  onToggleSubtask,
  onDeleteSubtask,
  onUpdateSubtaskTitle,
  onUpdateSubtasks,
  onOpenRecurring,
  onBulkDelete,
  onQuickAdd,
  onDeleteTag,
  onVoidRequest,
  isAdding,
}: TaskViewProps) {
  const [showActive, setShowActive] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid" | "compact">("list");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Quick Add State
  const [newItemTitle, setNewItemTitle] = useState("");
  const [quickNote, setQuickNote] = useState("");
  const [noteFormat, setNoteFormat] = useState<"text" | "code">("text");
  const [newPriority, setNewPriority] = useState("normal");
  const [newDueDate, setNewDueDate] = useState<string | null>(getTodayString());
  const [newTags, setNewTags] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(true);

  const [completedSelection, setCompletedSelection] = useState<Set<string>>(
    new Set(),
  );

  const safeItems = items || [];
  const safeFilterTags = filterTags || [];

  const getEffectiveDate = (item: TaskItem): Date => {
    return item.due_date ? parseSafeDate(item.due_date) : parseSafeDate(item.created_at);
  };

  const filteredItems = safeItems
    .filter((item) => {
      if (activeRecurrence === "archived") return item.status === "archived";
      if (item.status === "archived") return false;
      const matchesTab = (item.recurrence || "one_off") === activeRecurrence;

      const itemTags = item.tags || [];
      const matchesTags =
        safeFilterTags.length === 0 ||
        safeFilterTags.every((t) => itemTags.includes(t));

      // Dynamic Date Filter Logic
      if (activePeriod !== "all") {
        const date = getEffectiveDate(item);
        const itemKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (itemKey !== activePeriod) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = (item.title || "").toLowerCase().includes(query);
        const notesMatch = (item.content || "").toLowerCase().includes(query);
        if (!titleMatch && !notesMatch) return false;
      }

      return matchesTab && matchesTags;
    })
    .sort((a, b) => {
      if (sortOption === "manual") return 0;
      if (sortOption === "alpha_asc") return a.title.localeCompare(b.title);
      if (sortOption === "alpha_desc") return b.title.localeCompare(a.title);

      if (sortOption === "date_asc") {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return parseSafeDate(a.due_date).getTime() - parseSafeDate(b.due_date).getTime();
      }
      if (sortOption === "date_desc") {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return parseSafeDate(b.due_date).getTime() - parseSafeDate(a.due_date).getTime();
      }
      if (sortOption === "created_desc") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      if (sortOption === "priority_desc") {
        const aP = PRIORITY_VALUES[a.metadata?.priority || "normal"] || 2;
        const bP = PRIORITY_VALUES[b.metadata?.priority || "normal"] || 2;
        if (aP !== bP) return bP - aP;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      if (sortOption === "priority_asc") {
        const aP = PRIORITY_VALUES[a.metadata?.priority || "normal"] || 2;
        const bP = PRIORITY_VALUES[b.metadata?.priority || "normal"] || 2;
        if (aP !== bP) return aP - bP;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      return 0;
    });

  const activeTasks = filteredItems.filter((i) => i.status !== "completed");
  const completedTasks = filteredItems.filter((i) => i.status === "completed");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(active.id, over.id);
    }
  };

  const toggleSelection = (id: string) => {
    const next = new Set(completedSelection);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCompletedSelection(next);
  };

  const toggleSelectAll = () => {
    if (completedSelection.size === completedTasks.length) {
      setCompletedSelection(new Set());
    } else {
      setCompletedSelection(new Set(completedTasks.map((i) => i.id)));
    }
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim() && !quickNote.trim()) return;

    let finalTitle = newItemTitle.trim();
    if (!finalTitle) {
      finalTitle = noteFormat === "code" ? "[CODE] Snippet" : "Quick Task";
    }

    if (onQuickAdd) {
      onQuickAdd(finalTitle, quickNote, newPriority, newDueDate, newTags, isFavorite);
    }

    setQuickNote("");
    setNewItemTitle("");
    setNewPriority("normal");
    setNewDueDate(getTodayString());
    setNewTags([]);
    setIsFavorite(false);
  };

  // STATS CALCULATION
  const stats = useMemo(() => {
    // If viewing a specific recurrence list (Daily, Weekly, etc)
    if (activeRecurrence && activeRecurrence !== "one_off" && activeRecurrence !== "archived") {
      const relevant = items.filter(i => i.recurrence === activeRecurrence && i.status !== "archived");
      const total = relevant.length;
      // Count items that are "done" for the current period
      const completed = relevant.filter(i => i.status === "completed").length;
      // Sum streaks
      const streak = relevant.reduce((acc, curr) => acc + (curr.metadata?.streak || 0), 0);

      return { total, completed, streak };
    }

    // Default (Grid/List of active tasks)
    const total = activeTasks.length + completedTasks.length;
    return { total, completed: completedTasks.length, streak: 0 };
  }, [items, activeTasks, completedTasks, activeRecurrence]);

  // Stats Modal State
  const [statsItemId, setStatsItemId] = useState<string | null>(null);
  const activeStatsItem = useMemo(() =>
    items.find(i => i.id === statsItemId) || null
    , [items, statsItemId]);

  return (
    <div className="w-full max-w-5xl mx-auto pb-24 md:pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ... tabs ... */}

      {/* RENDER MODAL */}
      <ItemStatsModal
        isOpen={!!statsItemId}
        item={activeStatsItem}
        onClose={() => setStatsItemId(null)}
        onUpdateMetadata={onUpdateMetadata}
        onVoidRequest={onVoidRequest}
      />
      {/* 1. TIMEFRAME TABS */}
      {/* 1. TIMEFRAME TABS */}
      <div className="shrink-0 flex overflow-x-auto gap-2 mb-6 no-scrollbar pb-2 mask-linear-fade snap-x snap-mandatory px-1">
        {["daily", "weekly", "monthly", "quarterly", "one_off"].map((tab) => (
          <TimeframeTab
            key={tab}
            label={tab === "one_off" ? "One-Offs" : tab}
            id={tab}
            active={activeRecurrence}
            onClick={() => onRecurrenceChange(tab as RecurrenceType)}
          />
        ))}

        <div className="w-px h-8 bg-white/10 mx-1 self-center hidden md:block" />

        <TimeframeTab
          label="Archives"
          id="archived"
          active={activeRecurrence}
          onClick={() => onRecurrenceChange("archived")}
          icon={<Archive size={14} />}
        />

        <div className="flex-1" />

        <button
          onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border shadow-lg ${isQuickAddOpen ? "bg-purple-600/20 text-purple-400 border-purple-500/30" : "bg-slate-800 text-slate-400 border-white/5 hover:text-white"}`}
        >
          {isQuickAddOpen ? <ChevronUp size={14} /> : <Plus size={14} />}
          {isQuickAddOpen ? "Hide Form" : "Quick Add"}
        </button>
      </div>

      {/* 2. QUICK ADD (New Location: Below tabs, above list) */}
      {onQuickAdd && activeRecurrence !== "archived" && isQuickAddOpen && (
        <form
          onSubmit={handleQuickAddSubmit}
          className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 flex flex-col gap-4 shadow-2xl shadow-black/50 w-full mb-8 transition-all focus-within:border-purple-500/30 focus-within:shadow-purple-900/10 animate-in slide-in-from-top-4 duration-300"
        >
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <div className="bg-purple-500/10 p-1.5 rounded-lg border border-purple-500/20">
              <Zap size={14} className="text-purple-500" fill="currentColor" />
            </div>
            <input
              type="text"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder={`New ${activeRecurrence === "one_off" ? "Task" : activeRecurrence} title...`}
              className="bg-transparent w-full text-sm md:text-base font-black text-white placeholder:text-slate-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-lg transition-all ${isFavorite ? "text-pink-500 bg-pink-500/10 border border-pink-500/20" : "text-slate-600 border border-transparent hover:text-slate-100"}`}
            >
              <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <textarea
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              placeholder={
                noteFormat === "code"
                  ? "// Paste code snippet..."
                  : "Add notes or details... (Expandable)"
              }
              className={`w-full bg-black/20 rounded-xl p-4 text-sm focus:outline-none resize-y min-h-[80px] placeholder:text-slate-600 border border-white/5 focus:border-white/10 ${noteFormat === "code" ? "font-mono text-emerald-300" : "text-slate-300"}`}
            />

            <div className="flex flex-wrap items-center gap-4 py-2 px-1">
              <div className="flex flex-col gap-1.5 min-w-[120px]">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Priority</label>
                <PrioritySwitcher current={newPriority} onChange={setNewPriority} />
              </div>

              <div className="flex flex-col gap-1.5 min-w-[140px]">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Due Date</label>
                <DateControl dueDate={newDueDate} onChange={setNewDueDate} statusColor="purple" />
              </div>

              <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Tags</label>
                <div className="bg-black/20 rounded-xl p-2 border border-white/5">
                  <TagManager
                    selectedTags={newTags}
                    allSystemTags={allSystemTags}
                    onUpdateTags={setNewTags}
                    onDeleteTag={onDeleteTag}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() =>
                setNoteFormat(noteFormat === "text" ? "code" : "text")
              }
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${noteFormat === "code" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-slate-400 border-white/5 hover:text-white"}`}
            >
              {noteFormat === "text" ? <Type size={12} /> : <Code size={12} />}
              {noteFormat === "text" ? "Text Mode" : "Code Mode"}
            </button>

            <button
              type="submit"
              disabled={isAdding || (!quickNote.trim() && !newItemTitle.trim())}
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-4 py-2 md:px-6 md:py-2 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg disabled:shadow-none hover:shadow-purple-500/20"
            >
              {isAdding ? <Loader2 className="animate-spin" size={12} /> : "Add Task"}
              {!isAdding && <Plus size={12} />}
            </button>
          </div>
        </form>
      )
      }

      <div className="px-1 pt-2">
        {filteredItems.length === 0 && (
          <EmptyState context={activeRecurrence} />
        )}

        {/* --- PERSISTENT VIEW TOGGLE (Centered on Mobile) --- */}
        {filteredItems.length > 0 && (
          <div className="flex justify-center md:justify-end mb-4">
            {/* VIEW TOGGLE */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("compact")}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "compact"
                  ? "bg-slate-700 text-white shadow-inner"
                  : "text-slate-500 hover:text-white"
                  }`}
                title="Compact View"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "list"
                  ? "bg-slate-700 text-white shadow-inner"
                  : "text-slate-500 hover:text-white"
                  }`}
                title="List View"
              >
                <StretchVertical size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "grid"
                  ? "bg-slate-700 text-white shadow-inner"
                  : "text-slate-500 hover:text-white"
                  }`}
                title="Card View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        )}

        {/* --- ACTIVE TASKS COMMAND BAR --- */}
        {activeTasks.length > 0 && (
          <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-between gap-3 mb-4 border-b border-white/5 pb-3">
            <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
              <button
                type="button"
                onClick={() => setShowActive(!showActive)}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-black uppercase tracking-widest text-xs rounded-lg transition-all border border-purple-500/20 w-fit"
              >
                {showActive ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
                Active Queue ({activeTasks.length})
              </button>
            </div>
          </div>
        )}

        {/* --- ACTIVE TASKS SECTION --- */}
        {showActive && activeTasks.length > 0 && mounted && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={activeTasks.map((i) => i.id)}
              strategy={
                viewMode === "grid"
                  ? rectSortingStrategy
                  : verticalListSortingStrategy
              }
            >
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch"
                    : viewMode === "compact"
                      ? "space-y-1"
                      : "space-y-6" // List view
                }
              >
                {activeTasks.map((item) => (
                  <SortableItem key={item.id} id={item.id} disabled={sortOption !== "manual"}>
                    {viewMode === "compact" ? (
                      <CompactRow
                        item={item}
                        isManualSort={sortOption === "manual"}
                        allSystemTags={allSystemTags}
                        onToggleStatus={onToggleStatus}
                        onDelete={onDelete}
                        onArchive={onArchive}
                        onRestore={onRestore}
                        onAddSubtask={onAddSubtask}
                        onUpdateDate={onUpdateDate}
                        onUpdateTags={onUpdateTags}
                        onUpdateContent={onUpdateContent}
                        onUpdateRecurrence={onUpdateRecurrence}
                        onUpdatePriority={onUpdatePriority}
                        onUpdateMetadata={onUpdateMetadata}
                        onUpdateTitle={onUpdateTitle}
                        onReorderSubtask={onReorderSubtask}
                        onEdit={onEdit}
                        onToggleSubtask={onToggleSubtask}
                        onDeleteSubtask={onDeleteSubtask}
                        onUpdateSubtaskTitle={onUpdateSubtaskTitle}
                        onUpdateSubtasks={onUpdateSubtasks}
                        onOpenRecurring={onOpenRecurring}
                        onOpenStats={() => setStatsItemId(item.id)}
                      />
                    ) : (
                      <GridCard
                        item={item}
                        viewMode={viewMode} // Pass this so List view knows to span full width
                        isManualSort={sortOption === "manual"}
                        allSystemTags={allSystemTags}
                        onToggleStatus={onToggleStatus}
                        onDelete={onDelete}
                        onArchive={onArchive}
                        onRestore={onRestore}
                        onAddSubtask={onAddSubtask}
                        onUpdateDate={onUpdateDate}
                        onUpdateTags={onUpdateTags}
                        onUpdateContent={onUpdateContent}
                        onUpdateRecurrence={onUpdateRecurrence}
                        onUpdatePriority={onUpdatePriority}
                        onUpdateMetadata={onUpdateMetadata}
                        onUpdateTitle={onUpdateTitle}
                        onReorderSubtask={onReorderSubtask}
                        onEdit={onEdit}
                        onToggleSubtask={onToggleSubtask}
                        onDeleteSubtask={onDeleteSubtask}
                        onUpdateSubtaskTitle={onUpdateSubtaskTitle}
                        onUpdateSubtasks={onUpdateSubtasks}
                        onOpenRecurring={onOpenRecurring}
                        onOpenStats={() => setStatsItemId(item.id)}
                      />
                    )}
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {completedTasks.length > 0 && activeRecurrence !== "archived" && (
          <div className="mt-8 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-black uppercase tracking-widest text-xs rounded-full transition-all border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              >
                <Check size={14} />
                {showCompleted
                  ? "Hide Completed"
                  : `Show Completed (${completedTasks.length})`}
                {showCompleted ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </button>

              {showCompleted && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                  <button
                    onClick={toggleSelectAll}
                    className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-white transition-colors"
                  >
                    {completedSelection.size === completedTasks.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                  {completedSelection.size > 0 && onBulkDelete && (
                    <button
                      onClick={() =>
                        onBulkDelete(Array.from(completedSelection))
                      }
                      className="flex items-center gap-1 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                    >
                      <Trash2 size={12} />
                      Delete ({completedSelection.size})
                    </button>
                  )}
                </div>
              )}
            </div>

            {showCompleted && (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-stretch animate-in fade-in slide-in-from-top-4 duration-300"
                    : "space-y-6 md:space-y-5 mt-6 animate-in fade-in slide-in-from-top-4 duration-300"
                }
              >
                {completedTasks.map((item) => (
                  <div
                    key={item.id}
                    className="group/item flex items-start gap-3 transition-opacity"
                  >
                    {/* SELECTION CHECKBOX */}
                    <button
                      onClick={() => toggleSelection(item.id)}
                      className={`mt-4 shrink-0 w-5 h-5 rounded border transition-all flex items-center justify-center ${completedSelection.has(item.id)
                        ? "bg-purple-500 border-purple-500 text-white"
                        : "border-white/10 text-transparent hover:border-white/30"
                        }`}
                    >
                      <Check size={12} />
                    </button>

                    <div className="flex-1 min-w-0">
                      {viewMode === "compact" ? (
                        <CompactRow
                          item={item}
                          isManualSort={false}
                          allSystemTags={allSystemTags}
                          onToggleStatus={onToggleStatus}
                          onDelete={onDelete}
                          onArchive={onArchive}
                          onRestore={onRestore}
                          onAddSubtask={onAddSubtask}
                          onUpdateDate={onUpdateDate}
                          onUpdateTags={onUpdateTags}
                          onUpdateContent={onUpdateContent}
                          onUpdateRecurrence={onUpdateRecurrence}
                          onUpdatePriority={onUpdatePriority}
                          onUpdateMetadata={onUpdateMetadata}
                          onUpdateTitle={onUpdateTitle}
                          onReorderSubtask={onReorderSubtask}
                          onEdit={onEdit}
                          onToggleSubtask={onToggleSubtask}
                          onDeleteSubtask={onDeleteSubtask}
                          onUpdateSubtaskTitle={onUpdateSubtaskTitle}
                          onOpenRecurring={onOpenRecurring}
                        />
                      ) : (
                        <GridCard
                          item={item}
                          viewMode={viewMode}
                          isManualSort={false}
                          allSystemTags={allSystemTags}
                          onToggleStatus={onToggleStatus}
                          onDelete={onDelete}
                          onArchive={onArchive}
                          onRestore={onRestore}
                          onAddSubtask={onAddSubtask}
                          onUpdateDate={onUpdateDate}
                          onUpdateTags={onUpdateTags}
                          onUpdateContent={onUpdateContent}
                          onUpdateRecurrence={onUpdateRecurrence}
                          onUpdatePriority={onUpdatePriority}
                          onUpdateMetadata={onUpdateMetadata}
                          onUpdateTitle={onUpdateTitle}
                          onReorderSubtask={onReorderSubtask}
                          onEdit={onEdit}
                          onToggleSubtask={onToggleSubtask}
                          onDeleteSubtask={onDeleteSubtask}
                          onUpdateSubtaskTitle={onUpdateSubtaskTitle}
                          onOpenRecurring={onOpenRecurring}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky Stats Footer */}
      <StickyStats
        total={stats.total}
        completed={stats.completed}
        streak={stats.streak}
        label={activeRecurrence && activeRecurrence !== "one_off" ? "Goals" : "Tasks"}
      />
    </div>
  );
}

export default memo(TaskView);

function RecurringSummary({
  item,
  onToggleToday,
}: {
  item: TaskItem;
  onToggleToday: (id: string, dateStr: string) => void;
}) {
  const { recurrence, metadata } = item;
  const completedDates = (metadata?.completed_dates as string[]) || [];

  const today = new Date();
  // Monthly/Quarterly tasks track completion via the 1st of the month
  const isMonthOrQuarter = ["monthly", "quarterly"].includes(recurrence || "");
  const todayStr = isMonthOrQuarter
    ? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`
    : today.toISOString().split("T")[0];

  const isTodayDone = completedDates.includes(todayStr);
  const count = completedDates.length;

  // --- SMART DATE READOUT ---
  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  let dueText = "";
  if (recurrence === "weekly") {
    dueText = metadata?.preferred_weekday
      ? `Due: ${metadata.preferred_weekday}`
      : "Due: This Week";
  } else if (recurrence === "monthly") {
    dueText = metadata?.preferred_day_num
      ? `Due: ${getOrdinal(metadata.preferred_day_num)}`
      : "Due: This Month";
  } else if (recurrence === "quarterly") {
    // Specifying the specific Quarterly months if they set a day
    dueText = metadata?.preferred_day_num
      ? `Due: ${getOrdinal(metadata.preferred_day_num)} (Jan/Apr/Jul/Oct)`
      : "Due: This Quarter";
  }

  const handleStreakClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleToday(item.id, todayStr);
  };

  // Determine if TODAY is the target day to make the text Yellow
  let isTargetToday = false;
  if (
    recurrence === "weekly" &&
    metadata?.preferred_weekday ===
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][today.getDay()]
  )
    isTargetToday = true;
  if (
    recurrence === "monthly" &&
    metadata?.preferred_day_num === today.getDate()
  )
    isTargetToday = true;
  if (
    recurrence === "quarterly" &&
    metadata?.preferred_day_num === today.getDate() &&
    [0, 3, 6, 9].includes(today.getMonth())
  )
    isTargetToday = true;

  return (
    <div className="flex items-center justify-between px-1">
      {/* LEFT: Due Info */}
      <div className="flex items-center gap-2">
        {dueText && (
          <span
            className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${isTargetToday ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-white/5 border-white/10 text-slate-400"}`}
          >
            {dueText}
          </span>
        )}
      </div>

      {/* RIGHT: CLICKABLE STREAK TOGGLE */}
      <button
        onClick={handleStreakClick}
        title={isTodayDone ? "Undo Completion" : "Check In for Today"}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 ${isTodayDone
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
          : isTargetToday
            ? "bg-amber-500 text-black border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse"
            : "bg-white/5 text-slate-200 border border-white/10 hover:bg-emerald-500 hover:text-black hover:border-emerald-500"
          }`}
      >
        {isTodayDone ? (
          <>
            <Check size={12} strokeWidth={4} /> UNDO
          </>
        ) : (
          <>
            <Zap size={12} className={count > 0 ? "fill-current" : ""} /> CHECK
            IN
          </>
        )}
      </button>
    </div>
  );
}

function TimeframeTab({ label, id, active, onClick, icon }: any) {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 snap-center shrink-0 px-5 py-3 md:px-4 md:py-2 rounded-2xl md:rounded-full text-xs md:text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap active:scale-95 ${isActive
        ? "bg-purple-500 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] shadow-inner"
        : "bg-white/5 text-slate-400 border-transparent hover:border-white/10 hover:text-white"
        }`}
    >
      {icon} {label}
    </button>
  );
}



function EmptyState({ context }: { context: string }) {
  return (
    <div className="text-center py-20 opacity-30 animate-in fade-in zoom-in-95">
      <Sparkles size={48} className="mx-auto mb-4 text-purple-500" />     {" "}
      <p className="text-sm font-bold uppercase tracking-widest text-white">
        Your {context} slate is clean.      {" "}
      </p>{" "}
    </div>
  );
}
// --- PRIORITY BADGE COMPONENT ---
function PriorityBadge({
  priority,
  compact,
}: {
  priority: string;
  compact?: boolean;
}) {
  const config =
    {
      critical: {
        label: "CRITICAL",
        color: "text-rose-500 border-rose-500/50 bg-rose-500/10",
        icon: AlertCircle,
      },
      high: {
        label: "HIGH",
        color: "text-orange-400 border-orange-500/50 bg-orange-500/10",
        icon: ArrowUp,
      },
      low: {
        label: "LOW",
        color: "text-slate-400 border-slate-700 bg-slate-800/50",
        icon: ArrowDown,
      },
      normal: {
        label: "NORMAL",
        color: "text-slate-300 border-white/10",
        icon: null,
      },
      no_rush: {
        label: "NO RUSH",
        color: "text-slate-500 border-white/5 bg-white/5",
        icon: null,
      },
    }[priority] ||
    ({
      label: "NORMAL",
      color: "text-slate-300 border-white/10",
      icon: null,
    } as any);

  const Icon = config.icon;

  if (compact) {
    return (
      <div
        className={`w-2 h-2 rounded-full ${priority === "critical"
          ? "bg-rose-500"
          : priority === "high"
            ? "bg-orange-500"
            : priority === "low"
              ? "bg-slate-600"
              : "bg-slate-600 opacity-0"
          }`}
        title={config.label}
      />
    );
  }

  return (
    <span
      className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${config.color}`}
    >
      {Icon && <Icon size={10} />} {config.label}     {" "}
    </span>
  );
}
