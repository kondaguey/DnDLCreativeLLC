
import React, { useState } from 'react';
import {
    Edit3, Archive, Trash2, BarChart2, Undo2, CheckCircle2,
    GripVertical, Tag, Plus, X, Pill, List, Zap, ArrowUp, ArrowDown, Hash, Activity,
    RotateCcw, ChevronDown, ChevronUp, Save
} from 'lucide-react';
import {
    DndContext,
    closestCenter,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PersonalItem, ViewMode } from '../types';

// --- SortableSubTask ---
export function SortableSubTask({ id, sub, idx, isDarkMode, editValues, setEditValues, onRemove, availableTags }: any) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const [isEditing, setIsEditing] = useState(!sub || (typeof sub === 'object' && !sub.text));
    const [showTagPicker, setShowTagPicker] = useState(false);
    const style = { transform: CSS.Transform.toString(transform), transition };

    const subText = typeof sub === 'string' ? sub : sub.text;
    const subTags = typeof sub === 'string' ? [] : (sub.tags || []);

    const updateSubAction = (newVal: any) => {
        const newSubs = [...editValues.subActions];
        newSubs[idx] = newVal;
        setEditValues({ ...editValues, subActions: newSubs });
    };

    return (
        <div ref={setNodeRef} style={style} className="flex flex-col gap-2 group/sub w-full">
            <div className="flex items-center gap-2">
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-emerald-500 transition-colors">
                    <GripVertical size={14} />
                </div>

                <div className="flex-grow">
                    {isEditing ? (
                        <input
                            autoFocus
                            value={subText}
                            onBlur={() => { if (subText) setIsEditing(false); }}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && subText) setIsEditing(false);
                                if (e.key === 'Escape') {
                                    if (!subText) onRemove();
                                    else setIsEditing(false);
                                }
                            }}
                            onChange={e => {
                                if (typeof sub === 'string') {
                                    updateSubAction(e.target.value);
                                } else {
                                    updateSubAction({ ...sub, text: e.target.value });
                                }
                            }}
                            className={`w-full border rounded-lg px-3 py-1.5 font-medium outline-none focus:border-emerald-500 transition-colors text-xs ${isDarkMode ? 'bg-slate-800 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                            placeholder={`Step ${idx + 1}...`}
                        />
                    ) : (
                        <div
                            onClick={() => setIsEditing(true)}
                            className={`w-full px-3 py-1.5 text-xs font-medium rounded-lg border border-transparent cursor-text transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            {subText}
                        </div>
                    )}
                </div>

                <div className="flex gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                    <button
                        onClick={() => setShowTagPicker(!showTagPicker)}
                        className={`p-1.5 rounded-lg border transition-all ${showTagPicker ? 'bg-emerald-500 text-white border-emerald-500' : isDarkMode ? 'bg-slate-800 border-white/5 text-slate-500 hover:text-emerald-400' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-emerald-600'}`}
                        title="Sub-Action Tags"
                    >
                        <Tag size={12} />
                    </button>
                    <button
                        onClick={onRemove}
                        className={`p-1.5 rounded-lg border transition-all ${isDarkMode ? 'bg-slate-800 border-white/5 text-red-500/30 hover:text-red-500' : 'bg-slate-50 border-slate-100 text-red-300 hover:text-red-500'}`}
                        title="Remove Step"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            {showTagPicker && (
                <div className="ml-8 flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-100/50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10">
                    {availableTags.map((tag: string) => {
                        const isSelected = subTags.includes(tag);
                        return (
                            <button
                                key={tag}
                                onClick={() => {
                                    const nextTags = isSelected ? subTags.filter((t: string) => t !== tag) : [...subTags, tag];
                                    updateSubAction({ text: subText, tags: nextTags });
                                }}
                                className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${isSelected ? 'bg-emerald-500 text-white' : 'bg-white/50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500'}`}
                            >
                                {tag}
                            </button>
                        );
                    })}
                </div>
            )}

            {subTags.length > 0 && !showTagPicker && (
                <div className="ml-8 flex flex-wrap gap-1">
                    {subTags.map((tag: string) => (
                        <span key={tag} className="text-[7px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500/60 border border-emerald-500/10">
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- CompactCard ---
export function CompactCard({ item, index, isDarkMode, onLog, onOpenStats, onToggleSubtask, onEdit, onDelete, onArchive }: any) {
    const isCompleted = item.status === 'completed';
    const subtasks = item.metadata?.sub_actions || [];
    const completedSubtasks = item.metadata?.completed_sub_actions || [];
    const progress = subtasks.length > 0 ? (completedSubtasks.length / subtasks.length) * 100 : (isCompleted ? 100 : 0);

    return (
        <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all flex flex-col gap-3 sm:gap-4 shadow-sm group relative overflow-hidden ${isCompleted ? 'bg-emerald-50/20 border-emerald-500/20' : isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'}`}>
            <div className="flex flex-col xs:flex-row justify-between items-start gap-4">
                <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-emerald-500/50' : 'text-emerald-600/50'}`}>{index}.</span>
                        <h4 className={`font-black uppercase tracking-tight text-xs sm:text-sm ${isCompleted ? 'line-through opacity-50' : isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
                    </div>
                    <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{item.metadata?.duration || '0 min'}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                    <button onClick={onEdit} className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors ${isDarkMode ? 'hover:bg-white/5 text-slate-600' : 'hover:bg-slate-100 text-slate-300'}`} title="Edit"><Edit3 size={12} className="sm:size-[14px]" /></button>
                    <button onClick={onArchive} className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors ${isDarkMode ? 'hover:bg-white/5 text-slate-600' : 'hover:bg-slate-100 text-slate-300'}`} title="Archive"><Archive size={12} className="sm:size-[14px]" /></button>
                    <button onClick={onDelete} className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors ${isDarkMode ? 'hover:bg-white/5 text-red-500/30 hover:text-red-500' : 'hover:bg-red-50 text-red-300 hover:text-red-500'}`} title="Delete"><Trash2 size={12} className="sm:size-[14px]" /></button>
                    <button onClick={onOpenStats} className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors ${isDarkMode ? 'hover:bg-white/5 text-slate-600' : 'hover:bg-slate-100 text-slate-300'}`} title="Stats"><BarChart2 size={12} className="sm:size-[14px]" /></button>
                    <button onClick={onLog} className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all shadow-md ${isCompleted ? 'bg-emerald-600 text-white' : isDarkMode ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400'}`} title={isCompleted ? "Undo" : "Complete"}>
                        {isCompleted ? <Undo2 size={12} className="sm:size-[14px]" strokeWidth={3} /> : <CheckCircle2 size={12} className="sm:size-[14px]" strokeWidth={2.5} />}
                    </button>
                </div>
            </div>

            {subtasks.length > 0 && (
                <div className="space-y-2">
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-500">
                        <span>{completedSubtasks.length} / {subtasks.length} Steps</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- ListItem ---
export function ListItem({ item, index, isDarkMode, isSorting, onLog, onOpenStats, onEdit, onDelete, onArchive, onToggleSubtask, startEditing }: any) {
    return (
        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all shadow-sm ${item.status === 'completed' ? 'opacity-40 grayscale' : ''} ${isDarkMode ? 'bg-slate-900 border-white/5 shadow-black/20 text-white' : 'bg-white border-slate-200 shadow-slate-200/50 text-slate-900'}`}>
            <div className="flex items-center gap-4">
                <div className={`text-xl sm:text-2xl font-black w-6 sm:w-8 ${isDarkMode ? 'text-slate-800' : 'text-slate-300'}`}>{index}</div>
                <div className="flex-grow flex items-center gap-3 sm:gap-4">
                    <button onClick={onOpenStats} className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-colors ${isDarkMode ? 'bg-white/5 text-slate-500 hover:text-white' : 'bg-slate-100 text-slate-400 hover:text-emerald-600'}`}><BarChart2 size={14} className="sm:size-[16px]" /></button>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <h4 className={`font-black uppercase tracking-tight text-sm sm:text-base ${item.status === 'completed' ? 'line-through' : ''} ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
                            {item.metadata?.time_of_day && <span className={`text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md uppercase tracking-widest ${isDarkMode ? 'text-emerald-400 bg-emerald-500/10' : 'text-emerald-600 bg-emerald-50'}`}>{item.metadata.time_of_day}</span>}
                        </div>
                        <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{(item.metadata?.duration || '0 min')}</p>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-end gap-1 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                {!isSorting && (
                    <>
                        <button onClick={onEdit} className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-colors ${isDarkMode ? 'bg-white/5 text-slate-500 hover:text-white' : 'bg-slate-100 text-slate-400 hover:text-slate-900'}`} title="Edit"><Edit3 size={14} className="sm:size-[16px]" /></button>
                        <button onClick={onArchive} className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-white/5 text-slate-500 hover:text-white' : 'bg-slate-100 text-slate-400 hover:text-slate-900'}`} title="Archive"><Archive size={16} /></button>
                        <button onClick={onDelete} className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-white/5 text-red-500/30 hover:text-red-500' : 'bg-slate-100 text-red-300 hover:text-red-500'}`} title="Delete"><Trash2 size={16} /></button>
                    </>
                )}
                <button onClick={onLog} className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all shadow-lg active:scale-90 ${item.status === 'completed' ? 'bg-emerald-600 text-white shadow-emerald-200' : `${isDarkMode ? 'bg-white/5 text-slate-500 hover:text-emerald-400' : 'bg-slate-100 text-slate-400 hover:text-emerald-600'}`}`}>
                    {item.status === 'completed' ? <Undo2 size={18} className="sm:size-[20px]" strokeWidth={3} /> : <CheckCircle2 size={18} className="sm:size-[20px]" strokeWidth={2.5} />}
                </button>
            </div>
        </div>
    );
}

// --- Main ItemCard ---
export default function ItemCard({
    item,
    index,
    isEditing,
    editValues,
    setEditValues,
    isSorting,
    isDarkMode,
    view,
    onSort,
    onLog,
    onArchive,
    onRestore,
    onEdit,
    onSave,
    onCancel,
    onDelete,
    onOpenStats,
    onToggleSubtask,
    sensors,
    availableTags,
    expandedIds,
    toggleExpand
}: any) {
    const isCompleted = item.status === 'completed';
    const subtasks = item.metadata?.sub_actions || [];
    const completedSubtasks = item.metadata?.completed_sub_actions || [];
    const progress = subtasks.length > 0 ? (completedSubtasks.length / subtasks.length) * 100 : (isCompleted ? 100 : 0);

    const handleAddTag = (tag: string) => {
        if (!editValues.tags.includes(tag)) {
            setEditValues({ ...editValues, tags: [...editValues.tags, tag] });
        }
    };

    const handleRemoveTag = (tag: string) => {
        setEditValues({ ...editValues, tags: editValues.tags.filter((t: string) => t !== tag) });
    };

    if (isEditing) {
        return (
            <div className={`transition-all duration-300 rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 animate-in fade-in zoom-in-95 shadow-2xl ${isDarkMode ? 'bg-slate-900 border-2 border-emerald-500/50 shadow-emerald-500/10' : 'bg-white border-2 border-emerald-500 shadow-emerald-100'}`}>
                <div className="grid gap-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="md:col-span-1">
                            <label className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1.5 sm:mb-2 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Directive Title</label>
                            <input
                                value={editValues.title}
                                onChange={e => setEditValues({ ...editValues, title: e.target.value })}
                                className={`w-full border rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 font-black outline-none focus:border-emerald-500 transition-colors uppercase tracking-tight text-lg sm:text-xl ${isDarkMode ? 'bg-slate-800 border-white/5 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-300'}`}
                                placeholder="Objective Name"
                            />
                        </div>
                        <div>
                            <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Time of Day / Window</label>
                            <input
                                value={editValues.timeOfDay}
                                onChange={e => setEditValues({ ...editValues, timeOfDay: e.target.value })}
                                className={`w-full border rounded-xl px-4 py-3 font-bold outline-none focus:border-emerald-500 transition-colors ${isDarkMode ? 'bg-slate-800 border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                                placeholder="e.g. 05:00 AM or Morning"
                            />
                        </div>
                    </div>

                    <div>
                        <label className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1.5 sm:mb-2 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Protocol Description</label>
                        <textarea
                            value={editValues.content}
                            onChange={e => setEditValues({ ...editValues, content: e.target.value })}
                            rows={2}
                            className={`w-full border rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 font-medium outline-none focus:border-emerald-500 transition-colors text-xs sm:text-sm ${isDarkMode ? 'bg-slate-800 border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                            placeholder="What needs to be done?"
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                            <label className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1.5 sm:mb-2 block flex items-center gap-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                <Pill size={12} /> Supplements / Modalities
                            </label>
                            <textarea
                                value={editValues.supplements}
                                onChange={e => setEditValues({ ...editValues, supplements: e.target.value })}
                                rows={2}
                                className={`w-full border rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 font-medium outline-none focus:border-emerald-500 transition-colors text-xs ${isDarkMode ? 'bg-slate-800 border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                                placeholder="Vitamins, gear, or specific tools..."
                            />
                        </div>
                        <div>
                            <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block flex items-center gap-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                <List size={12} /> Sub-Actions Evolution
                            </label>
                            <div className="space-y-3">
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => {
                                    const { active, over } = event;
                                    if (over && active.id !== over.id) {
                                        const oldIndex = parseInt(active.id.toString().split('-')[1]);
                                        const newIndex = parseInt(over.id.toString().split('-')[1]);
                                        const newSubs = arrayMove(editValues.subActions, oldIndex, newIndex);
                                        setEditValues({ ...editValues, subActions: newSubs });
                                    }
                                }}>
                                    <SortableContext items={editValues.subActions.map((_: any, i: number) => `sub-${i}`)} strategy={verticalListSortingStrategy}>
                                        {editValues.subActions.map((sub: any, idx: number) => (
                                            <SortableSubTask
                                                key={`sub-${idx}`} id={`sub-${idx}`} sub={sub} idx={idx}
                                                isDarkMode={isDarkMode} editValues={editValues} setEditValues={setEditValues}
                                                onRemove={() => {
                                                    const newSubs = editValues.subActions.filter((_: any, i: number) => i !== idx);
                                                    setEditValues({ ...editValues, subActions: newSubs });
                                                }}
                                                availableTags={availableTags}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                                <button
                                    onClick={() => setEditValues({ ...editValues, subActions: [...editValues.subActions, { text: '', tags: [] }] })}
                                    className={`w-full py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-all ${isDarkMode ? 'border-white/5 text-slate-600 hover:text-emerald-400 hover:border-emerald-500/20' : 'border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-600/30'}`}
                                >
                                    <Plus size={12} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Add Step</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1.5 sm:mb-2 block flex items-center gap-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}><Tag size={12} /> Tags</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {editValues.tags.map((tag: string) => (
                                <span key={tag} className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest cursor-pointer ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`} onClick={() => handleRemoveTag(tag)}>
                                    {tag} <X size={10} />
                                </span>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.filter((tag: string) => !editValues.tags.includes(tag)).map((tag: string) => (
                                <span key={tag} className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest cursor-pointer ${isDarkMode ? 'bg-white/5 text-slate-500 hover:bg-white/10' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`} onClick={() => handleAddTag(tag)}>
                                    <Plus size={10} /> {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className={`flex flex-col sm:flex-row items-stretch sm:items-end gap-4 border-t pt-6 mt-4 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                        <div className="flex-grow">
                            <label className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1.5 sm:mb-2 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Duration</label>
                            <input
                                value={editValues.duration}
                                onChange={e => setEditValues({ ...editValues, duration: e.target.value })}
                                className={`w-full border rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 font-bold outline-none focus:border-emerald-500 transition-colors text-sm sm:text-base ${isDarkMode ? 'bg-slate-800 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                                placeholder="e.g. 45 min"
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={onSave} className="flex-grow sm:flex-grow-0 bg-emerald-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-black uppercase text-[10px] sm:text-xs flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"><Save size={14} /> Save Block</button>
                            <button onClick={onCancel} className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 text-slate-500 hover:text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}><X size={14} /></button>
                        </div>
                    </div>

                    <button onClick={onDelete} className={`text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 mt-2 w-fit ${isDarkMode ? 'text-red-500/30 hover:text-red-500' : 'text-red-500/50 hover:text-red-500'}`}>
                        <Trash2 size={12} /> Delete Block Entirely
                    </button>
                </div>
            </div>
        );
    }

    const isExpanded = expandedIds.has(item.id);

    return (
        <div className={`group rounded-[1.5rem] sm:rounded-[2.5rem] transition-all duration-500 relative overflow-hidden border ${isCompleted ? `border-emerald-500/30 ${isDarkMode ? 'bg-slate-900/50 shadow-none' : 'bg-emerald-50/30 shadow-none'}` : `shadow-2xl ${isDarkMode ? 'shadow-black/40 border-white/5 bg-slate-900' : 'shadow-slate-200/50 border-slate-200 bg-white'}`}`}>
            <div className={`p-4 sm:p-6 border-b flex items-center justify-between transition-colors ${isDarkMode ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'}`}>
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black italic text-xs sm:text-sm ${isCompleted ? 'bg-emerald-500/10 text-emerald-500/40' : isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-300 border border-slate-200'}`}>{index}</div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className={`text-sm sm:text-base font-black uppercase tracking-tight ${isCompleted ? 'line-through opacity-40' : isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                            {item.metadata?.time_of_day && <span className={`text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>{item.metadata.time_of_day}</span>}
                        </div>
                        <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>{item.metadata?.duration || '0 min'} • {subtasks.length} Steps</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <button onClick={() => toggleExpand(item.id)} className={`p-2 rounded-xl border transition-all hover:scale-110 active:scale-90 ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-500' : 'bg-white border-slate-200 text-slate-400'}`}>{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
                    {!isSorting && (
                        <button onClick={onLog} className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all shadow-lg active:scale-95 ${isCompleted ? 'bg-emerald-600 text-white shadow-emerald-500/20' : isDarkMode ? 'bg-white/10 text-slate-300 hover:bg-emerald-500 hover:text-white' : 'bg-slate-100 text-slate-400 hover:bg-emerald-600 hover:text-white'}`}>{isCompleted ? <Undo2 size={16} strokeWidth={3} /> : <CheckCircle2 size={16} strokeWidth={2.5} />}</button>
                    )}
                </div>
            </div>

            <div className={`p-5 sm:p-8 transition-all duration-500 ${!isExpanded ? 'max-h-0 py-0 opacity-0 overflow-hidden' : 'max-h-[1000px] opacity-100'}`}>
                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 pt-2">
                        <div className="flex items-center gap-3 sm:gap-4">
                            {isSorting ? (
                                <div className="flex flex-col gap-1">
                                    <button onClick={() => onSort(item.id, 'up')} className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'bg-white/5 text-slate-500 hover:text-emerald-400' : 'bg-slate-100 text-slate-400 hover:text-emerald-600'}`}><ArrowUp size={14} /></button>
                                    <button onClick={() => onSort(item.id, 'down')} className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'bg-white/5 text-slate-500 hover:text-emerald-400' : 'bg-slate-100 text-slate-400 hover:text-emerald-600'}`}><ArrowDown size={14} /></button>
                                </div>
                            ) : (
                                <button onClick={onOpenStats} className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all ${isCompleted ? `${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white border-emerald-200 text-emerald-600 shadow-sm'}` : `${isDarkMode ? 'bg-white/5 border-white/5 text-slate-500 hover:text-emerald-400 hover:bg-white/10' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600'}`}`} title="Evolution History"><BarChart2 size={16} /></button>
                            )}
                            <div><h3 className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${isCompleted ? 'opacity-40' : isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3></div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 ml-auto sm:ml-0">
                            {!isSorting && (
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <button onClick={onEdit} className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all active:scale-95 ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-100'}`} title="Edit Protocol"><Edit3 size={16} /></button>
                                    <button onClick={onDelete} className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all active:scale-95 ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-500 hover:text-red-400 hover:bg-red-500/10' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-50'}`} title="Delete Protocol"><Trash2 size={16} /></button>
                                    {item.status === 'archived' ? (
                                        <button onClick={onRestore} className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all active:scale-95 ${isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20' : 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100'}`} title="Restore Protocol"><RotateCcw size={16} /></button>
                                    ) : (
                                        <button onClick={onArchive} className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 border-white/5 text-slate-500 hover:text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'}`} title="Archive Protocol"><Archive size={16} /></button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {subtasks.length > 0 && (
                        <div className="mb-8 space-y-2">
                            <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 transition-all duration-700 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{ width: `${progress}%` }} />
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                                <span>Sub-Action Evolution: {completedSubtasks.length} / {subtasks.length}</span>
                                <span>{Math.round(progress)}% Optimized</span>
                            </div>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <p className={`text-base sm:text-lg font-medium leading-relaxed italic mb-6 ${isCompleted ? `text-emerald-800/40 ${isDarkMode ? 'text-emerald-400/30' : ''}` : `${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}`}>{item.content}</p>
                            {(item.metadata?.supplements || subtasks.length > 0) && (
                                <div className={`space-y-4 pt-4 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                                    {item.metadata?.supplements && <div className="flex gap-3"><Pill size={14} className="text-emerald-500 mt-1 flex-shrink-0" /><p className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{item.metadata.supplements}</p></div>}
                                    {subtasks.length > 0 && (
                                        <div className="flex gap-3"><List size={14} className="text-emerald-500 mt-1 flex-shrink-0" />
                                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                                                {subtasks.map((act: any, i: number) => {
                                                    const actText = typeof act === 'string' ? act : act.text;
                                                    const actTags = typeof act === 'string' ? [] : (act.tags || []);
                                                    const isDone = completedSubtasks.includes(actText);
                                                    return (
                                                        <li key={i} onClick={() => onToggleSubtask(item.id, actText)} className={`group/subli flex flex-col gap-1 cursor-pointer transition-all hover:translate-x-1 ${isDone ? 'opacity-50' : ''}`}>
                                                            <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-md border flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>{isDone && <CheckCircle2 size={10} className="text-white" />}</div>
                                                                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${isDone ? 'text-emerald-500/50 line-through' : isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{act.task_master_id && <Zap size={8} className="text-emerald-500 fill-emerald-500" />}{actText}</span>
                                                            </div>
                                                            {actTags.length > 0 && <div className="ml-5 flex flex-wrap gap-1">{actTags.map((tag: string) => <span key={tag} className="text-[7px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500/60 border border-emerald-500/10">{tag}</span>)}</div>}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col justify-end items-end gap-3">
                            {item.metadata?.streak > 0 && <div className={`flex items-center gap-2 sm:gap-3 border px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-sm ${isDarkMode ? 'bg-amber-500/5 border-amber-500/20 text-amber-500' : 'bg-white border-amber-100 text-amber-600'}`}><Activity size={14} className="text-amber-500" /><span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.15em]">Streak: {item.metadata.streak} Cycles</span></div>}
                            {item.metadata?.tags && item.metadata.tags.length > 0 && <div className="flex flex-wrap justify-end gap-2 mt-4">{item.metadata.tags.map((tag: string) => <span key={tag} className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400'}`}><Hash size={10} /> {tag}</span>)}</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}
