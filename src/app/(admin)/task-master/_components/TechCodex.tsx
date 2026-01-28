"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Terminal,
  Save,
  Trash2,
  Copy,
  Check,
  FilterX,
  FileCode,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  FileText,
  MessageSquare,
  Loader2,
  GripVertical,
  GripHorizontal,
  Search, // <--- Added Search icon
  X, // <--- Added X icon
} from "lucide-react";
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
import { SortableItem, DragHandle } from "./SortableItem";
import { TaskItem, SortOption } from "./types";
import TagManager from "./TagManager";

interface TechCodexProps {
  items: TaskItem[];
  sortOption: SortOption;
  filterTags: string[];
  allSystemTags: string[];
  searchQuery?: string; // Global search from FilterBar
  onUpdateTags: (id: string, tags: string[]) => void;
  onUpdateCodexData: (
    id: string,
    title: string,
    content: string,
    notes: string,
  ) => void;
  onDelete: (id: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
  onManualMove?: (id: string, direction: "up" | "down") => void;
}

export default function TechCodex({
  items,
  sortOption,
  filterTags,
  allSystemTags,
  searchQuery = "", // Use global search
  onUpdateTags,
  onUpdateCodexData,
  onDelete,
  onReorder,
  onManualMove,
}: TechCodexProps) {
  // LOCAL SEARCH STATE REMOVED

  const filteredItems = items
    .filter((item) => {
      if (item.status === "archived") return false;
      if (
        filterTags.length > 0 &&
        !filterTags.every((t) => item.tags?.includes(t))
      )
        return false;

      // SEARCH FILTER
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = (item.title || "").toLowerCase().includes(query);
        const codeMatch = (item.content || "").toLowerCase().includes(query);
        const notesMatch = (item.metadata?.notes || "").toLowerCase().includes(query);
        if (!titleMatch && !codeMatch && !notesMatch) return false;
      }

      return true;
    })
    .sort((a, b) => {
      // 1. STRICT MANUAL SORT (Uses exact database position)
      if (sortOption === "manual") {
        const posDiff = (a.position || 0) - (b.position || 0);
        if (posDiff !== 0) return posDiff;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      // 2. ALPHABETICAL
      if (sortOption === "alpha_asc")
        return (a.title || "").localeCompare(b.title || "");
      if (sortOption === "alpha_desc")
        return (b.title || "").localeCompare(a.title || "");

      // 3. NEWEST FIRST (Fallback)
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  if (filteredItems.length === 0) {
    const isFiltered = filterTags.length > 0;
    return (
      <div className="text-center py-20 opacity-30 animate-in fade-in zoom-in-95">
        {isFiltered ? (
          <>
            <FilterX className="mx-auto text-rose-500 mb-4" size={48} />
            <p className="text-sm font-bold uppercase tracking-widest text-white">
              No snippets match filters.
            </p>
          </>
        ) : (
          <>
            <Terminal className="mx-auto text-emerald-500 mb-4" size={48} />
            <p className="text-sm font-bold uppercase tracking-widest text-white">
              Codex clean. Paste a system prompt.
            </p>
          </>
        )}
      </div>
    );
  }

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={filteredItems.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4 md:space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-20 max-w-4xl mx-auto w-full">

          {filteredItems.map((item, index) => (
            <SortableItem
              key={item.id}
              id={item.id}
              disabled={sortOption !== "manual"}
            >
              <CodexCard
                item={item}
                isManualSort={sortOption === "manual"}
                isFirst={index === 0}
                isLast={index === filteredItems.length - 1}
                allSystemTags={allSystemTags}
                onUpdateTags={onUpdateTags}
                onUpdateCodexData={onUpdateCodexData}
                onDelete={onDelete}
                onManualMove={onManualMove}
              />
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function CodexCard({
  item,
  isManualSort,
  isFirst,
  isLast,
  allSystemTags,
  onUpdateTags,
  onUpdateCodexData,
  onDelete,
  onManualMove,
}: any) {
  const [title, setTitle] = useState(item.title || "");
  const [code, setCode] = useState(item.content || "");
  const [notes, setNotes] = useState(item.metadata?.notes || "");

  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Resize State for Split Pane (Notes Height %)
  const [splitRatio, setSplitRatio] = useState(30); // Default 30% notes, 70% code
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingSplit = useRef(false);

  // Auto-save refs to prevent stale closures if we use debouncing (optional, keeping explicit save for now)
  const isChanged =
    title !== (item.title || "") ||
    code !== (item.content || "") ||
    notes !== (item.metadata?.notes || "");

  useEffect(() => {
    setTitle(item.title || "");
  }, [item.title]);
  useEffect(() => {
    setCode(item.content || "");
  }, [item.content]);
  useEffect(() => {
    setNotes(item.metadata?.notes || "");
  }, [item.metadata]);

  // --- RESIZE HANDLERS ---
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingSplit.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingSplit.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const percentage = (relativeY / rect.height) * 100;
      // Clamp between 10% and 90%
      const newRatio = Math.max(10, Math.min(90, percentage));
      setSplitRatio(newRatio);
    },
    [],
  );

  const handleMouseUp = useCallback(() => {
    isDraggingSplit.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  // --- ACTIONS ---
  const handleExplicitSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaving(true);
    await onUpdateCodexData(item.id, title, code, notes);
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stopProp = (e: any) => e.stopPropagation();

  // --- RENDER CONTENT (Split Pane) ---
  const renderSplitPane = () => (
    <div
      ref={containerRef}
      className="flex flex-col w-full h-full relative"
    >
      {/* 1. NOTES SECTION (Resizable Height) */}
      <div
        style={{ height: `${splitRatio}%` }}
        className="flex flex-col min-h-[100px] shrink-0"
      >
        <div className="px-5 py-3 bg-black/20 border-t border-b border-white/5 overflow-x-auto no-scrollbar mask-linear-fade pr-4 text-xs shrink-0">
          <TagManager
            selectedTags={item.tags || []}
            allSystemTags={allSystemTags}
            onUpdateTags={(tags) => onUpdateTags(item.id, tags)}
          />
        </div>

        <div className="flex-1 bg-black/40 px-5 md:px-6 py-4 flex flex-col gap-3 min-h-0 border-b border-white/5">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">
            <MessageSquare size={14} />
            <span>Context & Notes</span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onPointerDown={stopProp}
            placeholder="Add context..."
            className="w-full h-full bg-transparent text-base md:text-sm text-slate-300 focus:outline-none resize-none scrollbar-thin scrollbar-thumb-slate-700 leading-relaxed"
          />
        </div>
      </div>

      {/* 2. RESIZE HANDLE */}
      <div
        onMouseDown={handleMouseDown}
        className="h-2 bg-black/60 border-y border-white/5 cursor-row-resize flex items-center justify-center hover:bg-emerald-500/20 transition-colors shrink-0 z-10"
      >
        <GripHorizontal size={12} className="text-slate-600" />
      </div>

      {/* 3. CODE SECTION (Remaining Height) */}
      <div className="flex-1 flex flex-col min-h-[100px] bg-[#0c0c0c] relative overflow-hidden">
        <div className="h-10 bg-black/80 border-b border-white/5 px-5 md:px-6 flex items-center justify-between shrink-0 shadow-inner">
          <span className="text-[10px] text-emerald-500 font-mono font-bold flex items-center gap-1.5">
            <FileCode size={12} /> SYSTEM.CODE
          </span>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all active:scale-95 ${copied
              ? "text-emerald-400 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              : "text-slate-500 hover:text-white bg-white/5"
              }`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}{" "}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onPointerDown={stopProp}
          className="flex-1 w-full bg-transparent p-5 md:p-6 font-mono text-base md:text-sm text-emerald-400 leading-relaxed selection:bg-emerald-500/30 placeholder:text-slate-800 focus:outline-none resize-none scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent shadow-inner"
          spellCheck={false}
          placeholder="// Paste system code here..."
        />
      </div>
    </div>
  );

  return (
    <div
      className={`relative bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl ${isExpanded
        ? "shadow-2xl h-[600px]" // Fixed height when expanded to allow internal resizing
        : "shadow-lg h-[120px] md:h-16 hover:border-white/20"
        }`}
    >
      <div
        className="w-full bg-black/40 px-4 md:px-5 py-3 md:py-0 min-h-[90px] md:min-h-16 h-auto md:h-16 flex flex-col md:flex-row items-stretch md:items-center justify-between shrink-0 shadow-inner gap-3 z-20 relative"
        onDoubleClick={() => setIsExpanded(!isExpanded)}
      >
        {/* TOP ROW (Mobile): Title & Icon */}
        <div className="flex-1 flex items-center gap-3 min-w-0 w-full">
          {/* Mobile Drag Handle (Only visible here on mobile if sortable) */}
          <div className="md:hidden">
            {isManualSort && (
              <DragHandle className="text-slate-600 hover:text-white cursor-grab active:cursor-grabbing shrink-0">
                <GripVertical size={20} />
              </DragHandle>
            )}
          </div>

          {/* Desktop Drag Handle (Hidden on mobile to save space? Or keep it?) 
              Actually user wants title expanded. Let's keep icon/drag on left of title.
          */}
          <div className="hidden md:block">
            {isManualSort && (
              <DragHandle className="text-slate-600 hover:text-white cursor-grab active:cursor-grabbing shrink-0">
                <GripVertical size={20} />
              </DragHandle>
            )}
          </div>

          <FileText
            size={18}
            className={`shrink-0 ${!isExpanded ? "text-slate-600" : "text-emerald-500"
              }`}
          />

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onPointerDown={stopProp}
            placeholder="Snippet Title"
            className={`bg-transparent text-white font-black tracking-tight focus:outline-none flex-1 min-w-0 truncate ${!isExpanded ? "text-base text-slate-300" : "text-xl md:text-2xl"
              }`}
          />
        </div>

        {/* BOTTOM ROW (Mobile): Controls & Save */}
        <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto pt-1 md:pt-0 border-t border-white/5 md:border-t-0">

          {/* Save Button (Moved here on mobile effectively, or just kept in flow) */}
          {isChanged ? (
            <button
              onClick={handleExplicitSave}
              disabled={isSaving}
              className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shrink-0 flex-1 md:flex-none ${isSaving
                ? "bg-slate-700 text-slate-300"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 animate-pulse"
                }`}
            >
              {isSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              <span className="inline">{isSaving ? "SAVING..." : "SAVE"}</span>
            </button>
          ) : <div className="flex-1 md:hidden"></div> /* Spacer for mobile layout balance if no save button */}

          {/* Right Side Controls */}
          <div className="flex items-center gap-1.5 shrink-0 flex-nowrap ml-auto">
            {/* UP/DOWN ARROWS */}
            {isManualSort && onManualMove && (
              <div className="flex items-center bg-white/5 rounded-xl border border-white/10 shadow-inner mr-1">
                <button
                  disabled={isFirst}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onManualMove(item.id, "up");
                  }}
                  className="p-2 md:p-1.5 text-slate-500 hover:text-white disabled:opacity-20 transition-all active:scale-95"
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
                  className="p-2 md:p-1.5 text-slate-500 hover:text-white disabled:opacity-20 transition-all active:scale-95"
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
              className="p-3 md:p-2 rounded-xl text-slate-600 hover:text-rose-400 hover:bg-white/5 transition-colors"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>

            <div className="w-px h-6 bg-white/10 mx-1 shrink-0"></div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-3 md:p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="flex-1 min-h-0 animate-in fade-in slide-in-from-top-2 duration-300 flex flex-col">
          {renderSplitPane()}
        </div>
      )}
    </div>
  );
}
