"use client";

import { useState, useEffect } from "react";
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
  onUpdateTags,
  onUpdateCodexData,
  onDelete,
  onReorder,
  onManualMove,
}: TechCodexProps) {
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

  return (
    <div
      className={`relative bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl ${isExpanded ? "shadow-2xl" : "shadow-lg h-[72px] md:h-16 hover:border-white/20"}`}
    >
      {/* 1. TOP HEADER (Bulletproof Flexbox) */}
      <div
        className="w-full bg-black/40 px-4 md:px-5 h-[72px] md:h-16 flex items-center justify-between shrink-0 shadow-inner gap-3"
        onDoubleClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Left Side: Icon + Input */}
        <div className="flex-1 flex items-center gap-3 min-w-0">
          {/* DRAG HANDLE */}
          {isManualSort && (
            <DragHandle className="text-slate-600 hover:text-white cursor-grab active:cursor-grabbing shrink-0">
              <GripVertical size={20} />
            </DragHandle>
          )}

          <FileText
            size={18}
            className={`shrink-0 ${!isExpanded ? "text-slate-600" : "text-emerald-500"}`}
          />

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onPointerDown={stopProp}
            placeholder="Snippet Title"
            className={`bg-transparent text-white font-black tracking-tight focus:outline-none flex-1 min-w-0 truncate ${!isExpanded ? "text-base text-slate-300" : "text-xl md:text-2xl"}`}
          />

          {isChanged && isExpanded && (
            <button
              onClick={handleExplicitSave}
              disabled={isSaving}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shrink-0 ${isSaving
                ? "bg-slate-700 text-slate-300"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 animate-pulse"
                }`}
            >
              {isSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {isSaving ? "SAVING..." : "SAVE"}
            </button>
          )}
        </div>

        {/* Right Side: Action Controls (No Wrapping, No Shrinking) */}
        <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
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

      {/* ONLY RENDER BELOW IF EXPANDED */}
      {isExpanded && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          <div className="px-5 py-3 bg-black/20 border-t border-b border-white/5 overflow-x-auto no-scrollbar mask-linear-fade pr-4">
            <TagManager
              selectedTags={item.tags || []}
              allSystemTags={allSystemTags}
              onUpdateTags={(tags) => onUpdateTags(item.id, tags)}
            />
          </div>

          <div className="w-full bg-black/40 px-5 md:px-6 py-4 flex flex-col gap-3 border-b border-white/5 shrink-0 shadow-inner">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <MessageSquare size={14} />
              <span>Documentation / Context</span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onPointerDown={stopProp}
              placeholder="Add context, terminal commands, or instructions here..."
              className="w-full bg-transparent text-base md:text-sm text-slate-300 focus:outline-none resize-none min-h-[60px] scrollbar-thin scrollbar-thumb-slate-700 leading-relaxed"
            />
          </div>

          <div className="flex flex-col bg-[#050505] max-h-[500px]">
            <div className="h-10 bg-black/80 border-b border-white/5 px-5 md:px-6 flex items-center justify-between shrink-0 shadow-inner">
              <span className="text-[10px] text-emerald-500 font-mono font-bold flex items-center gap-1.5">
                <FileCode size={12} /> SYSTEM.CODE
              </span>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all active:scale-95 ${copied ? "text-emerald-400 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "text-slate-500 hover:text-white bg-white/5"}`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}{" "}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onPointerDown={stopProp}
              className="w-full min-h-[250px] bg-transparent p-5 md:p-6 font-mono text-base md:text-sm text-emerald-400 leading-relaxed selection:bg-emerald-500/30 placeholder:text-slate-800 focus:outline-none resize-y scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent shadow-inner"
              spellCheck={false}
              placeholder="// Paste system code here..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
