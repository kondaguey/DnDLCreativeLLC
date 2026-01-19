"use client";

import { useState, useEffect } from "react";
import {
  Terminal,
  Save,
  Trash2,
  Copy,
  Check,
  FilterX,
  Maximize2,
  Minimize2,
  Edit2,
  FileCode,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
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

  // Basic Drag Handlers (Kept for compatibility)
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
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {filteredItems.map((item, index) => (
        <div
          key={item.id}
          draggable={sortOption === "manual"}
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, item.id)}
          className={`transition-all duration-300 ${
            draggedId === item.id ? "opacity-30" : "opacity-100"
          }`}
        >
          <CodeEditor
            item={item}
            isManualSort={sortOption === "manual"}
            isFirst={index === 0}
            isLast={index === filteredItems.length - 1}
            allSystemTags={allSystemTags}
            onUpdate={onUpdateContent}
            onUpdateTags={onUpdateTags}
            onDelete={onDelete}
            onManualMove={onManualMove}
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
  isFirst,
  isLast,
  allSystemTags,
  onUpdate,
  onUpdateTags,
  onDelete,
  onManualMove,
  onEdit,
}: any) {
  const [code, setCode] = useState(item.content || "");
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // View States: "normal" | "minimized" | "maximized"
  const [viewState, setViewState] = useState<
    "normal" | "minimized" | "maximized"
  >("normal");

  // Sync state
  useEffect(() => {
    setCode(item.content || "");
  }, [item.content]);

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

  const toggleMinimize = () => {
    setViewState((prev) => (prev === "minimized" ? "normal" : "minimized"));
  };

  const toggleMaximize = () => {
    setViewState((prev) => (prev === "maximized" ? "normal" : "maximized"));
  };

  // Container Styles
  const containerClasses = {
    normal:
      "relative bg-black/40 border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-2xl hover:border-white/20 transition-all duration-300",
    minimized:
      "relative bg-black/40 border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-sm opacity-75 hover:opacity-100 transition-all duration-300",
    maximized:
      "fixed inset-4 z-50 bg-slate-950/95 backdrop-blur-xl border border-emerald-500/30 rounded-xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200",
  }[viewState];

  return (
    <div className={containerClasses}>
      {/* --- TOP SECTION: CODE SNIPPET --- */}
      <div
        className={`w-full flex flex-col bg-slate-950 border-b border-white/10 relative group/code transition-all duration-300 ${
          viewState === "maximized"
            ? "flex-1" // Fill screen in max
            : viewState === "minimized"
              ? "h-10" // Just the bar in min
              : "min-h-[150px]" // <--- HERE IS THE FIX: 50% HEIGHT (was 300px)
        }`}
      >
        {/* Code Toolbar / Header */}
        <div className="h-10 bg-white/[0.02] border-b border-white/5 flex items-center justify-between px-3 shrink-0 select-none">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono uppercase">
            {/* MANUAL SORT ARROWS - Only visible in normal/minimized state */}
            {isManualSort && onManualMove && viewState !== "maximized" && (
              <div className="flex flex-col gap-0.5 mr-2 opacity-50 hover:opacity-100 transition-opacity">
                <button
                  disabled={isFirst}
                  onClick={() => onManualMove(item.id, "up")}
                  className="text-slate-500 hover:text-white disabled:opacity-20 p-0.5 hover:bg-white/10 rounded"
                >
                  <ArrowUp size={8} />
                </button>
                <button
                  disabled={isLast}
                  onClick={() => onManualMove(item.id, "down")}
                  className="text-slate-500 hover:text-white disabled:opacity-20 p-0.5 hover:bg-white/10 rounded"
                >
                  <ArrowDown size={8} />
                </button>
              </div>
            )}

            <FileCode
              size={14}
              className={
                viewState === "minimized"
                  ? "text-slate-600"
                  : "text-emerald-500"
              }
            />
            <span
              className={
                viewState === "minimized" ? "text-slate-400 font-bold" : ""
              }
            >
              {viewState === "minimized" ? item.title : "Exec"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Only show copy/save if NOT minimized */}
            {viewState !== "minimized" && (
              <>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono font-medium transition-all ${
                    copied
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                      : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {copied ? <Check size={10} /> : <Copy size={10} />}
                  <span>{copied ? "COPIED" : "COPY"}</span>
                </button>

                <button
                  onClick={handleSave}
                  className={`p-1 rounded border transition-colors ${
                    isSaving
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                  title="Save Code"
                >
                  <Save size={12} />
                </button>
              </>
            )}

            <button
              onClick={toggleMinimize}
              className="p-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-cyan-400 hover:bg-white/10 transition-colors"
              title={viewState === "minimized" ? "Restore" : "Minimize"}
            >
              {viewState === "minimized" ? (
                <ChevronDown size={12} />
              ) : (
                <ChevronUp size={12} />
              )}
            </button>

            <button
              onClick={toggleMaximize}
              className="p-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-cyan-400 hover:bg-white/10 transition-colors"
              title={
                viewState === "maximized" ? "Restore Window" : "Fullscreen"
              }
            >
              {viewState === "maximized" ? (
                <Minimize2 size={12} />
              ) : (
                <Maximize2 size={12} />
              )}
            </button>
          </div>
        </div>

        {/* The Actual Code Input - HIDDEN if minimized */}
        {viewState !== "minimized" && (
          <>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`
                    w-full flex-1 bg-[#0B0C10] p-4
                    font-mono leading-relaxed
                    text-emerald-300 selection:bg-emerald-500/30 placeholder:text-slate-800
                    focus:outline-none focus:bg-[#0F1115] transition-colors
                    resize-none scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent
                    ${viewState === "maximized" ? "text-base h-full" : "text-sm"}
                `}
              spellCheck={false}
              placeholder="// System instruction..."
            />

            {/* Status Bar */}
            <div className="h-5 bg-[#0B0C10] border-t border-white/5 px-3 flex items-center justify-end shrink-0">
              <span
                className={`text-[10px] font-mono ${
                  isSaving ? "text-emerald-500 animate-pulse" : "text-slate-700"
                }`}
              >
                {isSaving ? "SYNCING..." : "READY"}
              </span>
            </div>
          </>
        )}
      </div>

      {/* --- BOTTOM SECTION: NOTES & META --- */}
      {/* Hidden entirely when minimized */}
      {viewState !== "minimized" && (
        <div className="w-full bg-slate-900/50 p-4 flex flex-col gap-4 shrink-0">
          {/* Title Row */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <h3 className="text-emerald-400 font-mono text-sm font-bold tracking-tight">
                {item.title}
              </h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                Notes & Metadata
              </p>
            </div>

            {/* Actions (Edit/Delete) */}
            <div className="flex gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(item)}
                  className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-500 hover:text-purple-400 transition-colors"
                  title="Edit Title"
                >
                  <Edit2 size={14} />
                </button>
              )}
              <button
                onClick={() => onDelete(item.id)}
                className="p-1.5 rounded-md bg-white/5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                title="Delete Snippet"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Tags Row */}
          <div>
            <TagManager
              selectedTags={item.tags || []}
              allSystemTags={allSystemTags}
              onUpdateTags={(tags) => onUpdateTags(item.id, tags)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
