"use client";

import { useState, useMemo, useId } from "react";
import {
  Zap,
  BrainCircuit,
  Trash2,
  ArrowRightCircle,
  GripHorizontal,
  Code,
  Type,
  LayoutGrid,
  List,
  StretchVertical,
  Send,
  Sparkles,
  Star,
  Edit2,
  Archive,
  Clock,
  FlaskConical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
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
  searchQuery?: string;
  activePeriod?: string;
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
  onArchive?: (id: string) => void; // Added optional archive handler support if needed locally
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
  searchQuery = "",
  activePeriod = "all",
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
  const dndId = useId();
  const [activeTab, setActiveTab] = useState<
    "sparks" | "solidified" | "archived" | "favorites"
  >("sparks");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("grid");

  const [newItemTitle, setNewItemTitle] = useState("");
  const [quickNote, setQuickNote] = useState("");
  const [noteFormat, setNoteFormat] = useState<"text" | "code">("text");

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: {
        start: ["Enter"],
        cancel: ["Escape"],
        end: ["Enter", "Space"],
      },
    }),
  );

  // Helper for archiving items (sets status to archived)
  const handleArchive = (id: string) => {
    onUpdateMetadata(id, { status: "archived" });
  };

  const filteredItems = items
    .filter((item) => {
      if (activeTab === "favorites") {
        return item.metadata?.is_favorite && item.status !== "archived";
      }
      if (activeTab === "archived") {
        return item.status === "archived";
      }
      if (item.status === "archived") return false;

      const stage = item.metadata?.stage || "spark";
      if (activeTab === "sparks" && stage !== "spark") return false;
      if (activeTab === "solidified" && stage !== "solidified") return false;

      if (
        filterTags.length > 0 &&
        !filterTags.every((t) => item.tags?.includes(t))
      )
        return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = (item.title || "").toLowerCase().includes(query);
        const contentMatch = (item.content || "").toLowerCase().includes(query);
        if (!titleMatch && !contentMatch) return false;
      }

      if (activePeriod !== "all") {
        const date = getEffectiveDate(item);
        const itemKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (itemKey !== activePeriod) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (activeTab !== "favorites") {
        const aFav = a.metadata?.is_favorite ? 1 : 0;
        const bFav = b.metadata?.is_favorite ? 1 : 0;
        if (aFav !== bFav) return bFav - aFav;
      }

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
    if (!quickNote.trim() && !newItemTitle.trim()) return;

    let finalTitle = newItemTitle.trim();
    if (!finalTitle) {
      finalTitle = noteFormat === "code" ? "[CODE] Snippet" : "Quick Note";
    }

    onAdd(finalTitle, quickNote);

    setQuickNote("");
    setNewItemTitle("");
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
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6 md:mb-8 w-full py-2 md:bg-[#020617]/50 md:backdrop-blur-md -mx-4 px-4 md:-mx-6 md:px-6 md:border-b border-white/5">
        <div className="flex items-center justify-between gap-2 bg-black/20 p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar w-full md:flex-1 md:mr-4">
          <button
            onClick={() => setActiveTab("sparks")}
            className={`flex-1 px-3 py-2 md:px-4 text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 rounded-lg transition-all shrink-0 ${activeTab === "sparks" ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "text-slate-500 hover:text-white"}`}
          >
            <Zap
              size={14}
              fill={activeTab === "sparks" ? "currentColor" : "none"}
            />{" "}
            <span className="hidden sm:inline">Sparks</span>
          </button>
          <button
            onClick={() => setActiveTab("solidified")}
            className={`flex-1 px-3 py-2 md:px-4 text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 rounded-lg transition-all shrink-0 ${activeTab === "solidified" ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20" : "text-slate-500 hover:text-white"}`}
          >
            <FlaskConical size={14} />{" "}
            <span className="hidden sm:inline">Incubator</span>
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex-1 px-3 py-2 md:px-4 text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 rounded-lg transition-all shrink-0 ${activeTab === "favorites" ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20" : "text-slate-500 hover:text-white"}`}
          >
            <Star
              size={14}
              fill={activeTab === "favorites" ? "currentColor" : "none"}
            />{" "}
            <span className="hidden sm:inline">Favorites</span>
          </button>
          <button
            onClick={() => setActiveTab("archived")}
            className={`flex-1 px-3 py-2 md:px-4 text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 rounded-lg transition-all shrink-0 ${activeTab === "archived" ? "bg-slate-500 text-white shadow-lg shadow-slate-500/20" : "text-slate-500 hover:text-white"}`}
          >
            <Archive size={14} />{" "}
            <span className="hidden sm:inline">Archive</span>
          </button>
        </div>

        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 shadow-inner shrink-0 self-center md:self-auto">
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {activeTab === "sparks" && (
          <div className="space-y-6 md:space-y-8 w-full">
            <form
              onSubmit={handleQuickAdd}
              className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 flex flex-col gap-4 shadow-2xl shadow-black/50 w-full max-w-4xl mx-auto transition-all focus-within:border-amber-500/30 focus-within:shadow-amber-900/10"
            >
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <div className="bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20">
                  <Zap
                    size={14}
                    className="text-amber-500"
                    fill="currentColor"
                  />
                </div>
                <input
                  type="text"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder="New Idea Title..."
                  className="bg-transparent w-full text-sm md:text-base font-black text-white placeholder:text-slate-600 focus:outline-none"
                />
              </div>

              <textarea
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                placeholder={
                  noteFormat === "code"
                    ? "// Paste code snippet..."
                    : "Capture the details... (Expandable)"
                }
                className={`w-full bg-black/20 rounded-xl p-4 text-sm focus:outline-none resize-y min-h-[120px] placeholder:text-slate-600 border border-white/5 focus:border-white/10 ${noteFormat === "code" ? "font-mono text-emerald-300" : "text-slate-300"}`}
              />

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setNoteFormat(noteFormat === "text" ? "code" : "text")
                  }
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${noteFormat === "code" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-slate-400 border-white/5 hover:text-white"}`}
                >
                  {noteFormat === "text" ? (
                    <Type size={12} />
                  ) : (
                    <Code size={12} />
                  )}
                  {noteFormat === "text" ? "Text Mode" : "Code Mode"}
                </button>

                <button
                  type="submit"
                  disabled={!quickNote.trim() && !newItemTitle.trim()}
                  className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-black px-4 py-2 md:px-6 md:py-2 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg disabled:shadow-none hover:shadow-amber-500/20"
                >
                  Save Spark <Send size={12} />
                </button>
              </div>
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
                      onArchive={() =>
                        onUpdateMetadata(item.id, { status: "archived" })
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

        {activeTab !== "sparks" && (
          <div className="space-y-4 max-w-5xl mx-auto mt-4 w-full">
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
                      isManualSort={
                        sortOption === "manual" && activeTab !== "favorites"
                      }
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
                      onArchive={() =>
                        onUpdateMetadata(item.id, { status: "archived" })
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
              {activeTab === "favorites"
                ? "No favorites yet."
                : "Mind is clear. Start capturing."}
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
  allSystemTags,
  onUpdateContent,
  onUpdateTags,
  onDelete,
  onManualMove,
  onEdit,
  onToggleFavorite,
  onArchive,
  onSolidify,
}: any) {
  const [content, setContent] = useState(item.content || "");
  const isCode = item.title === "[CODE] Snippet";
  const isFav = item.metadata?.is_favorite;

  const effectiveDate = item.due_date
    ? new Date(item.due_date)
    : new Date(item.created_at);
  const dateStr = effectiveDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });

  // DYNAMIC STYLES BASED ON VIEW MODE
  let containerClasses = `group flex flex-col h-full bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden transition-all shadow-lg hover:shadow-2xl hover:-translate-y-0.5 relative w-full ${isFav ? "border-amber-500/50 shadow-amber-900/20" : "hover:border-white/20"} p-3.5 md:p-6.5`;

  if (viewMode === "compact") {
    containerClasses = `group flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/40 border border-white/5 relative w-full hover:bg-white/5 ${isFav ? "border-amber-500/30" : ""}`;
  } else if (viewMode === "list") {
    containerClasses = `group flex flex-col bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl relative w-full ${isFav ? "border-amber-500/50" : "hover:border-white/20"} p-3.5 md:p-6.5`;
  }

  return (
    <div className={containerClasses}>
      {/* FLOATING DRAG HANDLE */}
      {isManualSort && viewMode !== "compact" && (
        <DragHandle className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center bg-black/95 backdrop-blur-md px-8 py-2 md:px-3 md:py-1 rounded-full border border-white/10 shadow-xl text-slate-400 active:bg-amber-500/20 active:text-amber-400 transition-all cursor-grab active:cursor-grabbing">
          <GripHorizontal size={14} />
        </DragHandle>
      )}

      {/* --- COMPACT VIEW --- */}
      {viewMode === "compact" && (
        <div className="flex items-center w-full min-w-0 gap-2 md:gap-3">
          {isManualSort && (
            <DragHandle className="mr-1 md:mr-3 text-slate-600 hover:text-white cursor-grab active:cursor-grabbing shrink-0">
              <GripHorizontal size={14} />
            </DragHandle>
          )}
          <span className="text-[9px] md:text-[10px] font-mono text-slate-600 shrink-0 hidden sm:flex items-center gap-1 w-[70px] whitespace-nowrap">
            <Clock size={10} /> {dateStr}
          </span>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className="font-bold text-slate-200 text-xs truncate max-w-[100px] md:max-w-[150px]">
              {item.title}
            </span>
            <span className="text-slate-500 text-xs hidden sm:inline">-</span>
            <div className="flex-1 truncate text-xs text-slate-400 font-medium hidden sm:block">
              {isCode && (
                <span className="text-emerald-500 mr-2 font-mono">//</span>
              )}
              {item.content || "Empty Note"}
            </div>
          </div>
          <div className="hidden md:flex shrink-0">
            <TagManager
              selectedTags={item.tags || []}
              allSystemTags={allSystemTags}
              onUpdateTags={() => { }}
            />
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-auto bg-slate-900/50 rounded-lg p-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit && onEdit(item);
              }}
              className="p-1.5 text-slate-500 hover:text-cyan-400 transition-colors"
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="p-1.5 text-slate-500 hover:text-rose-500 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}

      {/* --- GRID & EXPANDED VIEW --- */}
      {viewMode !== "compact" && (
        <>
          {/* TITLE ROW */}
          <div className="mb-3 w-full pt-2">
            {" "}
            {/* Added pt-2 spacer for DragHandle clearance */}
            <h3 className="font-black text-lg text-slate-100 leading-tight w-full mb-2">
              {item.title}
            </h3>
            {/* ACTION ROW: DATE + ICONS */}
            <div className="flex justify-between items-center w-full">
              <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1 shrink-0">
                <Clock size={10} /> {dateStr}
              </span>

              <div className="flex gap-1 shrink-0">
                <button
                  title="Incubate"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSolidify();
                  }}
                  className="p-1.5 rounded hover:bg-violet-500/20 text-slate-600 hover:text-violet-400 transition-colors"
                >
                  <FlaskConical size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                  }}
                  className={`p-1.5 rounded hover:bg-white/10 ${isFav ? "text-amber-400" : "text-slate-600"}`}
                >
                  <Star size={16} fill={isFav ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit && onEdit(item);
                  }}
                  className="p-1.5 rounded hover:bg-cyan-500/10 text-slate-600 hover:text-cyan-400"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive && onArchive(item.id);
                  }}
                  className="p-1.5 rounded hover:bg-purple-500/10 text-slate-600 hover:text-purple-400"
                >
                  <Archive size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="p-1.5 rounded hover:bg-rose-500/10 text-slate-600 hover:text-rose-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 relative min-h-0 mb-3">
            <textarea
              value={content}
              readOnly
              className="w-full h-full bg-transparent resize-none text-xs md:text-sm text-slate-300 focus:outline-none cursor-pointer"
              placeholder="Empty..."
            />
          </div>

          <div className="pt-3 mt-auto border-t border-white/5 w-full">
            <TagManager
              selectedTags={item.tags || []}
              allSystemTags={allSystemTags}
              onUpdateTags={(t) => onUpdateTags(item.id, t)}
            />
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
  viewMode,
  isManualSort,
  allSystemTags,
  onUpdateTitle,
  onUpdateContent,
  onUpdateTags,
  onDelete,
  onEdit,
  onToggleFavorite,
  onArchive,
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

  // DYNAMIC STYLES BASED ON VIEW MODE
  let dynamicPadding = "p-6.5";
  let containerClasses = `group flex bg-violet-900/10 backdrop-blur-2xl border ${isFav ? "border-amber-500/50" : "border-violet-500/20"} rounded-3xl relative overflow-hidden transition-all shadow-xl hover:border-violet-500/40 cursor-pointer hover:bg-violet-900/20 `;

  if (viewMode === "grid") {
    containerClasses += " flex-col h-full w-full aspect-[4/5]";
    dynamicPadding = "p-5.5";
  } else if (viewMode === "compact") {
    containerClasses += " flex-row items-center w-full h-16 rounded-lg mb-1";
    dynamicPadding = "px-4.5";
  } else {
    // LIST (Expanded)
    containerClasses += " flex-col md:flex-row gap-6 w-full"; // Standard wide card
    dynamicPadding = "p-6.5";
  }

  const baseCardStyle = containerClasses + " " + dynamicPadding;

  return (
    <div className={baseCardStyle}>
      {/* --- COMPACT VIEW --- */}
      {viewMode === "compact" && (
        <>
          <div className="flex flex-col min-w-[200px]">
            <span className="font-bold text-violet-100 truncate text-sm">
              {item.title}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {dateStr}
            </span>
          </div>
          <div className="flex-1 px-4 text-xs text-slate-400 truncate hidden md:block">
            {item.content || "No description..."}
          </div>
          <TagManager
            selectedTags={item.tags || []}
            allSystemTags={allSystemTags}
            onUpdateTags={() => { }}
          />
        </>
      )}

      {/* --- GRID VIEW --- */}
      {viewMode === "grid" && (
        <>
          {/* TITLE ROW */}
          <div className="mb-3 w-full pt-2">
            <h3 className="font-black text-lg text-violet-100 leading-tight w-full mb-2">
              {item.title}
            </h3>

            {/* ACTION ROW: DATE + ICONS */}
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-[50%]">
                <span className="text-[9px] font-mono text-slate-500 shrink-0">
                  {dateStr}
                </span>
                {/* Metadata Pills */}
                {item.metadata?.incubator_metadata && (
                  <div className="flex gap-1 shrink-0">
                    {item.metadata.incubator_metadata.effort && (
                      <span
                        className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${item.metadata.incubator_metadata.effort === "high"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : item.metadata.incubator_metadata.effort === "low"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                      >
                        {item.metadata.incubator_metadata.effort}
                      </span>
                    )}
                    {item.metadata.incubator_metadata.impact && (
                      <span
                        className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${item.metadata.incubator_metadata.impact === "high"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : item.metadata.incubator_metadata.impact === "low"
                            ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                            : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                          }`}
                      >
                        {item.metadata.incubator_metadata.impact}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-1 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                  }}
                  className={`p-1.5 rounded hover:bg-white/10 ${isFav ? "text-amber-400" : "text-slate-600"}`}
                >
                  <Star size={16} fill={isFav ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit && onEdit(item);
                  }}
                  className="p-1.5 rounded hover:bg-cyan-500/10 text-slate-600 hover:text-cyan-400"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive && onArchive(item.id);
                  }}
                  className="p-1.5 rounded hover:bg-purple-500/10 text-slate-600 hover:text-purple-400"
                >
                  <Archive size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="p-1.5 rounded hover:bg-rose-500/10 text-slate-600 hover:text-rose-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 text-sm text-slate-400 overflow-hidden relative mb-4">
            <p className="line-clamp-6">{item.content}</p>
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/0 to-transparent" />
          </div>

          <div className="mt-auto pt-3 border-t border-white/5 space-y-3">
            <div className="h-6 overflow-hidden">
              <TagManager
                selectedTags={item.tags || []}
                allSystemTags={allSystemTags}
                onUpdateTags={() => { }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPromote();
                }}
                className="flex-1 bg-emerald-500 text-black hover:bg-emerald-400 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-emerald-500/20"
              >
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
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex-1 min-w-0 w-full">
                <input
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent text-lg md:text-3xl font-black text-violet-100 focus:outline-none placeholder:text-violet-900/50 border-b border-white/5 focus:border-violet-500/50 w-full pb-2"
                  defaultValue={item.title}
                  onBlur={(e) => onUpdateTitle(item.id, e.target.value)}
                />

                {/* METADATA BAR */}
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-white/5 px-2 py-1 rounded-md">
                    <Clock size={12} /> {dateStr}
                  </div>

                  {/* BEAUTIFUL METADATA BADGES */}
                  {item.metadata?.incubator_metadata && (
                    <div className="flex items-center gap-2">
                      {item.metadata.incubator_metadata.effort && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5">
                          <span className="text-[10px] uppercase font-bold text-slate-500">
                            Effort
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase ${item.metadata.incubator_metadata.effort === "high"
                              ? "text-rose-400"
                              : item.metadata.incubator_metadata.effort ===
                                "low"
                                ? "text-emerald-400"
                                : "text-amber-400"
                              }`}
                          >
                            {item.metadata.incubator_metadata.effort}
                          </span>
                        </div>
                      )}
                      {item.metadata.incubator_metadata.impact && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5">
                          <span className="text-[10px] uppercase font-bold text-slate-500">
                            Impact
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase ${item.metadata.incubator_metadata.impact === "high"
                              ? "text-emerald-400"
                              : item.metadata.incubator_metadata.impact ===
                                "low"
                                ? "text-slate-400"
                                : "text-cyan-400"
                              }`}
                          >
                            {item.metadata.incubator_metadata.impact}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-1 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                  }}
                  className={`p-3 rounded-xl border ${isFav ? "bg-amber-500/20 border-amber-500 text-amber-500" : "border-white/5 text-slate-500 hover:text-white"}`}
                >
                  <Star size={20} fill={isFav ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit && onEdit(item);
                  }}
                  className="p-3 rounded-xl border border-white/5 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive && onArchive(item.id);
                  }}
                  className="p-3 rounded-xl border border-white/5 text-slate-500 hover:text-purple-400 hover:bg-purple-500/10"
                >
                  <Archive size={20} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="p-3 rounded-xl border border-white/5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <textarea
              onClick={(e) => e.stopPropagation()}
              className="bg-black/20 w-full rounded-2xl p-6 text-base text-slate-300 resize-y min-h-[140px] focus:outline-none border border-white/5 focus:border-violet-500/30 leading-relaxed shadow-inner"
              defaultValue={item.content}
              onBlur={(e) => onUpdateContent(item.id, e.target.value)}
            />

            <div className="h-8">
              <TagManager
                selectedTags={item.tags || []}
                allSystemTags={allSystemTags}
                onUpdateTags={(t) => onUpdateTags(item.id, t)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-l border-white/5 pl-6 shrink-0 md:w-[180px] justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPromote();
              }}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex flex-col items-center gap-2 transition-all hover:-translate-y-1"
            >
              <ArrowRightCircle size={24} /> Promote
            </button>
          </div>
        </>
      )}
    </div>
  );
}
