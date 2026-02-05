"use client";

import { useState, useEffect } from "react";
import {
  X,
  Save,
  Loader2,
  CalendarDays,
  FileText,
  BrainCircuit,
  Star,
  Zap,
  BarChart2,
  AlertCircle,
  ArrowRightCircle,
  Archive,
  FlaskConical,
} from "lucide-react";
import { TaskItem } from "../utils/types";
import { EditableFields } from "../core/NotificationUI";

interface IdeaDetailModalProps {
  isOpen: boolean;
  item: TaskItem;
  allSystemTags: string[];
  TagManagerComponent: any;
  onSave: (id: string, fields: EditableFields) => Promise<void>;
  onClose: () => void;
  onPromote: (item: TaskItem) => void;
}

export default function IdeaDetailModal({
  isOpen,
  item,
  allSystemTags,
  TagManagerComponent,
  onSave,
  onClose,
  onPromote,
}: IdeaDetailModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [status, setStatus] = useState("active"); // Track local status for Archive toggle
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (item && isOpen) {
      setTitle(item.title || "");
      setContent(item.content || "");
      setTags(item.tags || []);
      setMetadata(item.metadata || {});
      setStatus(item.status || "active");

      const effectiveDate = item.due_date
        ? item.due_date
        : item.created_at || new Date().toISOString();
      setDueDate(effectiveDate.split("T")[0]);
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(item.id, {
      title,
      content,
      tags,
      metadata,
      status, // Save the updated status
      due_date: dueDate || null,
    });
    setIsSaving(false);
    onClose();
  };

  const updateMeta = (key: string, value: any) => {
    setMetadata((prev) => ({ ...prev, [key]: value }));
  };

  const updateIncubatorMeta = (key: string, value: any) => {
    setMetadata((prev) => ({
      ...prev,
      incubator_metadata: {
        ...(prev.incubator_metadata || {}),
        [key]: value,
      },
    }));
  };

  const effort = metadata.incubator_metadata?.effort || "medium";
  const impact = metadata.incubator_metadata?.impact || "medium";
  const stage = metadata.stage || "spark";
  const isFav = metadata.is_favorite || false;
  const isArchived = status === "archived";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-4">
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative w-full h-full md:h-auto md:max-w-5xl md:max-h-[92vh] bg-[#0c0c0c] md:border md:border-white/10 md:rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="p-4 md:p-6 border-b border-white/5 bg-white/5 pt-12 md:pt-6 shrink-0 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                The Idea Lab
              </span>
              {isArchived ? (
                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <Archive size={10} /> Archived
                </span>
              ) : stage === "spark" ? (
                <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                  <Zap size={10} fill="currentColor" /> Spark Phase
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                  <BrainCircuit size={10} /> Incubating
                </span>
              )}
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Idea Title..."
              className={`w-full bg-transparent text-2xl md:text-4xl font-black placeholder:text-slate-700 focus:outline-none leading-tight ${isArchived ? "text-slate-500 line-through" : "text-white"}`}
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5 bg-[#0c0c0c]">
          {/* LEFT: CONTENT EDITOR */}
          <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 min-h-[50vh]">
            <div className="space-y-2 flex-1 flex flex-col">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                <FileText size={14} /> Description & Notes
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Flesh out your idea here. What's the core concept? What are the requirements?"
                className="w-full flex-1 bg-transparent text-lg text-slate-200 placeholder:text-slate-800 focus:outline-none resize-none leading-relaxed"
                autoFocus
              />
            </div>

            {/* TAGS */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                Taxonomy
              </label>
              <div className="p-2 border border-white/5 rounded-xl bg-black/20">
                <TagManagerComponent
                  selectedTags={tags}
                  allSystemTags={allSystemTags}
                  onUpdateTags={setTags}
                />
              </div>
            </div>
          </div>

          {/* RIGHT: METADATA MATRIX */}
          <div className="w-full md:w-[320px] bg-[#111] p-6 space-y-8 shrink-0 overflow-y-auto">
            {/* DATE EDIT FEATURE */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                <CalendarDays size={14} /> Timeline Date
              </label>
              <div className="relative group">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-violet-500 transition-colors shadow-inner uppercase tracking-wide"
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>

            <div className="h-px bg-white/5 w-full" />

            {/* NEW: STATUS & ACTIONS GRID */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                Status & Actions
              </label>
              <div className="grid grid-cols-2 gap-2">
                {/* 1. BACK TO IDEA / SPARK */}
                <button
                  onClick={() => {
                    updateMeta("stage", "spark");
                    setStatus("active");
                  }}
                  disabled={stage === "spark" && !isArchived}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${stage === "spark" && !isArchived
                    ? "bg-amber-500 text-black border-amber-500 opacity-100 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    : "bg-white/5 border-transparent text-slate-500 hover:bg-white/10 hover:text-amber-400"
                    }`}
                >
                  <Zap
                    size={20}
                    fill={
                      stage === "spark" && !isArchived ? "currentColor" : "none"
                    }
                  />
                  <span className="text-[10px] font-black uppercase">
                    {stage === "spark" && !isArchived
                      ? "Current Stage"
                      : "Revert to Idea"}
                  </span>
                </button>

                {/* 2. INCUBATE */}
                <button
                  onClick={() => {
                    updateMeta("stage", "solidified");
                    setStatus("active");
                  }}
                  disabled={stage === "solidified" && !isArchived}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${stage === "solidified" && !isArchived
                    ? "bg-violet-500 text-white border-violet-500 opacity-100 shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                    : "bg-white/5 border-transparent text-slate-500 hover:bg-white/10 hover:text-violet-400"
                    }`}
                >
                  <FlaskConical size={20} />
                  <span className="text-[10px] font-black uppercase">
                    {stage === "solidified" && !isArchived
                      ? "Incubating"
                      : "Incubate"}
                  </span>
                </button>

                {/* 3. ARCHIVE */}
                <button
                  onClick={() =>
                    setStatus(status === "archived" ? "active" : "archived")
                  }
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${status === "archived"
                    ? "bg-slate-200 text-black border-slate-200 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    : "bg-white/5 border-transparent text-slate-500 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  <Archive size={20} />
                  <span className="text-[10px] font-black uppercase">
                    {status === "archived" ? "Archived" : "Archive"}
                  </span>
                </button>

                {/* 4. FAVORITE */}
                <button
                  onClick={() => updateMeta("is_favorite", !isFav)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${isFav
                    ? "bg-pink-500 text-white border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                    : "bg-white/5 border-transparent text-slate-500 hover:bg-white/10 hover:text-pink-400"
                    }`}
                >
                  <Star size={20} fill={isFav ? "currentColor" : "none"} />
                  <span className="text-[10px] font-black uppercase">
                    {isFav ? "Favorite" : "Add Fav"}
                  </span>
                </button>
              </div>
            </div>

            <div className="h-px bg-white/5 w-full" />

            {/* IMPACT / EFFORT MATRIX */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                <BarChart2 size={14} /> Priority Matrix
              </div>

              {/* EFFORT */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>Effort Required</span>
                  <span
                    className={
                      effort === "high"
                        ? "text-rose-400"
                        : effort === "low"
                          ? "text-emerald-400"
                          : "text-amber-400"
                    }
                  >
                    {effort.toUpperCase()}
                  </span>
                </div>
                <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                  {["low", "medium", "high"].map((v) => (
                    <button
                      key={v}
                      onClick={() => updateIncubatorMeta("effort", v)}
                      className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase transition-all ${effort === v
                        ? v === "low"
                          ? "bg-emerald-500 text-black"
                          : v === "high"
                            ? "bg-rose-500 text-white"
                            : "bg-amber-500 text-black"
                        : "text-slate-600 hover:text-white"
                        }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* IMPACT */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>Potential Impact</span>
                  <span
                    className={
                      impact === "high"
                        ? "text-emerald-400"
                        : impact === "low"
                          ? "text-slate-400"
                          : "text-cyan-400"
                    }
                  >
                    {impact.toUpperCase()}
                  </span>
                </div>
                <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                  {["low", "medium", "high"].map((v) => (
                    <button
                      key={v}
                      onClick={() => updateIncubatorMeta("impact", v)}
                      className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase transition-all ${impact === v
                        ? v === "high"
                          ? "bg-emerald-500 text-black"
                          : v === "low"
                            ? "bg-slate-700 text-white"
                            : "bg-cyan-500 text-black"
                        : "text-slate-600 hover:text-white"
                        }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-px bg-white/5 w-full" />

            {/* PROMOTE ACTION */}
            <button
              onClick={() => onPromote(item)}
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              Promote to Task <ArrowRightCircle size={16} />
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 md:p-6 border-t border-white/5 bg-[#111] flex justify-between items-center shrink-0 pb-8 md:pb-6">
          <div className="text-xs font-mono text-slate-600 flex items-center gap-2">
            <AlertCircle size={12} />
            {isSaving ? "Saving..." : "Unsaved changes are lost if closed."}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-xs text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-white text-black hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save Idea
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
