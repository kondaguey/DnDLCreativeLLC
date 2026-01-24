"use client";

import { useState, useMemo } from "react";
import {
  Zap,
  BrainCircuit,
  Trash2,
  ArrowRightCircle,
  GripHorizontal,
  ArrowLeft,
  ArrowRight,
  Code,
  Type,
  LayoutGrid,
  List,
  StretchVertical, // Changed from List to StretchVertical for 'Expanded'
  Clock,
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
  const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("grid");

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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-32 w-full">
      {/* 1. TOP CONTROL BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8 w-full sticky top-0 z-10 py-2 bg-[#020617]/50 backdrop-blur-md -mx-4 px-4 md:-mx-6 md:px-6 border-b border-white/5">
        {/* TABS */}
        <div className="flex items-center gap-4 bg-black/20 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab("sparks")}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest flex items-center gap-2 rounded-lg transition-all ${activeTab === "sparks" ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "text-slate-500 hover:text-white"}`}
          >
            <Zap size={14} fill={activeTab === "sparks" ? "currentColor" : "none"} /> Sparks
          </button>
          <button
            onClick={() => setActiveTab("solidified")}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest flex items-center gap-2 rounded-lg transition-all ${activeTab === "solidified" ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20" : "text-slate-500 hover:text-white"}`}
          >
            <BrainCircuit size={14} /> Incubator
          </button>
        </div>

        {/* TIMELINE & VIEW TOGGLE */}
        <div className="flex items-center gap-3 w-full md:w-auto min-w-0">
          <div className="hidden sm:flex bg-black/40 p-1 rounded-xl border border-white/5 shadow-inner shrink-0">
            <button
              onClick={() => setViewMode("compact")}
              className={`p-2 rounded-lg transition-all ${viewMode === "compact" ? "bg-white/10 text-white shadow-md" : "text-slate-500 hover:text-white"}`}
              title="Thin Line (Compact)"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white/10 text-white shadow-md" : "text-slate-500 hover:text-white"}`}
              title="Expanded Line"
            >
              <StretchVertical size={16} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white/10 text-white shadow-md" : "text-slate-500 hover:text-white"}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
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
            {/* 2. QUICK ADD BAR (Only in Sparks) */}
            <form
              onSubmit={handleQuickAdd}
              className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center gap-2 focus-within:border-amber-500/50 focus-within:shadow-[0_0_30px_-5px_rgba(245,158,11,0.2)] transition-all max-w-4xl mx-auto shadow-2xl w-full sticky top-[68px] z-10 mb-8"
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
                    : "flex flex-col gap-3 w-full max-w-5xl mx-auto"
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

        {activeTab === "solidified" && (
          <div className="space-y-4 max-w-5xl mx-auto mt-4 w-full">
            <SortableContext
              items={filteredItems.map((i) => i.id)}
              strategy={
                viewMode === "grid"
                  ? rectSortingStrategy // Use Rect for Grid
                  : verticalListSortingStrategy
              }
            >
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
                    : "flex flex-col gap-3 w-full"
                }
              >
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
                      viewMode={viewMode}
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
  viewMode, // "grid" | "list" | "compact"
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

  // DYNAMIC STYLES BASED ON VIEW MODE
  let dynamicPadding = "p-5";
  let containerClasses = `group flex bg-slate-900/60 backdrop-blur-2xl border rounded-2xl relative overflow-hidden transition-all shadow-md hover:shadow-2xl hover:-translate-y-0.5 ${isFav ? "border-amber-500/50 shadow-amber-900/20" : "border-white/5"} cursor-pointer hover:bg-white/5 `;

  if (viewMode === "grid") {
    containerClasses += " flex-col h-full w-full aspect-square";
    dynamicPadding = "p-5";
  } else if (viewMode === "compact") {
    containerClasses += " flex-row items-center w-full h-14 md:h-12 border-b border-r-0 border-l-0 border-t-0 rounded-none bg-transparent hover:bg-white/5";
    // Compact: Remove rounding/borders to look like a list
    dynamicPadding = "px-4";
  } else { // LIST (Expanded)
    containerClasses += " flex-col w-full min-h-[140px]";
    dynamicPadding = "p-5";
  }

  const baseCardStyle = containerClasses + " " + dynamicPadding;

  return (
    <div className={baseCardStyle} onClick={() => onEdit && onEdit(item)}>
      {/* FLOATING DRAG HANDLE */}
      {isManualSort && viewMode !== "compact" && (
        <DragHandle className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center bg-black/95 backdrop-blur-md px-8 py-2 md:px-3 md:py-1 rounded-full border border-white/10 shadow-xl text-slate-400 active:bg-amber-500/20 active:text-amber-400 transition-all cursor-grab active:cursor-grabbing">
          <GripHorizontal size={14} />
        </DragHandle>
      )}

      {/* --- COMPACT VIEW --- */}
      {viewMode === "compact" && (
        <>
          {isManualSort && (
            <DragHandle className="mr-3 text-slate-600 hover:text-white cursor-grab active:cursor-grabbing">
              <GripHorizontal size={14} />
            </DragHandle>
          )}
          <span className="text-[10px] font-mono text-slate-600 shrink-0 w-[80px]">{dateStr}</span>
          <div className="flex-1 truncate text-xs md:text-sm text-slate-300 font-medium">
            {isCode && <span className="text-emerald-500 mr-2 font-mono">//</span>}
            {item.content || "Empty Note"}
          </div>
          <TagManager selectedTags={item.tags || []} allSystemTags={allSystemTags} onUpdateTags={() => { }} />
          <button onClick={(e) => { e.stopPropagation(); onDelete(item.id) }} className="p-2 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <Trash2 size={14} />
          </button>
        </>
      )}

      {/* --- GRID & EXPANDED VIEW --- */}
      {viewMode !== "compact" && (
        <>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[9px] font-mono text-slate-500 bg-black/40 px-2 py-1 rounded border border-white/5">{dateStr}</span>
            <div className="flex gap-1">
              <button onClick={(e) => { e.stopPropagation(); onToggleFavorite() }} className={`p-1.5 rounded hover:bg-white/10 ${isFav ? "text-amber-400" : "text-slate-600"}`}>
                <Star size={14} fill={isFav ? "currentColor" : "none"} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(item.id) }} className="p-1.5 rounded hover:bg-rose-500/10 text-slate-600 hover:text-rose-400">
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 relative min-h-0">
            <textarea
              value={content}
              readOnly
              className="w-full h-full bg-transparent resize-none text-sm text-slate-300 focus:outline-none cursor-pointer"
              placeholder="Empty..."
            />
          </div>

          <div className="pt-3 mt-auto border-t border-white/5 flex justify-between items-center">
            <div className="max-w-[70%] overflow-hidden h-6">
              <TagManager selectedTags={item.tags || []} allSystemTags={allSystemTags} onUpdateTags={(t) => onUpdateTags(item.id, t)} />
            </div>
            <button
              onPointerDown={(e) => { e.stopPropagation(); onSolidify(); }}
              className="text-[9px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-300 flex items-center gap-1"
            >
              Incubate <ArrowRightCircle size={10} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ==========================================
// COMPONENT: Incubator Card (Solidified)
// ==========================================
function IncubatorCard({
  item,
  viewMode, // "grid" | "list" | "compact"
  isManualSort,
  allSystemTags,
  onUpdateTitle,
  onUpdateContent,
  onUpdateTags,
  onDelete,
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

  // DYNAMIC STYLES BASED ON VIEW MODE
  let dynamicPadding = "p-6";
  let containerClasses = `group flex bg-violet-900/10 backdrop-blur-2xl border ${isFav ? "border-amber-500/50" : "border-violet-500/20"} rounded-3xl relative overflow-hidden transition-all shadow-xl hover:border-violet-500/40 cursor-pointer hover:bg-violet-900/20 `;

  if (viewMode === "grid") {
    containerClasses += " flex-col h-full w-full aspect-[4/5]";
    dynamicPadding = "p-5";
  } else if (viewMode === "compact") {
    containerClasses += " flex-row items-center w-full h-16 rounded-lg mb-1";
    dynamicPadding = "px-4";
  } else { // LIST (Expanded)
    containerClasses += " flex-col md:flex-row gap-6 w-full"; // Standard wide card
    dynamicPadding = "p-6";
  }

  const baseCardStyle = containerClasses + " " + dynamicPadding;

  return (
    <div className={baseCardStyle} onClick={() => onEdit && onEdit(item)}>
      {/* --- COMPACT VIEW --- */}
      {viewMode === "compact" && (
        <>
          <div className="flex flex-col min-w-[200px]">
            <span className="font-bold text-violet-100 truncate text-sm">{item.title}</span>
            <span className="text-[10px] text-slate-500 font-mono">{dateStr}</span>
          </div>
          <div className="flex-1 px-4 text-xs text-slate-400 truncate hidden md:block">
            {item.content || "No description..."}
          </div>
          <TagManager selectedTags={item.tags || []} allSystemTags={allSystemTags} onUpdateTags={() => { }} />
        </>
      )}

      {/* --- GRID VIEW --- */}
      {viewMode === "grid" && (
        <>
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-black text-lg text-violet-100 leading-tight line-clamp-2">{item.title}</h3>
            <span className="text-[9px] font-mono text-slate-500 whitespace-nowrap">{dateStr}</span>
          </div>
          <div className="flex-1 text-sm text-slate-400 overflow-hidden relative mb-4">
            <p className="line-clamp-6">{item.content}</p>
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/0 to-transparent" />
          </div>

          <div className="mt-auto pt-3 border-t border-white/5 space-y-3">
            <div className="h-6 overflow-hidden">
              <TagManager selectedTags={item.tags || []} allSystemTags={allSystemTags} onUpdateTags={() => { }} />
            </div>
            <div className="flex gap-2">
              <button onClick={(e) => { e.stopPropagation(); onPromote() }} className="flex-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                Promote
              </button>
            </div>
          </div>
        </>
      )}

      {/* --- LIST (EXPANDED) VIEW --- */}
      {viewMode === "list" && (
        <>
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <input
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent text-2xl font-black text-violet-100 focus:outline-none placeholder:text-violet-900 border-b border-transparent focus:border-violet-500/50"
                  defaultValue={item.title}
                  onBlur={(e) => onUpdateTitle(item.id, e.target.value)}
                />
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono text-slate-500">{dateStr}</span>
                  {item.metadata?.incubator_metadata?.effort && <span className="text-[9px] uppercase font-bold text-slate-600 border border-white/5 px-1.5 rounded">Effort: {item.metadata.incubator_metadata.effort}</span>}
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); onToggleFavorite() }} className={`p-2 rounded-xl border ${isFav ? "bg-amber-500/20 border-amber-500 text-amber-500" : "border-white/5 text-slate-500"}`}>
                <Star size={16} fill={isFav ? "currentColor" : "none"} />
              </button>
            </div>

            <textarea
              onClick={(e) => e.stopPropagation()}
              className="bg-black/20 w-full rounded-xl p-4 text-sm text-slate-300 resize-y min-h-[100px] focus:outline-none border border-white/5 focus:border-violet-500/30"
              defaultValue={item.content}
              onBlur={(e) => onUpdateContent(item.id, e.target.value)}
            />

            <TagManager selectedTags={item.tags || []} allSystemTags={allSystemTags} onUpdateTags={(t) => onUpdateTags(item.id, t)} />
          </div>

          <div className="flex flex-col gap-2 border-l border-white/5 pl-5 shrink-0 min-w-[140px] justify-center">
            <button onClick={(e) => { e.stopPropagation(); onPromote() }} className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-black text-xs uppercase tracking-widest shadow-lg flex flex-col items-center gap-1 transition-all">
              <ArrowRightCircle size={18} /> Promote
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(item.id) }} className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
