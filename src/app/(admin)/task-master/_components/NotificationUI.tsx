"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  X,
  Trash2,
  XCircle,
  Edit2,
  Save,
  Loader2,
  Palette,
  Zap,
  BrainCircuit,
  Calendar,
  Repeat,
  ArrowRightCircle,
  Rocket,
} from "lucide-react";

// --- TYPES ---
export type ToastType = {
  id: string;
  type: "success" | "error" | "info";
  message: string;
};

// --- TOAST ---
export function Toast({
  toast,
  onClose,
}: {
  toast: ToastType;
  onClose: () => void;
}) {
  const isError = toast.type === "error";
  const bgClass = isError
    ? "bg-rose-500/10 border-rose-500/50"
    : "bg-emerald-500/10 border-emerald-500/50";
  const textClass = isError ? "text-rose-400" : "text-emerald-400";
  const Icon = isError ? XCircle : CheckCircle2;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl animate-in slide-in-from-right-10 fade-in duration-300 ${bgClass}`}
    >
      <Icon size={20} className={textClass} />
      <span className="font-bold text-sm text-slate-200">{toast.message}</span>
      <button
        onClick={onClose}
        className="ml-4 hover:text-white text-slate-500 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// --- CONFIRM MODAL ---
export function ConfirmModal({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  isProcessing,
}: {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4 text-rose-500">
          <div className="p-2 bg-rose-500/10 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-xl font-black uppercase tracking-wide text-white">
            {title}
          </h3>
        </div>
        <p className="text-slate-400 leading-relaxed mb-8">{description}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wide text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Abort
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wide bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all flex items-center gap-2"
          >
            {isProcessing ? (
              <span>Purging...</span>
            ) : (
              <>
                <Trash2 size={16} /> Confirm
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- SIMPLE CONFIRM MODAL ---
export function SimpleConfirmModal({
  isOpen,
  icon,
  iconColor = "purple",
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  icon?: React.ReactNode;
  iconColor?: "purple" | "emerald" | "rose" | "cyan";
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  const colorMap = {
    purple: {
      bg: "bg-purple-500/10",
      text: "text-purple-400",
      btn: "bg-purple-600 hover:bg-purple-500 shadow-purple-600/20",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      btn: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20",
    },
    rose: {
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      btn: "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20",
    },
    cyan: {
      bg: "bg-cyan-500/10",
      text: "text-cyan-400",
      btn: "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/20",
    },
  };

  const colors = colorMap[iconColor];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className={`flex items-center gap-3 mb-4 ${colors.text}`}>
          {icon && <div className={`p-2 ${colors.bg} rounded-lg`}>{icon}</div>}
          <h3 className="text-xl font-black uppercase tracking-wide text-white">
            {title}
          </h3>
        </div>
        <p className="text-slate-400 leading-relaxed mb-8">{description}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wide text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wide text-white shadow-lg transition-all flex items-center gap-2 ${colors.btn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- NEW COMPONENT: PROMOTE MODAL ---
export function PromoteModal({
  isOpen,
  item,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  item: { id: string; title: string; content?: string } | null;
  onConfirm: (id: string, title: string, recurrence: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [recurrence, setRecurrence] = useState("one_off");

  useEffect(() => {
    if (isOpen && item) {
      if (item.title === "Quick Note" && item.content) {
        setTitle(
          item.content.slice(0, 50) + (item.content.length > 50 ? "..." : ""),
        );
      } else {
        setTitle(item.title || "");
      }
      setRecurrence("one_off");
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />

      <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl shadow-emerald-900/20 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-6 text-emerald-400">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Rocket size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-wide text-white">
              Promote to Protocol
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Operationalize this idea
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Name this task..."
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
              Frequency / Tab
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["one_off", "daily", "weekly", "monthly", "quarterly"].map(
                (freq) => (
                  <button
                    key={freq}
                    onClick={() => setRecurrence(freq)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${
                      recurrence === freq
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                        : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {freq === "one_off" ? (
                      <Calendar size={12} />
                    ) : (
                      <Repeat size={12} />
                    )}
                    {freq.replace("_", "-")}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-8 border-t border-white/10 pt-4">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wide text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(item.id, title, recurrence)}
            disabled={!title.trim()}
            className="px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wide bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Promote <ArrowRightCircle size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- EDIT MODAL ---
export type EditableFields = {
  title?: string;
  content?: string;
  due_date?: string | null;
  tags?: string[];
  metadata?: Record<string, any>;
};

export function EditModal({
  isOpen,
  item,
  itemType,
  onSave,
  onClose,
  TagManagerComponent,
  allSystemTags = [],
}: {
  isOpen: boolean;
  item: {
    id: string;
    title: string;
    content?: string;
    due_date?: string | null;
    tags?: string[];
    metadata?: Record<string, any>;
  } | null;
  itemType: string;
  onSave: (id: string, fields: EditableFields) => Promise<void>;
  onClose: () => void;
  TagManagerComponent?: any;
  allSystemTags?: string[];
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (item && isOpen) {
      setTitle(item.title || "");
      setContent(item.content || "");

      // For Resources/Tasks, prefer due_date if available
      const effectiveDate = item.due_date ? item.due_date : item.created_at;
      setDueDate(effectiveDate.split("T")[0]);

      setTags(item.tags || []);
      setMetadata(item.metadata || {});
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

  const LABELS = [
    { name: "Strategy", color: "bg-violet-500" },
    { name: "Design", color: "bg-pink-500" },
    { name: "Dev", color: "bg-cyan-500" },
    { name: "Marketing", color: "bg-rose-500" },
    { name: "Money", color: "bg-emerald-500" },
    { name: "Ops", color: "bg-slate-500" },
    { name: "Urgent", color: "bg-orange-500" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Edit2 size={20} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-wide text-white">
              Edit {itemType.replace("_", " ")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* --- NEW: URL INPUT FOR RESOURCES --- */}
          {(itemType === "resource" || itemType === "social_bookmark") && (
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                URL / Link
              </label>
              <input
                type="text"
                value={metadata.url || ""}
                onChange={(e) =>
                  setMetadata({ ...metadata, url: e.target.value })
                }
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-emerald-400 font-mono text-sm focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="https://..."
              />
            </div>
          )}

          {itemType !== "ledger" && (
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                {itemType === "code_snippet" ? "Code / Content" : "Notes"}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={itemType === "code_snippet" ? 10 : 4}
                className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-purple-500 transition-colors resize-none ${
                  itemType === "code_snippet"
                    ? "font-mono text-sm text-emerald-300"
                    : ""
                }`}
              />
            </div>
          )}

          {(itemType === "task" ||
            itemType === "resource" ||
            itemType === "social_bookmark") && (
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                Effective Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          )}

          {itemType === "idea_board" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                  Stage
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMetadata({ ...metadata, stage: "spark" })}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border flex items-center justify-center gap-2 ${
                      metadata.stage === "spark"
                        ? "bg-amber-500 text-white border-amber-500"
                        : "bg-white/5 text-slate-500 border-white/10 hover:text-white"
                    }`}
                  >
                    <Zap size={14} /> Spark
                  </button>
                  <button
                    onClick={() =>
                      setMetadata({ ...metadata, stage: "solidified" })
                    }
                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border flex items-center justify-center gap-2 ${
                      metadata.stage === "solidified"
                        ? "bg-violet-500 text-white border-violet-500"
                        : "bg-white/5 text-slate-500 border-white/10 hover:text-white"
                    }`}
                  >
                    <BrainCircuit size={14} /> Incubator
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                  Label
                </label>
                <select
                  value={metadata.label?.name || ""}
                  onChange={(e) => {
                    const selected = LABELS.find(
                      (l) => l.name === e.target.value,
                    );
                    setMetadata({ ...metadata, label: selected || null });
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="">No Label</option>
                  {LABELS.map((label) => (
                    <option key={label.name} value={label.name}>
                      {label.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {TagManagerComponent && (
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                Tags
              </label>
              <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                <TagManagerComponent
                  selectedTags={tags}
                  allSystemTags={allSystemTags}
                  onUpdateTags={(newTags: string[]) => setTags(newTags)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-black/20 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wide text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wide bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2"
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
