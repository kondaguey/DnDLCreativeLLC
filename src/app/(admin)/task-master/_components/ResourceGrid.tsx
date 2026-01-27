"use client";

import { useState, useMemo, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem, DragHandle } from "./SortableItem";
import {
  Share2,
  Trash2,
  Archive,
  ExternalLink,
  Edit2,
  GripVertical,
  Link as LinkIcon,
  BookOpen,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Github,
  Music2,
  Video,
  Globe,
  ArrowUp,
  ArrowDown,
  CalendarDays,
  Clock,
  Calendar as CalendarIcon,
  Lock,
  Unlock,
} from "lucide-react";

import { TaskItem, ViewType, SortOption } from "./types";
import TagManager from "./TagManager";

interface ResourceGridProps {
  items: TaskItem[];
  type: ViewType;
  sortOption: SortOption;
  filterTags: string[];
  allSystemTags: string[];
  onUpdateTitle: (id: string, title: string) => void;
  onUpdateContent: (id: string, content: string) => void;
  onUpdateTags: (id: string, tags: string[]) => void;
  onUpdateDate?: (id: string, date: string) => void;
  onUpdateMetadata: (id: string, meta: any) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
  onManualMove?: (id: string, direction: "up" | "down") => void;
  onEdit?: (item: TaskItem) => void;
}

const getEffectiveDate = (item: TaskItem): Date => {
  return item.due_date ? new Date(item.due_date) : new Date(item.created_at);
};

export default function ResourceGrid({
  items,
  sortOption,
  filterTags,
  allSystemTags,
  onUpdateTitle,
  onUpdateContent,
  onUpdateTags,
  onUpdateDate,
  onUpdateMetadata,
  onDelete,
  onArchive,
  onReorder,
  onManualMove,
  onEdit,
}: ResourceGridProps) {
  const [activePeriod, setActivePeriod] = useState<string>("all");

  const timeline = useMemo(() => {
    const periods = new Set<string>();
    items.forEach((item) => {
      const date = getEffectiveDate(item);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      periods.add(key);
    });
    return Array.from(periods).sort().reverse();
  }, [items]);

  const filteredItems = items
    .filter((item) => {
      if (item.status === "archived") return false;
      if (
        filterTags.length > 0 &&
        !filterTags.every((t) => item.tags?.includes(t))
      )
        return false;

      if (activePeriod !== "all") {
        const date = getEffectiveDate(item);
        const itemKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (activePeriod.length === 4) {
          if (String(date.getFullYear()) !== activePeriod) return false;
        } else {
          if (itemKey !== activePeriod) return false;
        }
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

      if (sortOption === "alpha_asc") return a.title.localeCompare(b.title);
      if (sortOption === "alpha_desc") return b.title.localeCompare(a.title);

      const dateA = getEffectiveDate(a).getTime();
      const dateB = getEffectiveDate(b).getTime();
      if (sortOption === "date_asc") return dateA - dateB;
      return dateB - dateA;
    });

  const formatPeriod = (key: string) => {
    const [year, month] = key.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString(undefined, {
      month: "short",
      year: "2-digit",
    });
  };

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
    <div className="w-full">
      {/* TIMELINE SCROLLER */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar mask-linear-fade pb-2">
        <button
          onClick={() => setActivePeriod("all")}
          className={`shrink-0 px-4 py-2.5 md:py-1.5 rounded-full text-xs md:text-[10px] font-bold uppercase tracking-wider transition-all ${activePeriod === "all"
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
            className={`shrink-0 px-4 py-2.5 md:py-1.5 rounded-full text-xs md:text-[10px] font-bold uppercase tracking-wider transition-all ${activePeriod === period
              ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
              : "bg-white/5 text-slate-400 hover:text-white"
              }`}
          >
            {formatPeriod(period)}
          </button>
        ))}
      </div>

      <div className="pb-24 md:pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredItems.map((i) => i.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6 w-full">
              {filteredItems.map((item, index) => (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  disabled={sortOption !== "manual"}
                >
                  <ResourceCard
                    item={item}
                    allSystemTags={allSystemTags}
                    isManualSort={sortOption === "manual"}
                    isFirst={index === 0}
                    isLast={index === filteredItems.length - 1}
                    onUpdateTitle={onUpdateTitle}
                    onUpdateContent={onUpdateContent}
                    onUpdateTags={onUpdateTags}
                    onUpdateDate={onUpdateDate}
                    onUpdateMetadata={onUpdateMetadata}
                    onDelete={onDelete}
                    onArchive={onArchive}
                    onManualMove={onManualMove}
                    onEdit={onEdit}
                  />
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {filteredItems.length === 0 && (
          <div className="text-center py-20 opacity-30">
            <CalendarDays size={48} className="mx-auto mb-4 text-cyan-500" />
            <p className="text-sm font-bold uppercase tracking-widest text-white">
              No signals in this era
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- PLATFORM CONFIG ---
const getPlatformConfig = (url: string) => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes("instagram.com"))
    return {
      icon: Instagram,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
      name: "Instagram",
    };
  if (lowerUrl.includes("linkedin.com"))
    return {
      icon: Linkedin,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      name: "LinkedIn",
    };
  if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com"))
    return {
      icon: Twitter,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
      name: "X / Twitter",
    };
  if (lowerUrl.includes("tiktok.com"))
    return {
      icon: Music2,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      name: "TikTok",
    };
  if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be"))
    return {
      icon: Youtube,
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      name: "YouTube",
    };
  if (lowerUrl.includes("github.com"))
    return {
      icon: Github,
      color: "text-slate-200",
      bg: "bg-slate-700/50",
      border: "border-slate-500/20",
      name: "GitHub",
    };
  if (lowerUrl.includes("twitch.tv"))
    return {
      icon: Video,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      name: "Twitch",
    };
  return {
    icon: LinkIcon,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    name: "Link Detected",
  };
};

// --- RESOURCE CARD COMPONENT ---
function ResourceCard({
  item,
  allSystemTags,
  isManualSort,
  isFirst,
  isLast,
  onUpdateTitle,
  onUpdateContent,
  onUpdateTags,
  onUpdateDate,
  onUpdateMetadata,
  onDelete,
  onArchive,
  onManualMove,
  onEdit,
}: any) {
  const [content, setContent] = useState(item.content || "");
  const [title, setTitle] = useState(item.title);
  const [url, setUrl] = useState(item.metadata?.url || "");
  const [isLocked, setIsLocked] = useState(true);

  const dateInputRef = useRef<HTMLInputElement>(null);

  const platform = url ? getPlatformConfig(url) : null;
  const isBookmark = item.type === "social_bookmark" || !!url;
  const MainIcon = platform ? platform.icon : isBookmark ? Share2 : BookOpen;
  const accentBg = platform
    ? platform.bg
    : isBookmark
      ? "bg-purple-500/10"
      : "bg-cyan-500/10";
  const accentText = platform
    ? platform.color
    : isBookmark
      ? "text-purple-400"
      : "text-cyan-400";
  const borderHover = platform
    ? `hover:${platform.border}`
    : "hover:border-purple-500/30";

  const effectiveDate = item.due_date
    ? new Date(item.due_date)
    : new Date(item.created_at);
  const rawDate = effectiveDate.toISOString().split("T")[0];
  const displayDate = effectiveDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const isEdited = !!item.due_date;

  const handleDateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dateInputRef.current) {
      if ((dateInputRef.current as any).showPicker)
        (dateInputRef.current as any).showPicker();
      else dateInputRef.current.click();
    }
  };

  const handleUrlBlur = () => {
    if (url !== item.metadata?.url) {
      onUpdateMetadata(item.id, { ...item.metadata, url });
    }
  };

  return (
    <div
      className={`group flex flex-col h-full bg-slate-900/40 backdrop-blur-xl border border-white/5 ${borderHover} rounded-3xl overflow-hidden transition-all shadow-lg hover:shadow-2xl hover:-translate-y-0.5 relative w-full`}
    >
      {/* HEADER */}
      <div className="p-5 flex items-start gap-4">
        {/* THE FIX: PURE CSS CLASS DRAG HANDLE. ZERO EVENT CONFLICTS. */}
        {isManualSort ? (
          <DragHandle className="drag-handle mt-1 flex items-center justify-center bg-white/5 hover:bg-cyan-500/20 text-slate-600 hover:text-cyan-400 p-2 md:p-3 rounded-xl shadow-inner transition-colors cursor-grab active:cursor-grabbing touch-none shrink-0">
            <GripVertical size={20} />
          </DragHandle>
        ) : (
          <div
            className={`mt-1 p-2 md:p-3 rounded-xl ${accentBg} ${accentText} shadow-inner shrink-0`}
          >
            <MainIcon size={20} />
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-2">
          {/* TITLE INPUT */}
          {isLocked ? (
            <h3 className="text-xs md:text-lg font-black text-slate-100 w-full line-clamp-2 md:truncate cursor-default">
              {title}
            </h3>
          ) : (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                if (title !== item.title) onUpdateTitle(item.id, title);
              }}
              className="bg-black/40 rounded px-2 py-0.5 text-xs md:text-lg font-black text-slate-100 w-full focus:outline-none placeholder:text-slate-600 border border-cyan-500/30"
              placeholder="Resource Title..."
              autoFocus
            />
          )}

          {/* DATE & PLATFORM METADATA */}
          <div className="text-[10px] md:text-[9px] text-slate-500 font-mono flex items-center gap-2 flex-wrap">
            <div
              className={`flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded-md -ml-2 ${isEdited ? "text-cyan-400 bg-cyan-500/10" : "hover:text-white hover:bg-white/10"}`}
              title="Change Date"
              onClick={handleDateClick}
            >
              {isEdited ? <CalendarIcon size={12} /> : <Clock size={12} />}
              <span className="whitespace-nowrap">{displayDate}</span>
              <input
                ref={dateInputRef}
                type="date"
                defaultValue={rawDate}
                onChange={(e) => {
                  if (e.target.value)
                    onUpdateDate && onUpdateDate(item.id, e.target.value);
                }}
                className="w-0 h-0 opacity-0 absolute pointer-events-none"
              />
            </div>
            {platform && (
              <span
                className={`flex items-center gap-1.5 px-2 py-1 bg-black/40 rounded-md whitespace-nowrap ${platform.color}`}
              >
                <Globe size={12} /> {platform.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* URL INPUT FIELD */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-2 bg-black/40 rounded-xl px-3 py-2 border border-white/5 focus-within:border-cyan-500/50 transition-colors shadow-inner">
          <LinkIcon size={14} className="text-slate-500 shrink-0" />
          <input
            value={url}
            readOnly={isLocked}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={handleUrlBlur}
            placeholder={isLocked ? "No URL" : "Paste URL..."}
            className={`bg-transparent w-full text-base md:text-sm text-cyan-400 font-mono placeholder:text-slate-700 focus:outline-none truncate ${!isLocked && "border-b border-cyan-500/30"}`}
          />
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-cyan-400 p-1 shrink-0"
              title="Open Link"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>

      {/* TAGS */}
      <div className="px-5 py-2 overflow-x-auto no-scrollbar mask-linear-fade pr-4">
        <TagManager
          selectedTags={item.tags || []}
          allSystemTags={allSystemTags}
          onUpdateTags={(t) => onUpdateTags(item.id, t)}
        />
      </div>

      {/* NOTES BODY */}
      <div className="flex-1 p-5 pt-3 min-h-[100px] md:min-h-[120px] relative">
        <textarea
          value={content}
          readOnly={isLocked}
          onChange={(e) => setContent(e.target.value)}
          onBlur={() => {
            if (content !== item.content) onUpdateContent(item.id, content);
          }}
          className={`w-full h-full rounded-xl p-3 md:p-4 text-sm md:text-sm text-slate-300 focus:text-white focus:outline-none resize-none transition-colors border shadow-inner leading-relaxed ${isLocked ? "bg-transparent border-transparent" : "bg-black/40 border-white/10 focus:border-cyan-500/50"}`}
          placeholder={isLocked ? "No content." : "Add context, takeaways, or research..."}
        />
      </div>

      {/* FOOTER ACTIONS (ARROWS ARE 100% BULLETPROOF) */}
      <div className="p-3 md:p-3 border-t border-white/5 flex justify-between items-center bg-black/40">
        <div className="flex items-center gap-2">
          {/* THE WORKING ARROWS */}
          {isManualSort && onManualMove && (
            <div className="flex items-center bg-white/5 rounded-xl border border-white/10 shadow-inner mr-1">
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
              <div className="w-px h-6 bg-white/10" />
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
              onDelete(item.id);
            }}
            className="text-slate-600 hover:text-rose-400 p-3 md:p-2 rounded-xl hover:bg-rose-500/10 transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLocked(!isLocked);
            }}
            className={`p-3 md:p-2 rounded-xl transition-colors ${!isLocked ? "bg-cyan-500/10 text-cyan-400" : "text-slate-600 hover:text-white hover:bg-white/5"}`}
            title={isLocked ? "Unlock to Edit" : "Lock Task"}
          >
            {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onArchive(item.id);
            }}
            className="text-slate-600 hover:text-purple-400 p-3 md:p-2 rounded-xl hover:bg-purple-500/10 transition-colors"
            title="Archive"
          >
            <Archive size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
