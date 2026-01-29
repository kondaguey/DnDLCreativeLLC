"use client";

import React, { useState } from "react";
import { Check, ChevronDown, GripVertical, Lock, Unlock, Repeat, Calendar, Flag } from "lucide-react";
import { DragHandle } from "../SortableItem";
import { formatDate, getTodayString, isTaskOverdue } from "../dateUtils";
import TaskDetails from "./TaskDetails";
import RecurringTasks from "../RecurringTasks";
import CountdownTimer from "../CountdownTimer";

export default function CompactRow({ item, isManualSort, ...props }: any) {
    const [expanded, setExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isRecurrenceModalOpen, setIsRecurrenceModalOpen] = useState(false);

    // Status Logic
    const priority = item.metadata?.priority || "normal";
    const completedDates = (item.metadata?.completed_dates as string[]) || [];
    const todayStr = getTodayString();
    const isDoneToday = completedDates.includes(todayStr);

    const isCompleted = item.status === "completed" || isDoneToday;

    let containerClasses = `group flex flex-col bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-xl transition-all hover:bg-white/5 overflow-hidden relative`;

    if (priority === "critical") {
        containerClasses += " border-rose-500/20";
    }

    const isSkipped = !isCompleted && isTaskOverdue(item.due_date);
    if (isSkipped) {
        containerClasses += " border-rose-600/50 bg-rose-950/20";
    }

    if (isCompleted) {
        containerClasses += " opacity-60 grayscale-[0.5]";
    }

    return (
        <div className={containerClasses}>
            {/* PRIMARY ROW - ALWAYS VISIBLE */}
            <div
                className="flex items-center gap-4 p-3 min-h-[3.5rem] cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                {/* 1. Drag Handle */}
                {isManualSort && (
                    <div className="hidden md:flex text-slate-600 hover:text-white cursor-grab active:cursor-grabbing shrink-0 self-center">
                        <DragHandle>
                            <GripVertical size={14} />
                        </DragHandle>
                    </div>
                )}

                {/* 2. Checkbox */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        props.onToggleStatus(item.id, item.status);
                    }}
                    className={`shrink-0 w-4 h-4 rounded border transition-all flex items-center justify-center self-center ${isCompleted
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-slate-600 hover:border-emerald-400 bg-black/20"
                        }`}
                >
                    {isCompleted && (
                        <Check size={10} className="text-black" />
                    )}
                </button>

                {/* 3. Title */}
                <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                    <div className="flex items-center gap-3">
                        {isEditing ? (
                            <input
                                value={item.title}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) =>
                                    props.onUpdateTitle &&
                                    props.onUpdateTitle(item.id, e.target.value)
                                }
                                className={`bg-transparent text-sm font-bold w-full focus:outline-none ${isCompleted
                                    ? "line-through text-slate-500"
                                    : "text-slate-200"
                                    }`}
                            />
                        ) : (
                            <span
                                className={`text-sm font-bold truncate ${isCompleted
                                    ? "line-through text-slate-500"
                                    : "text-slate-200"
                                    }`}
                            >
                                {item.title}
                            </span>
                        )}

                        {/* Mobile-Friendly Indicators */}
                        {item.subtasks?.length > 0 && (
                            <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-slate-500 shrink-0 font-mono">
                                {
                                    item.subtasks.filter((s: any) => s.status === "completed")
                                        .length
                                }
                                /{item.subtasks.length}
                            </span>
                        )}
                    </div>
                </div>

                {/* 4. Right Side Meta */}
                <div className="flex items-center gap-3 shrink-0 self-center">
                    {/* Lock/Unlock */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(!isEditing);
                        }}
                        className="text-slate-600 hover:text-white transition-opacity opacity-0 group-hover:opacity-100"
                        title={isEditing ? "Lock Task" : "Unlock to Edit"}
                    >
                        {isEditing ? (
                            <Unlock size={14} className="text-purple-400" />
                        ) : (
                            <Lock size={14} />
                        )}
                    </button>

                    <span className="text-sm font-medium text-slate-200 truncate flex-1 flex items-center">
                        {item.title}
                        {item.recurrence && item.recurrence !== 'one_off' && props.onOpenStats && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    props.onOpenStats?.();
                                }}
                                className="ml-2 text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full hover:bg-slate-700 hover:text-white transition-colors border border-white/5 uppercase tracking-wide font-bold hidden sm:inline-block"
                            >
                                Stats
                            </button>
                        )}
                    </span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isEditing) setIsRecurrenceModalOpen(true);
                        }}
                        className={`transition-colors ${item.recurrence
                            ? "text-purple-400"
                            : "text-slate-600 hover:text-purple-400 opacity-0 group-hover:opacity-100"
                            } ${!isEditing ? "cursor-not-allowed" : ""}`}
                        disabled={!isEditing}
                        title="Recurrence"
                    >
                        <Repeat size={14} />
                    </button>

                    {item.due_date && (
                        <span className="text-[10px] font-mono text-slate-500 hidden sm:flex items-center gap-1">
                            {isDoneToday ? (
                                <CountdownTimer targetDate={item.due_date} />
                            ) : (
                                <>
                                    <Calendar size={10} /> {formatDate(item.due_date)}
                                </>
                            )}
                        </span>
                    )}

                    {priority !== "normal" && (
                        <span className={`text-[9px] font-black uppercase tracking-wider hidden sm:block ${priority === 'critical' ? 'text-rose-500' : 'text-orange-500'
                            }`}>
                            {priority}
                        </span>
                    )}

                    {item.metadata?.streak > 0 && (
                        <span className="text-[9px] font-black uppercase tracking-wider hidden sm:flex items-center gap-1 text-orange-400">
                            🔥 {item.metadata.streak}
                        </span>
                    )}

                    <ChevronDown
                        size={14}
                        className={`text-slate-500 transition-transform duration-200 ${expanded ? "rotate-180" : ""
                            }`}
                    />
                </div>
            </div>

            {/* EXPANDED DETAILS */}
            {expanded && (
                <div className="border-t border-white/5 p-4 bg-black/20 animate-in slide-in-from-top-2 fade-in duration-200 cursor-auto">
                    <TaskDetails item={item} isEditing={isEditing} {...props} />
                </div>
            )}

            <RecurringTasks
                item={item}
                isOpen={isRecurrenceModalOpen}
                onClose={() => setIsRecurrenceModalOpen(false)}
                onUpdateRecurrence={props.onUpdateRecurrence}
            />
        </div>
    );
}
