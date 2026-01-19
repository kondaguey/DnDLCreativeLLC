"use client";

import { useState } from "react";
import {
  Bug,
  Lightbulb,
  Wrench,
  GripVertical,
  CheckCircle2,
  Circle,
  Trash2,
  AlertTriangle,
  Archive,
  Edit2,
} from "lucide-react";
import styles from "../task-master.module.css";
import { TaskItem, SortOption } from "./types";

interface LedgerViewProps {
  items: TaskItem[];
  sortOption: SortOption;
  filterTags: string[]; // (Tags can be reused for specific versions or modules)
  onUpdateMetadata: (id: string, metadata: any) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
  onArchive: (id: string) => void;
  onManualMove?: (id: string, direction: "up" | "down") => void;
  onEdit?: (item: TaskItem) => void;
}

export default function LedgerView({
  items,
  sortOption,
  filterTags,
  onUpdateMetadata,
  onUpdateTitle,
  onDelete,
  onToggleStatus,
  onReorder,
  onArchive,
  onManualMove,
  onEdit,
}: LedgerViewProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const filteredItems = items
    .filter((item) => {
      if (item.status === "archived") return false;
      // Optional: Filter by 'app_name' using filterTags if you wanted to implement that later
      return true;
    })
    .sort((a, b) => {
      if (sortOption === "manual") return 0;
      // Sort by priority logic could go here, for now standard sorts
      if (sortOption === "created_desc")
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      return 0;
    });

  if (filteredItems.length === 0)
    return (
      <div className="p-12 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
        <Bug className="mx-auto text-slate-600 mb-3" size={32} />
        <p className="text-slate-500 italic">
          No open tickets. Systems nominal.
        </p>
      </div>
    );

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
    if (sortOption === "manual" && draggedId && draggedId !== targetId) {
      onReorder(draggedId, targetId);
      setDraggedId(null);
    }
  };

  return (
    <div className="space-y-3 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {filteredItems.map((item) => (
        <div
          key={item.id}
          draggable={sortOption === "manual"}
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, item.id)}
          className={`transition-all duration-300 ${draggedId === item.id ? "opacity-40 scale-95" : "opacity-100"
            }`}
        >
          <TicketCard
            item={item}
            isManualSort={sortOption === "manual"}
            onUpdateMetadata={onUpdateMetadata}
            onUpdateTitle={onUpdateTitle}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            onArchive={onArchive}
            onEdit={onEdit}
          />
        </div>
      ))}
    </div>
  );
}

// --- TICKET CARD ---
function TicketCard({
  item,
  isManualSort,
  onUpdateMetadata,
  onUpdateTitle,
  onDelete,
  onToggleStatus,
  onArchive,
  onEdit,
}: any) {
  const meta = item.metadata || {};
  const [title, setTitle] = useState(item.title);

  // Local State for Selectors
  const appName = meta.app_name || "General";
  const type = meta.ticket_type || "bug";
  const priority = meta.priority || "normal";

  const handleMetaChange = (field: string, value: string) => {
    onUpdateMetadata(item.id, { ...meta, [field]: value });
  };

  // Visual Configs
  const typeConfig = {
    bug: {
      icon: Bug,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
    feature: {
      icon: Lightbulb,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
    refactor: {
      icon: Wrench,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
  }[type as "bug" | "feature" | "refactor"] || {
    icon: Bug,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
  };

  const Icon = typeConfig.icon;
  const isCompleted = item.status === "completed";

  return (
    <div
      className={`${styles.itemCard
        } relative flex flex-col md:flex-row gap-4 !p-4 !border-l-4 !border-l-${priority === "critical"
          ? "rose-500"
          : priority === "high"
            ? "orange-500"
            : "transparent"
        } ${isCompleted ? "opacity-60 grayscale" : ""}`}
    >
      {/* LEFT: STATUS & GRIP */}
      <div className="flex flex-row md:flex-col items-center gap-3 shrink-0">
        {isManualSort && (
          <GripVertical
            size={16}
            className="text-slate-700 cursor-grab hover:text-white"
          />
        )}

        <button
          onClick={() => onToggleStatus(item.id, item.status)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted
              ? "bg-emerald-500 border-emerald-500 text-slate-900"
              : "border-slate-600 hover:border-emerald-500 text-transparent"
            }`}
        >
          <CheckCircle2 size={14} />
        </button>
      </div>

      {/* CENTER: CONTENT */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {/* TYPE BADGE */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${typeConfig.bg} ${typeConfig.color} ${typeConfig.border}`}
          >
            <Icon size={10} /> {type}
          </div>

          {/* PRIORITY BADGE (Only if not normal) */}
          {priority !== "normal" && priority !== "low" && (
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border bg-black/40 ${priority === "critical"
                  ? "text-rose-500 border-rose-500"
                  : "text-orange-500 border-orange-500"
                }`}
            >
              <AlertTriangle size={10} /> {priority}
            </div>
          )}
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            if (title !== item.title) onUpdateTitle(item.id, title);
          }}
          className={`bg-transparent text-base font-bold w-full focus:outline-none focus:border-b focus:border-white/20 transition-colors ${isCompleted ? "text-slate-500 line-through" : "text-slate-200"
            }`}
        />

        {/* CONTROLS ROW */}
        <div className="flex flex-wrap gap-2 mt-1">
          {/* APP SELECTOR */}
          <select
            value={appName}
            onChange={(e) => handleMetaChange("app_name", e.target.value)}
            className="bg-black/20 text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-white/10 rounded px-2 py-1 focus:outline-none focus:border-purple-500"
          >
            <option value="General">General</option>
            <option value="DnDL Website">DnDL Website</option>
            <option value="DnDLCreative Website">DnDLCreative Webapp</option>
            <option value="CineSonic Website/App">CineSonic Website/App</option>
          </select>

          {/* TYPE SELECTOR */}
          <select
            value={type}
            onChange={(e) => handleMetaChange("ticket_type", e.target.value)}
            className="bg-black/20 text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-white/10 rounded px-2 py-1 focus:outline-none focus:border-purple-500"
          >
            <option value="bug">Bug Report</option>
            <option value="feature">New Feature</option>
            <option value="refactor">Tech Debt</option>
          </select>

          {/* PRIORITY SELECTOR */}
          <select
            value={priority}
            onChange={(e) => handleMetaChange("priority", e.target.value)}
            className="bg-black/20 text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-white/10 rounded px-2 py-1 focus:outline-none focus:border-purple-500"
          >
            <option value="low">Low Priority</option>
            <option value="normal">Normal</option>
            <option value="high">High Priority</option>
            <option value="critical">CRITICAL</option>
          </select>
        </div>
      </div>

      {/* RIGHT: ACTIONS */}
      <div className="flex flex-row md:flex-col gap-1 items-center justify-end md:justify-start pl-0 md:pl-4 md:border-l md:border-white/5">
        <button
          onClick={() => onArchive(item.id)}
          className="p-2 rounded hover:bg-white/10 text-slate-600 hover:text-purple-400 transition-colors"
          title="Archive"
        >
          <Archive size={16} />
        </button>
        {onEdit && (
          <button
            onClick={() => onEdit(item)}
            className="p-2 rounded hover:bg-white/10 text-slate-600 hover:text-cyan-400 transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
        )}
        <button
          onClick={() => onDelete(item.id)}
          className="p-2 rounded hover:bg-white/10 text-slate-600 hover:text-rose-400 transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
