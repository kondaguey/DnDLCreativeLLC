"use client";

import { useState } from "react";
import {
  Share2,
  Library,
  Trash2,
  Archive,
  Calendar,
  ExternalLink,
  Edit2,
  Check,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { TaskItem, ViewType, SortOption } from "./types";
import TagManager from "./TagManager";
import { formatDate } from "./dateUtils";

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
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
  onManualMove?: (id: string, direction: "up" | "down") => void;
  onEdit?: (item: TaskItem) => void;
}

export default function ResourceGrid({
  items,
  type,
  sortOption,
  filterTags,
  allSystemTags,
  onUpdateTitle,
  onUpdateContent,
  onUpdateTags,
  onUpdateDate,
  onDelete,
  onArchive,
  onReorder,
  onManualMove,
  onEdit,
}: ResourceGridProps) {
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
      if (sortOption === "manual") return 0; // Preserves array order from DB
      if (sortOption === "alpha_asc") return a.title.localeCompare(b.title);
      // ... other sorts
      return 0;
    });

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (sortOption !== "manual") return;
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (sortOption === "manual" && draggedId && draggedId !== targetId) {
      onReorder(draggedId, targetId);
    }
    setDraggedId(null); // Ensure reset
  };

  // FIX 2: Ensure Drag End always resets state
  const handleDragEnd = () => {
    setDraggedId(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {filteredItems.map((item, index) => (
        <div
          key={item.id}
          draggable={sortOption === "manual"}
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragOver={(e) => sortOption === "manual" && e.preventDefault()}
          onDrop={(e) => handleDrop(e, item.id)}
          onDragEnd={handleDragEnd}
          className={`transition-all duration-300 ${draggedId === item.id ? "opacity-40 scale-95" : "opacity-100"
            }`}
        >
          <NoteCard
            item={item}
            type={type}
            isManualSort={sortOption === "manual"}
            isFirst={index === 0}
            isLast={index === filteredItems.length - 1}
            allSystemTags={allSystemTags}
            onUpdateTitle={onUpdateTitle}
            onUpdateContent={onUpdateContent}
            onUpdateTags={onUpdateTags}
            onDelete={onDelete}
            onArchive={onArchive}
            onManualMove={onManualMove}
            onEdit={onEdit}
          />
        </div>
      ))}
    </div>
  );
}

function NoteCard({
  item,
  type,
  isManualSort,
  isFirst,
  isLast,
  allSystemTags,
  onUpdateTitle,
  onUpdateContent,
  onUpdateTags,
  onDelete,
  onArchive,
  onManualMove,
  onEdit,
}: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(item.content || "");
  const [title, setTitle] = useState(item.title);

  const handleBlur = () => {
    if (title !== item.title) onUpdateTitle(item.id, title);
    if (content !== (item.content || "")) onUpdateContent(item.id, content);
    setIsEditing(false);
  };

  return (
    <div className="group flex flex-col h-full bg-white/5 border border-white/10 hover:border-purple-500/30 rounded-2xl overflow-hidden transition-all shadow-lg hover:shadow-purple-500/10">
      {/* CARD HEADER */}
      <div className="p-4 pb-2 flex items-start gap-3">
        <div
          className={`mt-1 p-2 rounded-lg ${type === "social_bookmark"
              ? "bg-pink-500/10 text-pink-400"
              : "bg-cyan-500/10 text-cyan-400"
            }`}
        >
          {type === "social_bookmark" ? (
            <Share2 size={16} />
          ) : (
            <Library size={16} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleBlur}
            className="bg-transparent font-bold text-slate-200 w-full focus:outline-none focus:text-white placeholder:text-slate-600 truncate"
            placeholder="Title..."
          />
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            {formatDate(item.created_at)}
          </div>
        </div>

        {/* MANUAL SORT CONTROLS (Fix #4) */}
        {isManualSort && onManualMove && (
          <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              disabled={isFirst}
              onClick={() => onManualMove(item.id, "up")}
              className="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-white disabled:opacity-20"
            >
              <ArrowUp size={12} />
            </button>
            <button
              disabled={isLast}
              onClick={() => onManualMove(item.id, "down")}
              className="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-white disabled:opacity-20"
            >
              <ArrowDown size={12} />
            </button>
          </div>
        )}
      </div>

      {/* TAGS */}
      <div className="px-4 py-2">
        <TagManager
          selectedTags={item.tags || []}
          allSystemTags={allSystemTags}
          onUpdateTags={(t) => onUpdateTags(item.id, t)}
        />
      </div>

      {/* CONTENT BODY */}
      <div className="flex-1 p-4 pt-2 min-h-[120px]">
        {isEditing ? (
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            className="w-full h-full bg-black/20 rounded p-2 text-sm text-slate-300 focus:outline-none resize-none"
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="w-full h-full text-sm text-slate-400 cursor-text whitespace-pre-wrap break-words"
          >
            {content || <span className="italic opacity-50">Add notes...</span>}
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-3 border-t border-white/5 flex justify-between items-center bg-black/20">
        <button
          onClick={() => onDelete(item.id)}
          className="text-slate-600 hover:text-rose-400 p-2 transition-colors"
        >
          <Trash2 size={14} />
        </button>
        <div className="flex gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="text-slate-600 hover:text-cyan-400 p-2 transition-colors"
              title="Edit"
            >
              <Edit2 size={14} />
            </button>
          )}
          <button
            onClick={() => onArchive(item.id)}
            className="text-slate-600 hover:text-purple-400 p-2 transition-colors"
          >
            <Archive size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
