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
  GripVertical,
} from "lucide-react";
import { TaskItem, SortOption } from "./types";
import TagManager from "./TagManager";
import { formatDate } from "./dateUtils";

interface LevelUpViewProps {
  items: TaskItem[];
  sortOption: SortOption;
  filterTags: string[];
  allSystemTags: string[];
  onUpdateMetadata: (id: string, metadata: any) => void;
  onUpdateTags: (id: string, tags: string[]) => void;
  onDelete: (id: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
  onToggleStatus: (id: string, status: string) => void;
  onManualMove?: (id: string, direction: "up" | "down") => void;
  onEdit?: (item: TaskItem) => void; // <--- THE MASTER EDIT PROP
}

export default function LevelUpView({
  items,
  sortOption,
  filterTags,
  allSystemTags,
  onUpdateMetadata,
  onUpdateTags,
  onDelete,
  onToggleStatus,
  onManualMove,
  onEdit, // <--- PASSED DOWN
}: LevelUpViewProps) {
  // 1. Calculate Overall "Global" Progress (High Precision)
  const globalTotalHours = items.reduce(
    (acc, item) => acc + (item.metadata?.total_hours || 0),
    0,
  );
  const globalCompletedHours = items.reduce(
    (acc, item) => acc + (item.metadata?.hours_completed || 0),
    0,
  );

  // PRECISION PERCENTAGE LOGIC
  const globalProgressRaw =
    globalTotalHours > 0 ? (globalCompletedHours / globalTotalHours) * 100 : 0;

  // Formats to x.xx (e.g., "12.50" or "99.99")
  const globalProgress = globalProgressRaw.toFixed(2);

  // Filter & Sort
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
    .sort((a, b) => {
      if (sortOption === "manual") return 0;
      if (sortOption === "created_desc")
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      return 0;
    });

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
    <div className="relative space-y-0 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      {/* --- OVERALL PROGRESS BAR (Glassmorphic) --- */}
      <div className="mb-10 bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl relative overflow-hidden group shadow-2xl">
        <div className="flex justify-between items-end mb-3 relative z-10">
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Trophy size={16} className="text-yellow-500" /> Mastery Level
            </h2>
            <div className="text-3xl md:text-2xl font-black text-white mt-1 font-mono tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              {globalProgress}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              Total Hours Invested
            </div>
            <div className="text-lg md:text-sm font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
              {globalCompletedHours} <span className="text-slate-600">/</span>{" "}
              {globalTotalHours} hrs
            </div>
          </div>
        </div>
        {/* Background Bar */}
        <div className="w-full h-4 md:h-3 bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(34,211,238,0.5)]"
            style={{ width: `${globalProgress}%` }}
          />
        </div>
      </div>

      {/* --- CONNECTOR LINE --- */}
      <div className="absolute left-[28px] md:left-[36px] top-32 bottom-20 w-0.5 bg-gradient-to-b from-transparent via-white/10 to-transparent -z-0" />

      {/* --- ITEMS --- */}
      {filteredItems.map((item, index) => (
        <div
          key={item.id}
          className="relative pl-16 md:pl-20 py-4 transition-all duration-300 group"
        >
          {/* NODE CIRCLE */}
          <div
            className={`absolute left-4 md:left-6 top-10 w-6 h-6 rounded-full border-4 border-slate-950 z-10 flex items-center justify-center transition-all duration-500
                ${
                  item.status === "completed"
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
            <div className="absolute left-[24px] md:left-[32px] bottom-[-10px] text-white/10 z-0">
              <ArrowDown size={16} />
            </div>
          )}

          <CourseCard
            item={item}
            isManualSort={sortOption === "manual"}
            allSystemTags={allSystemTags}
            onUpdateMetadata={onUpdateMetadata}
            onUpdateTags={onUpdateTags}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            onManualMove={onManualMove}
            onEdit={onEdit} // <--- PASSED TO CARD
            isFirst={index === 0}
            isLast={index === filteredItems.length - 1}
          />
        </div>
      ))}
    </div>
  );
}

// --- COURSE CARD COMPONENT ---
function CourseCard({
  item,
  isManualSort,
  allSystemTags,
  onUpdateMetadata,
  onUpdateTags,
  onDelete,
  onToggleStatus,
  onManualMove,
  onEdit, // <--- RECEIVED HERE
  isFirst,
  isLast,
}: any) {
  // Parse Metadata
  const meta = item.metadata || {};
  const [totalHours, setTotalHours] = useState(meta.total_hours || 0);
  const [completedHours, setCompletedHours] = useState(
    meta.hours_completed || 0,
  );
  const [startDate, setStartDate] = useState(meta.start_date || "");
  const [endDate, setEndDate] = useState(meta.end_date || "");
  const [courseLink, setCourseLink] = useState(meta.course_link || "");

  // Controls Inline Editing
  const [isEditing, setIsEditing] = useState(false);

  // Calculations
  const progress =
    totalHours > 0
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
      className={`bg-slate-900/40 backdrop-blur-xl border border-white/5 relative overflow-hidden flex flex-col gap-4 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all rounded-3xl p-5 md:p-6`}
    >
      {/* INDIVIDUAL PROGRESS BAR (Top Border) */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/40">
        <div
          className={`h-full transition-all duration-700 ${
            item.status === "completed"
              ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              : "bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header Row */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* MANUAL SORT ARROWS */}
          {isManualSort && onManualMove && (
            <div className="flex flex-col gap-1 shrink-0">
              <GripVertical size={16} className="text-slate-600 mb-1" />
              <button
                disabled={isFirst}
                onClick={() => onManualMove(item.id, "up")}
                className="text-slate-600 hover:text-white disabled:opacity-0 p-1 bg-white/5 rounded-md"
              >
                <ArrowUp size={12} />
              </button>
              <button
                disabled={isLast}
                onClick={() => onManualMove(item.id, "down")}
                className="text-slate-600 hover:text-white disabled:opacity-0 p-1 bg-white/5 rounded-md"
              >
                <ArrowDown size={12} />
              </button>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3
              className={`text-xl md:text-lg font-black leading-tight truncate ${
                item.status === "completed"
                  ? "text-emerald-400 line-through"
                  : "text-slate-100"
              }`}
              title={item.title}
            >
              {item.title}
            </h3>
            {/* Thumb-swipeable tags */}
            <div className="mt-2 overflow-x-auto no-scrollbar mask-linear-fade pr-2">
              <TagManager
                selectedTags={item.tags || []}
                allSystemTags={allSystemTags}
                onUpdateTags={(tags) => onUpdateTags(item.id, tags)}
              />
            </div>
          </div>
        </div>

        {/* CONTROLS (Scaled for thumbs) */}
        <div className="flex gap-1.5 shrink-0">
          {/* COURSE LINK BUTTON */}
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
            className={`p-3 md:p-2 rounded-xl border transition-all ${
              item.status === "completed"
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-inner"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/30"
            }`}
            title={
              item.status === "completed" ? "Mark Active" : "Mark Complete"
            }
          >
            {item.status === "completed" ? (
              <CheckCircle2 size={16} />
            ) : (
              <Circle size={16} />
            )}
          </button>

          {/* --- THE MASTER EDIT BUTTON --- */}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // Stops inline edit from opening
                onEdit(item); // OPENS MASTER MODAL
              }}
              className="p-3 md:p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-white transition-all"
              title="Edit in Master Modal"
            >
              <Edit2 size={16} />
            </button>
          )}

          <button
            onClick={() => onDelete(item.id)}
            className="p-3 md:p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-white transition-all"
            title="Delete Course"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* STATS AREA / QUICK EDIT (Clicking this opens Inline Edit) */}
      <div
        className="bg-black/40 rounded-2xl p-4 md:p-3 cursor-pointer hover:bg-black/60 transition-colors border border-white/5 shadow-inner"
        onClick={() => !isEditing && setIsEditing(true)}
      >
        {isEditing ? (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-200">
            {/* INPUTS (text-base required for iOS) */}
            <div className="col-span-2 space-y-1">
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

            <div className="col-span-2 flex justify-end gap-3 mt-2 border-t border-white/5 pt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(false);
                }}
                className="px-5 py-2.5 md:py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveMeta();
                }}
                className="px-5 py-2.5 md:py-2 rounded-xl text-sm font-black uppercase tracking-widest bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition-all"
              >
                Save Updates
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* VIEW MODE: HOURS */}
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
                    {completedHours}
                  </span>{" "}
                  / {totalHours} hrs
                  <span className="text-slate-600 ml-2">({progress}%)</span>
                </div>
              </div>
            </div>

            {/* VIEW MODE: DATES */}
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

            <div className="hidden md:block text-[10px] text-slate-600 uppercase font-bold tracking-widest hover:text-cyan-400 transition-colors ml-auto">
              Tap to Quick Edit
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
