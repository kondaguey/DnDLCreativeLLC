"use client";

import React, { useEffect, useState } from "react";
import { X, Flame, Calendar, Target, Trophy, TrendingUp } from "lucide-react";
import { TaskItem, RecurrenceType } from "./types";
import { calculateStats } from "./dateUtils";
import RecurrenceChart from "./RecurrenceChart";

interface ItemStatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: TaskItem | null;
}

export default function ItemStatsModal({ isOpen, onClose, item }: ItemStatsModalProps) {
    if (!isOpen || !item) return null;

    const stats = calculateStats(
        item.metadata?.completed_dates,
        item.created_at,
        item.recurrence || "daily"
    );

    const recurrence = item.recurrence || "daily";
    const isLate = stats.missed > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* BACKDROP */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* MODAL */}
            <div className="relative bg-[#0F172A] border border-white/10 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                {/* Background Glow */}
                <div className={`absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none transition-colors ${isLate ? "bg-rose-500/10" : "bg-purple-500/10"}`} />
                <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* HEADER */}
                <div className="flex items-start gap-4 mb-8 relative z-10">
                    <div className={`p-3 rounded-2xl ${recurrence === "daily" ? "bg-orange-500/10 text-orange-500" :
                        recurrence === "weekly" ? "bg-purple-500/10 text-purple-500" :
                            recurrence === "monthly" ? "bg-cyan-500/10 text-cyan-500" :
                                "bg-rose-500/10 text-rose-500"
                        }`}>
                        {recurrence === "daily" && <Flame size={24} fill="currentColor" />}
                        {recurrence === "weekly" && <Calendar size={24} />}
                        {recurrence === "monthly" && <Target size={24} />}
                        {recurrence === "quarterly" && <Trophy size={24} />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white leading-tight">{item.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold uppercase tracking-wider text-slate-500">
                                {recurrence} Stats
                            </span>
                            {/* STATUS BADGE */}
                            {isLate ? (
                                <span className="text-[10px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20 flex items-center gap-1">
                                    <Target size={10} /> Late / Missed
                                </span>
                            ) : (
                                <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                                    <TrendingUp size={10} /> On Track
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* GRID STATS */}
                <div className="grid grid-cols-3 gap-4 mb-8 relative z-10">
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-black text-white flex items-center gap-2">
                            {stats.streak} <Flame size={20} className="text-orange-500" fill="currentColor" />
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">Current Streak</span>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-black text-white">
                            {item.metadata?.completed_dates?.length || 0}
                        </span>
                        {/* MISSED STAT */}
                        <div className={`rounded-2xl p-4 flex flex-col items-center justify-center text-center border transition-colors ${isLate ? "bg-rose-500/10 border-rose-500/20" : "bg-black/40 border-white/5"}`}>
                            <span className={`text-3xl font-black ${isLate ? "text-rose-400" : "text-slate-500"}`}>
                                {stats.missed}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isLate ? "text-rose-400" : "text-slate-500"}`}>
                                Missed
                            </span>
                        </div>
                    </div>

                    {/* CHART */}
                    <div className="bg-black/20 border border-white/5 rounded-2xl p-6 relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={16} className="text-emerald-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Activity Trend</span>
                        </div>
                        <RecurrenceChart items={[item]} period={(recurrence === "quarterly" ? "monthly" : recurrence) as any} />
                    </div>
                </div>
            </div>
        </div>
    );
}
