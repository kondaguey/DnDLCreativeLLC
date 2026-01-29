"use client";

import { useMemo } from "react";
import {
    Calendar,
    Flame,
    Trophy,
    Target,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    CheckCircle2
} from "lucide-react";
import { TaskItem, RecurrenceType } from "./types";
import { getTodayString, calculateStats } from "./dateUtils";
import { createClient } from "@/lib/supabase/client";

interface RecurrenceDashboardProps {
    items: TaskItem[];
    activeRecurrence: RecurrenceType;
    period?: string; // "2024-01" etc
}

export default function RecurrenceDashboard({
    items,
    activeRecurrence
}: RecurrenceDashboardProps) {
    // 0. Filter items relevant to this dashboard
    // We only care about active items of the current recurrence type
    // Statistics are aggregated across ALL items of this type? 
    // OR is this dashboard usually specific to a SINGLE item or the whole category?
    // User phrasing: "let me tally and keep a ledger... plan the day... " 
    // It sounds like a "Top Level" dashboard for the category, PLUS individual task stats.
    // Let's build a "Category Overview" first.

    const relevantItems = useMemo(() =>
        items.filter(i => i.recurrence === activeRecurrence && i.status !== "archived"),
        [items, activeRecurrence]);

    const stats = useMemo(() => {
        let totalStreaks = 0;
        let totalCompletions = 0;
        let perfectDays = 0; // Days where ALL daily tasks were done

        // Naive aggregation for now
        relevantItems.forEach(item => {
            const { streak } = calculateStats(
                item.metadata?.completed_dates,
                item.created_at,
                activeRecurrence
            );
            totalStreaks += streak;
            totalCompletions += (item.metadata?.completed_dates?.length || 0);
        });

        return { totalStreaks, totalCompletions };
    }, [relevantItems, activeRecurrence]);

    // VIEW LOGIC
    if (activeRecurrence === "daily") {
        return <DailyDashboard items={relevantItems} stats={stats} />;
    }
    if (activeRecurrence === "weekly") {
        return <WeeklyDashboard items={relevantItems} stats={stats} />;
    }
    if (activeRecurrence === "monthly") {
        return <MonthlyDashboard items={relevantItems} stats={stats} />;
    }
    if (activeRecurrence === "quarterly") {
        return <QuarterlyDashboard items={relevantItems} stats={stats} />;
    }
    return null;
}

// --- SUB-DASHBOARDS ---

function DailyDashboard({ items, stats }: any) {
    // Show a heatmap or a simple week view of "Perfect Days"
    // For now, let's just show the Aggregate Streak and a mini calendar of THESE items?
    // Actually, user wants a "Ledger". 
    // Let's render a 7-day strip showing completion status for ALL daily tasks?

    return (
        <div className="w-full bg-slate-900/50 border border-white/5 rounded-3xl p-6 mb-8 backdrop-blur-md">
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <Flame className="text-orange-500" fill="currentColor" /> Daily Momentum
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* BIG STAT CARD */}
                <div className="bg-black/40 rounded-2xl p-5 border border-white/5 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-black text-white">{stats.totalStreaks}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-2">Aggregate Streak</span>
                </div>

                {/* HEATMAP PLACEHOLDER (To Be Built) */}
                <div className="md:col-span-2 bg-black/40 rounded-2xl p-5 border border-white/5 flex items-center justify-center text-slate-500 text-sm italic">
                    (Calendar Visualization Coming Soon)
                </div>
            </div>
        </div>
    );
}

function WeeklyDashboard({ items, stats }: any) {
    return (
        <div className="w-full bg-slate-900/50 border border-white/5 rounded-3xl p-6 mb-8 backdrop-blur-md">
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <Calendar className="text-purple-500" /> Weekly Plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <h3 className="font-bold text-purple-300 mb-2">This Week</h3>
                    <p className="text-sm text-slate-400">Focus on hitting your targets before Sunday.</p>
                </div>
            </div>
        </div>
    )
}

function MonthlyDashboard({ items, stats }: any) {
    return (
        <div className="w-full bg-slate-900/50 border border-white/5 rounded-3xl p-6 mb-8 backdrop-blur-md">
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <Target className="text-cyan-500" /> Monthly Targets
            </h2>
            {/* Monthly Grid Logic */}
        </div>
    )
}

function QuarterlyDashboard({ items, stats }: any) {
    const quarters = [
        { label: "Q1", range: "Jan 1 – Mar 31", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
        { label: "Q2", range: "Apr 1 – Jun 30", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
        { label: "Q3", range: "Jul 1 – Sep 30", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
        { label: "Q4", range: "Oct 1 – Dec 31", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    ];

    // Determine current Quarter
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const currentQIndex = Math.floor(month / 3);

    return (
        <div className="w-full bg-slate-900/50 border border-white/5 rounded-3xl p-6 mb-8 backdrop-blur-md">
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <Trophy className="text-amber-500" /> Quarterly Objectives
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {quarters.map((q, idx) => {
                    const isActive = idx === currentQIndex;
                    return (
                        <div key={q.label} className={`rounded-xl p-4 border flex flex-col gap-2 ${isActive ? `ring-2 ring-white/20 ${q.bg} ${q.border}` : "bg-black/20 border-white/5 opacity-50"}`}>
                            <div className="flex justify-between items-center">
                                <span className={`text-2xl font-black ${q.color}`}>{q.label}</span>
                                {isActive && <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded text-white">NOW</span>}
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{q.range}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
