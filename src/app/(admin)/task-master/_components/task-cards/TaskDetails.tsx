"use client";

import React, { useState, useRef, useMemo, memo } from "react";
import { Check, X, Plus, Clock, List as ListIcon, GripVertical, Flag, Save, FileText } from "lucide-react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove
} from "@dnd-kit/sortable";
import { SortableItem, DragHandle } from "../widgets/SortableItem";

function TaskDetailsComponent({
    item,
    onAddSubtask,
    onToggleSubtask,
    onDeleteSubtask,
    onUpdateContent,
    onUpdateTitle,
    onUpdateSubtaskTitle,
    onUpdateSubtasks,
    isEditing,
    // Lifted state props
    localTitle: externalTitle,
    setLocalTitle: externalSetTitle,
    localContent: externalContent,
    setLocalContent: externalSetContent,
    localSubtasks: externalSubtasks,
    setLocalSubtasks: externalSetSubtasks,
    hasUnsavedChanges: externalHasUnsavedChanges,
    setHasUnsavedChanges: externalSetHasUnsavedChanges,
    handleSave: externalHandleSave,
}: any) {
    const [newSub, setNewSub] = useState("");

    // Internal state if NOT provided by parent (fallback)
    const [internalTitle, setInternalTitle] = useState(item.title || "");
    const [internalContent, setInternalContent] = useState(item.content || "");
    const [internalSubtasks, setInternalSubtasks] = useState(item.subtasks || []);
    const [internalHasUnsavedChanges, setInternalHasUnsavedChanges] = useState(false);

    // Final state used in component
    const localTitle = externalTitle !== undefined ? externalTitle : internalTitle;
    const setLocalTitle = externalSetTitle || setInternalTitle;
    const localContent = externalContent !== undefined ? externalContent : internalContent;
    const setLocalContent = externalSetContent || setInternalContent;
    const localSubtasks = externalSubtasks !== undefined ? externalSubtasks : internalSubtasks;
    const setLocalSubtasks = externalSetSubtasks || setInternalSubtasks;
    const hasUnsavedChanges = externalHasUnsavedChanges !== undefined ? externalHasUnsavedChanges : internalHasUnsavedChanges;
    const setHasUnsavedChanges = externalSetHasUnsavedChanges || setInternalHasUnsavedChanges;


    const contentRef = useRef<HTMLTextAreaElement>(null);

    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = localSubtasks.findIndex((s: any) => s.id === active.id);
            const newIndex = localSubtasks.findIndex((s: any) => s.id === over.id);
            const reordered = arrayMove(localSubtasks, oldIndex, newIndex);
            setLocalSubtasks(reordered);
            setHasUnsavedChanges(true);
        }
    };

    const handleUpdateSubtaskPriority = (subId: string, priority: string) => {
        const updated = localSubtasks.map((s: any) =>
            s.id === subId ? { ...s, priority } : s
        );
        setLocalSubtasks(updated);
        setHasUnsavedChanges(true);
    };

    const handleLocalAddSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSub.trim()) {
            const newSubItem = {
                id: crypto.randomUUID(),
                title: newSub.trim(),
                status: "active",
                priority: "normal"
            };
            setLocalSubtasks([...localSubtasks, newSubItem]);
            setNewSub("");
            setHasUnsavedChanges(true);
        }
    };

    const handleLocalUpdateSubtaskTitle = (subId: string, title: string) => {
        const updated = localSubtasks.map((s: any) =>
            s.id === subId ? { ...s, title } : s
        );
        setLocalSubtasks(updated);
        setHasUnsavedChanges(true);
    };

    const handleLocalToggleSubtask = (subId: string, currentStatus: string) => {
        const newStatus = currentStatus === "active" ? "completed" : "active";
        const updated = localSubtasks.map((s: any) =>
            s.id === subId ? { ...s, status: newStatus } : s
        );
        setLocalSubtasks(updated);
        setHasUnsavedChanges(true);
    };

    const handleSave = () => {
        if (externalHandleSave) {
            externalHandleSave();
            return;
        }
        if (localTitle !== item.title && onUpdateTitle) {
            onUpdateTitle(item.id, localTitle);
        }
        if (onUpdateContent) onUpdateContent(item.id, localContent);
        if (onUpdateSubtasks) onUpdateSubtasks(item.id, localSubtasks);
        setHasUnsavedChanges(false);
    };

    const priorityColors: Record<string, string> = {
        critical: "text-rose-500",
        high: "text-orange-500",
        normal: "text-slate-500",
        low: "text-slate-600",
    };

    const handleAddSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSub.trim()) {
            onAddSubtask(item.id, newSub.trim());
            setNewSub("");
        }
    };

    return (
        <div className="space-y-6 relative">
            {/* Unsaved Glow Indicator (Expanded View) */}
            {hasUnsavedChanges && (
                <div className="absolute -top-4 right-0 animate-pulse translate-y-[2px]">
                    <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                </div>
            )}

            {/* Subtasks Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                        <ListIcon size={14} className="text-purple-400 font-black" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Subtasks & Protocol</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="space-y-2">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={localSubtasks}
                                strategy={verticalListSortingStrategy}
                            >
                                {localSubtasks.map((sub: any) => (
                                    <SortableItem key={sub.id} id={sub.id} disabled={!isEditing}>
                                        <div className="flex items-center gap-3 group py-1">
                                            {isEditing && (
                                                <DragHandle className="text-slate-700 hover:text-slate-400 p-1">
                                                    <GripVertical size={12} />
                                                </DragHandle>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (isEditing) {
                                                        handleLocalToggleSubtask(sub.id, sub.status);
                                                    } else {
                                                        onToggleSubtask(item.id, sub.id, sub.status);
                                                    }
                                                }}
                                                className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${sub.status === "completed"
                                                    ? "bg-purple-500 border-purple-500 hover:bg-purple-600"
                                                    : "border-slate-500 hover:border-purple-400 bg-white/5"
                                                    }`}
                                            >
                                                {sub.status === "completed" && (
                                                    <Check size={12} className="text-white stroke-[3]" />
                                                )}
                                            </button>

                                            <div className="flex-1 min-w-0">
                                                {isEditing ? (
                                                    <input
                                                        value={sub.title}
                                                        onChange={(e) => handleLocalUpdateSubtaskTitle(sub.id, e.target.value)}
                                                        className={`bg-transparent text-sm w-full focus:outline-none placeholder:text-slate-600 ${sub.status === "completed"
                                                            ? "line-through text-slate-500"
                                                            : "text-slate-200"
                                                            }`}
                                                    />
                                                ) : (
                                                    <span
                                                        className={`text-sm break-words ${sub.status === "completed"
                                                            ? "line-through text-slate-500"
                                                            : "text-slate-200"
                                                            }`}
                                                    >
                                                        {sub.title}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Priority Marker */}
                                            <div className="flex items-center gap-1">
                                                {["low", "normal", "high", "critical"].map((p) => (
                                                    <button
                                                        key={p}
                                                        disabled={!isEditing}
                                                        onClick={() => handleUpdateSubtaskPriority(sub.id, p)}
                                                        className={`transition-all ${sub.priority === p
                                                            ? priorityColors[p] + " opacity-100"
                                                            : "text-slate-800 hover:text-slate-600 opacity-0 group-hover:opacity-100"
                                                            }`}
                                                    >
                                                        <Flag size={10} fill={sub.priority === p ? "currentColor" : "none"} />
                                                    </button>
                                                ))}
                                            </div>

                                            {isEditing && (
                                                <button
                                                    onClick={() => {
                                                        const updated = localSubtasks.filter((s: any) => s.id !== sub.id);
                                                        setLocalSubtasks(updated);
                                                        setHasUnsavedChanges(true);
                                                    }}
                                                    className="p-1.5 text-slate-700 hover:text-rose-400 transition-all ml-2"
                                                    title="Delete Step"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </SortableItem>
                                ))}
                            </SortableContext>
                        </DndContext>

                        {isEditing && (
                            <form
                                onSubmit={handleLocalAddSubtask}
                                className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5"
                            >
                                <div className="w-5 h-5 rounded-md border border-dashed border-slate-600 flex items-center justify-center shrink-0">
                                    <Plus size={12} className="text-slate-500" />
                                </div>
                                <input
                                    value={newSub}
                                    onChange={(e) => setNewSub(e.target.value)}
                                    placeholder="Add a new step (Press Enter)..."
                                    className="bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none flex-1"
                                />
                            </form>
                        )}
                    </div>

                </div>
            </div>

            {/* Notes Section */}
            <div className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 mb-3">
                    <FileText size={14} className="text-slate-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Notes</span>
                </div>
                {isEditing ? (
                    <textarea
                        value={localContent}
                        onChange={(e) => {
                            setLocalContent(e.target.value);
                            setHasUnsavedChanges(true);
                        }}
                        placeholder="Add notes..."
                        className="w-full bg-black/40 rounded-xl p-4 text-sm text-slate-300 min-h-[120px] border border-white/5 focus:border-purple-500/50 focus:outline-none resize-none transition-all"
                    />
                ) : (
                    <div className="w-full bg-black/20 rounded-xl p-4 text-sm text-slate-400 min-h-[60px] border border-white/5 whitespace-pre-wrap leading-relaxed">
                        {item.content || "No notes provided..."}
                    </div>
                )}
            </div>

            {/* Completed History Ledger */}
            {item.recurrence && item.recurrence !== "one_off" && item.metadata?.completed_dates?.length > 0 && (
                <div className="pt-6 border-t border-white/5 bg-slate-950/20 rounded-2xl p-4 mt-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                        <ListIcon size={12} className="text-purple-400" />
                        Log Ledger History
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                        {item.metadata.completed_dates.slice().reverse().map((log: string, idx: number) => (
                            <div key={idx} className="flex items-center justify-between gap-3 text-xs text-slate-500 py-2 px-3 bg-white/[0.02] border border-white/5 rounded-xl italic opacity-80 group hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[8px] font-black text-emerald-500/50">
                                        {item.metadata.completed_dates.length - idx}
                                    </div>
                                    <span className="font-mono text-[10px] line-through decoration-slate-700/50">
                                        {log}
                                    </span>
                                </div>
                                <Check size={12} className="text-emerald-500/30" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* GLOBAL SAVE ACTION */}
            {hasUnsavedChanges && (
                <div className="flex justify-end pt-6 border-t border-white/5">
                    <button
                        onClick={handleSave}
                        className="p-2 rounded-xl bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all animate-pulse border border-amber-500/20"
                        title="Save Changes"
                    >
                        <Save size={18} strokeWidth={3} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default memo(TaskDetailsComponent);
