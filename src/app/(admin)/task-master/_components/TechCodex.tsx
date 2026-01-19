"use client";

import { useState } from "react";
import {
  Terminal,
  Save,
  Trash2,
  Copy,
  Check,
  GripVertical,
  FilterX,
  Maximize2,
  Minimize2,
  Edit2,
} from "lucide-react";
import { TaskItem, SortOption } from "./types";
import TagManager from "./TagManager";

interface TechCodexProps {
  items: TaskItem[];
  sortOption: SortOption;
  filterTags: string[];
  allSystemTags: string[];
  onUpdateContent: (id: string, content: string) => void;
  onUpdateTags: (id: string, tags: string[]) => void;
  onDelete: (id: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
  onManualMove?: (id: string, direction: "up" | "down") => void;
  onEdit?: (item: TaskItem) => void;
}

export default function TechCodex({
  items,
  sortOption,
  filterTags,
  allSystemTags,
  onUpdateContent,
  onUpdateTags,
  onDelete,
  onReorder,
  onManualMove,
  onEdit,
}: TechCodexProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

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
      // NEW ALPHABETICAL SORT
      if (sortOption === "alpha_asc") return a.title.localeCompare(b.title);
      if (sortOption === "alpha_desc") return b.title.localeCompare(a.title);

      if (sortOption === "created_desc")
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      return 0;
    });

  if (filteredItems.length === 0) {
    const isFiltered = filterTags.length > 0;
    return (
      <div className="p-12 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
        {isFiltered ? (
          <>
            <FilterX className="mx-auto text-rose-500 mb-3" size={32} />
            <p className="text-slate-400 text-sm font-medium mb-2">
              No snippets match filters.
            </p>
          </>
        ) : (
          <>
            <Terminal className="mx-auto text-slate-600 mb-3" size={32} />
            <p className="text-slate-500 text-sm italic font-medium">
              Codex clean.
            </p>
          </>
        )}
      </div>
    );
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (sortOption !== "manual") return;
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent) => {
    if (sortOption === "manual") e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (sortOption !== "manual" || !draggedId || draggedId === targetId) return;
    onReorder(draggedId, targetId);
    setDraggedId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {filteredItems.map((item) => (
        <div
          key={item.id}
          draggable={sortOption === "manual"}
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, item.id)}
          className={`transition-all duration-300 ${draggedId === item.id ? "opacity-30" : "opacity-100"
            }`}
        >
          <CodeEditor
            item={item}
            isManualSort={sortOption === "manual"}
            allSystemTags={allSystemTags}
            onUpdate={onUpdateContent}
            onUpdateTags={onUpdateTags}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      ))}
    </div>
  );
}

function CodeEditor({
  item,
  isManualSort,
  allSystemTags,
  onUpdate,
  onUpdateTags,
  onDelete,
  onEdit,
}: any) {
  const [code, setCode] = useState(item.content || "");
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // New state for fullscreen mode

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdate(item.id, code);
    setTimeout(() => setIsSaving(false), 800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group relative bg-black/40 border border-white/10 rounded-xl overflow-hidden flex flex-col md:flex-row items-stretch shadow-2xl ${isExpanded
          ? "fixed inset-4 z-50 bg-slate-950/95 backdrop-blur-xl border-emerald-500/30"
          : ""
        }`}
    >
      {/* SIDEBAR (Desktop) / TOPBAR (Mobile) */}
      <div className="w-full md:w-56 bg-white/5 border-b md:border-b-0 md:border-r border-white/5 p-4 flex flex-col justify-between shrink-0">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            {isManualSort && !isExpanded && (
              <GripVertical
                size={16}
                className="text-slate-600 cursor-grab shrink-0 hover:text-white"
              />
            )}
            <h3
              className="text-emerald-400 font-mono text-sm font-bold tracking-tight truncate w-full"
              title={item.title}
            >
              <Terminal size={12} className="inline mr-2" />
              {item.title}
            </h3>
          </div>

          <div className="pl-1">
            <TagManager
              selectedTags={item.tags || []}
              allSystemTags={allSystemTags}
              onUpdateTags={(tags) => onUpdateTags(item.id, tags)}
            />
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-white/5 justify-end md:justify-start flex-wrap">
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-emerald-400 transition-colors"
            title="Copy Code"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button
            onClick={handleSave}
            className={`p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors ${isSaving ? "text-emerald-500" : "text-slate-400 hover:text-white"
              }`}
            title="Save"
          >
            <Save size={14} />
          </button>
          <div className="flex-grow md:hidden" /> {/* Spacer for mobile */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-400 transition-colors"
            title={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-purple-400 transition-colors"
              title="Edit Title"
            >
              <Edit2 size={14} />
            </button>
          )}
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-600 hover:text-rose-400 transition-colors ml-auto md:ml-0"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* CODE AREA - HUGE REAL ESTATE */}
      <div className="flex-grow relative flex flex-col bg-slate-950">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={`
            w-full h-full bg-transparent p-6 
            text-sm font-mono leading-7 
            text-emerald-300 selection:bg-emerald-500/30 placeholder:text-slate-700
            focus:outline-none focus:bg-white/[0.01] transition-colors
            resize-none
            ${isExpanded ? "text-base" : "min-h-[300px]"}
          `}
          spellCheck={false}
          placeholder="// Initialize protocol..."
        />
        {/* Status Indicator */}
        <div className="absolute bottom-2 right-4 text-[10px] font-mono text-slate-700 pointer-events-none uppercase tracking-widest">
          {isSaving ? "SYNCING..." : "READY"}
        </div>
      </div>
    </div>
  );
}
