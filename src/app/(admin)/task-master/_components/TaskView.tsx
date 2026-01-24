"use client";

import { useState, useRef, useEffect } from "react";
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
  Repeat,
  HelpCircle,
  Clock,
  ArrowRight,
  StickyNote,
  ChevronLeft,
  ChevronUp,
  LayoutGrid,
  List,
} from "lucide-react";
import { TaskItem, RecurrenceType, SortOption } from "./types";
import TagManager from "./TagManager";
import { formatDate, toInputDate, getDaysUntil } from "./dateUtils";

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
import { SortableItem, DragHandle } from "./SortableItem";

interface TaskViewProps {
  items: TaskItem[];
  activeRecurrence: RecurrenceType;
  sortOption: SortOption;
  filterTags: string[];
  allSystemTags: string[];
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
  onManualMove?: (id: string, direction: "up" | "down") => void;
  onReorderSubtask?: (
    parentId: string,
    subtaskId: string,
    direction: "up" | "down",
  ) => void;
  onEdit?: (item: TaskItem) => void;

  onToggleSubtask: (
    parentId: string,
    subtaskId: string,
    currentStatus: string,
  ) => void;
  onDeleteSubtask: (parentId: string, subtaskId: string) => void;
}

export default function TaskView({
  items,
  activeRecurrence,
  sortOption,
  filterTags,
  allSystemTags,
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
  onManualMove,
  onReorderSubtask,
  onEdit,
  onToggleSubtask,
  onDeleteSubtask,
}: TaskViewProps) {
  const [showActive, setShowActive] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const safeItems = items || [];
  const safeFilterTags = filterTags || [];

  const filteredItems = safeItems
    .filter((item) => {
      if (activeRecurrence === "archived") return item.status === "archived";
      if (item.status === "archived") return false;
      const matchesTab = (item.recurrence || "one_off") === activeRecurrence;

      const itemTags = item.tags || [];
      const matchesTags =
        safeFilterTags.length === 0 ||
        safeFilterTags.every((t) => itemTags.includes(t));
      return matchesTab && matchesTags;
    })
    .sort((a, b) => {
      if (sortOption === "manual") return 0;
      if (sortOption === "alpha_asc") return a.title.localeCompare(b.title);
      if (sortOption === "alpha_desc") return b.title.localeCompare(a.title);

      if (sortOption === "date_asc") {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (sortOption === "date_desc") {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
      }
      if (sortOption === "created_desc") {
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

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="shrink-0 flex overflow-x-auto gap-2 mb-6 no-scrollbar pb-2 mask-linear-fade snap-x snap-mandatory px-1">
        {["daily", "weekly", "monthly", "quarterly", "one_off"].map((tab) => (
          <TimeframeTab
            key={tab}
            label={tab === "one_off" ? "One-Offs" : tab}
            id={tab}
            active={activeRecurrence}
            onClick={onRecurrenceChange}
          />
        ))}
        <div className="w-px h-8 bg-white/10 mx-1 self-center hidden md:block" />
        <TimeframeTab
          label="Archives"
          id="archived"
          active={activeRecurrence}
          onClick={onRecurrenceChange}
          icon={<Archive size={14} />}
        />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-1 pt-2 pb-32">
        {filteredItems.length === 0 && (
          <EmptyState context={activeRecurrence} />
        )}

        {/* --- ACTIVE TASKS COMMAND BAR --- */}
        {activeTasks.length > 0 && (
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
            <button
              onClick={() => setShowActive(!showActive)}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-black uppercase tracking-widest text-xs rounded-lg transition-all border border-purple-500/20"
            >
              {showActive ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
              Active Queue ({activeTasks.length})
            </button>

            {/* VIEW TOGGLE */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "list"
                  ? "bg-slate-700 text-white shadow-inner"
                  : "text-slate-500 hover:text-white"
                  }`}
                title="List View"
              >
                <List size={16} />
              </button>
              <button
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

        {/* --- ACTIVE TASKS SECTION --- */}
        {showActive && activeTasks.length > 0 && (
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
                /* ADDED items-stretch to grid so cards are equal height */
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch"
                    : "space-y-4 md:space-y-5"
                }
              >
                {activeTasks.map((item) => (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    disabled={sortOption !== "manual"}
                  >
                    <TaskCard
                      item={item}
                      isManualSort={sortOption === "manual"}
                      viewMode={viewMode} /* Pass viewMode to adapt styles */
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
                      onManualMove={onManualMove}
                      onReorderSubtask={onReorderSubtask}
                      onEdit={onEdit}
                      onToggleSubtask={onToggleSubtask}
                      onDeleteSubtask={onDeleteSubtask}
                    />
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* --- COMPLETED TASKS COLLAPSIBLE VAULT --- */}
        {completedTasks.length > 0 && activeRecurrence !== "archived" && (
          <div className="mt-8 pt-4 border-t border-white/5">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-black uppercase tracking-widest text-xs rounded-full transition-all mx-auto border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
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
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6 items-stretch animate-in fade-in slide-in-from-top-4 duration-300"
                    : "space-y-4 md:space-y-5 mt-6 animate-in fade-in slide-in-from-top-4 duration-300"
                }
              >
                {completedTasks.map((item) => (
                  <TaskCard
                    key={item.id}
                    item={item}
                    isManualSort={false}
                    viewMode={viewMode}
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
                    onReorderSubtask={onReorderSubtask}
                    onEdit={onEdit}
                    onToggleSubtask={onToggleSubtask}
                    onDeleteSubtask={onDeleteSubtask}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- TASK CARD ---
function TaskCard({
  item,
  isManualSort,
  viewMode, // Destructure viewMode
  allSystemTags,
  onToggleStatus,
  onDelete,
  onArchive,
  onRestore,
  onAddSubtask,
  onUpdateDate,
  onUpdateTags,
  onUpdateContent,
  onUpdateRecurrence,
  onManualMove,
  onReorderSubtask,
  onEdit,
  onToggleSubtask,
  onDeleteSubtask,
}: any) {
  const [expanded, setExpanded] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [notes, setNotes] = useState(item.content || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const safeSubtasks = item.subtasks || [];
  const totalSub = safeSubtasks.length;
  const completedSub = safeSubtasks.filter(
    (s: any) => s.status === "completed",
  ).length;

  const progress =
    totalSub === 0
      ? item.status === "completed"
        ? 100
        : 0
      : Math.round((completedSub / totalSub) * 100);

  const daysUntil = getDaysUntil(item.due_date);

  let statusColor = "slate";
  let statusBorder = "border-white/5";
  let statusGlow = "shadow-lg";

  if (item.status === "completed") {
    statusColor = "emerald";
    statusBorder = "border-emerald-500/20";
    statusGlow = "opacity-80";
  } else if (item.status === "archived") {
    statusColor = "slate";
    statusGlow = "opacity-60 grayscale";
  } else if (item.due_date) {
    if (daysUntil <= 0) {
      statusColor = "rose";
      statusBorder = "border-rose-500/50";
      statusGlow = "shadow-[0_0_15px_rgba(244,63,94,0.15)]";
    } else if (daysUntil <= 3) {
      statusColor = "orange";
      statusBorder = "border-orange-500/30";
      statusGlow = "shadow-[0_0_15px_rgba(249,115,22,0.1)]";
    } else if (daysUntil <= 7) {
      statusColor = "yellow";
      statusBorder = "border-yellow-400/20";
    }
  }

  const progressGradient =
    {
      rose: "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]",
      orange: "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.6)]",
      yellow: "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)]",
      emerald: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]",
      slate:
        "bg-gradient-to-r from-purple-500 to-cyan-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]",
    }[statusColor] || "bg-slate-500";

  const handleSubmitSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtaskTitle.trim()) return;
    onAddSubtask(item.id, subtaskTitle);
    setSubtaskTitle("");
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    await onUpdateContent(item.id, notes);
    setTimeout(() => setIsSavingNotes(false), 800);
  };

  return (
    <div
      // Kept 'h-full' to stretch grid items.
      className={`bg-slate-900/60 backdrop-blur-2xl border rounded-3xl overflow-hidden relative group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl ${statusBorder} ${statusGlow} flex flex-col h-full`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex items-start gap-4 p-5 md:p-6 w-full relative z-10 flex-1">
        {isManualSort && item.status !== "archived" && (
          <div className="flex flex-col items-center gap-1 mt-1.5 shrink-0">
            <DragHandle className="text-slate-600 hover:text-white transition-colors">
              <GripVertical size={16} />
            </DragHandle>
            {onManualMove && (
              <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                <button
                  onClick={() => onManualMove(item.id, "up")}
                  className="text-slate-600 hover:text-white p-1 bg-white/5 rounded-md"
                  title="Move Up"
                >
                  <ArrowUp size={12} />
                </button>
                <button
                  onClick={() => onManualMove(item.id, "down")}
                  className="text-slate-600 hover:text-white p-1 bg-white/5 rounded-md mt-0.5"
                  title="Move Down"
                >
                  <ArrowDown size={12} />
                </button>
              </div>
            )}
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus(item.id, item.status);
          }}
          className={`w-6 h-6 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all shadow-inner ${item.status === "completed"
            ? "bg-emerald-500 border-emerald-500 text-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            : "border-slate-500 hover:border-emerald-500 text-transparent"
            }`}
          disabled={item.status === "archived"}
        >
          {item.status === "completed" && (
            <Check size={14} className="text-black font-black" />
          )}
        </button>

        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
          {/* Changed standard breakpoint from xl to adapt directly to the viewMode */}
          <div
            className={`flex flex-col gap-3 w-full ${viewMode === "list" ? "xl:flex-row xl:justify-between xl:items-start" : ""}`}
          >
            <div className="flex flex-col gap-2 w-full min-w-0">
              <div className="flex items-start gap-2.5">
                {statusColor === "rose" && item.status !== "completed" && (
                  <AlertCircle
                    size={18}
                    className={`text-rose-400 ${daysUntil === 0 ? "animate-pulse" : ""} shrink-0 mt-0.5`}
                  />
                )}
                {/* REMOVED truncate. ADDED break-words leading-tight */}
                <h4
                  className={`font-black text-xl md:text-lg leading-tight break-words transition-all cursor-pointer select-none ${item.status === "completed" || item.status === "archived"
                    ? "line-through text-slate-600"
                    : "text-slate-100"
                    }`}
                  onClick={() => setExpanded(!expanded)}
                >
                  {item.title}
                </h4>
              </div>

              <div className="mt-1 flex-1 overflow-x-auto no-scrollbar mask-linear-fade pr-4">
                <TagManager
                  selectedTags={item.tags || []}
                  allSystemTags={allSystemTags}
                  onUpdateTags={(tags) => onUpdateTags(item.id, tags)}
                />
              </div>
            </div>

            {/* ACTION CONTROLS - Added flex-wrap so they don't get cut off on grid view */}
            <div
              className={`flex items-center gap-1.5 self-start shrink-0 flex-wrap ${viewMode === "list" ? "mt-2 xl:mt-0" : "mt-2"}`}
            >
              {item.status === "archived" ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore(item.id);
                  }}
                  className="flex items-center gap-1 text-xs md:text-[10px] uppercase font-black px-3 py-2 md:px-2 md:py-1 rounded-xl border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all shadow-inner"
                >
                  <RefreshCcw size={14} /> Restore
                </button>
              ) : (
                <>
                  <DateControl
                    dueDate={item.due_date}
                    onChange={(date) => onUpdateDate(item.id, date)}
                    statusColor={statusColor}
                  />

                  <RecurrenceSwitcher
                    current={item.recurrence || "one_off"}
                    onChange={(newRec) => onUpdateRecurrence(item.id, newRec)}
                  />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive(item.id);
                    }}
                    className="text-slate-600 hover:text-purple-400 transition-colors p-2.5 md:p-2 bg-white/5 md:bg-transparent rounded-xl md:rounded-lg border md:border-transparent border-white/5"
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
                      className="text-slate-600 hover:text-cyan-400 transition-colors p-2.5 md:p-2 bg-white/5 md:bg-transparent rounded-xl md:rounded-lg border md:border-transparent border-white/5"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="text-slate-600 hover:text-rose-400 transition-colors p-2.5 md:p-2 bg-white/5 md:bg-transparent rounded-xl md:rounded-lg border md:border-transparent border-white/5"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="mt-auto">
            <div className="w-full h-1.5 md:h-1 bg-black/40 rounded-full mt-4 md:mt-3 overflow-hidden shadow-inner border border-white/5">
              <div
                className={`h-full transition-all duration-700 ${progressGradient}`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <div
              onClick={() => setExpanded(!expanded)}
              className={`flex items-center gap-2 mt-3 md:mt-2 text-xs font-bold uppercase tracking-widest cursor-pointer transition-all w-fit p-1 -ml-1 rounded-md select-none ${expanded ? "text-purple-400" : "text-slate-500 hover:text-white"
                }`}
            >
              {expanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}

              {totalSub > 0 ? (
                <>
                  {completedSub}/{totalSub} Steps
                  <span className="text-[10px] opacity-50 ml-1">
                    ({progress}%)
                  </span>
                </>
              ) : item.content?.trim() ? (
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <StickyNote size={12} className="text-cyan-500" /> Notes
                  Inside
                </span>
              ) : (
                "Expand Task"
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
      >
        <div className="overflow-hidden">
          <div className="bg-black/30 border-t border-white/5 p-5 md:p-6 md:pl-16 shadow-inner">
            <div className="space-y-3 mb-8">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                <CheckSquare size={12} className="text-purple-500" /> Checklist
              </h5>
              {safeSubtasks.map((sub: any, index: number) => (
                <div
                  key={sub.id}
                  className="flex items-start gap-3 group/sub relative bg-white/5 md:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none border md:border-transparent border-white/5 hover:bg-white/5 transition-colors"
                >
                  <button
                    onClick={() => onToggleSubtask(item.id, sub.id, sub.status)}
                    className={`w-5 h-5 md:w-4 md:h-4 mt-0.5 rounded-md border-2 md:border flex items-center justify-center shrink-0 transition-all ${sub.status === "completed"
                      ? "bg-indigo-500 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                      : "border-slate-500 hover:border-indigo-400"
                      }`}
                  >
                    {sub.status === "completed" && (
                      <Check size={12} className="text-white font-black" />
                    )}
                  </button>
                  <span
                    className={`text-base md:text-sm break-words leading-relaxed pt-0.5 transition-all ${sub.status === "completed"
                      ? "line-through text-slate-600"
                      : "text-slate-100 font-medium"
                      }`}
                  >
                    {sub.title}
                  </span>
                  <button
                    onClick={() => onDeleteSubtask(item.id, sub.id)}
                    className="md:opacity-0 group-hover/sub:opacity-100 text-slate-600 hover:text-rose-400 ml-auto p-2 md:p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {item.status !== "archived" && (
                <form
                  onSubmit={handleSubmitSub}
                  className="flex items-center gap-2 relative mt-4 md:mt-2 bg-white/5 md:bg-transparent border border-white/10 md:border-transparent focus-within:bg-purple-500/5 focus-within:border-purple-500/50 rounded-xl transition-all"
                >
                  <CornerDownRight
                    size={16}
                    className="text-slate-600 shrink-0 hidden md:block"
                  />
                  <input
                    type="text"
                    value={subtaskTitle}
                    onChange={(e) => setSubtaskTitle(e.target.value)}
                    placeholder="Add a new step..."
                    className="bg-transparent text-base md:text-sm text-white font-medium w-full px-4 py-3 md:py-2 focus:outline-none placeholder:text-slate-600"
                  />
                  <button
                    type="submit"
                    className="text-slate-500 hover:text-purple-400 p-3 md:p-2 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </form>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <FileText size={12} className="text-cyan-500" /> Notes
                </h5>
                {(notes !== (item.content || "") || isSavingNotes) &&
                  item.status !== "archived" && (
                    <button
                      onClick={handleSaveNotes}
                      className={`flex items-center gap-1.5 text-xs md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 md:px-0 md:py-0 rounded-lg md:rounded-none bg-white/5 md:bg-transparent transition-colors ${isSavingNotes
                        ? "text-emerald-500"
                        : "text-cyan-400 hover:text-white"
                        }`}
                    >
                      <Save size={14} />{" "}
                      {isSavingNotes ? "Saved" : "Save Notes"}
                    </button>
                  )}
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Drop insights, links, or terminal commands here..."
                disabled={item.status === "archived"}
                className="w-full bg-black/40 border border-white/5 rounded-2xl md:rounded-xl p-4 text-base md:text-sm text-slate-100 font-medium placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-950/20 transition-all min-h-[120px] resize-y shadow-inner leading-relaxed whitespace-pre-wrap break-words"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// SMART DATE MENU WITH "TBA" & SMART VIEWPORT POSITIONING
// ==============================================================================
function DateControl({
  dueDate,
  onChange,
  statusColor,
}: {
  dueDate: string | null;
  onChange: (val: string | null) => void;
  statusColor: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const [viewDate, setViewDate] = useState(
    dueDate ? new Date(dueDate) : new Date(),
  );

  const daysUntil = getDaysUntil(dueDate);
  const humanTime = formatDate(dueDate);

  let displayTime = humanTime || "TBA";
  let statusText = "text-slate-400";
  let statusBorder = "border-white/10";
  let statusBg = "bg-transparent";

  if (!dueDate) {
    statusText = "text-slate-500";
    statusBorder = "border-white/10 border-dashed";
  } else if (statusColor === "rose") {
    statusText = "text-rose-400";
    statusBorder = "border-rose-500/30";
    statusBg = "bg-rose-500/10";
    displayTime = daysUntil < 0 ? "OVERDUE" : "Due Today";
  } else if (statusColor === "orange") {
    statusText = "text-orange-400";
    statusBorder = "border-orange-500/30";
    statusBg = "bg-orange-500/10";
    displayTime = `${daysUntil} days left`;
  } else if (statusColor === "yellow") {
    statusText = "text-yellow-400";
    statusBorder = "border-yellow-400/20";
    statusBg = "bg-yellow-400/10";
    displayTime = `${daysUntil} days left`;
  }

  const handleOpen = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const calendarWidth = 260;
      const calendarHeight = 350;

      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      const finalLeft =
        rect.left + calendarWidth > screenWidth
          ? rect.right - calendarWidth
          : rect.left;

      // Smart Y-Axis positioning: If too close to bottom, pop UP.
      const finalTop =
        rect.bottom + calendarHeight > screenHeight
          ? rect.top - calendarHeight - 8
          : rect.bottom + 8;

      setCoords({ top: finalTop, left: finalLeft });
    }
    setIsOpen(!isOpen);
    setViewDate(dueDate ? new Date(dueDate) : new Date());
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current && triggerRef.current.contains(e.target as Node))
        return;
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node))
        return;
      setIsOpen(false);
    };
    const handleScroll = () => setIsOpen(false);

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  const setToday = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    onChange(d.toISOString().split("T")[0]);
    setIsOpen(false);
  };

  const setTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    onChange(d.toISOString().split("T")[0]);
    setIsOpen(false);
  };

  const setTBA = () => {
    onChange(null);
    setIsOpen(false);
  };

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handlePrevMonth = (e: React.PointerEvent) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = (e: React.PointerEvent) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const selectDate = (day: number) => {
    const selected = new Date(currentYear, currentMonth, day);
    const offset = selected.getTimezoneOffset();
    selected.setMinutes(selected.getMinutes() - offset);
    onChange(selected.toISOString().split("T")[0]);
    setIsOpen(false);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!dueDate) return false;
    const selected = new Date(dueDate);
    return (
      day === selected.getUTCDate() &&
      currentMonth === selected.getUTCMonth() &&
      currentYear === selected.getUTCFullYear()
    );
  };

  return (
    <>
      <button
        ref={triggerRef}
        onPointerDown={handleOpen}
        className={`flex items-center gap-1.5 text-xs md:text-[10px] uppercase font-black px-3 py-2 md:px-2 md:py-1 rounded-xl border transition-all whitespace-nowrap shadow-inner ${statusBg} ${statusBorder} ${statusText} ${isOpen
          ? "bg-purple-500 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
          : "hover:border-purple-500/50 hover:text-purple-300"
          }`}
      >
        {dueDate ? <Calendar size={14} /> : <HelpCircle size={14} />}
        {displayTime}
      </button>

      <input
        ref={dateInputRef}
        type="date"
        className="invisible absolute top-0 left-0 w-0 h-0"
        value={toInputDate(dueDate)}
        onChange={(e) => onChange(e.target.value)}
      />

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
            className="w-[260px] flex flex-col bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-[99999] p-3 animate-in fade-in zoom-in-95 duration-100"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setToday();
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
              >
                <Clock size={12} /> Today
              </button>
              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setTomorrow();
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
              >
                <ArrowRight size={12} /> Tmrw
              </button>
            </div>

            <div className="h-px bg-white/10 mb-3 mx-1" />

            {/* CALENDAR HEADER */}
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-sm font-black text-white ml-1">
                {viewDate.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <div className="flex gap-1">
                <button
                  onPointerDown={handlePrevMonth}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onPointerDown={handleNextMonth}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* CALENDAR GRID */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <span
                  key={day}
                  className="text-[10px] font-black uppercase text-slate-600 py-1"
                >
                  {day}
                </span>
              ))}

              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelectedDay = isSelected(day);
                const isTodayDay = isToday(day);

                return (
                  <button
                    key={day}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      selectDate(day);
                    }}
                    className={`aspect-square rounded-full flex items-center justify-center text-xs font-bold transition-all ${isSelectedDay
                      ? "bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                      : isTodayDay
                        ? "bg-white/10 text-emerald-400 border border-emerald-500/30"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="h-px bg-white/10 my-3 mx-1" />

            <button
              onPointerDown={(e) => {
                e.stopPropagation();
                setTBA();
              }}
              className="w-full text-center px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-slate-500 hover:bg-white/5 hover:text-white transition-colors"
            >
              <HelpCircle size={14} /> Reset to TBA
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}

function RecurrenceSwitcher({
  current,
  onChange,
}: {
  current: string;
  onChange: (val: RecurrenceType) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const options: { id: RecurrenceType; label: string }[] = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "quarterly", label: "Quarterly" },
    { id: "one_off", label: "One-Off" },
  ];

  const handleOpen = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuHeight = 220;
      const screenHeight = window.innerHeight;

      // If it overflows the bottom, POP IT UP ABOVE THE BUTTON
      const finalTop =
        rect.bottom + menuHeight > screenHeight
          ? rect.top - menuHeight - 8
          : rect.bottom + 8;

      setCoords({ top: finalTop, left: rect.left });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current && triggerRef.current.contains(e.target as Node))
        return;
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node))
        return;
      setIsOpen(false);
    };

    const handleScroll = () => setIsOpen(false);

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  const currentLabel =
    options.find((o) => o.id === current)?.label || "One-Off";

  return (
    <>
      <button
        ref={triggerRef}
        onPointerDown={handleOpen}
        className={`flex items-center gap-1.5 text-xs md:text-[10px] uppercase font-black px-3 py-2 md:px-2 md:py-1 rounded-xl border transition-all whitespace-nowrap shadow-inner ${isOpen
          ? "bg-purple-500 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
          : "text-slate-400 border-white/10 hover:border-purple-500/50 hover:text-purple-300"
          }`}
        title="Change Category"
      >
        <Repeat size={14} /> {currentLabel}
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
            className="w-36 flex flex-col bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-[99999] p-1.5 animate-in fade-in zoom-in-95 duration-100"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {options.map((opt) => (
              <button
                key={opt.id}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-colors ${current === opt.id
                  ? "bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                  : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
              >
                {opt.label}
                {current === opt.id && <Check size={14} />}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
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
      <Sparkles size={48} className="mx-auto mb-4 text-purple-500" />
      <p className="text-sm font-bold uppercase tracking-widest text-white">
        Your {context} slate is clean.
      </p>
    </div>
  );
}
