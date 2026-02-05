"use client";

import React, { useState, memo } from "react";
import {
    Check,
    Save,
    GripVertical,
    ChevronDown,
    Archive,
    Trash2,
    Lock,
    Unlock,
    Repeat,
    Calendar,
    Flag,
    Flame,
    List as ListIcon,
    FileText,
    ClipboardList,
    Star
} from "lucide-react";
import CountdownTimer from "../widgets/CountdownTimer";
import { DragHandle } from "../widgets/SortableItem";
import TagManager from "../navigation/TagManager";
import { DateControl, PrioritySwitcher, ActionButton } from "./shared";
import TaskDetails from "./TaskDetails";
import RecurringTasks from "../widgets/RecurringTasks";
import {
    getTodayString,
    isTaskOverdue,
    formatDate,
    calculateStats,
    isCycleSatisfied
} from "../utils/dateUtils";
import RecurringBadge from "./RecurringBadge";

const GridCardComponent = function GridCard({
    item,
    viewMode,
    isManualSort,
    ...props
}: any) {
    const [expanded, setExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isRecurrenceModalOpen, setIsRecurrenceModalOpen] = useState(false);
    const [isJustCompleted, setIsJustCompleted] = useState(false);

    const priority = item.metadata?.priority || "normal";
    const completedDates = (item.metadata?.completed_dates as string[]) || [];
    const isRecurring = item.recurrence && item.recurrence !== "one_off";
    const todayStr = getTodayString();
    const isDoneToday = completedDates.some(d => d.startsWith(todayStr));

    const isSatisfied = React.useMemo(() => {
        if (!isRecurring) return false;
        return isCycleSatisfied(completedDates, item.recurrence);
    }, [completedDates, item.recurrence, isRecurring]);

    const isCompleted = item.status === "completed" || (isRecurring ? (isJustCompleted || isSatisfied) : isDoneToday);

    const liveStreak = React.useMemo(() => {
        if (!isRecurring) return 0;
        const { streak } = calculateStats(completedDates, item.created_at, item.recurrence, item.metadata);
        return streak;
    }, [completedDates, item.created_at, item.recurrence, item.metadata, isRecurring]);

    // --- LIFTED STATE FOR MANUAL SAVE ---
    const [localTitle, setLocalTitle] = useState(item.title);
    const [localContent, setLocalContent] = useState(item.content || "");
    const [localSubtasks, setLocalSubtasks] = useState(item.subtasks || []);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Sync if item changes from outside (e.g. database push)
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
        containerClasses += " opacity-90 hover:opacity-100";
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
            <div className={`flex flex-col gap-4 w-full relative z-10 ${viewMode === "list" && !expanded ? "md:w-2/5 md:border-r md:border-white/5 md:pr-8" : ""}`}>
                <div className="flex items-start gap-4">
                    {/* CHECKBOX */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isRecurring && !isDoneToday) {
                                setIsJustCompleted(true);
                                setTimeout(() => setIsJustCompleted(false), 3000);
                            }
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
                        <div className="flex items-center gap-2 mb-1">
                            {isSkipped && (
                                <span className="text-[10px] font-black uppercase tracking-widest bg-rose-600 text-white px-2 py-0.5 rounded shadow-sm animate-pulse">
                                    SKIPPED / LATE
                                </span>
                            )}
                            {hasUnsavedChanges && (
                                <div className="animate-pulse translate-y-[2px]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                                </div>
                            )}
                        </div>
                        {isEditing ? (
                            <div className="relative group/title">
                                <input
                                    value={localTitle}
                                    autoFocus
                                    onChange={(e) => {
                                        setLocalTitle(e.target.value);
                                        setHasUnsavedChanges(true);
                                    }}
                                    className={`bg-black/20 px-2 py-1 rounded-lg w-full font-black text-lg md:text-xl leading-snug tracking-tight focus:outline-none placeholder:text-slate-600 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] ${isCompleted ? "line-through opacity-50" : "opacity-100"}`}
                                />
                            </div>
                        ) : (
                            <h3
                                className={`font-black text-lg md:text-xl leading-snug tracking-tight ${isCompleted ? "line-through text-slate-500" : "text-slate-100"}`}
                            >
                                {localTitle}
                                {item.metadata?.is_favorite && (
                                    <Star size={14} className="inline-block ml-2 text-pink-500 fill-pink-500 mb-1" />
                                )}
                                {isRecurring && (
                                    <div className="inline-flex gap-2 ml-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                props.onOpenStats?.();
                                            }}
                                            className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full hover:bg-slate-700 hover:text-white transition-colors border border-white/5 uppercase tracking-wide font-black flex items-center gap-1.5 shadow-sm"
                                        >
                                            <ListIcon size={10} />
                                            Log: {completedDates.length}
                                        </button>
                                    </div>
                                )}
                            </h3>
                        )}
                    </div>

                    {/* LOCK BUTTON */}
                    <div className="flex items-center gap-2 pt-1 self-start">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(!isEditing);
                            }}
                            className={`p-2 rounded-xl transition-all duration-300 ${isEditing
                                ? "bg-purple-500/20 text-purple-400 shadow-[inset_0_0_10px_rgba(168,85,247,0.2)]"
                                : "text-slate-500 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {isEditing ? <Unlock size={18} /> : <Lock size={18} />}
                        </button>
                    </div>
                </div>

                {/* VISUAL DATE & PRIORITY ROW (Replaces Status Bar) */}
                <div className="flex flex-wrap items-center gap-2">
                    {isEditing ? (
                        <DateControl
                            dueDate={item.due_date}
                            isNoRush={item.metadata?.is_no_rush}
                            onChange={(d) => props.onUpdateDate(item.id, d)}
                            statusColor={priority === "critical" ? "rose" : "slate"}
                            disabled={false}
                        />
                    ) : (item.due_date || item.metadata?.is_no_rush) && (
                        <span className={`text-[10px] font-mono flex items-center gap-1.5 px-3 py-1 rounded-md border ${priority === 'critical' ? 'text-rose-400 border-rose-500/20 bg-rose-500/10' : 'text-slate-400 border-white/5 bg-white/5'}`}>
                            <Calendar size={12} />
                            {item.metadata?.is_no_rush ? "No Rush" : formatDate(item.due_date)}
                        </span>
                    )}
                    {isEditing ? (
                        <PrioritySwitcher
                            current={priority}
                            onChange={(p) => props.onUpdatePriority(item.id, p)}
                            disabled={false}
                        />
                    ) : (
                        <span className={`text-[10px] font-mono flex items-center gap-1.5 px-3 py-1 rounded-md border text-slate-400 border-white/5 bg-white/5 uppercase tracking-wider`}>
                            <Flag
                                size={12}
                                className={
                                    priority === "critical" ? "fill-rose-500 text-rose-500" :
                                        priority === "high" ? "fill-orange-500 text-orange-500" :
                                            priority === "normal" ? "text-slate-400" :
                                                priority === "low" ? "text-slate-500" :
                                                    "text-slate-600"
                                }
                            />
                            {priority.replace('_', ' ')}
                        </span>
                    )}

                    {liveStreak > 0 && (
                        <span className="text-[10px] font-mono flex items-center gap-1.5 px-2 py-1 rounded-md border border-orange-500/20 bg-orange-500/10 text-orange-400 uppercase tracking-wider">
                            <Flame size={12} className="fill-orange-500" /> {liveStreak}
                        </span>
                    )}

                    {localSubtasks?.length > 0 && (
                        <span className="text-[10px] font-mono flex items-center gap-1.5 px-2 py-1 rounded-md border border-white/5 bg-white/5 text-slate-400">
                            <ClipboardList size={12} className="text-slate-500" />
                            <span className="font-black text-slate-300">
                                {localSubtasks.filter((s: any) => s.status === "completed").length}/{localSubtasks.length}
                            </span>
                        </span>
                    )}

                    {item.content && (
                        <span className="text-[10px] font-mono flex items-center gap-1.5 px-2 py-1 rounded-md border border-white/5 bg-white/5 text-slate-400" title="Has Notes">
                            <FileText size={12} className="text-slate-500" />
                        </span>
                    )}

                    <RecurringBadge
                        recurrence={item.recurrence}
                        dueDate={item.due_date}
                        isSatisfied={isSatisfied}
                    />
                </div>
            </div>


            {/* BODY SECTION */}
            <div className={`flex-1 flex ${viewMode === "list" && !expanded ? "flex-row gap-8 md:items-start md:pl-8" : "flex-col gap-6 pt-6 mt-4 border-t border-white/5"}`}>

                {/* CONTENT PREVIEW OR EDITOR */}
                <div className="flex-1 min-w-0">
                    {expanded ? (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300 w-full relative">
                            {/* COLLAPSE BUTTON (TOP RIGHT) */}
                            <button
                                onClick={() => setExpanded(false)}
                                className="absolute -top-1 -right-1 p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition-all z-20 group"
                                title="Collapse Details"
                            >
                                <ChevronDown size={18} className="rotate-180 group-hover:-translate-y-0.5 transition-transform" />
                            </button>

                            {/* Subtask Protocol & Notes */}
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
                    ) : (
                        <div
                            className="w-full cursor-pointer group/content"
                            onClick={() => setExpanded(!expanded)}
                        >
                            <div className="flex items-center justify-between opacity-50 group-hover/content:opacity-100 transition-opacity mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Subtasks & Notes</span>
                                <ChevronDown size={14} className="text-slate-500" />
                            </div>
                            <p className={`text-slate-400 leading-relaxed font-medium ${viewMode === "list" ? "text-sm line-clamp-4" : "text-sm line-clamp-6"}`}>
                                {item.content || "Add details..."}
                            </p>

                            {/* PREVIEW PROGRESS BAR (Under the Drop) */}
                            {localSubtasks?.length > 0 && (
                                <div className="mt-3 flex items-center gap-3">
                                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 max-w-[120px]">
                                        <div
                                            className="h-full bg-purple-500/40 transition-all duration-700"
                                            style={{ width: `${(localSubtasks.filter((s: any) => s.status === "completed").length / localSubtasks.length) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-mono font-black text-slate-600">
                                        {Math.round((localSubtasks.filter((s: any) => s.status === "completed").length / localSubtasks.length) * 100)}%
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ACTIONS & META FOOTER */}
                <div className={`
                    flex flex-col items-center gap-4
                    ${viewMode === "list" && !expanded
                        ? "w-64 shrink-0 border-l border-white/5 pl-8 justify-center"
                        : "mt-auto pt-6 border-t border-white/5"
                    }
                `}>

                    {/* TAG SECTION - EXPLICITLY BORDERED */}
                    <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 shadow-inner">
                        <TagManager
                            selectedTags={item.tags || []}
                            allSystemTags={props.allSystemTags}
                            onUpdateTags={(t: string[]) => props.onUpdateTags(item.id, t)}
                            disabled={!isEditing}
                        />
                    </div>

                    {/* ACTION BUTTONS - CENTERED BENEATH TAGS */}
                    <div className="flex items-center justify-center gap-4 shrink-0">
                        {hasUnsavedChanges && (
                            <button
                                onClick={handleSave}
                                className="p-2 rounded-lg bg-amber-500/20 text-amber-500 hover:bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:text-white transition-all animate-pulse"
                                title="Save Changes"
                            >
                                <Save size={18} strokeWidth={3} />
                            </button>
                        )}
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
        </div >
    );
}

const GridCard = memo(GridCardComponent);

export default GridCard;
