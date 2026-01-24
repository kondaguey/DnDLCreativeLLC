"use client";

import { useState, useMemo } from "react";
import {
  Zap,
  BrainCircuit,
  Trash2,
  ArrowRightCircle,
  GripHorizontal,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Code,
  Type,
  LayoutGrid,
  List,
  Clock,
  Edit2,
  Send,
  Sparkles,
  Star,
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { TaskItem, SortOption } from "./types";
import TagManager from "./TagManager";
import { SortableItem, DragHandle } from "./SortableItem";

interface IdeaBoardProps {
  items: TaskItem[];
  sortOption: SortOption;
  filterTags: string[];
  allSystemTags: string[];
  onAdd: (title: string, content: string) => void;
  onUpdateContent: (id: string, content: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onUpdateTags: (id: string, tags: string[]) => void;
  onUpdateMetadata: (id: string, meta: any) => void;
  onDelete: (id: string) => void;
  onPromoteToTask: (item: TaskItem) => void;
  onReorder: (draggedId: string, targetId: string) => void;
  onManualMove?: (id: string, direction: "up" | "down") => void;
  onEdit?: (item: TaskItem) => void;
}

const getEffectiveDate = (item: TaskItem): Date =>
  item.due_date ? new Date(item.due_date) : new Date(item.created_at);

const getSortText = (item: TaskItem): string => {
  const title = item.title || "";
  if (
    title === "Quick Note" ||
    title === "[CODE] Quick Note" ||
    title.trim() === ""
  ) {
    return (item.content || "").toLowerCase();
  }
  return title.toLowerCase();
};

export default function IdeaBoard({
  items,
  sortOption,
  filterTags,
  allSystemTags,
  onAdd,
  onUpdateContent,
  onUpdateTitle,
  onUpdateTags,
  onUpdateMetadata,
  onDelete,
  onPromoteToTask,
  onReorder,
  onManualMove,
  onEdit,
}: IdeaBoardProps) {
  const [activeTab, setActiveTab] = useState<"sparks" | "solidified">("sparks");
  const [activePeriod, setActivePeriod] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [quickNote, setQuickNote] = useState("");
  const [noteFormat, setNoteFormat] = useState<"text" | "code">("text");

  const timeline = useMemo(() => {
    const periods = new Set<string>();
    items.forEach((item) => {
      const date = getEffectiveDate(item);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      periods.add(key);
    });
    return Array.from(periods).sort().reverse();
  }, [items]);

  const formatPeriod = (key: string) => {
    const [year, month] = key.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: {
        start: ["Enter"],
        cancel: ["Escape"],
        end: ["Enter", "Space"],
      },
    }),
  );

  const filteredItems = items
    .filter((item) => {
      if (item.status === "archived") return false;
      const stage = item.metadata?.stage || "spark";
      if (activeTab === "sparks" && stage !== "spark") return false;
      if (activeTab === "solidified" && stage !== "solidified") return false;
      if (
        filterTags.length > 0 &&
        !filterTags.every((t) => item.tags?.includes(t))
      )
        return false;

      if (activePeriod !== "all") {
        const date = getEffectiveDate(item);
        const itemKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (itemKey !== activePeriod) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const aFav = a.metadata?.is_favorite ? 1 : 0;
      const bFav = b.metadata?.is_favorite ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;

      switch (sortOption) {
        case "manual":
          return (a.position || 0) - (b.position || 0);
        case "alpha_asc": {
          const comp = getSortText(a).localeCompare(getSortText(b));
          return comp !== 0
            ? comp
            : new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime();
        }
        case "alpha_desc": {
          const comp = getSortText(b).localeCompare(getSortText(a));
          return comp !== 0
            ? comp
            : new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime();
        }
        case "date_asc":
          return getEffectiveDate(a).getTime() - getEffectiveDate(b).getTime();
        case "date_desc":
          return getEffectiveDate(b).getTime() - getEffectiveDate(a).getTime();
        case "created_desc":
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;
    const noteTitle =
      noteFormat === "code" ? "[CODE] Quick Note" : "Quick Note";
    onAdd(noteTitle, quickNote);
    setQuickNote("");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-20 w-full overflow-hidden">
      {/* 1. TOP CONTROL BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8 w-full">
        {/* TABS */}
        <div className="flex items-center gap-4 border-b border-white/10 px-2 w-full md:w-auto md:max-w-sm">
          <button
            onClick={() => setActiveTab("sparks")}
            className={`pb-3 text-sm md:text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${activeTab === "sparks" ? "text-amber-400 border-amber-400" : "text-slate-500 border-transparent hover:text-white"}`}
          >
            <Zap size={16} /> Sparks
          </button>
          <button
            onClick={() => setActiveTab("solidified")}
            className={`pb-3 text-sm md:text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${activeTab === "solidified" ? "text-violet-400 border-violet-400" : "text-slate-500 border-transparent hover:text-white"}`}
          >
            <BrainCircuit size={16} /> Incubator
          </button>
        </div>

        {/* TIMELINE & VIEW TOGGLE */}
        <div className="flex items-center gap-3 w-full md:w-auto min-w-0">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mask-linear-fade flex-1 min-w-0 pr-4 md:pr-0">
            <button
              onClick={() => setActivePeriod("all")}
              className={`shrink-0 px-4 py-2.5 md:px-3 md:py-1.5 rounded-full text-xs md:text-[10px] font-bold uppercase tracking-wider transition-all ${activePeriod === "all" ? "bg-white text-black shadow-lg shadow-white/20" : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"}`}
            >
              All Time
            </button>
            {timeline.map((period) => (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={`shrink-0 px-4 py-2.5 md:px-3 md:py-1.5 rounded-full text-xs md:text-[10px] font-bold uppercase tracking-wider transition-all ${activePeriod === period ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"}`}
              >
                {formatPeriod(period)}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-white/10 hidden md:block shrink-0" />

          {/* VIEW TOGGLE */}
          <div className="hidden sm:flex bg-white/5 p-1 rounded-xl border border-white/5 shadow-inner shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 md:p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white/10 text-white shadow-md" : "text-slate-500 hover:text-white"}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 md:p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white/10 text-white shadow-md" : "text-slate-500 hover:text-white"}`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {activeTab === "sparks" && (
          <div className="space-y-6 md:space-y-8 w-full">
            {/* 2. QUICK ADD BAR */}
            <form
              onSubmit={handleQuickAdd}
              className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center gap-2 focus-within:border-amber-500/50 focus-within:shadow-[0_0_30px_-5px_rgba(245,158,11,0.2)] transition-all max-w-4xl mx-auto shadow-2xl w-full"
            >
              <button
                type="button"
                onClick={() =>
                  setNoteFormat(noteFormat === "text" ? "code" : "text")
                }
                className={`p-3 md:p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 ${noteFormat === "code" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-slate-400 hover:text-white"}`}
                title="Toggle Note Format"
              >
                {noteFormat === "text" ? (
                  <Type size={20} />
                ) : (
                  <Code size={20} />
                )}
              </button>

              <input
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                placeholder={
                  noteFormat === "code"
                    ? "Paste code snippet..."
                    : "Capture thought..."
                }
                className={`flex-1 min-w-0 bg-transparent border-none text-base focus:outline-none p-3 placeholder:text-slate-600 ${noteFormat === "code" ? "font-mono text-emerald-300" : "text-slate-100"}`}
              />

              <button
                type="submit"
                disabled={!quickNote.trim()}
                className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-black px-5 py-3 md:py-2.5 rounded-xl font-black text-sm uppercase tracking-wide transition-all flex items-center gap-2 shrink-0 shadow-lg disabled:shadow-none"
              >
                <Send size={16} />{" "}
                <span className="hidden sm:inline">Save</span>
              </button>
            </form>

            {/* 3. NOTE GRID */}
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
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 w-full"
                    : "space-y-4 max-w-4xl mx-auto w-full"
                }
              >
                {filteredItems.map((item, index) => (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    disabled={sortOption !== "manual"}
                  >
                    <SparkCard
                      item={item}
                      viewMode={viewMode}
                      isManualSort={sortOption === "manual"}
                      isFirst={index === 0}
                      isLast={index === filteredItems.length - 1}
                      allSystemTags={allSystemTags}
                      onUpdateContent={onUpdateContent}
                      onUpdateTags={onUpdateTags}
                      onDelete={onDelete}
                      onManualMove={onManualMove}
                      onEdit={onEdit}
                      onToggleFavorite={() =>
                        onUpdateMetadata(item.id, {
                          ...item.metadata,
                          is_favorite: !item.metadata?.is_favorite,
                        })
                      }
                      onSolidify={() =>
                        onUpdateMetadata(item.id, {
                          ...item.metadata,
                          stage: "solidified",
                        })
                      }
                    />
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </div>
        )}

        {/* INCUBATOR TAB */}
        {activeTab === "solidified" && (
          <div className="space-y-4 max-w-4xl mx-auto mt-4 w-full">
            <SortableContext
              items={filteredItems.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4 md:space-y-5 w-full">
                {filteredItems.map((item, index) => (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    disabled={sortOption !== "manual"}
                  >
                    <IncubatorCard
                      item={item}
                      isManualSort={sortOption === "manual"}
                      isFirst={index === 0}
                      isLast={index === filteredItems.length - 1}
                      allSystemTags={allSystemTags}
                      onUpdateTitle={onUpdateTitle}
                      onUpdateContent={onUpdateContent}
                      onUpdateTags={onUpdateTags}
                      onDelete={onDelete}
                      onManualMove={onManualMove}
                      onEdit={onEdit}
                      onToggleFavorite={() =>
                        onUpdateMetadata(item.id, {
                          ...item.metadata,
                          is_favorite: !item.metadata?.is_favorite,
                        })
                      }
                      onPromote={() => onPromoteToTask(item)}
                    />
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="text-center py-20 opacity-30">
            <Sparkles size={48} className="mx-auto mb-4 text-amber-500" />
            <p className="text-sm font-bold uppercase tracking-widest text-white">
              Mind is clear. Start capturing.
            </p>
          </div>
        )}
      </DndContext>
    </div>
  );
}

// ==========================================
// COMPONENT: Spark Card
// ==========================================
function SparkCard({
  item,
  viewMode,
  isManualSort,
  isFirst,
  isLast,
  allSystemTags,
  onUpdateContent,
  onUpdateTags,
  onDelete,
  onManualMove,
  onEdit,
  onToggleFavorite,
  onSolidify,
}: any) {
  const [content, setContent] = useState(item.content || "");
  const isCode = item.title === "[CODE] Quick Note";
  const isFav = item.metadata?.is_favorite;

  const effectiveDate = item.due_date
    ? new Date(item.due_date)
    : new Date(item.created_at);
  const dateStr = effectiveDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
  const stopProp = (e: any) => e.stopPropagation();

  // THE FIX: If isManualSort is true, we apply pt-14 (mobile) or pt-12 (desktop) to make room for the handle.
  const dynamicPadding = isManualSort ? "px-5 pb-5 pt-14 md:pt-12" : "p-5";

  const baseCardStyle = `group flex flex-col bg-slate-900/40 backdrop-blur-xl border rounded-3xl relative overflow-hidden transition-all shadow-md hover:shadow-2xl hover:-translate-y-0.5 ${isFav ? "border-amber-500/50 shadow-amber-900/20" : "border-white/5"} ${viewMode === "grid" ? "h-full w-full" : "w-full"} ${dynamicPadding}`;

  return (
    <div className={baseCardStyle}>
      {/* FLOATING DRAG HANDLE */}
      {isManualSort && (
        <DragHandle className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center bg-black/95 backdrop-blur-md px-8 py-2 md:px-3 md:py-1 rounded-full border border-white/10 shadow-xl text-slate-400 active:bg-amber-500/20 active:text-amber-400 transition-all cursor-grab active:cursor-grabbing w-[160px] md:w-auto">
          {onManualMove && viewMode === "grid" && (
            <button
              disabled={isFirst}
              onPointerDown={(e) => {
                e.stopPropagation();
                onManualMove(item.id, "up");
              }}
              className="hover:text-amber-400 disabled:opacity-0 p-1"
            >
              <ArrowLeft size={14} className="md:w-3 md:h-3" />
            </button>
          )}
          <GripHorizontal
            size={20}
            className="hover:text-white mx-3 md:mx-1 md:w-4 md:h-4"
          />
          {onManualMove && viewMode === "grid" && (
            <button
              disabled={isLast}
              onPointerDown={(e) => {
                e.stopPropagation();
                onManualMove(item.id, "down");
              }}
              className="hover:text-amber-400 disabled:opacity-0 p-1"
            >
              <ArrowRight size={14} className="md:w-3 md:h-3" />
            </button>
          )}
        </DragHandle>
      )}

      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-start mb-4 gap-2 w-full">
        {/* LEFT SIDE: Date */}
        <span className="text-[9px] font-mono text-slate-500 bg-black/40 px-2 py-1 rounded-md flex items-center gap-1 border border-white/5 whitespace-nowrap shrink-0">
          <Clock size={10} className="shrink-0" />
          {dateStr}
        </span>

        {/* RIGHT SIDE: Tools */}
        <div className="flex flex-wrap gap-1.5 transition-opacity z-10 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            onPointerDown={stopProp}
            className={`p-2.5 md:p-1.5 rounded-lg transition-all ${isFav ? "text-amber-400 bg-amber-500/10 shadow-inner" : "text-slate-600 hover:text-amber-400 hover:bg-white/5"}`}
            title="Favorite"
          >
            <Star size={16} fill={isFav ? "currentColor" : "none"} />
          </button>
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              onPointerDown={stopProp}
              className="p-2.5 md:p-1.5 hover:bg-cyan-500/10 text-slate-600 hover:text-cyan-400 rounded-lg transition-colors"
              title="Edit Note"
            >
              <Edit2 size={16} />
            </button>
          )}
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="p-2.5 md:p-1.5 hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div
        className="flex-1 relative min-h-[140px] w-full"
        onPointerDown={stopProp}
      >
        {isCode ? (
          <div className="bg-black/60 rounded-xl p-4 font-mono text-xs text-emerald-400 border border-emerald-500/20 h-full shadow-inner w-full">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={() => onUpdateContent(item.id, content)}
              className="bg-transparent w-full h-full resize-none focus:outline-none scrollbar-thin scrollbar-thumb-emerald-500/20"
              placeholder="// Code snippet..."
            />
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={() => onUpdateContent(item.id, content)}
            className="bg-transparent w-full h-full resize-none text-base md:text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none leading-relaxed tracking-wide"
            placeholder="Empty note..."
          />
        )}
      </div>

      {/* FOOTER */}
      <div className="pt-4 mt-auto border-t border-white/5 flex flex-wrap justify-between items-center gap-3 w-full">
        <div
          className="flex-1 min-w-[100px] overflow-x-auto no-scrollbar mask-linear-fade pr-4"
          onPointerDown={stopProp}
        >
          <TagManager
            selectedTags={item.tags || []}
            allSystemTags={allSystemTags}
            onUpdateTags={(t) => onUpdateTags(item.id, t)}
          />
        </div>
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            onSolidify();
          }}
          className="shrink-0 flex items-center gap-1.5 text-xs md:text-[10px] font-black uppercase tracking-widest bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black px-4 md:px-3 py-2.5 md:py-1.5 rounded-xl transition-all shadow-lg"
        >
          Incubate <ArrowRightCircle size={14} />
        </button>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENT: Incubator Card (Solidified)
// ==========================================
function IncubatorCard({
  item,
  isManualSort,
  isFirst,
  isLast,
  allSystemTags,
  onUpdateTitle,
  onUpdateContent,
  onUpdateTags,
  onDelete,
  onManualMove,
  onEdit,
  onToggleFavorite,
  onPromote,
}: any) {
  const isFav = item.metadata?.is_favorite;
  const effectiveDate = item.due_date
    ? new Date(item.due_date)
    : new Date(item.created_at);
  const dateStr = effectiveDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
  const stopProp = (e: any) => e.stopPropagation();

  // THE FIX: Dynamic Padding-Top
  const dynamicPadding = isManualSort
    ? "px-5 pb-5 pt-16 md:px-6 md:pb-6 md:pt-14"
    : "p-5 md:p-6";

  return (
    <div
      className={`bg-violet-950/20 backdrop-blur-2xl border ${isFav ? "border-amber-500/50" : "border-violet-500/20"} rounded-3xl flex flex-col md:flex-row gap-5 relative overflow-hidden group shadow-xl transition-all hover:border-violet-500/40 w-full ${dynamicPadding}`}
    >
      {/* FLOATING DRAG HANDLE */}
      {isManualSort && (
        <DragHandle className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center bg-black/95 backdrop-blur-md px-10 py-2.5 md:px-4 md:py-1 rounded-full border border-white/10 shadow-xl text-slate-400 active:bg-amber-500/20 active:text-amber-400 transition-all cursor-grab active:cursor-grabbing w-[160px] md:w-auto">
          <GripHorizontal
            size={20}
            className="hover:text-white md:w-4 md:h-4"
          />
        </DragHandle>
      )}

      {/* NORMAL LAYOUT */}
      <div className="flex-1 min-w-0 space-y-4 w-full">
        {/* HEADER */}
        <div className="flex flex-wrap justify-between items-start gap-2 w-full">
          <input
            className="bg-transparent text-2xl md:text-xl font-black text-violet-100 flex-1 min-w-[150px] focus:outline-none border-b border-transparent focus:border-violet-500/50 pb-1 placeholder:text-violet-900"
            defaultValue={item.title === "Quick Note" ? "" : item.title}
            placeholder="Idea Name..."
            onBlur={(e) => onUpdateTitle(item.id, e.target.value)}
            onPointerDown={stopProp}
            onKeyDown={stopProp}
          />
          <span className="text-[9px] bg-black/40 px-2 py-1 rounded-md text-slate-500 font-mono mt-1 flex items-center gap-1 whitespace-nowrap shrink-0 border border-white/5">
            <Clock size={10} />
            {dateStr}
          </span>
        </div>

        <textarea
          className="bg-black/40 w-full rounded-2xl p-4 md:p-4 text-base md:text-sm text-slate-200 placeholder:text-slate-600 focus:text-white focus:outline-none resize-y min-h-[120px] border border-white/5 focus:border-violet-500/30 transition-all shadow-inner leading-relaxed"
          defaultValue={item.content}
          placeholder="Elaborate on your idea..."
          onBlur={(e) => onUpdateContent(item.id, e.target.value)}
          onPointerDown={stopProp}
          onKeyDown={stopProp}
        />

        <div
          className="overflow-x-auto no-scrollbar mask-linear-fade w-full"
          onPointerDown={stopProp}
        >
          <TagManager
            selectedTags={item.tags || []}
            allSystemTags={allSystemTags}
            onUpdateTags={(t) => onUpdateTags(item.id, t)}
          />
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex md:flex-col gap-3 justify-end border-t md:border-t-0 md:border-l border-white/5 pt-5 md:pt-0 md:pl-5 shrink-0 flex-wrap w-full md:w-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          onPointerDown={stopProp}
          className={`flex items-center justify-center p-4 md:p-3 rounded-xl border transition-all ${isFav ? "bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-inner" : "bg-white/5 text-slate-500 border-white/10 hover:text-amber-400"}`}
        >
          <Star size={18} fill={isFav ? "currentColor" : "none"} />
        </button>

        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            onPromote();
          }}
          className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 md:px-4 py-4 md:py-3 rounded-xl text-sm md:text-xs font-black uppercase tracking-widest transition-all shadow-lg md:ml-0 flex-1 md:flex-none text-center"
        >
          Promote
        </button>

        <div className="flex items-center gap-2 mt-auto shrink-0 flex-nowrap md:ml-0 ml-auto">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              onPointerDown={stopProp}
              className="p-4 md:p-3 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-500 hover:text-white rounded-xl flex justify-center transition-all"
            >
              <Edit2 size={18} />
            </button>
          )}

          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="p-4 md:p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl flex justify-center transition-all"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
