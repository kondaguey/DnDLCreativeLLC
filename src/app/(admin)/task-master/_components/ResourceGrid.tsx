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
  verticalListSortingStrategy,
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
  X as XIcon,
  List,
  StretchVertical,
  LayoutGrid,
} from "lucide-react";

import { TaskItem, ViewType, SortOption } from "./types";
import TagManager from "./TagManager";
import CalendarModal from "./CalendarModal";

interface ResourceGridProps {
  items: TaskItem[];
  type: ViewType;
  sortOption: SortOption;
  filterTags: string[];
  allSystemTags: string[];
  searchQuery?: string;
  activePeriod?: string;
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
  type,
  sortOption,
  filterTags,
  allSystemTags,
  searchQuery = "",
  activePeriod = "all",
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

  const [viewMode, setViewMode] = useState<"list" | "grid" | "compact">("grid");

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

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = (item.title || "").toLowerCase().includes(query);
        const contentMatch = (item.content || "").toLowerCase().includes(query);
        const notesMatch = (item.metadata?.notes || "").toLowerCase().includes(query);
        if (!titleMatch && !contentMatch && !notesMatch) return false;
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
      {/* 1. VIEW TOGGLES (Mobile Centered) */}
      <div className="flex justify-center md:justify-end mb-4">
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 shadow-inner shrink-0">
          <button
            onClick={() => setViewMode("compact")}
            className={`p-2 rounded-lg transition-all ${viewMode === "compact"
              ? "bg-white/10 text-white shadow-md"
              : "text-slate-500 hover:text-white"
              }`}
            title="Compact View"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all ${viewMode === "list"
              ? "bg-white/10 text-white shadow-md"
              : "text-slate-500 hover:text-white"
              }`}
            title="List View"
          >
            <StretchVertical size={16} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all ${viewMode === "grid"
              ? "bg-white/10 text-white shadow-md"
              : "text-slate-500 hover:text-white"
              }`}
            title="Grid View"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      <div className="pb-24 md:pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredItems.map((i) => i.id)}
            strategy={
              viewMode === "grid"
                ? rectSortingStrategy
                : verticalListSortingStrategy
            }
          >
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6 w-full"
                  : viewMode === "compact"
                    ? "space-y-1"
                    : "space-y-4"
              }
            >
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
                    viewMode={viewMode}
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
    </div >
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
      icon: XIcon, // USING X ICON FROM LUCIDE if available, or fallback
      color: "text-slate-200", // X is usually black/white, so slate-200 on dark bg
      bg: "bg-slate-500/10",
      border: "border-slate-500/20",
      name: "X",
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
  viewMode,
}: any) {
  const [content, setContent] = useState(item.content || "");
  const [title, setTitle] = useState(item.title);
  const [url, setUrl] = useState(item.metadata?.url || "");
  const [isLocked, setIsLocked] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const dateButtonRef = useRef<HTMLDivElement>(null);

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
  const displayDate = effectiveDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const isEdited = !!item.due_date;

  const handleDateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dateButtonRef.current) {
      setTriggerRect(dateButtonRef.current.getBoundingClientRect());
    }
    setIsCalendarOpen(true);
  };

  const handleUrlBlur = () => {
    if (url !== item.metadata?.url) {
      onUpdateMetadata(item.id, { ...item.metadata, url });
    }
  };

  // DYNAMIC CLASSES BASED ON VIEW MODE
  let containerClasses = `group flex flex-col h-full bg-slate-900/40 backdrop-blur-xl border border-white/5 ${borderHover} rounded-3xl overflow-hidden transition-all shadow-lg hover:shadow-2xl hover:-translate-y-0.5 relative w-full`;
  const isCompact = viewMode === "compact";
  const isList = viewMode === "list";

  if (isCompact) {
    containerClasses = `group flex items-center gap-3 p-2 rounded-xl bg-slate-900/40 border border-white/5 ${borderHover} relative w-full hover:bg-white/5`;
  } else if (isList) {
    containerClasses = `group flex flex-col bg-slate-900/40 backdrop-blur-xl border border-white/5 ${borderHover} rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl relative w-full`;
  }

  // COMPACT RENDER
  if (isCompact) {
    return (
      <div className={containerClasses}>
        {isManualSort ? (
          <DragHandle className="text-slate-600 hover:text-white cursor-grab active:cursor-grabbing shrink-0">
            <GripVertical size={16} />
          </DragHandle>
        ) : (
          <div className={`p-1.5 rounded-lg ${accentBg} ${accentText} shrink-0`}>
            <MainIcon size={14} />
          </div>
        )}

        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-sm font-bold text-slate-200 truncate">{title}</span>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline-block">{displayDate}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-cyan-400 hover:text-white">
              <ExternalLink size={12} />
            </a>
          )}
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

  return (
    <>
      <div
        className={containerClasses}
      >
        {/* HEADER */}
        <div className="p-5 flex flex-col md:flex-row items-start gap-3 md:gap-4">
          {isManualSort ? (
            <DragHandle className="drag-handle flex items-center justify-center bg-white/5 hover:bg-cyan-500/20 text-slate-600 hover:text-cyan-400 p-2 md:p-3 rounded-xl shadow-inner transition-colors cursor-grab active:cursor-grabbing touch-none shrink-0">
              <GripVertical size={20} />
            </DragHandle>
          ) : (
            <div
              className={`p-2 md:p-3 rounded-xl ${accentBg} ${accentText} shadow-inner shrink-0`}
            >
              <MainIcon size={20} />
            </div>
          )}

          <div className="flex-1 min-w-0 w-full space-y-2">
            {/* TITLE */}
            {isLocked ? (
              <h3 className="text-sm md:text-lg font-black text-slate-100 w-full line-clamp-2 md:truncate cursor-default">
                {title}
              </h3>
            ) : (
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => {
                  if (title !== item.title) onUpdateTitle(item.id, title);
                }}
                className="bg-black/40 rounded px-2 py-0.5 text-sm md:text-lg font-black text-slate-100 w-full focus:outline-none placeholder:text-slate-600 border border-cyan-500/30"
                placeholder="Resource Title..."
                autoFocus
              />
            )}

            {/* DATE & PLATFORM METADATA */}
            <div className="text-[10px] md:text-[9px] text-slate-500 font-mono flex items-center gap-2 flex-wrap">
              <div
                ref={dateButtonRef}
                className={`flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded-md -ml-2 ${isEdited ? "text-cyan-400 bg-cyan-500/10" : "hover:text-white hover:bg-white/10"}`}
                title="Change Date"
                onClick={handleDateClick}
              >
                {isEdited ? <CalendarIcon size={12} /> : <Clock size={12} />}
                <span className="whitespace-nowrap">{displayDate}</span>
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

        {/* FOOTER ACTIONS */}
        <div className="p-3 md:p-3 border-t border-white/5 flex justify-between items-center bg-black/40">
          <div className="flex items-center gap-2">
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

      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={effectiveDate}
        onSelectDate={(date) => {
          const dateStr = date.toISOString().split("T")[0];
          onUpdateDate && onUpdateDate(item.id, dateStr);
        }}
        triggerRect={triggerRect}
      />
    </>
  );
}
