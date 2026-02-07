
import React from 'react';
import Link from 'next/link';
import { Gauge, Target, PlusCircle, ChevronUp, ChevronDown, Activity, Command } from 'lucide-react';
import { PersonalItem } from '../types';

interface HUDProps {
    isDarkMode: boolean;
    selectedDate: string;
    isHudOpen: boolean;
    setIsHudOpen: (val: boolean) => void;
    setIsImportModalOpen: (val: boolean) => void;
    dayProgress: number;
    totalActive: number;
    totalCompleted: number;
    currentFocusItem: PersonalItem | undefined;
    getProgressColor: (p: number) => string;
    getProgressBg: (p: number) => string;
}

export default function HUD({
    isDarkMode,
    selectedDate,
    isHudOpen,
    setIsHudOpen,
    setIsImportModalOpen,
    dayProgress,
    totalActive,
    totalCompleted,
    currentFocusItem,
    getProgressColor,
    getProgressBg
}: HUDProps) {
    return (
        <div className={`mb-8 rounded-[2rem] border transition-all duration-500 overflow-hidden ${isDarkMode ? 'bg-slate-900/50 border-white/5 shadow-2xl shadow-black/40' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`}>
            <div className="p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                            <Gauge size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter italic leading-none">Daily HUD</h2>
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                {new Date(selectedDate + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/task-master"
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all active:scale-95 group ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30' : 'bg-slate-50 border-slate-100 text-slate-500 hover:text-emerald-600 hover:border-emerald-500'}`}
                        >
                            <Target size={14} className="group-hover:rotate-12 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Protocol Editor</span>
                        </Link>

                        <button
                            onClick={() => setIsImportModalOpen(true)}
                            className={`relative group px-4 py-2 sm:px-6 sm:py-3 rounded-[1.2rem] sm:rounded-2xl font-black uppercase tracking-widest text-[8px] sm:text-[10px] flex items-center gap-2 sm:gap-3 transition-all active:scale-95 shadow-lg overflow-hidden ${isDarkMode ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-emerald-600 text-white shadow-emerald-500/30'}`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                            <PlusCircle size={14} className="sm:size-4 relative z-10" />
                            <span className="relative z-10">Protocol Stream</span>
                            <div className="absolute -inset-1 bg-emerald-400 opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
                        </button>
                        <button
                            onClick={() => setIsHudOpen(!isHudOpen)}
                            className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5 text-slate-500' : 'hover:bg-slate-50 text-slate-400'}`}
                        >
                            {isHudOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    </div>
                </div>

                {isHudOpen && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Daily Progress</span>
                                <Activity size={12} className={getProgressColor(dayProgress)} />
                            </div>
                            <div className={`text-2xl font-black italic ${getProgressColor(dayProgress)} transition-colors duration-500`}>
                                {Math.round(dayProgress)}%
                            </div>
                            <div className="mt-3 h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 rounded-full ${getProgressBg(dayProgress)}`}
                                    style={{ width: `${dayProgress}%` }}
                                />
                            </div>
                        </div>

                        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Protocol Load</span>
                                <Command size={12} className="text-blue-500" />
                            </div>
                            <div className="text-2xl font-black italic">{totalCompleted} / {totalActive}</div>
                            <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Executed Directives</p>
                        </div>

                        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Current Vector</span>
                                <Target size={12} className="text-amber-500" />
                            </div>
                            <div className="text-[11px] font-black uppercase tracking-tight truncate">
                                {currentFocusItem?.title || "Operational Zero"}
                            </div>
                            <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Immediate Priority</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
