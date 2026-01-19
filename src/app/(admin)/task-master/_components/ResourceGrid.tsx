"use client";

import { useState, useMemo, useRef } from "react";
import {
  Share2,
  Library,
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
  Copy,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import { TaskItem, ViewType, SortOption } from "./types";
import { SortableItem } from "./SortableItem";
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
  onUpdateMetadata: (id: string, meta: any) => void; // <--- NEW PROP
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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
      if (sortOption === "manual") return (a.position || 0) - (b.position || 0);
      if (sortOption === "alpha_asc") return a.title.localeCompare(b.title);
      if (sortOption === "alpha_desc") return b.title.localeCompare(a.title);

      const dateA = getEffectiveDate(a).getTime();
      const dateB = getEffectiveDate(b).getTime();
      if (sortOption === "date_asc") return dateA - dateB;
      return dateB - dateA;
    });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string);
    }
  };

  const formatPeriod = (key: string) => {
    const [year, month] = key.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString(undefined, {
      month: "short",
      year: "2-digit",
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-2 mask-linear-fade">
        <button
          onClick={() => setActivePeriod("all")}
          className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
            activePeriod === "all"
              ? "bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/20"
              : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
          }`}
        >
          All Time
        </button>
        {timeline.map((period) => (
          <button
            key={period}
            onClick={() => setActivePeriod(period)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
              activePeriod === period
                ? "bg-cyan-500 text-white border-cyan-500 shadow-lg shadow-cyan-500/20"
                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            {formatPeriod(period)}
          </button>
        ))}
      </div>

      <div className="pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <SortableContext
          items={filteredItems.map((i) => i.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

        {filteredItems.length === 0 && (
          <div className="text-center py-20 opacity-30">
            <CalendarDays size={48} className="mx-auto mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest">
              No signals in this era
            </p>
          </div>
        )}
      </div>
    </DndContext>
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
      border: "hover:border-pink-500/30",
      name: "Instagram",
    };
  if (lowerUrl.includes("linkedin.com"))
    return {
      icon: Linkedin,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "hover:border-blue-500/30",
      name: "LinkedIn",
    };
  if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com"))
    return {
      icon: Twitter,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
      border: "hover:border-sky-500/30",
      name: "X / Twitter",
    };
  if (lowerUrl.includes("tiktok.com"))
    return {
      icon: Music2,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "hover:border-rose-500/30",
      name: "TikTok",
    };
  if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be"))
    return {
      icon: Youtube,
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "hover:border-red-500/30",
      name: "YouTube",
    };
  if (lowerUrl.includes("github.com"))
    return {
      icon: Github,
      color: "text-slate-200",
      bg: "bg-slate-700/50",
      border: "hover:border-slate-500/30",
      name: "GitHub",
    };
  if (lowerUrl.includes("twitch.tv"))
    return {
      icon: Video,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "hover:border-purple-500/30",
      name: "Twitch",
    };
  return {
    icon: LinkIcon,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "hover:border-emerald-500/30",
    name: "Link Detected",
  };
};

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
  // SPLIT STATE
  const [content, setContent] = useState(item.content || "");
  const [title, setTitle] = useState(item.title);
  const [url, setUrl] = useState(item.metadata?.url || "");

  const dateInputRef = useRef<HTMLInputElement>(null);

  // Platform Detection based on URL field
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
  const borderHover = platform ? platform.border : "hover:border-purple-500/30";

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

  const stopProp = (e: any) => e.stopPropagation();

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
      className={`group flex flex-col h-full bg-white/5 border border-white/10 ${borderHover} rounded-2xl overflow-hidden transition-all shadow-lg hover:shadow-2xl relative`}
    >
      {/* HEADER */}
      <div className="p-4 pb-2 flex items-start gap-3">
        {isManualSort ? (
          <div className="mt-1.5 flex items-center gap-1 text-slate-600">
            <GripVertical size={16} className="cursor-grab hover:text-white" />
            {onManualMove && (
              <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  disabled={isFirst}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onManualMove(item.id, "up");
                  }}
                  className="hover:text-white disabled:opacity-0"
                >
                  <ArrowUp size={10} />
                </button>
                <button
                  disabled={isLast}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onManualMove(item.id, "down");
                  }}
                  className="hover:text-white disabled:opacity-0"
                >
                  <ArrowDown size={10} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={`mt-1 p-2 rounded-lg ${accentBg} ${accentText}`}>
            <MainIcon size={16} />
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-1">
          {/* TITLE INPUT */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              if (title !== item.title) onUpdateTitle(item.id, title);
            }}
            onPointerDown={stopProp}
            onKeyDown={stopProp}
            className="bg-transparent font-bold text-slate-200 w-full focus:outline-none focus:text-white placeholder:text-slate-600 truncate"
            placeholder="Resource Title..."
          />

          {/* DATE & PLATFORM LABEL */}
          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
            <div
              className={`flex items-center gap-1 cursor-pointer transition-colors p-1 rounded -ml-1 ${isEdited ? "text-cyan-400 hover:bg-cyan-500/10" : "hover:text-white hover:bg-white/10"}`}
              title="Change Date"
              onClick={handleDateClick}
              onPointerDown={stopProp}
            >
              {isEdited ? <CalendarIcon size={10} /> : <Clock size={10} />}
              <span>{displayDate}</span>
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
              <span className={`flex items-center gap-1 ${platform.color}`}>
                <Globe size={10} /> {platform.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* URL INPUT FIELD (NEW) */}
      <div className="px-4 pb-2" onPointerDown={stopProp}>
        <div className="flex items-center gap-2 bg-black/30 rounded-lg px-2 py-1.5 border border-white/5 focus-within:border-purple-500/50 transition-colors">
          <LinkIcon size={12} className="text-slate-500 shrink-0" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={handleUrlBlur}
            onKeyDown={stopProp}
            placeholder="Paste URL..."
            className="bg-transparent w-full text-xs text-emerald-400 font-mono placeholder:text-slate-700 focus:outline-none truncate"
          />
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-emerald-400"
              title="Open Link"
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {/* TAGS */}
      <div className="px-4 py-1" onPointerDown={stopProp}>
        <TagManager
          selectedTags={item.tags || []}
          allSystemTags={allSystemTags}
          onUpdateTags={(t) => onUpdateTags(item.id, t)}
        />
      </div>

      {/* NOTES BODY */}
      <div className="flex-1 p-4 pt-2 min-h-[80px] relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={() => {
            if (content !== item.content) onUpdateContent(item.id, content);
          }}
          onPointerDown={stopProp}
          onKeyDown={stopProp}
          className="w-full h-full bg-black/20 rounded-lg p-3 text-sm text-slate-300 focus:outline-none resize-none transition-colors focus:bg-black/40"
          placeholder="Add notes, summaries, or context..."
        />
      </div>

      {/* FOOTER ACTIONS */}
      <div
        className="p-2 border-t border-white/5 flex justify-between items-center bg-black/20"
        onPointerDown={stopProp}
      >
        <button
          onClick={() => onDelete(item.id)}
          className="text-slate-600 hover:text-rose-400 p-2 rounded hover:bg-white/5 transition-colors"
        >
          <Trash2 size={14} />
        </button>
        <div className="flex gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="text-slate-600 hover:text-cyan-400 p-2 rounded hover:bg-white/5 transition-colors"
            >
              <Edit2 size={14} />
            </button>
          )}
          <button
            onClick={() => onArchive(item.id)}
            className="text-slate-600 hover:text-purple-400 p-2 rounded hover:bg-white/5 transition-colors"
          >
            <Archive size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
