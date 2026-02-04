"use client";

import { useState } from "react";
import {
  GraduationCap,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  CalendarDays,
  ArrowDown,
  ArrowUp,
  Trophy,
  ExternalLink,
  Link as LinkIcon,
  Edit2,
  Plus,
  Send,
  Loader2,
  MessageSquare,
} from "lucide-react";

import { TaskItem, SortOption } from "../utils/types";
import TagManager from "../navigation/TagManager";
import { formatDate } from "../utils/dateUtils";

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
import { SortableItem, DragHandle } from "../widgets/SortableItem";
import { GripVertical } from "lucide-react";

interface LevelUpViewProps {
  items: TaskItem[];
  sortOption: SortOption; // Ignored for UI, but kept for type compliance
  filterTags: string[];
  allSystemTags: string[];
  onUpdateMetadata: (id: string, metadata: any) => void;
  onUpdateTags: (id: string, tags: string[]) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
  onManualMove?: (id: string, direction: "up" | "down") => void;
  onEdit?: (item: TaskItem) => void;
  onAdd: (title: string, totalHours: number, link: string) => void;
  isAdding?: boolean;
}

export default function LevelUpView({
  items,
  sortOption, // Used for disabling drag
  filterTags,
  allSystemTags,
  onUpdateMetadata,
  onUpdateTags,
  onDelete,
  onToggleStatus,
  onReorder,
  onManualMove,
  onEdit,
  onAdd,
  isAdding = false,
}: LevelUpViewProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newHours, setNewHours] = useState(0);
  const [newLink, setNewLink] = useState("");
  // --- MATH ENGINE ---
  const globalTotalHours = items.reduce(
    (acc, item) => acc + (item.metadata?.total_hours || 0),
    0,
  );

  const globalCompletedHours = items.reduce((acc, item) => {
    // 100% automatic credit if marked completed
    if (item.status === "completed") {
      return acc + (item.metadata?.total_hours || 0);
    }
    return acc + (item.metadata?.hours_completed || 0);
  }, 0);

  const globalProgressRaw =
    globalTotalHours > 0 ? (globalCompletedHours / globalTotalHours) * 100 : 0;
  const globalProgress = globalProgressRaw.toFixed(2);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(active.id, over.id);
    }
  };

  // --- STRICT MANUAL SORT ONLY ---
  const filteredItems = items
    .filter((item) => {
      if (item.status === "archived") return false;
      if (
        filterTags.length > 0 &&
        !filterTags.every((t) => item.tags?.includes(t))
      )
        return false;
      return true;
    })
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  if (filteredItems.length === 0)
    return (
      <div className="text-center py-20 opacity-30 animate-in fade-in zoom-in-95">
        <GraduationCap size={48} className="mx-auto mb-4 text-emerald-500" />
        <p className="text-sm font-bold uppercase tracking-widest text-white">
          No courses in the queue. Add one to start your path.
        </p>
      </div>
    );

  return (
    <div className="relative space-y-0 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full">
      {/* QUICK ADD CARD */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newTitle.trim()) return;
          onAdd(newTitle, newHours, newLink);
          setNewTitle("");
          setNewHours(0);
          setNewLink("");
        }}
        className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 flex flex-col gap-4 shadow-2xl mb-12 group transition-all focus-within:border-emerald-500/30"
      >
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <div className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20">
            <GraduationCap size={14} className="text-emerald-500" fill="currentColor" />
          </div>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New Course or Skill Path title..."
            className="bg-transparent w-full text-sm font-black text-white placeholder:text-slate-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Clock size={12} /> Total Hours Estimated
            </span>
            <input
              type="number"
              value={newHours}
              onChange={(e) => setNewHours(Number(e.target.value))}
              placeholder="20"
              className="w-full bg-black/20 rounded-xl p-3 text-sm text-white font-bold focus:outline-none border border-white/5 focus:border-white/10 placeholder:text-slate-800"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <LinkIcon size={12} /> Course URL
            </span>
            <input
              type="text"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              placeholder="https://..."
              className="w-full bg-black/20 rounded-xl p-3 text-sm text-blue-400 focus:outline-none border border-white/5 focus:border-white/10 placeholder:text-slate-800"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isAdding || !newTitle.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest grow md:grow-0 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/20"
          >
            {isAdding ? <Loader2 className="animate-spin" size={12} /> : "Initiate Path"}
            {!isAdding && <Send size={12} />}
          </button>
        </div>
      </form>
      {/* --- OVERALL PROGRESS BAR --- */}
      <div className="mb-10 bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 md:p-6 rounded-3xl relative overflow-hidden group shadow-2xl w-full">
        <div className="flex flex-wrap justify-between items-end mb-4 md:mb-3 relative z-10 gap-3">
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Trophy size={16} className="text-yellow-500 shrink-0" /> Mastery
              Level
            </h2>
            <div className="text-3xl md:text-2xl font-black text-white mt-1 font-mono tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              {globalProgress}%
            </div>
          </div>
          <div className="text-left md:text-right">
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              Total Hours Invested
            </div>
            <div className="text-lg md:text-sm font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
              {globalCompletedHours} <span className="text-slate-600">/</span>{" "}
              {globalTotalHours} hrs
            </div>
          </div>
        </div>
        <div className="w-full h-4 md:h-3 bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(34,211,238,0.5)]"
            style={{ width: `${globalProgress}%` }}
          />
        </div>
      </div>

      {/* --- CONNECTOR LINE (Mobile Adjusted) --- */}
      <div className="absolute left-[20px] md:left-[36px] top-32 bottom-20 w-0.5 bg-gradient-to-b from-transparent via-white/10 to-transparent -z-0" />

      {/* --- LIST ITEMS --- */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredItems.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4 md:space-y-0 w-full">
            {filteredItems.map((item, index) => (
              <SortableItem
                key={item.id}
                id={item.id}
                disabled={sortOption !== "manual"} // Using sortOption here as passed prop, assuming manual sort logic is handled by parent but disabled if not manual
              >
                <div className="relative pl-12 md:pl-20 py-2 md:py-4 transition-all duration-300 w-full">
                  {/* NODE CIRCLE */}
                  <div
                    className={`absolute left-2 md:left-6 top-8 md:top-12 w-6 h-6 rounded-full border-4 border-slate-950 z-10 flex items-center justify-center transition-all duration-500
                        ${item.status === "completed"
                        ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] border-emerald-900"
                        : "bg-slate-700 shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                      }
                    `}
                  >
                    {item.status === "completed" && (
                      <CheckCircle2 size={12} className="text-slate-900" />
                    )}
                  </div>

                  {/* ARROW CONNECTOR */}
                  {index < filteredItems.length - 1 && (
                    <div className="absolute left-[16px] md:left-[32px] bottom-[-10px] text-white/10 z-0 hidden md:block">
                      <ArrowDown size={16} />
                    </div>
                  )}

                  <CourseCard
                    item={item}
                    allSystemTags={allSystemTags}
                    onUpdateMetadata={onUpdateMetadata}
                    onUpdateTags={onUpdateTags}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                    onManualMove={onManualMove}
                    onEdit={onEdit}
                    isFirst={index === 0}
                    isLast={index === filteredItems.length - 1}
                    isManualSort={sortOption === "manual"} // Pass this down
                  />
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// --- COURSE CARD COMPONENT ---
function CourseCard({
  item,
  allSystemTags,
  onUpdateMetadata,
  onUpdateTags,
  onDelete,
  onToggleStatus,
  onManualMove,
  onEdit,
  isFirst,
  isLast,
  isManualSort,
}: any) {
  const meta = item.metadata || {};
  const [totalHours, setTotalHours] = useState(meta.total_hours || 0);
  const [completedHours, setCompletedHours] = useState(
    meta.hours_completed || 0,
  );
  const [startDate, setStartDate] = useState(meta.start_date || "");
  const [endDate, setEndDate] = useState(meta.end_date || "");
  const [courseLink, setCourseLink] = useState(meta.course_link || "");

  const [isEditing, setIsEditing] = useState(false);

  const progress =
    item.status === "completed"
      ? 100
      : totalHours > 0
        ? Math.min(Math.round((completedHours / totalHours) * 100), 100)
        : 0;

  const handleSaveMeta = () => {
    onUpdateMetadata(item.id, {
      ...meta,
      total_hours: Number(totalHours),
      hours_completed: Number(completedHours),
      start_date: startDate,
      end_date: endDate,
      course_link: courseLink,
    });
    setIsEditing(false);
  };

  const stopProp = (e: any) => e.stopPropagation();

  return (
    <div
      className={`bg-slate-900/40 backdrop-blur-xl border border-white/5 relative overflow-hidden flex flex-col gap-4 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all rounded-3xl p-5 md:p-6 w-full`}
    >
      {/* INDIVIDUAL PROGRESS BAR */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/40">
        <div
          className={`h-full transition-all duration-700 ${item.status === "completed"
            ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            : "bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
            }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* --- HEADER: Title & Arrows --- */}
      <div className="flex flex-col md:flex-row md:justify-between items-start gap-3 w-full">
        {/* DRAG HANDLE */}
        {isManualSort && (
          <DragHandle className="mt-1 mr-2 text-slate-600 hover:text-white cursor-grab active:cursor-grabbing shrink-0">
            <GripVertical size={20} />
          </DragHandle>
        )}

        {/* Title & Tags */}
        <div className="flex-1 min-w-0 w-full">
          <h3
            className={`text-xl md:text-lg font-black leading-tight truncate ${item.status === "completed"
              ? "text-emerald-400 line-through"
              : "text-slate-100"
              }`}
            title={item.title}
          >
            {item.title}
          </h3>
          <div className="mt-2 overflow-x-auto no-scrollbar mask-linear-fade pr-2">
            <TagManager
              selectedTags={item.tags || []}
              allSystemTags={allSystemTags}
              onUpdateTags={(tags) => onUpdateTags(item.id, tags)}
            />
          </div>
        </div>

        {/* Action Controls (Responsive Wrap) */}
        <div className="flex flex-wrap gap-1.5 shrink-0 w-full md:w-auto mt-2 md:mt-0">
          {/* UP/DOWN ARROWS */}
          {onManualMove && (
            <div className="flex items-center bg-white/5 rounded-xl border border-white/5 shadow-inner mr-1">
              <button
                disabled={isFirst}
                onClick={() => onManualMove(item.id, "up")}
                className="p-3 md:p-2 text-slate-500 hover:text-white disabled:opacity-20 transition-all active:scale-95"
                title="Move Up"
              >
                <ArrowUp size={16} />
              </button>
              <div className="w-px h-6 bg-white/10" />
              <button
                disabled={isLast}
                onClick={() => onManualMove(item.id, "down")}
                className="p-3 md:p-2 text-slate-500 hover:text-white disabled:opacity-20 transition-all active:scale-95"
                title="Move Down"
              >
                <ArrowDown size={16} />
              </button>
            </div>
          )}

          {/* OTHER ACTIONS */}
          {!isEditing && courseLink && (
            <a
              href={courseLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 md:p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:text-white transition-all shadow-inner"
              title="Open Course"
            >
              <ExternalLink size={16} />
            </a>
          )}

          <button
            onClick={() => onToggleStatus(item.id, item.status)}
            className={`p-3 md:p-2 rounded-xl border transition-all ${item.status === "completed"
              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-inner"
              : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/30"
              }`}
          >
            {item.status === "completed" ? (
              <CheckCircle2 size={16} />
            ) : (
              <Circle size={16} />
            )}
          </button>

          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              className="p-3 md:p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-white transition-all"
            >
              <Edit2 size={16} />
            </button>
          )}

          <button
            onClick={() => onDelete(item.id)}
            className="p-3 md:p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-white transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* --- STATS / QUICK EDIT --- */}
      <div
        className="bg-black/40 rounded-2xl p-4 md:p-3 cursor-pointer hover:bg-black/60 transition-colors border border-white/5 shadow-inner w-full"
        onClick={() => !isEditing && setIsEditing(true)}
      >
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <LinkIcon size={12} /> Course Link (URL)
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={courseLink}
                onChange={(e) => setCourseLink(e.target.value)}
                onClick={stopProp}
                className="bg-black/40 border border-white/10 rounded-xl w-full px-4 py-3 md:py-2 text-base md:text-sm text-blue-300 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500">
                Completed Hrs
              </label>
              <input
                type="number"
                value={completedHours}
                onChange={(e) => setCompletedHours(Number(e.target.value))}
                onClick={stopProp}
                className="bg-black/40 border border-white/10 rounded-xl w-full px-4 py-3 md:py-2 text-base md:text-sm text-white font-bold focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500">
                Total Hrs
              </label>
              <input
                type="number"
                value={totalHours}
                onChange={(e) => setTotalHours(Number(e.target.value))}
                onClick={stopProp}
                className="bg-black/40 border border-white/10 rounded-xl w-full px-4 py-3 md:py-2 text-base md:text-sm text-white font-bold focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onClick={stopProp}
                className="bg-black/40 border border-white/10 rounded-xl w-full px-4 py-3 md:py-2 text-base md:text-sm text-slate-300 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                onClick={stopProp}
                className="bg-black/40 border border-white/10 rounded-xl w-full px-4 py-3 md:py-2 text-base md:text-sm text-slate-300 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-2 border-t border-white/5 pt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(false);
                }}
                className="px-5 py-3 md:py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveMeta();
                }}
                className="px-5 py-3 md:py-2 rounded-xl text-sm font-black uppercase tracking-widest bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-cyan-500/10 text-cyan-400">
                <Clock size={18} />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Progress
                </div>
                <div className="font-mono text-base md:text-sm text-slate-200">
                  <span className="text-cyan-400 font-bold">
                    {item.status === "completed" ? totalHours : completedHours}
                  </span>{" "}
                  / {totalHours} hrs
                  <span className="text-slate-600 ml-2">({progress}%)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-purple-500/10 text-purple-400">
                <CalendarDays size={18} />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Timeline
                </div>
                <div className="font-mono text-sm md:text-xs text-slate-300">
                  {startDate ? formatDate(startDate) : "Start"} &rarr;{" "}
                  {endDate ? formatDate(endDate) : "End"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
