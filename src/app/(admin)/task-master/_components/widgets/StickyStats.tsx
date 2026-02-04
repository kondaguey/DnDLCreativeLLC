"use client";

import { useMemo } from "react";
import { CheckCircle2, Circle, Flame } from "lucide-react";

interface StickyStatsProps {
    total: number;
    completed: number;
    label?: string;
    streak?: number;
}

export default function StickyStats({ total, completed, label = "Tasks", streak = 0 }: StickyStatsProps) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-black/50 px-6 py-3 flex items-center gap-6">

                {/* PROGRESS */}
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#1e293b"
                                strokeWidth="3"
                            />
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={percentage === 100 ? "#10b981" : "#8b5cf6"}
                                strokeWidth="3"
                                strokeDasharray={`${percentage}, 100`}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <span className="text-[10px] font-black">{percentage}%</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">{completed} / {total}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label} Done</span>
                    </div>
                </div>

                {/* STREAK OR EXTRA STAT */}
                {streak > 0 && (
                    <>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-orange-500/10 rounded-full border border-orange-500/20 text-orange-500">
                                <Flame size={14} fill="currentColor" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-white">{streak}</span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Streak</span>
                            </div>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}
