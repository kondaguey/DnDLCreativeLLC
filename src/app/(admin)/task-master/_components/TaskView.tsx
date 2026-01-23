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
    <div className="flex flex-col h-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
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

      <div className="flex-1 overflow-y-auto no-scrollbar px-1 pt-2 pb-32 space-y-4 md:space-y-5">
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
                  onUpdateRecurrence={onUpdateRecurrence}
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
  const dateInputRef = useRef<HTMLInputElement>(null);

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
    statusBorder = "border-emerald-500/20";
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

  const handleDateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dateInputRef.current?.showPicker?.() || dateInputRef.current?.focus();
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    await onUpdateContent(item.id, notes);
    setTimeout(() => setIsSavingNotes(false), 800);
  };

  return (
    <div
      className={`bg-slate-900/60 backdrop-blur-2xl border rounded-3xl overflow-hidden relative group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl ${statusBorder} ${statusGlow}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex items-start gap-4 p-5 md:p-6 w-full relative z-10">
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
          className={`w-6 h-6 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all shadow-inner ${
            item.status === "completed"
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
            <div className="flex flex-col gap-2 w-full min-w-0">
              <div className="flex items-start gap-2.5">
                {statusColor === "rose" && item.status !== "completed" && (
                  <AlertCircle
                    size={18}
                    className={`${statusText} ${pulse} shrink-0 mt-0.5`}
                  />
                )}
                <h4
                  className={`font-black text-xl md:text-lg leading-tight transition-all cursor-pointer select-none truncate ${
                    item.status === "completed" || item.status === "archived"
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
                    className={`flex items-center gap-1.5 text-xs md:text-[10px] uppercase font-black px-3 py-2 md:px-2 md:py-1 rounded-xl border transition-all whitespace-nowrap shadow-inner ${
                      statusColor === "slate"
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

                  {/* RECURRENCE SWITCHER INJECTED */}
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

          <div className="w-full h-1.5 md:h-1 bg-black/40 rounded-full mt-4 md:mt-3 overflow-hidden shadow-inner border border-white/5">
            <div
              className={`h-full transition-all duration-700 ${progressGradient}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div
            onClick={() => setExpanded(!expanded)}
            className={`flex items-center gap-2 mt-3 md:mt-2 text-xs font-bold uppercase tracking-widest cursor-pointer transition-all w-fit p-1 -ml-1 rounded-md select-none ${
              expanded ? "text-purple-400" : "text-slate-500 hover:text-white"
            }`}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {totalSub === 0
              ? "Expand Task"
              : `${completedSub}/${totalSub} Steps`}
            {totalSub > 0 && (
              <span className="text-[10px] opacity-50 ml-1">({progress}%)</span>
            )}
          </div>
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
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
                    className={`w-5 h-5 md:w-4 md:h-4 mt-0.5 rounded-md border-2 md:border flex items-center justify-center shrink-0 transition-all ${
                      sub.status === "completed"
                        ? "bg-indigo-500 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        : "border-slate-500 hover:border-indigo-400"
                    }`}
                  >
                    {sub.status === "completed" && (
                      <Check size={12} className="text-white font-black" />
                    )}
                  </button>
                  <span
                    className={`text-base md:text-sm break-words leading-relaxed pt-0.5 transition-all ${
                      sub.status === "completed"
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
                      className={`flex items-center gap-1.5 text-xs md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 md:px-0 md:py-0 rounded-lg md:rounded-none bg-white/5 md:bg-transparent transition-colors ${
                        isSavingNotes
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

// --- NEW COMPONENT: RECURRENCE SWITCHER PORTAL ---
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

  // THE FIX: onPointerDown prevents DND conflicts
  const handleOpen = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 8, left: rect.left });
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
        onPointerDown={handleOpen} // <-- Using PointerDown
        className={`flex items-center gap-1.5 text-xs md:text-[10px] uppercase font-black px-3 py-2 md:px-2 md:py-1 rounded-xl border transition-all whitespace-nowrap shadow-inner ${
          isOpen
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
            onPointerDown={(e) => e.stopPropagation()} // Stop DND leaks
          >
            {options.map((opt) => (
              <button
                key={opt.id}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-colors ${
                  current === opt.id
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
      className={`flex items-center gap-2 snap-center shrink-0 px-5 py-3 md:px-4 md:py-2 rounded-2xl md:rounded-full text-xs md:text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap active:scale-95 ${
        isActive
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
