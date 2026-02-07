"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Zap, Plus, Trash2, Save, X, Edit3, ArrowUp, ArrowDown,
    Clock, GripVertical, Loader2, CheckCircle2, ChevronLeft,
    Search, Tag, ListChecks, PlusCircle, Target, Lightbulb
} from 'lucide-react';
import { fetchTemplates, createPersonalItem, updatePersonalItem, deletePersonalItem, updatePersonalPositions } from '../actions';
import { fetchAllTaskMasterItems } from '../../task-master/actions';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TemplateItem {
    id: string;
    title: string;
    content: string;
    position: number;
    metadata: any;
}

interface TaskMasterItem {
    id: string;
    title: string;
    content: string;
    type: string;
    metadata: any;
}

function SortableTemplateItem({ item, onEdit, onDelete, isDarkMode }: {
    item: TemplateItem;
    onEdit: () => void;
    onDelete: () => void;
    isDarkMode: boolean;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const subActions = item.metadata?.sub_actions || [];
    const tags = item.metadata?.tags || [];

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`p-6 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'}`}
        >
            <div className="flex items-start gap-4">
                <button
                    {...attributes}
                    {...listeners}
                    className={`p-2 rounded-xl cursor-grab active:cursor-grabbing mt-1 ${isDarkMode ? 'hover:bg-white/5 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}
                >
                    <GripVertical size={20} />
                </button>

                <div className="flex-1 min-w-0">
                    <h3 className={`font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {item.title || 'Untitled Protocol'}
                    </h3>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {item.content || 'No description'}
                    </p>

                    {/* Tags */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {tags.map((tag: string, i: number) => (
                                <span key={i} className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Sub-actions preview */}
                    {subActions.length > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                            <ListChecks size={12} className="text-blue-500" />
                            <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                {subActions.length} sub-task{subActions.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    )}

                    {/* Duration/Time */}
                    {(item.metadata?.duration || item.metadata?.time_of_day) && (
                        <div className="flex items-center gap-4 mt-3">
                            {item.metadata?.duration && (
                                <div className="flex items-center gap-1.5">
                                    <Clock size={12} className="text-amber-500" />
                                    <span className="text-[10px] font-bold text-amber-500">{item.metadata.duration}</span>
                                </div>
                            )}
                            {item.metadata?.time_of_day && (
                                <div className="flex items-center gap-1.5">
                                    <Target size={12} className="text-blue-500" />
                                    <span className="text-[10px] font-bold text-blue-500">{item.metadata.time_of_day}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onEdit}
                        className={`p-3 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                    >
                        <Edit3 size={18} />
                    </button>
                    <button
                        onClick={onDelete}
                        className={`p-3 rounded-xl transition-all ${isDarkMode ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'}`}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<TemplateItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState({
        title: '',
        content: '',
        duration: '',
        timeOfDay: '',
        tags: [] as string[],
        subActions: [] as { text: string; tags: string[] }[]
    });
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [newTag, setNewTag] = useState('');
    const [newSubAction, setNewSubAction] = useState('');

    // TaskMaster Import State
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [taskMasterItems, setTaskMasterItems] = useState<TaskMasterItem[]>([]);
    const [importSearch, setImportSearch] = useState('');
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);

    const availableTags = ['cosmetic', 'supplement', 'training', 'diet', 'business', 'work', 'skill up', 'creative work', 'free time', 'meal prep'];

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setIsLoading(true);
        const res = await fetchTemplates();
        if (res.success && res.data) {
            setTemplates(res.data);
        }
        setIsLoading(false);
    };

    const loadTaskMasterItems = async () => {
        setIsLoadingTasks(true);
        const res = await fetchAllTaskMasterItems();
        if (res.success && res.data) {
            setTaskMasterItems(res.data);
        }
        setIsLoadingTasks(false);
    };

    const handleAddTemplate = async () => {
        const newItem = {
            title: "",
            content: "",
            type: "task",
            position: templates.length > 0 ? templates[templates.length - 1].position + 1000 : 1000,
            metadata: {
                is_template: true,
                duration: "",
                time_of_day: "",
                sub_actions: [],
                cosmetic: "emerald",
                tags: []
            }
        };
        const res = await createPersonalItem(newItem);
        if (res.success && res.data) {
            setTemplates(prev => [...prev, res.data]);
            startEditing(res.data);
            showToast("New template created");
        } else {
            showToast("Failed to create template", 'error');
        }
    };

    const handleImportFromTaskMaster = async (taskItem: TaskMasterItem) => {
        const newItem = {
            title: taskItem.title,
            content: taskItem.content || taskItem.metadata?.notes || "",
            type: "task",
            position: templates.length > 0 ? templates[templates.length - 1].position + 1000 : 1000,
            metadata: {
                is_template: true,
                duration: taskItem.metadata?.duration || "",
                time_of_day: taskItem.metadata?.time_of_day || "",
                sub_actions: taskItem.metadata?.sub_actions || [],
                cosmetic: taskItem.metadata?.cosmetic || "emerald",
                tags: taskItem.metadata?.tags || [],
                source_task_id: taskItem.id
            }
        };
        const res = await createPersonalItem(newItem);
        if (res.success && res.data) {
            setTemplates(prev => [...prev, res.data]);
            showToast(`Imported: ${taskItem.title}`);
        } else {
            showToast("Failed to import", 'error');
        }
    };

    const startEditing = (item: TemplateItem) => {
        setEditingId(item.id);
        setEditValues({
            title: item.title || '',
            content: item.content || '',
            duration: item.metadata?.duration || '',
            timeOfDay: item.metadata?.time_of_day || '',
            tags: item.metadata?.tags || [],
            subActions: (item.metadata?.sub_actions || []).map((s: any) =>
                typeof s === 'string' ? { text: s, tags: [] } : s
            )
        });
    };

    const saveEdit = async () => {
        if (!editingId) return;
        const item = templates.find(t => t.id === editingId);
        if (!item) return;

        const updates = {
            title: editValues.title,
            content: editValues.content,
            metadata: {
                ...item.metadata,
                duration: editValues.duration,
                time_of_day: editValues.timeOfDay,
                tags: editValues.tags,
                sub_actions: editValues.subActions
            }
        };

        setTemplates(prev => prev.map(t => t.id === editingId ? { ...t, ...updates } : t));
        setEditingId(null);

        const res = await updatePersonalItem(editingId, updates);
        if (res.success) {
            showToast("Template saved");
        } else {
            showToast("Failed to save", 'error');
            loadTemplates();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this template?")) return;

        setTemplates(prev => prev.filter(t => t.id !== id));
        const res = await deletePersonalItem(id);
        if (res.success) {
            showToast("Template deleted");
        } else {
            showToast("Failed to delete", 'error');
            loadTemplates();
        }
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            let newList: TemplateItem[] = [];

            setTemplates((prev) => {
                const oldIndex = prev.findIndex((i) => i.id === active.id);
                const newIndex = prev.findIndex((i) => i.id === over.id);
                const temp = arrayMove(prev, oldIndex, newIndex);
                newList = temp.map((item, index) => ({ ...item, position: index * 1000 }));
                return newList;
            });

            setTimeout(() => {
                const positionUpdates = newList.map(item => ({ id: item.id, position: item.position }));
                updatePersonalPositions(positionUpdates);
            }, 0);
        }
    };

    const addTag = () => {
        if (newTag && !editValues.tags.includes(newTag)) {
            setEditValues(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
            setNewTag('');
        }
    };

    const removeTag = (tag: string) => {
        setEditValues(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    };

    const addSubAction = () => {
        if (newSubAction) {
            setEditValues(prev => ({
                ...prev,
                subActions: [...prev.subActions, { text: newSubAction, tags: [] }]
            }));
            setNewSubAction('');
        }
    };

    const removeSubAction = (index: number) => {
        setEditValues(prev => ({
            ...prev,
            subActions: prev.subActions.filter((_, i) => i !== index)
        }));
    };

    const filteredTaskMasterItems = taskMasterItems.filter(item =>
        item.title.toLowerCase().includes(importSearch.toLowerCase()) ||
        item.content?.toLowerCase().includes(importSearch.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
                <Loader2 className="animate-spin text-emerald-500" size={48} />
            </div>
        );
    }

    return (
        <div className={`min-h-screen py-6 sm:py-12 px-4 sm:px-6 transition-colors ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
            <div className="max-w-3xl mx-auto">
                {/* HEADER */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link
                            href="/daily-schedule"
                            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-4 transition-colors ${isDarkMode ? 'text-slate-500 hover:text-emerald-400' : 'text-slate-400 hover:text-emerald-600'}`}
                        >
                            <ChevronLeft size={14} />
                            Back to Scheduler
                        </Link>
                        <h1 className={`text-3xl sm:text-4xl font-black uppercase tracking-tighter italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            Daily Templates
                        </h1>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            Create and manage your daily protocol templates
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setIsImportModalOpen(true);
                                loadTaskMasterItems();
                            }}
                            className={`px-4 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all border ${isDarkMode ? 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10' : 'border-blue-500/30 text-blue-600 hover:bg-blue-50'}`}
                        >
                            <Lightbulb size={16} />
                            Import
                        </button>
                        <button
                            onClick={handleAddTemplate}
                            className="bg-emerald-600 text-white font-black uppercase tracking-widest px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
                        >
                            <Plus size={18} />
                            Add
                        </button>
                    </div>
                </div>

                {/* TOAST */}
                {toast && (
                    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top duration-300 px-4">
                        <div className={`px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-4 font-black uppercase tracking-[0.2em] text-[10px] ${toast.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400/50' : 'bg-red-500 text-white border-red-400/50'}`}>
                            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <X size={16} />}
                            {toast.message}
                        </div>
                    </div>
                )}

                {/* IMPORT MODAL */}
                {isImportModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsImportModalOpen(false)} />
                        <div className={`relative w-full max-w-2xl rounded-[2rem] border shadow-2xl max-h-[80vh] overflow-hidden flex flex-col ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
                            <div className="p-6 border-b border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className={`text-xl font-black uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                        Import from Task Master
                                    </h2>
                                    <button onClick={() => setIsImportModalOpen(false)} className="text-slate-500 hover:text-white">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="relative">
                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        value={importSearch}
                                        onChange={(e) => setImportSearch(e.target.value)}
                                        placeholder="Search tasks..."
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 placeholder:text-slate-400'}`}
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                {isLoadingTasks ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="animate-spin text-emerald-500" size={32} />
                                    </div>
                                ) : filteredTaskMasterItems.length === 0 ? (
                                    <p className="text-center text-slate-500 py-12">No tasks found</p>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredTaskMasterItems.map(item => (
                                            <div
                                                key={item.id}
                                                className={`p-4 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-bold truncate">{item.title}</h4>
                                                    <p className={`text-xs truncate ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{item.content || 'No description'}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleImportFromTaskMaster(item)}
                                                    className="ml-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500"
                                                >
                                                    Import
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* EDIT MODAL */}
                {editingId && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setEditingId(null)} />
                        <div className={`relative w-full max-w-lg rounded-[2rem] border p-8 shadow-2xl max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
                            <h2 className={`text-xl font-black uppercase tracking-tighter mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                Edit Template
                            </h2>
                            <div className="space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Title</label>
                                    <input
                                        value={editValues.title}
                                        onChange={(e) => setEditValues(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Protocol name..."
                                        className={`w-full px-4 py-3 rounded-xl border text-sm font-bold ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 placeholder:text-slate-400'}`}
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Description</label>
                                    <textarea
                                        value={editValues.content}
                                        onChange={(e) => setEditValues(prev => ({ ...prev, content: e.target.value }))}
                                        placeholder="What does this protocol involve?"
                                        rows={3}
                                        className={`w-full px-4 py-3 rounded-xl border text-sm resize-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 placeholder:text-slate-400'}`}
                                    />
                                </div>

                                {/* Duration & Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Duration</label>
                                        <input
                                            value={editValues.duration}
                                            onChange={(e) => setEditValues(prev => ({ ...prev, duration: e.target.value }))}
                                            placeholder="e.g. 30 min"
                                            className={`w-full px-4 py-3 rounded-xl border text-sm font-bold ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 placeholder:text-slate-400'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Time of Day</label>
                                        <input
                                            value={editValues.timeOfDay}
                                            onChange={(e) => setEditValues(prev => ({ ...prev, timeOfDay: e.target.value }))}
                                            placeholder="e.g. Morning"
                                            className={`w-full px-4 py-3 rounded-xl border text-sm font-bold ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 placeholder:text-slate-400'}`}
                                        />
                                    </div>
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Tags</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {editValues.tags.map((tag, i) => (
                                            <button
                                                key={i}
                                                onClick={() => removeTag(tag)}
                                                className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400 hover:bg-red-500/20 hover:text-red-400' : 'bg-emerald-50 text-emerald-600 hover:bg-red-50 hover:text-red-500'}`}
                                            >
                                                {tag} <X size={10} />
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            className={`flex-1 px-4 py-2 rounded-xl border text-sm ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'}`}
                                        >
                                            <option value="">Select tag...</option>
                                            {availableTags.filter(t => !editValues.tags.includes(t)).map(tag => (
                                                <option key={tag} value={tag}>{tag}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={addTag}
                                            disabled={!newTag}
                                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 disabled:opacity-50"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Sub-Actions */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Sub-Tasks</label>
                                    <div className="space-y-2 mb-2">
                                        {editValues.subActions.map((sub, i) => (
                                            <div key={i} className={`flex items-center gap-2 p-3 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                                                <span className="flex-1 text-sm">{sub.text}</span>
                                                <button onClick={() => removeSubAction(i)} className="text-red-400 hover:text-red-500">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            value={newSubAction}
                                            onChange={(e) => setNewSubAction(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addSubAction()}
                                            placeholder="Add sub-task..."
                                            className={`flex-1 px-4 py-2 rounded-xl border text-sm ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 placeholder:text-slate-400'}`}
                                        />
                                        <button
                                            onClick={addSubAction}
                                            disabled={!newSubAction}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 disabled:opacity-50"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => setEditingId(null)}
                                    className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${isDarkMode ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveEdit}
                                    className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                                >
                                    <Save size={14} />
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TEMPLATES LIST */}
                {templates.length === 0 ? (
                    <div className={`p-12 rounded-[2.5rem] border text-center ${isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200'}`}>
                        <Zap size={48} className="mx-auto text-emerald-500 mb-4 opacity-50" />
                        <h3 className={`text-xl font-black uppercase tracking-tighter mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            No Templates Yet
                        </h3>
                        <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            Create your first template to get started. Templates are your daily routines that you can load onto any day.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => {
                                    setIsImportModalOpen(true);
                                    loadTaskMasterItems();
                                }}
                                className={`px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all border ${isDarkMode ? 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10' : 'border-blue-500/30 text-blue-600 hover:bg-blue-50'}`}
                            >
                                <Lightbulb size={18} />
                                Import from Task Master
                            </button>
                            <button
                                onClick={handleAddTemplate}
                                className="bg-emerald-600 text-white font-black uppercase tracking-widest px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20"
                            >
                                <Plus size={20} />
                                Create Template
                            </button>
                        </div>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={templates.map(t => t.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-4">
                                {templates.map((item) => (
                                    <SortableTemplateItem
                                        key={item.id}
                                        item={item}
                                        onEdit={() => startEditing(item)}
                                        onDelete={() => handleDelete(item.id)}
                                        isDarkMode={isDarkMode}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}

                {/* ADD MORE BUTTON */}
                {templates.length > 0 && (
                    <button
                        onClick={handleAddTemplate}
                        className={`w-full mt-6 py-8 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 group ${isDarkMode ? 'border-white/5 bg-white/[0.02] text-slate-600 hover:text-emerald-400 hover:border-emerald-500/20' : 'border-slate-200 bg-white/50 text-slate-400 hover:text-emerald-600 hover:border-emerald-600/30'}`}
                    >
                        <Plus size={24} />
                        <span className="font-black uppercase tracking-[0.2em] text-[10px]">Add Another Template</span>
                    </button>
                )}
            </div>
        </div>
    );
}
