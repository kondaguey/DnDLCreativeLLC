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
} from "lucide-react";
import styles from "../task-master.module.css";
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
  onEdit?: (item: TaskItem) => void;
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
  onEdit,
}: LevelUpViewProps) {
  // 1. Calculate Overall "Global" Progress (High Precision)
  const globalTotalHours = items.reduce(
    (acc, item) => acc + (item.metadata?.total_hours || 0),
    0
  );
  const globalCompletedHours = items.reduce(
    (acc, item) => acc + (item.metadata?.hours_completed || 0),
    0
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
      <div className="p-12 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
        <GraduationCap className="mx-auto text-slate-600 mb-3" size={32} />
        <p className="text-slate-500 italic">
          No courses in the queue. Add one to start your path.
        </p>
      </div>
    );

  return (
    <div className="relative space-y-0 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* --- OVERALL PROGRESS BAR --- */}
      <div className="mb-8 bg-white/5 border border-white/10 p-4 rounded-2xl relative overflow-hidden group">
        <div className="flex justify-between items-end mb-2 relative z-10">
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Trophy size={14} className="text-yellow-500" /> Mastery Level
            </h2>
            <div className="text-2xl font-black text-white mt-1 font-mono tracking-tight">
              {globalProgress}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              Total Hours Invested
            </div>
            <div className="text-sm font-bold text-cyan-400">
              {globalCompletedHours} <span className="text-slate-600">/</span>{" "}
              {globalTotalHours} hrs
            </div>
          </div>
        </div>
        {/* Background Bar */}
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 transition-all duration-1000 ease-out"
            style={{ width: `${globalProgress}%` }}
          />
        </div>
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>

      {/* --- CONNECTOR LINE --- */}
      <div className="absolute left-[28px] md:left-[36px] top-20 bottom-20 w-0.5 bg-white/10 -z-0" />

      {/* --- ITEMS --- */}
      {filteredItems.map((item, index) => (
        <div
          key={item.id}
          className="relative pl-16 md:pl-20 py-4 transition-all duration-300 group"
        >
          {/* NODE CIRCLE */}
          <div
            className={`absolute left-4 md:left-6 top-10 w-6 h-6 rounded-full border-4 border-slate-900 z-10 flex items-center justify-center transition-colors
                ${item.status === "completed"
                ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
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
            onEdit={onEdit}
            isFirst={index === 0}
            isLast={index === filteredItems.length - 1}
          />
        </div>
      ))}
    </div>
  );
}

// --- COURSE CARD ---
function CourseCard({
  item,
  isManualSort,
  allSystemTags,
  onUpdateMetadata,
  onUpdateTags,
  onDelete,
  onToggleStatus,
  onManualMove,
  onEdit,
  isFirst,
  isLast,
}: any) {
  // Parse Metadata
  const meta = item.metadata || {};
  const [totalHours, setTotalHours] = useState(meta.total_hours || 0);
  const [completedHours, setCompletedHours] = useState(
    meta.hours_completed || 0
  );
  const [startDate, setStartDate] = useState(meta.start_date || "");
  const [endDate, setEndDate] = useState(meta.end_date || "");
  const [courseLink, setCourseLink] = useState(meta.course_link || "");
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

  return (
    <div
      className={`${styles.itemCard} !bg-black/40 !border-white/5 relative overflow-hidden flex flex-col gap-4 shadow-xl`}
    >
      {/* INDIVIDUAL PROGRESS BAR (Top Border) */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800">
        <div
          className={`h-full transition-all duration-700 ${item.status === "completed"
              ? "bg-emerald-500"
              : "bg-gradient-to-r from-blue-500 to-purple-500"
            }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="flex justify-between items-start pt-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* MANUAL SORT ARROWS */}
          {isManualSort && onManualMove && (
            <div className="flex flex-col gap-0.5 mt-0.5 shrink-0 opacity-50 hover:opacity-100 transition-opacity">
              <button
                disabled={isFirst}
                onClick={() => onManualMove(item.id, "up")}
                className="text-slate-500 hover:text-white disabled:opacity-20 p-0.5 hover:bg-white/10 rounded"
              >
                <ArrowUp size={12} />
              </button>
              <button
                disabled={isLast}
                onClick={() => onManualMove(item.id, "down")}
                className="text-slate-500 hover:text-white disabled:opacity-20 p-0.5 hover:bg-white/10 rounded"
              >
                <ArrowDown size={12} />
              </button>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3
              className={`text-lg font-bold leading-tight truncate ${item.status === "completed"
                  ? "text-emerald-400 line-through"
                  : "text-slate-200"
                }`}
              title={item.title}
            >
              {item.title}
            </h3>
            <div className="mt-2">
              <TagManager
                selectedTags={item.tags || []}
                allSystemTags={allSystemTags}
                onUpdateTags={(tags) => onUpdateTags(item.id, tags)}
              />
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex gap-2 shrink-0 ml-4">
          {/* COURSE LINK BUTTON */}
          {!isEditing && courseLink && (
            <a
              href={courseLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:text-white transition-all"
              title="Open Course"
            >
              <ExternalLink size={16} />
            </a>
          )}

          <button
            onClick={() => onToggleStatus(item.id, item.status)}
            className={`p-2 rounded-lg border transition-all ${item.status === "completed"
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
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
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-600 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
              title="Edit"
            >
              <Edit2 size={16} />
            </button>
          )}
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-600 hover:text-rose-400 hover:border-rose-500/30 transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* STATS AREA */}
      <div
        className="bg-black/20 rounded-lg p-3 cursor-pointer hover:bg-black/30 transition-colors border border-white/5"
        onClick={() => !isEditing && setIsEditing(true)}
      >
        {isEditing ? (
          <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-200">
            {/* INPUTS */}
            <div className="col-span-2">
              <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1">
                <LinkIcon size={10} /> Course Link (URL)
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={courseLink}
                onChange={(e) => setCourseLink(e.target.value)}
                className="bg-white/5 border border-white/10 rounded w-full p-1 text-sm text-blue-300 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">
                Completed Hrs
              </label>
              <input
                type="number"
                value={completedHours}
                onChange={(e) => setCompletedHours(Number(e.target.value))}
                className="bg-white/5 border border-white/10 rounded w-full p-1 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">
                Total Hrs
              </label>
              <input
                type="number"
                value={totalHours}
                onChange={(e) => setTotalHours(Number(e.target.value))}
                className="bg-white/5 border border-white/10 rounded w-full p-1 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white/5 border border-white/10 rounded w-full p-1 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white/5 border border-white/10 rounded w-full p-1 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="col-span-2 flex justify-end gap-2 mt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(false);
                }}
                className="text-xs text-slate-500 hover:text-white px-3 py-1"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveMeta();
                }}
                className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-wide px-4 py-1.5 rounded"
              >
                Save Updates
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* VIEW MODE: HOURS */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-cyan-500/10 text-cyan-400">
                <Clock size={16} />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500">
                  Progress
                </div>
                <div className="font-mono text-sm text-slate-200">
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
              <div className="p-2 rounded-full bg-purple-500/10 text-purple-400">
                <CalendarDays size={16} />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500">
                  Timeline
                </div>
                <div className="font-mono text-xs text-slate-300">
                  {startDate ? formatDate(startDate) : "Start"} &rarr;{" "}
                  {endDate ? formatDate(endDate) : "End"}
                </div>
              </div>
            </div>

            <div className="hidden md:block text-[10px] text-slate-600 uppercase font-bold tracking-widest hover:text-cyan-400 transition-colors">
              Click to Edit
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
