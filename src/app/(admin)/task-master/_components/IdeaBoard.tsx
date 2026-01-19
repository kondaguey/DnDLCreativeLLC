"use client";

import { useState } from "react";
import {
  Lightbulb,
  Zap,
  ArrowRightCircle,
  Trash2,
  BrainCircuit,
  Rocket,
  StickyNote,
  Palette,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Clock,
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
import { SortableItem } from "./SortableItem";

const LABELS = [
  {
    name: "Strategy",
    color: "bg-violet-500",
    border: "border-violet-400",
    text: "text-violet-100",
  },
  {
    name: "Design",
    color: "bg-pink-500",
    border: "border-pink-400",
    text: "text-pink-100",
  },
  {
    name: "Dev",
    color: "bg-cyan-500",
    border: "border-cyan-400",
    text: "text-cyan-100",
  },
  {
    name: "Marketing",
    color: "bg-rose-500",
    border: "border-rose-400",
    text: "text-rose-100",
  },
  {
    name: "Money",
    color: "bg-emerald-500",
    border: "border-emerald-400",
    text: "text-emerald-100",
  },
  {
    name: "Ops",
    color: "bg-slate-500",
    border: "border-slate-400",
    text: "text-slate-100",
  },
  {
    name: "Urgent",
    color: "bg-orange-500",
    border: "border-orange-400",
    text: "text-orange-100",
  },
];

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
}

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
}: IdeaBoardProps) {
  const [activeTab, setActiveTab] = useState<"sparks" | "solidified">("sparks");
  const [quickNote, setQuickNote] = useState("");

  // --- FIX: CONFIGURE SENSORS TO IGNORE SPACEBAR ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      // This disables the default "Space" key listener for dragging
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
      return true;
    })
    .sort((a, b) => {
      if (sortOption === "manual") return (a.position || 0) - (b.position || 0);
      if (sortOption === "alpha_asc") return a.title.localeCompare(b.title);
      if (sortOption === "alpha_desc") return b.title.localeCompare(a.title);
      if (sortOption === "date_asc")
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;
    onAdd("Quick Note", quickNote);
    setQuickNote("");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-4 mb-6 border-b border-white/10 px-2">
        <button
          onClick={() => setActiveTab("sparks")}
          className={`pb-3 text-xs font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${activeTab === "sparks" ? "text-amber-400 border-amber-400" : "text-slate-500 border-transparent"}`}
        >
          <Zap size={14} /> Sparks
        </button>
        <button
          onClick={() => setActiveTab("solidified")}
          className={`pb-3 text-xs font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${activeTab === "solidified" ? "text-violet-400 border-violet-400" : "text-slate-500 border-transparent"}`}
        >
          <BrainCircuit size={14} /> Incubator
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {activeTab === "sparks" && (
          <div className="space-y-6">
            <form onSubmit={handleQuickAdd} className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <StickyNote className="text-slate-500" size={20} />
              </div>
              <input
                type="text"
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                placeholder="Type a raw idea and hit Enter..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-slate-200 focus:outline-none focus:border-amber-500/50"
              />
            </form>
            <SortableContext
              items={filteredItems.map((i) => i.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map((item, index) => (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    disabled={sortOption !== "manual"}
                  >
                    <SparkCard
                      item={item}
                      isManualSort={sortOption === "manual"}
                      isFirst={index === 0}
                      isLast={index === filteredItems.length - 1}
                      allSystemTags={allSystemTags}
                      onUpdateContent={onUpdateContent}
                      onUpdateTags={onUpdateTags}
                      onDelete={onDelete}
                      onManualMove={onManualMove}
                      onSolidify={() =>
                        onUpdateMetadata(item.id, {
                          ...item.metadata,
                          stage: "solidified",
                        })
                      }
                      onSetLabel={(l: any) =>
                        onUpdateMetadata(item.id, {
                          ...item.metadata,
                          label: l,
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
          <div className="space-y-4 max-w-4xl mx-auto">
            <SortableContext
              items={filteredItems.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
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
                      onPromote={() => onPromoteToTask(item)}
                      onSetLabel={(l: any) =>
                        onUpdateMetadata(item.id, {
                          ...item.metadata,
                          label: l,
                        })
                      }
                    />
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </div>
        )}
      </DndContext>
    </div>
  );
}

// ... LabelPicker ...
function LabelPicker({ currentLabel, onSelect }: any) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded text-slate-500 hover:text-white"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {currentLabel ? (
          <span
            className={`text-[10px] font-black uppercase px-1 ${currentLabel.text}`}
          >
            {currentLabel.name}
          </span>
        ) : (
          <Palette size={14} />
        )}
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 p-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-20 grid grid-cols-2 gap-2 w-48 animate-in zoom-in-95">
            {LABELS.map((l) => (
              <button
                key={l.name}
                onClick={() => {
                  onSelect(l);
                  setIsOpen(false);
                }}
                className={`${l.color} ${l.text} text-[10px] font-bold uppercase p-2 rounded`}
              >
                {l.name}
              </button>
            ))}
            <button
              onClick={() => {
                onSelect(null);
                setIsOpen(false);
              }}
              className="col-span-2 text-[10px] p-2 bg-slate-800 rounded"
            >
              Clear
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function SparkCard({
  item,
  isManualSort,
  isFirst,
  isLast,
  allSystemTags,
  onUpdateContent,
  onUpdateTags,
  onDelete,
  onManualMove,
  onSolidify,
  onSetLabel,
}: any) {
  const [content, setContent] = useState(item.content || "");
  const currentLabel = item.metadata?.label;
  const dateStr = new Date(item.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  // Stop propagation on inputs to prevent drag interference
  const stopProp = (e: any) => e.stopPropagation();

  return (
    <div
      className={`group flex flex-col bg-amber-500/5 border ${currentLabel ? currentLabel.border : "border-amber-500/10"} hover:border-amber-500/30 rounded-xl p-4 h-full relative`}
    >
      <div className="flex justify-between items-start mb-2">
        {isManualSort && (
          <div className="flex items-center gap-1 text-slate-600">
            <GripVertical size={14} className="cursor-grab hover:text-white" />
            {onManualMove && (
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  disabled={isFirst}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onManualMove(item.id, "up");
                  }}
                  className="hover:text-amber-400 disabled:opacity-0"
                >
                  <ArrowLeft size={12} />
                </button>
                <button
                  disabled={isLast}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onManualMove(item.id, "down");
                  }}
                  className="hover:text-amber-400 disabled:opacity-0"
                >
                  <ArrowRight size={12} />
                </button>
              </div>
            )}
          </div>
        )}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 ml-auto">
          <LabelPicker currentLabel={currentLabel} onSelect={onSetLabel} />
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="p-1.5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {currentLabel && (
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${currentLabel.color} rounded-t-xl opacity-50`}
        />
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={() => onUpdateContent(item.id, content)}
        // CRITICAL: Stop propagation to prevent drag
        onPointerDown={stopProp}
        onKeyDown={stopProp}
        className="bg-transparent w-full flex-1 resize-none text-sm text-amber-100/90 focus:outline-none min-h-[80px]"
        placeholder="Empty note..."
      />
      <div className="text-[9px] text-amber-500/40 text-right font-mono mb-2">
        {dateStr}
      </div>
      <div className="pt-2 border-t border-amber-500/10 flex justify-between items-end">
        <div className="w-[60%]" onPointerDown={stopProp}>
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
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2 py-1 rounded"
        >
          Solidify <ArrowRightCircle size={12} />
        </button>
      </div>
    </div>
  );
}

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
  onPromote,
  onSetLabel,
}: any) {
  const currentLabel = item.metadata?.label;
  const dateStr = new Date(item.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
  const stopProp = (e: any) => e.stopPropagation();

  return (
    <div
      className={`bg-violet-500/5 border ${currentLabel ? currentLabel.border : "border-violet-500/10"} hover:border-violet-500/30 rounded-xl p-5 flex flex-col md:flex-row gap-5 relative overflow-hidden group`}
    >
      {currentLabel && (
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${currentLabel.color}`}
        />
      )}
      {isManualSort && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-slate-600">
          <GripVertical size={16} className="cursor-grab hover:text-white" />
          {onManualMove && (
            <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                disabled={isFirst}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onManualMove(item.id, "up");
                }}
                className="hover:text-violet-400 disabled:opacity-0"
              >
                <ArrowUp size={10} />
              </button>
              <button
                disabled={isLast}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onManualMove(item.id, "down");
                }}
                className="hover:text-violet-400 disabled:opacity-0"
              >
                <ArrowDown size={10} />
              </button>
            </div>
          )}
        </div>
      )}
      <div className={`flex-1 space-y-3 ${isManualSort ? "pl-6" : "pl-2"}`}>
        <div className="flex justify-between items-start">
          <input
            className="bg-transparent text-lg font-bold text-violet-200 w-full focus:outline-none border-b border-transparent focus:border-violet-500/30 pb-1"
            defaultValue={item.title === "Quick Note" ? "" : item.title}
            placeholder="Title..."
            onBlur={(e) => onUpdateTitle(item.id, e.target.value)}
            // CRITICAL: Stop propagation
            onPointerDown={stopProp}
            onKeyDown={stopProp}
          />
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono whitespace-nowrap ml-2 mt-1">
            <Clock size={10} /> {dateStr}
          </div>
        </div>
        <textarea
          className="bg-transparent w-full text-sm text-slate-400 focus:text-slate-200 focus:outline-none resize-y min-h-[60px]"
          defaultValue={item.content}
          placeholder="Elaborate..."
          onBlur={(e) => onUpdateContent(item.id, e.target.value)}
          // CRITICAL: Stop propagation
          onPointerDown={stopProp}
          onKeyDown={stopProp}
        />
        <div onPointerDown={stopProp}>
          <TagManager
            selectedTags={item.tags || []}
            allSystemTags={allSystemTags}
            onUpdateTags={(t) => onUpdateTags(item.id, t)}
          />
        </div>
      </div>
      <div className="flex md:flex-col gap-2 justify-end border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-4">
        <div className="flex justify-end mb-auto" onPointerDown={stopProp}>
          <LabelPicker currentLabel={currentLabel} onSelect={onSetLabel} />
        </div>
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            onPromote();
          }}
          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-4 py-2 rounded-lg text-xs font-bold uppercase"
        >
          <Rocket size={14} />
        </button>
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          className="p-2 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-lg flex justify-center"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
