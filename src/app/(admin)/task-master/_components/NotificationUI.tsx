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
} from "lucide-react";

// --- TYPES ---
export type ToastType = {
  id: string;
  type: "success" | "error" | "info";
  message: string;
};

// --- TOAST COMPONENT (Named Export) ---
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

// --- CONFIRM MODAL COMPONENT (Named Export) ---
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />

      {/* Modal Card */}
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
                <Trash2 size={16} /> Confirm Purge
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- SIMPLE CONFIRM MODAL (Named Export) ---
// Used for edit open/close confirmations
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className={`flex items-center gap-3 mb-4 ${colors.text}`}>
          {icon && (
            <div className={`p-2 ${colors.bg} rounded-lg`}>{icon}</div>
          )}
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

// --- EDIT MODAL (Named Export) ---
// Full-featured edit modal with open/close confirmations
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
  itemType: "task" | "level_up" | "ledger" | "code_snippet" | "resource" | "social_bookmark";
  onSave: (id: string, fields: EditableFields) => Promise<void>;
  onClose: () => void;
  TagManagerComponent?: React.ComponentType<{
    selectedTags: string[];
    allSystemTags: string[];
    onUpdateTags: (tags: string[]) => void;
  }>;
  allSystemTags?: string[];
}) {
  // States
  const [showOpenConfirm, setShowOpenConfirm] = useState(true);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Record<string, any>>({});

  // Track if anything changed
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form when item changes
  useEffect(() => {
    if (item && isOpen) {
      setTitle(item.title || "");
      setContent(item.content || "");
      setDueDate(item.due_date?.split("T")[0] || "");
      setTags(item.tags || []);
      setMetadata(item.metadata || {});
      setShowOpenConfirm(true);
      setShowCloseConfirm(false);
      setShowDiscardConfirm(false);
      setHasChanges(false);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleFieldChange = () => {
    setHasChanges(true);
  };

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
    setShowCloseConfirm(false);
    onClose();
  };

  const handleRequestClose = () => {
    if (hasChanges) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmEdit = () => {
    setShowOpenConfirm(false);
  };

  const handleCancelOpen = () => {
    setShowOpenConfirm(false);
    onClose();
  };

  // Open Confirmation Modal
  if (showOpenConfirm) {
    return (
      <SimpleConfirmModal
        isOpen={true}
        icon={<Edit2 size={24} />}
        iconColor="purple"
        title="Edit Item"
        description={`Open editor for "${item.title}"? You can modify all fields and save your changes.`}
        confirmLabel="Open Editor"
        cancelLabel="Cancel"
        onConfirm={handleConfirmEdit}
        onCancel={handleCancelOpen}
      />
    );
  }

  // Save Confirmation Modal
  if (showCloseConfirm) {
    return (
      <SimpleConfirmModal
        isOpen={true}
        icon={<Save size={24} />}
        iconColor="emerald"
        title="Confirm Changes"
        description="Save all changes to this item? This action will update the record."
        confirmLabel="Save Changes"
        cancelLabel="Keep Editing"
        onConfirm={handleSave}
        onCancel={() => setShowCloseConfirm(false)}
      />
    );
  }

  // Discard Confirmation Modal
  if (showDiscardConfirm) {
    return (
      <SimpleConfirmModal
        isOpen={true}
        icon={<XCircle size={24} />}
        iconColor="rose"
        title="Discard Changes"
        description="You have unsaved changes. Are you sure you want to discard them?"
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        onConfirm={onClose}
        onCancel={() => setShowDiscardConfirm(false)}
      />
    );
  }

  // Main Edit Modal
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleRequestClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Edit2 size={20} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-wide text-white">
              Edit Item
            </h3>
          </div>
          <button
            onClick={handleRequestClose}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title Field */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                handleFieldChange();
              }}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="Enter title..."
            />
          </div>

          {/* Content/Notes Field (not for ledger) */}
          {itemType !== "ledger" && (
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                {itemType === "code_snippet" ? "Code / Content" : "Notes"}
              </label>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  handleFieldChange();
                }}
                rows={itemType === "code_snippet" ? 10 : 4}
                className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-purple-500 transition-colors resize-none ${itemType === "code_snippet" ? "font-mono text-sm text-emerald-300" : ""
                  }`}
                placeholder={itemType === "code_snippet" ? "// Enter code..." : "Add notes..."}
              />
            </div>
          )}

          {/* Due Date (for tasks) */}
          {itemType === "task" && (
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  handleFieldChange();
                }}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          )}

          {/* Level Up Metadata Fields */}
          {itemType === "level_up" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                  Course Link
                </label>
                <input
                  type="text"
                  value={metadata.course_link || ""}
                  onChange={(e) => {
                    setMetadata({ ...metadata, course_link: e.target.value });
                    handleFieldChange();
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-blue-300 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                    Completed Hrs
                  </label>
                  <input
                    type="number"
                    value={metadata.hours_completed || 0}
                    onChange={(e) => {
                      setMetadata({ ...metadata, hours_completed: Number(e.target.value) });
                      handleFieldChange();
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-cyan-300 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                    Total Hrs
                  </label>
                  <input
                    type="number"
                    value={metadata.total_hours || 0}
                    onChange={(e) => {
                      setMetadata({ ...metadata, total_hours: Number(e.target.value) });
                      handleFieldChange();
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={metadata.start_date || ""}
                  onChange={(e) => {
                    setMetadata({ ...metadata, start_date: e.target.value });
                    handleFieldChange();
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={metadata.end_date || ""}
                  onChange={(e) => {
                    setMetadata({ ...metadata, end_date: e.target.value });
                    handleFieldChange();
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Ledger Metadata Fields */}
          {itemType === "ledger" && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                  App / Project
                </label>
                <select
                  value={metadata.app_name || "General"}
                  onChange={(e) => {
                    setMetadata({ ...metadata, app_name: e.target.value });
                    handleFieldChange();
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="General">General</option>
                  <option value="DnDL Website">DnDL Website</option>
                  <option value="DnDLCreative Website">DnDLCreative Webapp</option>
                  <option value="CineSonic Website/App">CineSonic Website/App</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                  Type
                </label>
                <select
                  value={metadata.ticket_type || "bug"}
                  onChange={(e) => {
                    setMetadata({ ...metadata, ticket_type: e.target.value });
                    handleFieldChange();
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="bug">Bug Report</option>
                  <option value="feature">New Feature</option>
                  <option value="refactor">Tech Debt</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                  Priority
                </label>
                <select
                  value={metadata.priority || "normal"}
                  onChange={(e) => {
                    setMetadata({ ...metadata, priority: e.target.value });
                    handleFieldChange();
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="low">Low Priority</option>
                  <option value="normal">Normal</option>
                  <option value="high">High Priority</option>
                  <option value="critical">CRITICAL</option>
                </select>
              </div>
            </div>
          )}

          {/* Tags (if TagManager provided) */}
          {TagManagerComponent && (
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                Tags
              </label>
              <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                <TagManagerComponent
                  selectedTags={tags}
                  allSystemTags={allSystemTags}
                  onUpdateTags={(newTags) => {
                    setTags(newTags);
                    handleFieldChange();
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 flex justify-between items-center shrink-0 bg-black/20">
          <div className="text-[10px] uppercase font-bold tracking-widest text-slate-600">
            {hasChanges ? (
              <span className="text-amber-500">● Unsaved Changes</span>
            ) : (
              <span className="text-slate-600">No changes</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRequestClose}
              className="px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wide text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowCloseConfirm(true)}
              disabled={!hasChanges || isSaving}
              className="px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wide bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2"
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
    </div>
  );
}
