"use client";

import React, { useState } from "react";
import {
    Check,
    GripVertical,
    ChevronDown,
    Archive,
    Trash2,
    Lock,
    Unlock,
    Repeat,
    Calendar,
    Flag,
    Flame
} from "lucide-react";
import CountdownTimer from "../CountdownTimer";
import { DragHandle } from "../SortableItem";
import TagManager from "../TagManager";
import { DateControl, PrioritySwitcher, ActionButton } from "./shared";
import TaskDetails from "./TaskDetails";
import RecurringTasks from "../RecurringTasks";
import { getTodayString, isTaskOverdue } from "../dateUtils";
import RecurringBadge from "./RecurringBadge";

export default function GridCard({
    item,
    viewMode,
    isManualSort,
    ...props
}: any) {
    const [expanded, setExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isRecurrenceModalOpen, setIsRecurrenceModalOpen] = useState(false);
    const priority = item.metadata?.priority || "normal";

    const completedDates = (item.metadata?.completed_dates as string[]) || [];
    const todayStr = getTodayString(); // FIX: Consistent Local Date
    const isDoneToday = completedDates.includes(todayStr);

    const isCompleted = item.status === "completed" || isDoneToday;

    // ... (Container styles existing logic)

    // ... (Render)


    // --- DYNAMIC STYLES (MATCHING INCUBATOR) ---
    // Base: Glassmorphism, rounded-3xl, border-white/5
    let containerClasses = `
        group flex flex-col relative transition-all duration-300
        bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden
        shadow-lg hover:shadow-2xl hover:-translate-y-0.5
        ${viewMode === "list" && !expanded ? "md:flex-row md:items-start p-6" : "h-full p-6"}
    `;

    // Priority Accents (Subtle Glows instead of bars)
    if (priority === "critical") {
        containerClasses += " border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.1)]";
    } else if (priority === "high") {
        containerClasses += " border-orange-500/30";
    }

    const isSkipped = !isCompleted && isTaskOverdue(item.due_date);
    if (isSkipped) {
        containerClasses += " border-rose-600/50 shadow-[0_0_20px_rgba(225,29,72,0.15)] bg-rose-950/20";
    }

    if (isCompleted) {
        containerClasses += " opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0";
    }

    return (
        <div className={containerClasses}>
            {/* FLOATING DRAG HANDLE (Consistent with IdeaBoard) */}
            {isManualSort && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 text-slate-600 hover:text-white cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                    <DragHandle>
                        <GripVertical size={16} />
                    </DragHandle>
                </div>
            )}

            {/* HEADER SECTION */}
            <div className={`flex flex-col gap-4 w-full relative z-10 ${viewMode === "list" && !expanded ? "md:w-1/3 md:border-r md:border-white/5 md:pr-8" : ""}`}>
                <div className="flex items-start gap-4">
                    {/* CHECKBOX */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            props.onToggleStatus(item.id, item.status);
                        }}
                        className={`mt-1 shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isCompleted
                            ? "bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                            : "border-white/10 hover:border-emerald-400 bg-black/20"
                            }`}
                    >
                        {isCompleted && (
                            <Check size={14} className="text-black stroke-[3]" />
                        )}
                    </button>

                    <div className="flex-1 min-w-0">
                        {/* TITLE */}
                        {isSkipped && (
                            <div className="mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest bg-rose-600 text-white px-2 py-0.5 rounded shadow-sm animate-pulse">
                                    SKIPPED / LATE
                                </span>
                            </div>
                        )}
                        {isEditing ? (
                            <textarea
                                value={item.title}
                                rows={1}
                                autoFocus
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = 'auto';
                                    target.style.height = `${target.scrollHeight}px`;
                                }}
                                onChange={(e) =>
                                    props.onUpdateTitle &&
                                    props.onUpdateTitle(item.id, e.target.value)
                                }
                                className={`bg-transparent w-full font-black text-xl md:text-2xl leading-tight focus:outline-none placeholder:text-slate-600 resize-none overflow-hidden ${isCompleted ? "line-through text-slate-500" : "text-slate-100"}`}
                                style={{ minHeight: '2rem' }}
                            />
                        ) : (
                            <h3
                                className={`font-black text-lg md:text-xl leading-snug tracking-tight ${isCompleted ? "line-through text-slate-500" : "text-slate-100"}`}
                            >
                                {item.title}
                                {item.recurrence && item.recurrence !== 'one_off' && props.onOpenStats && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            props.onOpenStats?.();
                                        }}
                                        className="ml-2 text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full hover:bg-slate-700 hover:text-white transition-colors border border-white/5 uppercase tracking-wide font-bold"
                                    >
                                        Stats
                                    </button>
                                )}
                            </h3>
                        )}
                    </div>

                    {/* LOCK BUTTON */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(!isEditing);
                        }}
                        className="text-slate-600 hover:text-white transition-colors pt-1 opacity-0 group-hover:opacity-100"
                    >
                        {isEditing ? <Unlock size={16} className="text-purple-400" /> : <Lock size={16} />}
                    </button>
                </div>

                {/* VISUAL DATE & PRIORITY ROW (Replaces Status Bar) */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {isEditing ? (
                        <DateControl
                            dueDate={item.due_date}
                            onChange={(d) => props.onUpdateDate(item.id, d)}
                            statusColor={priority === "critical" ? "rose" : "slate"}
                            disabled={false}
                        />
                    ) : (item.due_date && (
                        <span className={`text-[10px] font-mono flex items-center gap-1.5 px-2 py-1 rounded-md border ${priority === 'critical' ? 'text-rose-400 border-rose-500/20 bg-rose-500/10' : 'text-slate-400 border-white/5 bg-white/5'}`}>
                            <Calendar size={12} />
                            {new Date(item.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    ))}
                    {isEditing ? (
                        <PrioritySwitcher
                            current={priority}
                            onChange={(p) => props.onUpdatePriority(item.id, p)}
                            disabled={false}
                        />
                    ) : (priority !== "normal" && (
                        <span className={`text-[10px] font-mono flex items-center gap-1.5 px-2 py-1 rounded-md border text-slate-400 border-white/5 bg-white/5 uppercase tracking-wider`}>
                            <Flag size={12} className={priority === "critical" ? "fill-rose-500 text-rose-500" : "fill-orange-500 text-orange-500"} />
                            {priority}
                        </span>
                    ))}

                    {item.metadata?.streak > 0 && (
                        <span className="text-[10px] font-mono flex items-center gap-1.5 px-2 py-1 rounded-md border border-orange-500/20 bg-orange-500/10 text-orange-400 uppercase tracking-wider">
                            <Flame size={12} className="fill-orange-500" /> {item.metadata.streak}
                        </span>
                    )}

                    <RecurringBadge
                        recurrence={item.recurrence}
                        dueDate={item.due_date}
                        isDoneToday={isDoneToday}
                    />
                </div>
            </div>


            {/* BODY SECTION */}
            <div className={`flex-1 flex ${viewMode === "list" && !expanded ? "flex-row gap-8 md:items-start md:pl-8" : "flex-col gap-6 pt-6 mt-4 border-t border-white/5"}`}>

                {/* CONTENT PREVIEW OR EDITOR */}
                <div className="flex-1 min-w-0">
                    {expanded ? (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300 w-full">
                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Subtasks & Notes</span>
                                <button
                                    onClick={() => setExpanded(false)}
                                    className="p-1.5 bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                                >
                                    <ChevronDown size={14} className="rotate-180" />
                                </button>
                            </div>
                            <TaskDetails item={item} isEditing={isEditing} {...props} />
                        </div>
                    ) : (
                        <div
                            className="w-full cursor-pointer group/content"
                            onClick={() => setExpanded(true)}
                        >
                            <div className="flex items-center justify-between opacity-50 group-hover/content:opacity-100 transition-opacity mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Subtasks & Notes</span>
                                <ChevronDown size={14} className="text-slate-500" />
                            </div>
                            <p className={`text-slate-400 leading-relaxed font-medium ${viewMode === "list" ? "text-sm line-clamp-2" : "text-sm line-clamp-4"}`}>
                                {item.content || "Add details..."}
                            </p>
                        </div>
                    )}
                </div>

                {/* ACTIONS & META FOOTER */}
                <div className={`
                    ${viewMode === "list"
                        ? "w-64 shrink-0 flex flex-col gap-4 border-l border-white/5 pl-8 justify-center"
                        : "mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-4"
                    }
                `}>

                    {/* FOOTER CONTROLS - REDUCED */}
                    <div className={`w-full ${viewMode === 'list' ? '' : 'flex-1'}`}>
                        <TagManager
                            selectedTags={item.tags || []}
                            allSystemTags={props.allSystemTags}
                            onUpdateTags={(t: string[]) => props.onUpdateTags(item.id, t)}
                            disabled={!isEditing}
                        />
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center gap-1 shrink-0 ml-auto">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isEditing) setIsRecurrenceModalOpen(true);
                            }}
                            className={`p-2 rounded-lg transition-colors ${item.recurrence
                                ? "text-purple-400 bg-purple-500/10"
                                : "text-slate-600 hover:text-purple-400 hover:bg-white/5"
                                }`}
                            title="Recurrence"
                        >
                            <Repeat size={18} />
                        </button>
                        <ActionButton
                            icon={<Archive size={18} />}
                            onClick={() => props.onArchive(item.id)}
                            color="text-slate-600 hover:text-purple-400 hover:bg-white/5"
                        />
                        <ActionButton
                            icon={<Trash2 size={18} />}
                            onClick={() => props.onDelete(item.id)}
                            color="text-slate-600 hover:text-rose-400 hover:bg-white/5"
                        />
                    </div>
                </div>
            </div>

            <RecurringTasks
                item={item}
                isOpen={isRecurrenceModalOpen}
                onClose={() => setIsRecurrenceModalOpen(false)}
                onUpdateRecurrence={props.onUpdateRecurrence}
            />
        </div>
    );
}
