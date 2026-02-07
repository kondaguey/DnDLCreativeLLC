"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Zap, X, Plus, Loader2, ChevronRight, Target, LayoutGrid, List, Lightbulb, GraduationCap, Share2, CheckSquare } from 'lucide-react';
import { fetchAllTaskMasterItems } from '../task-master/actions';
import { TaskItem as TaskMasterItem, RecurrenceType, ViewType } from '../task-master/_components/utils/types';

interface TaskMasterImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (item: TaskMasterItem, target: { type: 'main' | 'subtask', parentId?: string }) => void;
    isDarkMode: boolean;
    personalItems: any[];
}

const CAT_TABS: { label: string, value: ViewType, icon: any }[] = [
    { label: 'Quick Notes', value: 'idea_board', icon: Lightbulb },
    { label: 'Protocol Tasks', value: 'task', icon: CheckSquare },
    { label: 'Leveling Up', value: 'level_up', icon: GraduationCap },
    { label: 'Signal Archive', value: 'resource', icon: Share2 },
];

const REC_TABS: { label: string, value: RecurrenceType | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'One-off', value: 'one_off' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
];

export default function TaskMasterImportModal({ isOpen, onClose, onImport, isDarkMode, personalItems }: TaskMasterImportModalProps) {
    const [tmItems, setTmItems] = useState<TaskMasterItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCat, setActiveCat] = useState<ViewType>('task');
    const [activeRec, setActiveRec] = useState<RecurrenceType | 'all'>('all');
    const [selectedItem, setSelectedItem] = useState<TaskMasterItem | null>(null);

    const loadItems = useCallback(async () => {
        setIsLoading(true);
        const res = await fetchAllTaskMasterItems();
        if (res.success) {
            setTmItems(res.data || []);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            loadItems();
            setSelectedItem(null);
        }
    }, [isOpen, loadItems]);

    const filtered = useMemo(() => {
        return tmItems.filter(i => {
            const matchesSearch = i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (i.content && i.content.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesCat = i.type === activeCat;
            const matchesRec = activeCat !== 'task' || activeRec === 'all' || i.recurrence === activeRec;
            return matchesSearch && matchesCat && matchesRec;
        });
    }, [tmItems, searchTerm, activeCat, activeRec]);

    if (!isOpen) return null;

    const handleSelectTarget = (type: 'main' | 'subtask', parentId?: string) => {
        if (selectedItem) {
            onImport(selectedItem, { type, parentId });
            setSelectedItem(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose} />
            <div className={`relative w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-[3.5rem] border shadow-3xl flex flex-col ${isDarkMode ? 'bg-slate-900 border-white/10 shadow-emerald-900/40' : 'bg-white border-slate-200 shadow-slate-200/50'}`}>

                {/* Header */}
                <div className="p-10 pb-6 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-4">
                            {selectedItem && (
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className={`p-2.5 rounded-2xl transition-all ${isDarkMode ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                                >
                                    <ChevronRight className="rotate-180" size={24} />
                                </button>
                            )}
                            <h2 className={`text-4xl font-black uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                {selectedItem ? "Confirm Target" : "Import Directive"}
                            </h2>
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-3 mt-2">
                            <Zap size={16} /> {selectedItem ? `Targeting: ${selectedItem.title}` : "Synchronize with Task-Master"}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-4 rounded-3xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                        <X size={28} />
                    </button>
                </div>

                {!selectedItem ? (
                    <>
                        {/* CATEGORY TABS */}
                        <div className="px-10 pb-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {CAT_TABS.map(cat => (
                                    <button
                                        key={cat.value}
                                        onClick={() => {
                                            setActiveCat(cat.value);
                                            setActiveRec('all');
                                        }}
                                        className={`p-6 rounded-[2rem] border flex flex-col items-center gap-3 transition-all ${activeCat === cat.value ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-600/30 ring-4 ring-emerald-500/10' : isDarkMode ? 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <cat.icon size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search & Sub-Tabs */}
                        <div className="px-10 pb-8 space-y-6">
                            <div className="flex items-center gap-5 bg-slate-100 dark:bg-white/5 rounded-[1.5rem] px-7 py-4 border border-transparent focus-within:border-emerald-500/30 transition-all shadow-inner">
                                <Search size={22} className="text-slate-400" />
                                <input
                                    autoFocus
                                    placeholder="Search Protocol System..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="bg-transparent border-none outline-none font-black uppercase tracking-widest text-sm w-full placeholder:text-slate-500"
                                />
                            </div>

                            {activeCat === 'task' && (
                                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide animate-in slide-in-from-top-2 duration-300">
                                    {REC_TABS.map(tab => (
                                        <button
                                            key={tab.value}
                                            onClick={() => setActiveRec(tab.value)}
                                            className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${activeRec === tab.value ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 shadow-lg shadow-emerald-500/5' : isDarkMode ? 'bg-white/5 border-transparent text-slate-500 hover:text-slate-300' : 'bg-slate-50 border-transparent text-slate-400 hover:text-slate-600'}`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* List - Added extra horizontal padding to avoid scale clipping */}
                        <div className="flex-grow overflow-y-auto px-10 sm:px-12 pb-12 space-y-8">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="animate-spin text-emerald-500" size={40} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Syncing Protocol Stream...</span>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="text-center py-20 font-black uppercase tracking-widest text-slate-500 text-sm">No compatible directives found.</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-1">
                                    {filtered.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => setSelectedItem(item)}
                                            className={`group p-8 rounded-[2.5rem] border text-left transition-all hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-2xl relative ${isDarkMode ? 'bg-white/5 border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:shadow-emerald-900/20' : 'bg-slate-50 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-emerald-500/10'}`}
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'bg-white/10 text-slate-400' : 'bg-white text-slate-400 border border-slate-100 shadow-sm'}`}>
                                                    {item.recurrence || 'one_off'}
                                                </span>
                                                <div className={`p-2.5 rounded-full transition-all ${isDarkMode ? 'bg-white/10 text-emerald-500/50 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-500/20' : 'bg-white text-emerald-300 group-hover:bg-emerald-500 group-hover:text-white shadow-sm group-hover:shadow-lg group-hover:shadow-emerald-500/20'}`}>
                                                    <Plus size={20} />
                                                </div>
                                            </div>
                                            <h4 className={`text-2xl font-black uppercase tracking-tighter mb-3 leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
                                            <p className="text-[14px] font-medium text-slate-500 leading-relaxed italic tracking-tight">{item.content || 'System directive ready for optimization.'}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-grow overflow-y-auto px-8 pb-8 space-y-8 animate-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 gap-6">
                            <button
                                onClick={() => handleSelectTarget('main')}
                                className={`flex items-center gap-6 p-8 rounded-[2.5rem] border text-left transition-all hover:scale-[1.02] active:scale-95 group ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 shadow-xl shadow-emerald-900/20' : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 shadow-xl shadow-emerald-500/10'}`}
                            >
                                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${isDarkMode ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'}`}>
                                    <LayoutGrid size={32} />
                                </div>
                                <div>
                                    <h3 className={`text-xl font-black uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Add as Main Task</h3>
                                    <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Insert as a standalone protocol directive in your list.</p>
                                </div>
                                <ChevronRight className="ml-auto text-emerald-500 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div>
                                <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 pl-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Add as Subtask to existing:</h3>
                                <div className="grid gap-2">
                                    {personalItems.filter(i => i.status !== 'archived').length === 0 ? (
                                        <div className="text-center py-10 text-[10px] font-black uppercase tracking-widest text-slate-500 italic">No available parent directives.</div>
                                    ) : (
                                        personalItems.filter(i => i.status !== 'archived').map(pi => (
                                            <button
                                                key={pi.id}
                                                onClick={() => handleSelectTarget('subtask', pi.id)}
                                                className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all group ${isDarkMode ? 'bg-white/5 border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5' : 'bg-slate-50 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50'}`}
                                            >
                                                <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-white/10 text-slate-400' : 'bg-white text-slate-300 border border-slate-100'}`}>
                                                    <List size={16} />
                                                </div>
                                                <span className={`text-xs font-black uppercase tracking-tight ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{pi.title}</span>
                                                <Plus size={14} className="ml-auto text-emerald-500 opacity-0 group-hover:opacity-100 transition-all" />
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
