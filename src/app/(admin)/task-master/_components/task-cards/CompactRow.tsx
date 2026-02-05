"use client";

import React, { useState, memo } from "react";
import { Check, ChevronDown, GripVertical, Lock, Unlock, Repeat, Calendar, Flag, FileText, ClipboardList, Star, Save } from "lucide-react";
import { DragHandle } from "../widgets/SortableItem";
import { formatDate, getTodayString, isTaskOverdue, calculateStats, isCycleSatisfied } from "../utils/dateUtils";
import TaskDetails from "./TaskDetails";
import RecurringTasks from "../widgets/RecurringTasks";
import CountdownTimer from "../widgets/CountdownTimer";

function CompactRowComponent({ item, isManualSort, ...props }: any) {
    const [expanded, setExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isRecurrenceModalOpen, setIsRecurrenceModalOpen] = useState(false);
    const [isJustCompleted, setIsJustCompleted] = useState(false);

    // Status Logic
    const priority = item.metadata?.priority || "normal";
    const completedDates = (item.metadata?.completed_dates as string[]) || [];
    const todayStr = getTodayString();
    const isDoneToday = completedDates.some(d => d.startsWith(todayStr));

    const isRecurring = item.recurrence && item.recurrence !== "one_off";

    const isSatisfied = React.useMemo(() => {
        if (!isRecurring) return false;
        return isCycleSatisfied(completedDates, item.recurrence);
    }, [completedDates, item.recurrence, isRecurring]);

    const isCompleted = item.status === "completed" || (isRecurring ? (isJustCompleted || isSatisfied) : isDoneToday);

    const liveStreak = React.useMemo(() => {
        if (!item.recurrence || item.recurrence === "one_off") return 0;
        const { streak } = calculateStats(item.metadata?.completed_dates, item.created_at, item.recurrence, item.metadata);
        return streak;
    }, [item.metadata?.completed_dates, item.created_at, item.recurrence, item.metadata]);

    // --- LIFTED STATE FOR MANUAL SAVE ---
    const [localTitle, setLocalTitle] = useState(item.title);
    const [localContent, setLocalContent] = useState(item.content || "");
    const [localSubtasks, setLocalSubtasks] = useState(item.subtasks || []);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Sync if item changes from outside
    React.useEffect(() => {
        if (!hasUnsavedChanges) {
            setLocalTitle(item.title);
            setLocalContent(item.content || "");
            setLocalSubtasks(item.subtasks || []);
        }
    }, [item, hasUnsavedChanges]);

    const handleSave = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (localTitle !== item.title) {
            props.onUpdateTitle(item.id, localTitle);
        }
        if (localContent !== item.content) {
            props.onUpdateContent(item.id, localContent);
        }
        props.onUpdateSubtasks(item.id, localSubtasks);
        setHasUnsavedChanges(false);
    };

    let containerClasses = `group flex flex-col bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-xl transition-all hover:bg-white/5 overflow-hidden relative`;

    if (priority === "critical") {
        containerClasses += " border-rose-500/20";
    }

    const isSkipped = !isCompleted && isTaskOverdue(item.due_date);
    if (isSkipped) {
        containerClasses += " border-rose-600/50 bg-rose-950/20";
    }

    if (isCompleted) {
        containerClasses += " opacity-85";
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
                        // Optimistic UI for recurring tasks
                        if (isRecurring && !isDoneToday) {
                            setIsJustCompleted(true);
                            setTimeout(() => setIsJustCompleted(false), 3000);
                        }
                        props.onToggleStatus(item.id, item.status);
                    }}
                    className={`shrink-0 w-4 h-4 rounded border transition-all flex items-center justify-center self-center ${isCompleted
                        ? "bg-emerald-500 border-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.3)]"
                        : "border-slate-600 hover:border-emerald-400 bg-black/20"
                        }`}
                >
                    {isCompleted && (
                        <Check size={10} className="text-black" />
                    )}
                </button>

                {/* 3. Left Section: Title + Star + Indicators */}
                <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                    <div className="flex items-center gap-3">
                        {isEditing ? (
                            <input
                                value={localTitle}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                    setLocalTitle(e.target.value);
                                    setHasUnsavedChanges(true);
                                }}
                                className={`bg-black/20 px-1 rounded text-sm font-bold w-full focus:outline-none ${isCompleted
                                    ? "line-through text-slate-500"
                                    : "text-white opacity-100 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                                    }`}
                            />
                        ) : (
                            <span
                                className={`text-sm font-bold ${isCompleted
                                    ? "line-through text-slate-500"
                                    : "text-slate-200"
                                    }`}
                            >
                                {item.title}
                            </span>
                        )}

                        {item.metadata?.is_favorite && (
                            <Star size={10} className="text-pink-500 fill-pink-500 shrink-0" />
                        )}

                        {/* Subtask Progress Bar (Compact) */}
                        {localSubtasks?.length > 0 && (
                            <div className="flex items-center gap-3 shrink-0 ml-1 min-w-[80px]">
                                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="h-full bg-purple-500 transition-all duration-500 shadow-[0_0_5px_rgba(168,85,247,0.3)]"
                                        style={{ width: `${(localSubtasks.filter((s: any) => s.status === "completed").length / localSubtasks.length) * 100}%` }}
                                    />
                                </div>
                                <span className="text-[9px] text-slate-500 font-black min-w-[24px]">
                                    {localSubtasks.filter((s: any) => s.status === "completed").length}/{localSubtasks.length}
                                </span>
                            </div>
                        )}

                        {item.content && (
                            <FileText size={10} className="text-slate-600 shrink-0" />
                        )}

                        {/* UNSAVED CHANGES INDICATOR (Compact Level) */}
                        {hasUnsavedChanges && (
                            <div className="flex items-center animate-pulse ml-2 px-1 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 translate-y-[2px]">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Middle Section: Tags & Content Preview (Max Out) */}
                <div className="hidden lg:flex flex-1 items-center gap-4 min-w-0 px-4">
                    {/* Tags (Mini) */}
                    {item.tags?.length > 0 && (
                        <div className="flex items-center gap-1 shrink-0">
                            {item.tags.slice(0, 2).map((tag: string) => (
                                <span
                                    key={tag}
                                    className="text-[8px] md:text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-white/5 uppercase tracking-wider font-bold"
                                >
                                    {tag}
                                </span>
                            ))}
                            {item.tags.length > 2 && (
                                <span className="text-[8px] text-slate-600 font-bold">
                                    +{item.tags.length - 2}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Content Preview */}
                    <div className="flex-1 min-w-0 flex items-center gap-2 text-[10px] md:text-xs text-slate-400 font-medium">
                        {item.content ? (
                            <span className="truncate opacity-70 italic max-w-[400px]">
                                "{item.content}"
                            </span>
                        ) : (
                            <span className="text-slate-700 italic">...</span>
                        )}
                    </div>
                </div>

                {/* 5. Right Side Meta */}
                <div className="flex items-center gap-3 shrink-0 self-center">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(!isEditing);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${isEditing ? "bg-purple-500/20 text-purple-400" : "text-slate-600 hover:text-white"}`}
                            title={isEditing ? "Lock Task" : "Unlock to Edit"}
                        >
                            {isEditing ? <Unlock size={14} /> : <Lock size={14} />}
                        </button>
                        {hasUnsavedChanges && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSave();
                                }}
                                className="p-1.5 rounded-lg bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white shadow-[0_0_10px_rgba(245,158,11,0.2)] transition-all animate-pulse"
                                title="Save Changes"
                            >
                                <Save size={14} strokeWidth={3} />
                            </button>
                        )}
                    </div>

                    {item.recurrence && item.recurrence !== 'one_off' && props.onOpenStats && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                props.onOpenStats?.();
                            }}
                            className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full hover:bg-slate-700 hover:text-white transition-colors border border-white/5 uppercase tracking-wide font-bold hidden md:inline-block"
                        >
                            Stats
                        </button>
                    )}

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

                    {(item.due_date || item.metadata?.is_no_rush) && (
                        <span className="text-[10px] font-mono text-slate-500 hidden sm:flex items-center gap-1">
                            {isDoneToday ? (
                                <CountdownTimer targetDate={item.due_date} />
                            ) : (
                                <>
                                    <Calendar size={10} /> {item.metadata?.is_no_rush ? "No Rush" : formatDate(item.due_date)}
                                </>
                            )}
                        </span>
                    )}

                    <span className={`text-[9px] font-black uppercase tracking-wider hidden sm:block ${priority === 'critical' ? 'text-rose-500' :
                        priority === 'high' ? 'text-orange-500' :
                            priority === 'normal' ? 'text-slate-400' :
                                priority === 'low' ? 'text-slate-500' :
                                    'text-slate-600'
                        }`}>
                        {priority.replace('_', ' ')}
                    </span>

                    {liveStreak > 0 && (
                        <span className="text-[9px] font-black uppercase tracking-wider hidden sm:flex items-center gap-1 text-orange-400">
                            🔥 {liveStreak}
                        </span>
                    )}

                    <ChevronDown
                        size={14}
                        className={`text-slate-500 transition-transform duration-200 ${expanded ? "rotate-180" : ""
                            }`}
                    />
                </div>
            </div >

            {/* EXPANDED DETAILS */}
            {
                expanded && (
                    <div className="border-t border-white/5 p-4 bg-black/20 animate-in slide-in-from-top-2 fade-in duration-200 cursor-auto">
                        <TaskDetails
                            item={item}
                            isEditing={isEditing}
                            localTitle={localTitle}
                            setLocalTitle={setLocalTitle}
                            localContent={localContent}
                            setLocalContent={setLocalContent}
                            localSubtasks={localSubtasks}
                            setLocalSubtasks={setLocalSubtasks}
                            hasUnsavedChanges={hasUnsavedChanges}
                            setHasUnsavedChanges={setHasUnsavedChanges}
                            handleSave={handleSave}
                            {...props}
                        />
                    </div>
                )
            }

            <RecurringTasks
                item={item}
                isOpen={isRecurrenceModalOpen}
                onClose={() => setIsRecurrenceModalOpen(false)}
                onUpdateRecurrence={props.onUpdateRecurrence}
            />
        </div >
    );
}

export default memo(CompactRowComponent);
