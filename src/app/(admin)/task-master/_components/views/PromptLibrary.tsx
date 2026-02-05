"use client";

import React, { useState } from "react";
import {
    Sparkles,
    Plus,
    Send,
    Copy,
    Check,
    Trash2,
    Edit2,
    MessageSquare,
    ShieldAlert,
    Clock,
    ExternalLink,
    GripVertical,
    Loader2,
    Clock9,
    Tag,
    Star,
    ChevronUp,
    Save
} from "lucide-react";
import { TaskItem, SortOption } from "../utils/types";
import TagManager from "../navigation/TagManager";

interface PromptLibraryProps {
    items: TaskItem[];
    sortOption: SortOption;
    filterTags: string[];
    allSystemTags: string[];
    searchQuery: string;
    onAdd: (title: string, systemContext: string, prompt: string, tags: string[], isFavorite: boolean) => Promise<void>;
    onUpdateMetadata: (id: string, m: any) => Promise<void>;
    onUpdateTitle: (id: string, t: string) => Promise<void>;
    onUpdateContent: (id: string, c: string) => Promise<void>;
    onDelete: (id: string) => void;
    onDeleteTag?: (tag: string) => void;
    onEdit: (item: TaskItem) => void;
    isAdding: boolean;
}

export default function PromptLibrary({
    items,
    sortOption,
    filterTags,
    allSystemTags,
    searchQuery,
    onAdd,
    onUpdateMetadata,
    onUpdateTitle,
    onUpdateContent,
    onDelete,
    onDeleteTag,
    onEdit,
    isAdding
}: PromptLibraryProps) {
    const [newTitle, setNewTitle] = useState("");
    const [newSystemContext, setNewSystemContext] = useState("");
    const [newPrompt, setNewPrompt] = useState("");
    const [newTags, setNewTags] = useState<string[]>([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(true);
    const [copyStatus, setCopyStatus] = useState<string | null>(null);


    const filteredItems = items
        .filter((i) => i.type === "ai_prompt")
        .filter((i) => {
            const matchesSearch =
                i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (i.content || "").toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTags =
                filterTags.length === 0 ||
                filterTags.every((t) => (i.tags || []).includes(t));
            return matchesSearch && matchesTags;
        });

    const handleCopy = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopyStatus(id);
            setTimeout(() => setCopyStatus(null), 2000);
        } catch (err) {
            console.error("Copy failed", err);
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4">
            {/* TOGGLE AREA */}
            <div className="flex justify-end pt-2">
                <button
                    onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border shadow-lg ${isQuickAddOpen ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/30" : "bg-slate-800 text-slate-400 border-white/5 hover:text-white"}`}
                >
                    {isQuickAddOpen ? <ChevronUp size={14} /> : <Plus size={14} />}
                    {isQuickAddOpen ? "Hide Form" : "Quick Add"}
                </button>
            </div>

            {/* QUICK ADD FORM */}
            {isQuickAddOpen && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!newTitle.trim() || !newPrompt.trim()) return;
                        onAdd(newTitle, newSystemContext, newPrompt, newTags, isFavorite);
                        setNewTitle("");
                        setNewSystemContext("");
                        setNewPrompt("");
                        setNewTags([]);
                        setIsFavorite(false);
                    }}
                    className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 flex flex-col gap-4 shadow-2xl group transition-all focus-within:border-indigo-500/30"
                >
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                        <div className="bg-indigo-500/10 p-1.5 rounded-lg border border-indigo-500/20 text-indigo-400">
                            <Sparkles size={16} fill="currentColor" />
                        </div>
                        <input
                            type="text"
                            placeholder="Prompt Title (e.g., Python Refactor)"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="bg-transparent w-full text-lg font-black text-white focus:outline-none placeholder:text-slate-700"
                        />
                        <button
                            type="button"
                            onClick={() => setIsFavorite(!isFavorite)}
                            className={`p-2 rounded-lg transition-all ${isFavorite ? "text-indigo-400 bg-indigo-400/10 border border-indigo-400/20" : "text-slate-600 border border-transparent hover:text-slate-100"}`}
                        >
                            <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 pl-1">
                                    <ShieldAlert size={10} /> System Context / Persona
                                </label>
                                <textarea
                                    placeholder="You are a senior engineer..."
                                    value={newSystemContext}
                                    onChange={(e) => setNewSystemContext(e.target.value)}
                                    className="bg-black/20 rounded-xl p-3 text-xs text-indigo-200 placeholder:text-slate-800 focus:outline-none border border-white/5 focus:border-indigo-500/20 min-h-[80px] font-mono"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 pl-1">
                                    <MessageSquare size={10} /> User Prompt Body
                                </label>
                                <textarea
                                    placeholder="Refactor the following code for performance..."
                                    value={newPrompt}
                                    onChange={(e) => setNewPrompt(e.target.value)}
                                    className="bg-black/20 rounded-xl p-3 text-xs text-slate-300 placeholder:text-slate-800 focus:outline-none border border-white/5 focus:border-indigo-500/20 min-h-[80px]"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 pl-1">
                                <Tag size={10} /> Tags
                            </label>
                            <div className="bg-black/20 rounded-xl p-2 border border-white/5">
                                <TagManager
                                    selectedTags={newTags}
                                    allSystemTags={allSystemTags}
                                    onUpdateTags={setNewTags}
                                    onDeleteTag={onDeleteTag}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={isAdding || !newTitle.trim() || !newPrompt.trim()}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/20 active:scale-95"
                        >
                            {isAdding ? <Loader2 className="animate-spin" size={12} /> : <Save size={12} strokeWidth={3} />}
                            {isAdding ? "Saving..." : "Save Prompt"}
                        </button>
                    </div>
                </form>
            )}

            {/* PROMPT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {filteredItems.map((item) => (
                    <div
                        key={item.id}
                        className="bg-[#0A0F1E]/60 backdrop-blur-xl border border-white/5 hover:border-indigo-500/20 rounded-3xl p-6 transition-all group flex flex-col gap-4 shadow-xl"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex flex-col gap-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-black text-lg md:text-xl text-indigo-100 group-hover:text-white transition-colors">
                                        {item.title}
                                    </h3>
                                    {item.metadata?.is_favorite && (
                                        <Star size={14} className="text-yellow-500 fill-current" />
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    <span className="flex items-center gap-1">
                                        <Clock size={10} />
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 bg-black/40 p-1 rounded-xl border border-white/5">
                                <button
                                    type="button"
                                    onClick={() => onEdit(item)}
                                    className="p-2 text-slate-500 hover:text-white transition-all rounded-lg hover:bg-white/5"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete(item.id)}
                                    className="p-2 text-slate-500 hover:text-red-400 transition-all rounded-lg hover:bg-red-500/10"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        {item.metadata?.system_context && (
                            <div className="bg-indigo-900/10 border border-indigo-500/10 rounded-2xl p-4 relative overflow-hidden group/context">
                                <div className="absolute top-3 right-3 opacity-0 group-hover/context:opacity-100 transition-all">
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(item.metadata?.system_context || "", item.id + "-ctx")}
                                        className="p-1.5 rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                    >
                                        {copyStatus === item.id + "-ctx" ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                </div>
                                <div className="text-[10px] font-black uppercase text-indigo-400 mb-2 flex items-center gap-1.5">
                                    <ShieldAlert size={10} /> System Message
                                </div>
                                <pre className="text-[11px] font-mono text-indigo-300 whitespace-pre-wrap leading-relaxed italic">
                                    "{item.metadata.system_context}"
                                </pre>
                            </div>
                        )}

                        <div className="bg-black/30 border border-white/5 rounded-2xl p-4 relative group/prompt">
                            <div className="absolute top-3 right-3 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleCopy(item.content || "", item.id)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-black/40"
                                >
                                    {copyStatus === item.id ? <Check size={12} /> : <Copy size={12} />}
                                    {copyStatus === item.id ? "Copied" : "Copy Prompt"}
                                </button>
                            </div>
                            <div className="text-[10px] font-black uppercase text-slate-500 mb-2 flex items-center gap-1.5">
                                <MessageSquare size={10} /> User Prompt
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed min-h-[40px]">
                                {item.content}
                            </p>
                        </div>

                        {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-auto">
                                {item.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="bg-slate-800/50 border border-white/5 px-2 py-0.5 rounded text-[9px] font-bold text-slate-400 transition-all hover:border-indigo-500/30 hover:text-indigo-300"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-900/40 border border-dashed border-white/5 rounded-[40px] opacity-40 italic text-slate-500 text-sm">
                    <Sparkles size={48} className="mb-4 opacity-10" />
                    No prompts found. Add your first instruction above.
                </div>
            )}
        </div>
    );
}
