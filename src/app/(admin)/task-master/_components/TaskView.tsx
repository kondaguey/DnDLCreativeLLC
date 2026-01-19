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
} from "lucide-react";
import styles from "../task-master.module.css";
import { TaskItem, RecurrenceType, SortOption } from "./types";
import TagManager from "./TagManager";
import { formatDate, toInputDate, getDaysUntil } from "./dateUtils";

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
  // NEW PROPS
  onManualMove?: (id: string, direction: "up" | "down") => void;
  onReorderSubtask?: (
    parentId: string,
    subtaskId: string,
    direction: "up" | "down"
  ) => void;
  onEdit?: (item: TaskItem) => void;
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
}: TaskViewProps) {
  // DRAG STATE
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Filter & Sort
  const filteredItems = items
    .filter((item) => {
      if (activeRecurrence === "archived") return item.status === "archived";
      if (item.status === "archived") return false;
      const matchesTab = (item.recurrence || "one_off") === activeRecurrence;
      const matchesTags =
        filterTags.length === 0 ||
        filterTags.every((t) => item.tags?.includes(t));
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
  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (sortOption !== "manual") return;
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (sortOption !== "manual") return;
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (sortOption !== "manual" || !draggedId || draggedId === targetId) return;

    onReorder(draggedId, targetId);
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* TABS */}
      <div className="flex overflow-x-auto gap-2 mb-4 border-b border-white/10 pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {["daily", "weekly", "monthly", "quarterly", "one_off"].map((tab) => (
          <TimeframeTab
            key={tab}
            label={tab === "one_off" ? "One-Offs" : tab}
            id={tab}
            active={activeRecurrence}
            onClick={onRecurrenceChange}
          />
        ))}
        <div className="w-px h-6 bg-white/10 mx-2 self-center" />
        <TimeframeTab
          label="Archives"
          id="archived"
          active={activeRecurrence}
          onClick={onRecurrenceChange}
          icon={<Archive size={12} />}
        />
      </div>

      {/* LIST */}
      <div className="space-y-3 md:space-y-4 overflow-y-auto pb-20 px-1">
        {filteredItems.length === 0 && (
          <EmptyState context={activeRecurrence} />
        )}

        {filteredItems.map((item) => (
          <div
            key={item.id}
            draggable={sortOption === "manual"}
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, item.id)}
            onDragEnd={handleDragEnd}
            className={`transition-all duration-300 ${draggedId === item.id ? "opacity-40 scale-95" : "opacity-100"
              }`}
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
            />
          </div>
        ))}
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
}: any) {
  const [expanded, setExpanded] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [notes, setNotes] = useState(item.content || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const totalSub = item.subtasks?.length || 0;
  const completedSub =
    item.subtasks?.filter((s: any) => s.status === "completed").length || 0;
  const progress =
    totalSub === 0
      ? item.status === "completed"
        ? 100
        : 0
      : Math.round((completedSub / totalSub) * 100);

  const daysUntil = getDaysUntil(item.due_date);
  const humanTime = formatDate(item.due_date);

  let statusColor = "slate";
  let statusBorder = "border-l-transparent";
  let statusBg = "";
  let statusText = "text-slate-400";
  let pulse = "";
  let displayTime = humanTime || "Set Date";

  if (item.status === "completed") {
    statusColor = "emerald";
    statusText = "text-emerald-500/50";
    statusBorder = "border-l-emerald-500/30";
  } else if (item.status === "archived") {
    statusColor = "slate";
    statusText = "text-slate-600";
    statusBg = "opacity-60 grayscale bg-black/20";
  } else if (item.due_date) {
    if (daysUntil < 0) {
      statusColor = "rose";
      statusBorder = "border-l-rose-500";
      statusBg = "bg-rose-500/5";
      statusText = "text-rose-400";
      pulse = "animate-pulse";
      displayTime = "OVERDUE";
    } else if (daysUntil === 0) {
      statusColor = "rose";
      statusBorder = "border-l-rose-500";
      statusBg = "bg-rose-500/5";
      statusText = "text-rose-400";
      pulse = "animate-pulse";
      displayTime = "Due Today";
    } else if (daysUntil <= 3) {
      statusColor = "orange";
      statusBorder = "border-l-orange-500";
      statusBg = "bg-orange-500/5";
      statusText = "text-orange-400";
      displayTime = `${daysUntil} days left`;
    } else if (daysUntil <= 7) {
      statusColor = "yellow";
      statusBorder = "border-l-yellow-500";
      statusText = "text-yellow-400";
      displayTime = `${daysUntil} days left`;
    }
  }

  const progressGradient =
    {
      rose: "bg-rose-500",
      orange: "bg-orange-500",
      yellow: "bg-yellow-400",
      emerald: "bg-emerald-500",
      slate: "bg-gradient-to-r from-purple-500 to-indigo-500",
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
      className={`${styles.itemCard} flex-col !gap-0 !p-0 overflow-visible relative group border-l-4 ${statusBorder} ${statusBg} transition-colors duration-300`}
    >
      <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 w-full relative z-10">
        {/* DRAG GRIP & MANUAL SORT ARROWS */}
        {isManualSort && item.status !== "archived" && (
          <div className="flex flex-col items-center gap-1 mt-1 shrink-0">
            <div className="cursor-grab text-slate-700 hover:text-slate-400">
              <GripVertical size={16} />
            </div>
            {/* MANUAL SORT BUTTONS */}
            {onManualMove && (
              <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onManualMove(item.id, "up")}
                  className="text-slate-700 hover:text-white p-0.5"
                  title="Move Up"
                >
                  <ArrowUp size={12} />
                </button>
                <button
                  onClick={() => onManualMove(item.id, "down")}
                  className="text-slate-700 hover:text-white p-0.5"
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
          className={`${styles.checkbox} ${item.status === "completed" ? styles.checkboxChecked : ""
            } shrink-0 mt-1`}
          disabled={item.status === "archived"}
        >
          {item.status === "completed" && (
            <CheckSquare size={14} className="text-white" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-start gap-2">
                {statusColor === "rose" && item.status !== "completed" && (
                  <AlertCircle
                    size={16}
                    className={`${statusText} ${pulse} shrink-0 mt-0.5`}
                  />
                )}
                <h4
                  className={`font-medium text-base md:text-lg leading-tight transition-all cursor-pointer select-none break-words pr-2 ${item.status === "completed" || item.status === "archived"
                    ? "line-through text-slate-600"
                    : "text-slate-200"
                    }`}
                  onClick={() => setExpanded(!expanded)}
                >
                  {item.title}
                </h4>
              </div>

              <div className="mt-1">
                <TagManager
                  selectedTags={item.tags || []}
                  allSystemTags={allSystemTags}
                  onUpdateTags={(tags) => onUpdateTags(item.id, tags)}
                />
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-2 mt-2 md:mt-0 self-start md:self-auto shrink-0">
              {/* Restore Button for Archives */}
              {item.status === "archived" ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore(item.id);
                  }}
                  className="flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-1 rounded border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                >
                  <RefreshCcw size={12} /> Restore
                </button>
              ) : (
                <>
                  <button
                    onClick={handleDateClick}
                    className={`flex items-center gap-1.5 text-[10px] uppercase font-bold px-2 py-1 rounded border transition-colors whitespace-nowrap 
                        ${statusColor === "slate"
                        ? "text-slate-400 border-white/10 hover:border-purple-500/50 hover:text-purple-300"
                        : `border-${statusColor}-500/30 bg-${statusColor}-500/10 ${statusText}`
                      }`}
                  >
                    {statusColor === "rose" ? (
                      <AlertCircle size={12} />
                    ) : (
                      <Calendar size={12} />
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
                    className="text-slate-600 hover:text-purple-400 transition-colors p-1"
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
                      className="text-slate-600 hover:text-cyan-400 transition-colors p-1"
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
                className="text-slate-600 hover:text-rose-400 transition-colors p-1"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="w-full h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${progressGradient}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 mt-2 text-xs font-bold uppercase tracking-widest text-slate-500 cursor-pointer hover:text-purple-400 transition-colors"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {totalSub === 0 ? "Details" : `${completedSub}/${totalSub} Steps`}
            {totalSub > 0 && (
              <span className="text-[10px] opacity-50 ml-1">({progress}%)</span>
            )}
          </div>
        </div>
      </div>

      {/* EXPANDED AREA */}
      {expanded && (
        <div className="bg-black/20 border-t border-white/5 p-3 md:p-4 md:pl-12 animate-in slide-in-from-top-2">
          {/* Subtasks */}
          <div className="space-y-2 mb-6">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
              Checklist
            </h5>
            {item.subtasks?.map((sub: any, index: number) => (
              <div
                key={sub.id}
                className="flex items-start gap-3 group/sub relative"
              >
                {/* SUBTASK REORDER ARROWS */}
                {onReorderSubtask && item.status !== "archived" && (
                  <div className="flex flex-col absolute -left-6 top-0.5 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                    <button
                      disabled={index === 0}
                      onClick={() => onReorderSubtask(item.id, sub.id, "up")}
                      className="text-slate-600 hover:text-white disabled:opacity-0 p-0.5"
                    >
                      <ArrowUp size={10} />
                    </button>
                    <button
                      disabled={index === (item.subtasks?.length || 0) - 1}
                      onClick={() => onReorderSubtask(item.id, sub.id, "down")}
                      className="text-slate-600 hover:text-white disabled:opacity-0 p-0.5"
                    >
                      <ArrowDown size={10} />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => onToggleStatus(sub.id, sub.status)}
                  className={`w-4 h-4 mt-0.5 rounded border border-slate-600 flex items-center justify-center shrink-0 ${sub.status === "completed"
                    ? "bg-indigo-500 border-indigo-500"
                    : "hover:border-indigo-400"
                    }`}
                >
                  {sub.status === "completed" && (
                    <CheckSquare size={10} className="text-white" />
                  )}
                </button>
                <span
                  className={`text-sm break-all leading-snug ${sub.status === "completed"
                    ? "line-through text-slate-600"
                    : "text-slate-300"
                    }`}
                >
                  {sub.title}
                </span>
                <button
                  onClick={() => onDelete(sub.id)}
                  className="opacity-100 lg:opacity-0 group-hover/sub:opacity-100 text-slate-600 hover:text-rose-400 ml-auto p-1"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {item.status !== "archived" && (
              <form
                onSubmit={handleSubmitSub}
                className="flex items-center gap-2 relative mt-2"
              >
                <CornerDownRight
                  size={16}
                  className="text-slate-600 shrink-0"
                />
                <input
                  type="text"
                  value={subtaskTitle}
                  onChange={(e) => setSubtaskTitle(e.target.value)}
                  placeholder="Add step..."
                  className="bg-transparent border-b border-white/10 text-sm text-slate-300 w-full px-2 py-1 focus:outline-none focus:border-purple-500 placeholder:text-slate-600"
                />
                <button
                  type="submit"
                  className="text-slate-500 hover:text-purple-400 p-2"
                >
                  <Plus size={16} />
                </button>
              </form>
            )}
          </div>
          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <FileText size={12} /> Notes
              </h5>
              {(notes !== (item.content || "") || isSavingNotes) &&
                item.status !== "archived" && (
                  <button
                    onClick={handleSaveNotes}
                    className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${isSavingNotes
                      ? "text-emerald-500"
                      : "text-purple-400 hover:text-white"
                      }`}
                  >
                    <Save size={12} /> {isSavingNotes ? "Saved" : "Save Notes"}
                  </button>
                )}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add context..."
              disabled={item.status === "archived"}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-slate-300 focus:outline-none focus:border-purple-500/50 transition-colors min-h-[100px] resize-y"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ... Utils ...
function TimeframeTab({ label, id, active, onClick, icon }: any) {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 snap-start shrink-0 px-4 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border whitespace-nowrap ${isActive
        ? "bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/25"
        : "bg-white/5 text-slate-500 border-transparent hover:border-white/10 hover:text-slate-300"
        }`}
    >
      {icon} {label}
    </button>
  );
}

function EmptyState({ context }: { context: string }) {
  return (
    <div className="p-12 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
      <div className="text-slate-500 font-medium">
        No tasks found for {context}.
      </div>
      <p className="text-slate-600 text-sm mt-2">
        Add a task above or switch tabs.
      </p>
    </div>
  );
}
