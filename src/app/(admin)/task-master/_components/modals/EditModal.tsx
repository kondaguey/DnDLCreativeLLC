"use client";

import { useState, useEffect } from "react";
import {
  X,
  Save,
  Loader2,
  CalendarDays,
  FileText,
  Code,
  Link as LinkIcon,
  Clock,
  Zap,
  BrainCircuit,
  Star,
  Bug,
  Gauge,
  Trophy,
  ExternalLink,
  Edit3,
} from "lucide-react";
import { TaskItem, ViewType } from "../utils/types";
import { EditableFields } from "../core/NotificationUI";

interface EditModalProps {
  isOpen: boolean;
  item: TaskItem | null;
  itemType: ViewType;
  allSystemTags: string[];
  TagManagerComponent: any;
  onSave: (id: string, fields: EditableFields) => Promise<void>;
  onClose: () => void;
}

export default function EditModal({
  isOpen,
  item,
  itemType,
  allSystemTags,
  TagManagerComponent,
  onSave,
  onClose,
}: EditModalProps) {
  // --- UNIFIED STATE ---
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dueDate, setDueDate] = useState(""); // THE OMNIPRESENT DATE
  const [tags, setTags] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  // --- POPULATE ON OPEN ---
  useEffect(() => {
    if (item && isOpen) {
      setTitle(item.title || "");
      setContent(item.content || "");
      setTags(item.tags || []);
      setMetadata(item.metadata || {});

      // ROBUST DATE HANDLING (Prefer Due Date -> Fallback to Created Date)
      const effectiveDate = item.due_date
        ? item.due_date
        : item.created_at || "";
      setDueDate(effectiveDate.split("T")[0]);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(item.id, {
      title,
      content,
      due_date: dueDate || null,
      tags,
      metadata,
    });
    setIsSaving(false);
    onClose();
  };

  // --- HELPERS FOR METADATA MANIPULATION ---
  const updateMeta = (key: string, value: any) => {
    setMetadata((prev) => ({ ...prev, [key]: value }));
  };

  const isIdea = itemType === "idea_board";
  const isCodex = itemType === "code_snippet";
  const isLedger = itemType === "ledger";
  const isLevelUp = itemType === "level_up";
  const isResource = itemType === "resource" || itemType === "social_bookmark";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-4">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* MASTER CONTAINER */}
      <div className="relative w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] bg-slate-900 md:border md:border-white/10 md:rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
        {/* --- DYNAMIC HEADER --- */}
        <div className="p-4 md:p-6 border-b border-white/5 bg-white/5 pt-12 md:pt-6 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
              <Edit3 size={14} className="text-purple-400" /> Editing:{" "}
              {itemType.replace("_", " ")}
            </span>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          {/* TITLE INPUT (Text-base to stop iOS zoom) */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title..."
            className="w-full bg-transparent text-xl md:text-3xl font-black text-white placeholder:text-slate-600 focus:outline-none"
          />
        </div>

        {/* --- SCROLLABLE WORKSPACE --- */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scrollbar-thin scrollbar-thumb-white/10">
          {/* TOP GRID: Metadata + Taxonomy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. DATE SHIFTER (Visible for almost all types) */}
            {!isLedger && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                  <CalendarDays size={14} /> Timeline Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-slate-300 font-mono text-base focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            )}

            {/* 2. TAG MANAGER */}
            <div className="space-y-2 md:col-span-1">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                Taxonomy / Tags
              </label>
              <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 h-[52px] flex items-center overflow-x-auto no-scrollbar">
                <TagManagerComponent
                  selectedTags={tags}
                  allSystemTags={allSystemTags}
                  onUpdateTags={setTags}
                />
              </div>
            </div>

            {/* --- IDEA BOARD SPECIFIC CONTROLS --- */}
            {isIdea && (
              <>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <BrainCircuit size={14} /> Pipeline Stage
                  </label>
                  <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 h-[52px]">
                    <button
                      onClick={() => updateMeta("stage", "spark")}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all ${metadata.stage === "spark" ? "bg-amber-500 text-black shadow-lg" : "text-slate-500 hover:text-white"}`}
                    >
                      <Zap size={14} /> Spark
                    </button>
                    <button
                      onClick={() => updateMeta("stage", "solidified")}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all ${metadata.stage === "solidified" ? "bg-violet-500 text-white shadow-lg" : "text-slate-500 hover:text-white"}`}
                    >
                      <BrainCircuit size={14} /> Incubator
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <Star size={14} /> Status
                  </label>
                  <button
                    onClick={() =>
                      updateMeta("is_favorite", !metadata.is_favorite)
                    }
                    className={`w-full h-[52px] rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${metadata.is_favorite ? "bg-amber-500/10 border-amber-500/50 text-amber-400" : "bg-black/40 border-white/5 text-slate-500 hover:text-white"}`}
                  >
                    <Star
                      size={16}
                      fill={metadata.is_favorite ? "currentColor" : "none"}
                    />{" "}
                    {metadata.is_favorite ? "Favorited" : "Mark as Favorite"}
                  </button>
                </div>
              </>
            )}

            {/* --- RESOURCE SPECIFIC --- */}
            {isResource && (
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                  <LinkIcon size={14} /> Source URL
                </label>
                <div className="flex bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 focus-within:border-cyan-500 transition-colors">
                  <input
                    type="url"
                    value={metadata.url || ""}
                    onChange={(e) => updateMeta("url", e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-transparent text-cyan-400 font-mono text-base focus:outline-none"
                  />
                  {metadata.url && (
                    <a
                      href={metadata.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-cyan-400"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* --- LEDGER SPECIFIC --- */}
            {isLedger && (
              <>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <Bug size={14} /> Ticket Type
                  </label>
                  <select
                    value={metadata.ticket_type || "bug"}
                    onChange={(e) => updateMeta("ticket_type", e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-slate-300 text-base focus:outline-none focus:border-purple-500"
                  >
                    <option value="bug">Bug</option>
                    <option value="feature">Feature</option>
                    <option value="refactor">Refactor</option>
                    <option value="security">Security</option>
                    <option value="performance">Performance</option>
                    <option value="design">Design</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <Gauge size={14} /> Priority
                  </label>
                  <select
                    value={metadata.priority || "normal"}
                    onChange={(e) => updateMeta("priority", e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-slate-300 text-base focus:outline-none focus:border-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </>
            )}

            {/* --- LEVEL UP SPECIFIC --- */}
            {isLevelUp && (
              <>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <Clock size={14} /> Hours Completed
                  </label>
                  <input
                    type="number"
                    value={metadata.hours_completed || 0}
                    onChange={(e) =>
                      updateMeta("hours_completed", Number(e.target.value))
                    }
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-white font-bold text-base focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <Trophy size={14} /> Total Hours
                  </label>
                  <input
                    type="number"
                    value={metadata.total_hours || 0}
                    onChange={(e) =>
                      updateMeta("total_hours", Number(e.target.value))
                    }
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-slate-300 font-bold text-base focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <LinkIcon size={14} /> Course Link
                  </label>
                  <input
                    type="url"
                    value={metadata.course_link || ""}
                    onChange={(e) => updateMeta("course_link", e.target.value)}
                    placeholder="Course URL..."
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-blue-400 font-mono text-base focus:outline-none focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {/* --- CODEX SPECIFIC (Notes) --- */}
            {isCodex && (
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                  <FileText size={14} /> Context / Documentation
                </label>
                <textarea
                  value={metadata.notes || ""}
                  onChange={(e) => updateMeta("notes", e.target.value)}
                  placeholder="Terminal commands, instructions, reasoning..."
                  className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-base text-slate-300 focus:outline-none focus:border-emerald-500 min-h-[120px]"
                />
              </div>
            )}
          </div>

          {/* MAIN CONTENT TEXTAREA (Adaptive) */}
          <div className="space-y-3 pt-6 border-t border-white/5">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              {isCodex ? (
                <>
                  <Code size={14} /> System Code
                </>
              ) : (
                <>
                  <FileText size={14} /> Primary Content
                </>
              )}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                isCodex
                  ? "// Paste code here..."
                  : "Add your thoughts, details, notes..."
              }
              className={`w-full min-h-[300px] bg-black/40 border border-white/5 rounded-2xl p-6 focus:outline-none focus:border-purple-500/50 transition-all resize-y ${isCodex
                ? "font-mono text-sm text-emerald-400"
                : "text-base leading-relaxed text-slate-200"
                }`}
            />
          </div>
        </div>

        {/* --- FOOTER: SAVE BUTTON --- */}
        <div className="p-4 md:p-6 border-t border-white/5 bg-black/40 flex justify-end gap-3 shrink-0 pb-8 md:pb-6">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-sm text-slate-500 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={16} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
