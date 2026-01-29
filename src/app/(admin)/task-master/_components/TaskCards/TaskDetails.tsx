"use client";

import React, { useState } from "react";
import { Check, X, Plus } from "lucide-react";

export default function TaskDetails({
    item,
    onAddSubtask,
    onToggleSubtask,
    onDeleteSubtask,
    onUpdateContent,
    onUpdateSubtaskTitle,
    isEditing,
}: any) {
    const [newSub, setNewSub] = useState("");
    const contentRef = React.useRef<HTMLTextAreaElement>(null);

    const handleAddSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSub.trim()) {
            onAddSubtask(item.id, newSub.trim());
            setNewSub("");
        }
    };

    return (
        <div className="space-y-6">
            {/* Subtasks */}
            <div className="space-y-2">
                {item.subtasks?.map((sub: any) => (
                    <div key={sub.id} className="flex items-center gap-3 group py-1">
                        <button
                            onClick={() => onToggleSubtask(item.id, sub.id, sub.status)}
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
                                    defaultValue={sub.title}
                                    onBlur={(e) =>
                                        onUpdateSubtaskTitle &&
                                        onUpdateSubtaskTitle(item.id, sub.id, e.target.value)
                                    }
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

                        {isEditing && (
                            <button
                                onClick={() => onDeleteSubtask(item.id, sub.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-400 transition-all"
                                title="Delete Step"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                ))}

                {isEditing && (
                    <form
                        onSubmit={handleAddSubtask}
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
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!newSub.trim()}
                            className="p-1.5 bg-purple-500/10 text-purple-400 rounded hover:bg-purple-500 hover:text-white transition-all disabled:opacity-0"
                        >
                            <Plus size={16} />
                        </button>
                    </form>
                )}
            </div>

            {/* Notes */}
            <div>
                {isEditing ? (
                    <textarea
                        ref={contentRef}
                        defaultValue={item.content}
                        placeholder="Add notes..."
                        className="w-full bg-black/20 rounded-lg p-3 text-sm text-slate-300 min-h-[100px] border border-white/5 focus:border-purple-500/50 focus:outline-none resize-none"
                    />
                ) : (
                    <div className="w-full bg-black/10 rounded-lg p-3 text-sm text-slate-400 min-h-[50px] border border-white/5 whitespace-pre-wrap">
                        {item.content || "No notes..."}
                    </div>
                )}
            </div>

            {/* GLOBAL SAVE ACTION (Fixed at bottom) */}
            {isEditing && (
                <div className="flex justify-end pt-4 border-t border-white/5">
                    <button
                        onClick={() => {
                            // Save content
                            if (contentRef.current) {
                                onUpdateContent(item.id, contentRef.current.value);
                            }
                            // Close/Toggle Edit Mode logic could go here if managed externally, 
                            // but currently we just save the notes content.
                            // Ideally, this should trigger a broader "save" if other fields were local state,
                            // but they are updated immediately via props.
                        }}
                        className="w-full md:w-auto px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Check size={14} />
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
}
