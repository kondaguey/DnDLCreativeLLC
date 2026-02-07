
"use client";

import React, { useMemo } from "react";
import {
    X, Flame, Calendar, Target, Clock, Check, Plus, Undo2, Trash2, Activity, TrendingUp, BarChart2
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface PersonalItem {
    id: string;
    title: string;
    content: string;
    status: string;
    due_date: string | null;
    metadata: any;
    recurrence: string | null;
}

interface PersonalStatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: PersonalItem | null;
    isDarkMode?: boolean;
    onUpdateMetadata: (id: string, metadata: any) => Promise<void>;
}

export default function PersonalStatsModal({
    isOpen,
    onClose,
    item,
    isDarkMode,
    onUpdateMetadata
}: PersonalStatsModalProps) {
    const completedDates = (item?.metadata?.completed_dates as string[]) || [];

    const chartData = useMemo(() => {
        const last14Days = Array.from({ length: 14 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const counts = completedDates.reduce((acc: any, entry: string) => {
            const date = entry.split(' @ ')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        return last14Days.map(date => ({
            date: date.split('-').slice(1).join('/'),
            fullDate: date,
            count: counts[date] || 0
        }));
    }, [completedDates]);

    const handleManualLog = async () => {
        if (!item) return;
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const entry = `${dateStr} @ ${timeStr}`;

        const newLog = [...completedDates, entry];
        const newStreak = newLog.length;

        await onUpdateMetadata(item.id, {
            ...item.metadata,
            completed_dates: newLog,
            streak: newStreak
        });
    };

    const handleDeleteLog = async (index: number) => {
        if (!item || !confirm("Delete this log entry?")) return;

        const newLog = [...completedDates];
        newLog.splice(index, 1);
        const newStreak = newLog.length;

        await onUpdateMetadata(item.id, {
            ...item.metadata,
            completed_dates: newLog,
            streak: newStreak
        });
    };

    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className={`absolute inset-0 backdrop-blur-sm ${isDarkMode ? 'bg-slate-950/80' : 'bg-slate-950/20'}`} onClick={onClose} />

            <div className={`relative w-full max-w-lg border rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                {/* Header */}
                <div className={`p-6 sm:p-8 border-b flex justify-between items-start ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                    <div>
                        <h2 className={`text-xl sm:text-2xl font-black uppercase tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">History & Evolution</p>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-500' : 'bg-slate-100 hover:bg-slate-200 text-slate-400'}`}>
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 sm:p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200/50'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Flame size={14} className="text-orange-500" />
                                <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Streak</span>
                            </div>
                            <p className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.metadata?.streak || 0}</p>
                        </div>
                        <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200/50'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Activity size={14} className="text-emerald-500" />
                                <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Total</span>
                            </div>
                            <p className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{completedDates.length}</p>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className={`p-6 rounded-[2rem] border ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50/50 border-slate-100'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                <TrendingUp size={14} /> 14-Day Velocity
                            </h3>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Evolution Progress</span>
                        </div>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.count > 0 ? '#10b981' : (isDarkMode ? '#1e293b' : '#e2e8f0')}
                                            />
                                        ))}
                                    </Bar>
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 9, fontWeight: 700, fill: isDarkMode ? '#475569' : '#94a3b8' }}
                                        interval={2}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                                            border: `1px solid ${isDarkMode ? '#1e293b' : '#e2e8f0'}`,
                                            borderRadius: '12px',
                                            fontSize: '10px',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase'
                                        }}
                                        cursor={{ fill: isDarkMode ? '#1e293b' : '#f1f5f9', opacity: 0.4 }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Log History */}
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                <Clock size={16} /> Completion Ledger
                            </h3>
                            <button
                                onClick={handleManualLog}
                                className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5"
                            >
                                <Plus size={14} /> Add Log
                            </button>
                        </div>

                        {completedDates.length === 0 ? (
                            <div className={`text-center py-12 rounded-3xl border border-dashed ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                <p className={`text-xs font-bold uppercase tracking-widest italic ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>No cycles recorded yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {[...completedDates].reverse().map((entry, idx) => {
                                    const originalIndex = completedDates.length - 1 - idx;
                                    return (
                                        <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/[0.08] group' : 'bg-white border-slate-200 hover:border-emerald-200 group'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400 ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                                                    <Check size={16} strokeWidth={3} />
                                                </div>
                                                <p className={`text-sm font-bold font-mono tracking-tight ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{entry}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteLog(originalIndex)}
                                                className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-400/10 ${isDarkMode ? 'text-slate-600 hover:text-red-400' : 'text-slate-300 hover:text-red-500'}`}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className={`p-6 border-t ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] text-center ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                        Protocol Persistence Active • DnDL Creative LLC
                    </p>
                </div>
            </div>
        </div>
    );
}
