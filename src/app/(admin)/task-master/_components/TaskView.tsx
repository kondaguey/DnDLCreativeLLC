"use client";

import { useState, useRef } from "react";
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
} from "lucide-react";
import styles from "../task-master.module.css";
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
  onUpdateDate: (id: string, date: string) => void;
  onUpdateTags: (id: string, tags: string[]) => void;
  onUpdateContent: (id: string, content: string) => void;
  onManualMove?: (id: string, direction: "up" | "down") => void;
  onReorderSubtask?: (
    parentId: string,
    subtaskId: string,
    direction: "up" | "down",
  ) => void;
  onEdit?: (item: TaskItem) => void;

  // JSONB SUBTASK HANDLERS
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
  onManualMove,
  onReorderSubtask,
  onEdit,
  onToggleSubtask,
  onDeleteSubtask,
}: TaskViewProps) {
  // DRAG STATE


  // --- SAFETY NET #1: Ensure items is always an array ---
  const safeItems = items || [];
  const safeFilterTags = filterTags || [];

  // Filter & Sort
  const filteredItems = safeItems
    .filter((item) => {
      if (activeRecurrence === "archived") return item.status === "archived";
      if (item.status === "archived") return false;
      const matchesTab = (item.recurrence || "one_off") === activeRecurrence;

      // Safety net for tags
      const itemTags = item.tags || [];
      const matchesTags =
        safeFilterTags.length === 0 ||
        safeFilterTags.every((t) => itemTags.includes(t));
      return matchesTab && matchesTags;
    })
    .sort((a, b) => {
      if (sortOption === "manual") return 0;

      if (a.status === "completed" && b.status !== "completed") return 1;
      if (a.status !== "completed" && b.status === "completed") return -1;

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

  // DRAG HANDLERS
  // DRAG STATE & SENSORS
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
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      {/* TABS (Mobile Glassmorphic Scroller) */}
      <div className="flex overflow-x-auto gap-2 mb-6 no-scrollbar pb-2 mask-linear-fade snap-x snap-mandatory">
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

      {/* LIST */}
      <div className="space-y-4 md:space-y-5 pb-20">
        {filteredItems.length === 0 && (
          <EmptyState context={activeRecurrence} />
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
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
                <TaskCard
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
                  onManualMove={onManualMove}
                  onReorderSubtask={onReorderSubtask}
                  onEdit={onEdit}
                  onToggleSubtask={onToggleSubtask}
                  onDeleteSubtask={onDeleteSubtask}
                />
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

// --- TASK CARD ---
function TaskCard({
  item,
  isManualSort,
  allSystemTags,
  onToggleStatus,
  onDelete,
  onArchive,
  onRestore,
  onAddSubtask,
  onUpdateDate,
  onUpdateTags,
  onUpdateContent,
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
  const dateInputRef = useRef<HTMLInputElement>(null);

  // --- SAFETY NET #2: Handle DB NULL values for subtasks ---
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
  const humanTime = formatDate(item.due_date);

  let statusColor = "slate";
  let statusBorder = "border-white/5";
  let statusGlow = "shadow-lg";
  let statusText = "text-slate-400";
  let pulse = "";
  let displayTime = humanTime || "Set Date";

  if (item.status === "completed") {
    statusColor = "emerald";
    statusText = "text-emerald-500/50";
    statusBorder = "border-emerald-500/10";
  } else if (item.status === "archived") {
    statusColor = "slate";
    statusText = "text-slate-600";
    statusGlow = "opacity-60 grayscale";
  } else if (item.due_date) {
    if (daysUntil <= 0) {
      statusColor = "rose";
      statusBorder = "border-rose-500/50";
      statusText = "text-rose-400";
      statusGlow = "shadow-[0_0_15px_rgba(244,63,94,0.15)]";
      pulse = daysUntil === 0 ? "animate-pulse" : "";
      displayTime = daysUntil < 0 ? "OVERDUE" : "Due Today";
    } else if (daysUntil <= 3) {
      statusColor = "orange";
      statusBorder = "border-orange-500/30";
      statusText = "text-orange-400";
      statusGlow = "shadow-[0_0_15px_rgba(249,115,22,0.1)]";
      displayTime = `${daysUntil} days left`;
    } else if (daysUntil <= 7) {
      statusColor = "yellow";
      statusBorder = "border-yellow-400/20";
      statusText = "text-yellow-400";
      displayTime = `${daysUntil} days left`;
    }
  }

  const progressGradient =
    {
      rose: "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]",
      orange: "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]",
      yellow: "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]",
      emerald: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
      slate:
        "bg-gradient-to-r from-purple-500 to-cyan-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]",
    }[statusColor] || "bg-slate-500";

  const handleSubmitSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtaskTitle.trim()) return;
    onAddSubtask(item.id, subtaskTitle);
    setSubtaskTitle("");
  };

  const handleDateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dateInputRef.current?.showPicker?.() || dateInputRef.current?.focus();
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    await onUpdateContent(item.id, notes);
    setTimeout(() => setIsSavingNotes(false), 800);
  };

  const stopProp = (e: any) => e.stopPropagation();

  return (
    <div
      className={`bg-slate-900/40 backdrop-blur-xl border rounded-3xl overflow-hidden relative group transition-all duration-300 hover:-translate-y-0.5 ${statusBorder} ${statusGlow}`}
    >
      {/* HEADER SECTION */}
      <div className="flex items-start gap-4 p-5 md:p-6 w-full relative z-10">
        {/* MANUAL SORT HANDLE */}
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

        {/* MEGA CHECKBOX */}
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

        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-start gap-2.5">
                {statusColor === "rose" && item.status !== "completed" && (
                  <AlertCircle
                    size={18}
                    className={`${statusText} ${pulse} shrink-0 mt-0.5`}
                  />
                )}
                {/* BIG MOBILE TITLE */}
                <h4
                  className={`font-black text-xl md:text-lg leading-tight transition-all cursor-pointer select-none break-words pr-2 ${item.status === "completed" || item.status === "archived"
                    ? "line-through text-slate-600"
                    : "text-slate-100"
                    }`}
                  onClick={() => setExpanded(!expanded)}
                >
                  {item.title}
                </h4>
              </div>

              {/* THUMB SWIPEABLE TAGS */}
              <div className="mt-1 overflow-x-auto no-scrollbar mask-linear-fade pr-4">
                <TagManager
                  selectedTags={item.tags || []}
                  allSystemTags={allSystemTags}
                  onUpdateTags={(tags) => onUpdateTags(item.id, tags)}
                />
              </div>
            </div>

            {/* ACTION CONTROLS */}
            <div className="flex items-center gap-1.5 mt-2 md:mt-0 self-start md:self-auto shrink-0 flex-wrap">
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
                  <button
                    onClick={handleDateClick}
                    className={`flex items-center gap-1.5 text-xs md:text-[10px] uppercase font-black px-3 py-2 md:px-2 md:py-1 rounded-xl border transition-all whitespace-nowrap shadow-inner
                        ${statusColor === "slate"
                        ? "text-slate-400 border-white/10 hover:border-purple-500/50 hover:text-purple-300"
                        : `border-${statusColor}-500/30 bg-${statusColor}-500/10 ${statusText}`
                      }`}
                  >
                    {statusColor === "rose" ? (
                      <AlertCircle size={14} />
                    ) : (
                      <Calendar size={14} />
                    )}
                    {displayTime}
                  </button>
                  <input
                    ref={dateInputRef}
                    type="date"
                    className="invisible absolute top-0 left-0 w-0 h-0"
                    value={toInputDate(item.due_date)}
                    onChange={(e) => onUpdateDate(item.id, e.target.value)}
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

          {/* PROGRESS BAR */}
          <div className="w-full h-1.5 md:h-1 bg-black/40 rounded-full mt-4 md:mt-3 overflow-hidden shadow-inner border border-white/5">
            <div
              className={`h-full transition-all duration-700 ${progressGradient}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* EXPAND TOGGLE */}
          <div
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 mt-3 md:mt-2 text-xs font-bold uppercase tracking-widest text-slate-500 cursor-pointer hover:text-purple-400 transition-colors w-fit p-1 -ml-1 rounded-md"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {totalSub === 0 ? "Expand" : `${completedSub}/${totalSub} Steps`}
            {totalSub > 0 && (
              <span className="text-[10px] opacity-50 ml-1">({progress}%)</span>
            )}
          </div>
        </div>
      </div>

      {/* EXPANDED AREA */}
      {expanded && (
        <div className="bg-black/60 backdrop-blur-3xl border-t border-white/5 p-5 md:p-6 md:pl-16 animate-in slide-in-from-top-2 duration-300">
          {/* SUBTASKS */}
          <div className="space-y-3 mb-8">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
              <CheckSquare size={12} /> Checklist
            </h5>
            {safeSubtasks.map((sub: any, index: number) => (
              <div
                key={sub.id}
                className="flex items-start gap-3 group/sub relative bg-white/5 md:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none border md:border-transparent border-white/5"
              >
                {onReorderSubtask && item.status !== "archived" && (
                  <div className="flex flex-col absolute -left-6 top-1 opacity-0 group-hover/sub:opacity-100 transition-opacity hidden md:flex">
                    <button
                      disabled={index === 0}
                      onClick={() => onReorderSubtask(item.id, sub.id, "up")}
                      className="text-slate-600 hover:text-white disabled:opacity-0 p-0.5"
                    >
                      <ArrowUp size={10} />
                    </button>
                    <button
                      disabled={index === safeSubtasks.length - 1}
                      onClick={() => onReorderSubtask(item.id, sub.id, "down")}
                      className="text-slate-600 hover:text-white disabled:opacity-0 p-0.5"
                    >
                      <ArrowDown size={10} />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => onToggleSubtask(item.id, sub.id, sub.status)}
                  className={`w-5 h-5 md:w-4 md:h-4 mt-0.5 rounded-md border-2 md:border flex items-center justify-center shrink-0 transition-all ${sub.status === "completed"
                    ? "bg-indigo-500 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    : "border-slate-600 hover:border-indigo-400"
                    }`}
                >
                  {sub.status === "completed" && (
                    <Check size={12} className="text-white font-black" />
                  )}
                </button>
                <span
                  className={`text-base md:text-sm break-all leading-relaxed pt-0.5 ${sub.status === "completed"
                    ? "line-through text-slate-600"
                    : "text-slate-200"
                    }`}
                >
                  {sub.title}
                </span>
                {/* FIXED: Removed the md:size prop from Trash2 */}
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
                className="flex items-center gap-2 relative mt-4 md:mt-2"
              >
                <CornerDownRight
                  size={16}
                  className="text-slate-600 shrink-0 hidden md:block"
                />
                <Plus
                  size={16}
                  className="text-slate-600 shrink-0 md:hidden ml-2"
                />
                {/* iOS FIX: text-base */}
                <input
                  type="text"
                  value={subtaskTitle}
                  onChange={(e) => setSubtaskTitle(e.target.value)}
                  placeholder="Add step..."
                  className="bg-transparent border-b border-white/10 text-base md:text-sm text-slate-200 w-full px-3 py-2 md:py-1 focus:outline-none focus:border-purple-500 placeholder:text-slate-600 transition-colors"
                />
                {/* FIXED: Replaced md:h-4 className sizing with a clean parent button wrapper */}
                <button
                  type="submit"
                  className="text-slate-500 hover:text-purple-400 p-2"
                >
                  <Plus size={20} />
                </button>
              </form>
            )}
          </div>

          {/* NOTES AREA */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <FileText size={12} /> Notes
              </h5>
              {(notes !== (item.content || "") || isSavingNotes) &&
                item.status !== "archived" && (
                  <button
                    onClick={handleSaveNotes}
                    className={`flex items-center gap-1.5 text-xs md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 md:px-0 md:py-0 rounded-lg md:rounded-none bg-white/5 md:bg-transparent transition-colors ${isSavingNotes
                      ? "text-emerald-500"
                      : "text-purple-400 hover:text-white"
                      }`}
                  >
                    <Save size={14} /> {isSavingNotes ? "Saved" : "Save Notes"}
                  </button>
                )}
            </div>
            {/* iOS FIX: text-base */}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add context, terminal commands, scratchpad..."
              disabled={item.status === "archived"}
              className="w-full bg-black/40 border border-white/5 rounded-2xl md:rounded-xl p-4 text-base md:text-sm text-slate-300 focus:outline-none focus:border-purple-500/50 transition-colors min-h-[120px] resize-y shadow-inner leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// --- UTILS ---
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
      <CheckSquare size={48} className="mx-auto mb-4 text-emerald-500" />
      <p className="text-sm font-bold uppercase tracking-widest text-white">
        No active protocols for {context}
      </p>
    </div>
  );
}
