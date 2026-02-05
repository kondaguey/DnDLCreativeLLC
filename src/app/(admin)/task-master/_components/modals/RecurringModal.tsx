"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Calendar,
  Check,
  List as ListIcon,
  Clock,
  Flame,
  TrendingUp,
  Target,
  Plus,
  AlertCircle,
  Trophy,
  RotateCcw,
  MinusCircle
} from "lucide-react";
import { TaskItem } from "../utils/types";
import { calculateStats, generateTrendData, formatDate, calculateMissedDates } from "../utils/dateUtils";
import {
  AreaChart,
  Area,
  ResponsiveContainer
} from "recharts";

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: TaskItem;
  onUpdateMetadata: (id: string, metadata: any) => void;
  onVoidRequest?: (id: string, dateEntry: string, onConfirm: () => void) => void;
}

export default function RecurringModal({
  isOpen,
  onClose,
  item,
  onUpdateMetadata,
  onVoidRequest
}: RecurringModalProps) {
  const [activeTab, setActiveTab] = useState<"success" | "missed">("success");
  const completedDates = (item.metadata?.completed_dates as string[]) || [];

  const stats = useMemo(() => {
    return calculateStats(completedDates, item.created_at, item.recurrence || "daily", item.metadata);
  }, [completedDates, item.created_at, item.recurrence, item.metadata]);

  const trendData = useMemo(() => {
    return generateTrendData(completedDates);
  }, [completedDates]);

  const missedEntries = useMemo(() => {
    return calculateMissedDates(completedDates, item.created_at, item.recurrence || "daily", item.metadata);
  }, [completedDates, item.created_at, item.recurrence, item.metadata]);

  const isOnTrack = stats.missed === 0;

  if (!isOpen) return null;

  const handleManualLog = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const entry = `${dateStr} @ ${timeStr}`;
    const newCompleted = [...completedDates, entry];
    onUpdateMetadata(item.id, {
      ...item.metadata,
      completed_dates: newCompleted,
    });
  };

  const handleVoidLog = (dateEntry: string) => {
    const executeVoid = () => {
      const index = completedDates.indexOf(dateEntry);
      if (index === -1) return;
      const newLog = [...completedDates];
      newLog.splice(index, 1);
      onUpdateMetadata(item.id, {
        ...item.metadata,
        completed_dates: newLog
      });
    };

    if (onVoidRequest) {
      onVoidRequest(item.id, dateEntry, executeVoid);
    } else {
      // Fallback if not provided, though we want custom modals everywhere
      if (window.confirm("Delete this event?")) {
        executeVoid();
      }
    }
  };

  const handleResolveMissed = (dateStr: string) => {
    const entry = `${dateStr} @ 00:00 (RESOLVED)`;
    const newCompleted = [...completedDates, entry];
    onUpdateMetadata(item.id, {
      ...item.metadata,
      completed_dates: newCompleted,
    });
  };

  const handleIgnoreMissed = (dateStr: string) => {
    const voided = (item.metadata?.voided_gaps as string[]) || [];
    onUpdateMetadata(item.id, {
      ...item.metadata,
      voided_gaps: [...voided, dateStr]
    });
  };

  const handleAddMissed = () => {
    const dateStr = prompt("Enter date to mark as missed (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return;

    const manualMissed = (item.metadata?.manual_missed as string[]) || [];
    onUpdateMetadata(item.id, {
      ...item.metadata,
      manual_missed: [...manualMissed, dateStr]
    });
  };

  const handleToggleDate = (dateEntry: string) => {
    const isDone = completedDates.includes(dateEntry);
    const newCompleted = isDone
      ? completedDates.filter((d) => d !== dateEntry)
      : [...completedDates, dateEntry];
    onUpdateMetadata(item.id, {
      ...item.metadata,
      completed_dates: newCompleted,
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 p-2 sm:p-4">
      <div className="w-full max-w-2xl bg-[#0a0f18] border border-white/10 rounded-[24px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[95vh] sm:h-[90vh] relative ring-1 ring-white/10">

        {/* --- HEADER --- */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-white/5 bg-slate-900/40 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <Target className="text-cyan-400" size={20} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight truncate max-w-[180px] sm:max-w-none">
                {item.title}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-500 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em]">
                  {item.recurrence}
                </span>
                <div className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${isOnTrack ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                  <div className={`w-1 h-1 rounded-full ${isOnTrack ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
                  {isOnTrack ? "On Track" : "Action"}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 sm:p-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all active:scale-95 border border-white/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- MAIN SCROLLABLE BODY --- */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0a0f18] scrollbar-thin scrollbar-thumb-white/10">

          {/* --- STATS GRID (Responsive Stacking) --- */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12">
            {/* Streak Card */}
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col items-center justify-center min-h-[120px] sm:min-h-[160px] relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
                <Flame size={48} className="text-orange-500" />
              </div>
              <div className="flex items-baseline gap-2 mb-2 z-10">
                <span className="text-3xl sm:text-4xl font-black text-white leading-none tracking-tighter">{stats.streak}</span>
                <Flame size={20} className="text-orange-500 fill-orange-500" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full z-10">Streak</span>
            </div>

            {/* Missed Card - NO REDUNDANT NUMBERS */}
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col items-center justify-center min-h-[120px] sm:min-h-[160px] relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
                <Clock size={48} className="text-rose-500" />
              </div>
              <div className="flex flex-col items-center gap-2 z-10">
                <span className="text-3xl sm:text-4xl font-black text-white leading-none tracking-tighter">{stats.missed}</span>
                <span className="text-[9px] sm:text-[10px] font-black text-rose-500/70 uppercase tracking-widest bg-rose-500/5 border border-rose-500/10 px-3 py-1 rounded-full">Missed</span>
              </div>
            </div>

            {/* Activity Trend Card */}
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col items-center justify-center min-h-[120px] sm:min-h-[160px] relative group overflow-hidden">
              <div className="flex items-center gap-2 mb-4 self-start z-10">
                <TrendingUp size={14} className="text-emerald-400" />
                <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Trend</span>
              </div>
              <div className="w-full h-8 sm:h-12 mb-2 z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="gTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#gTrend)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between w-full px-1 z-10">
                {trendData.slice(-4).map((d, i) => (
                  <span key={i} className="text-[7px] font-bold text-slate-600 uppercase">{d.name}</span>
                ))}
              </div>
            </div>
          </div>

          {/* --- TABBED MANIFEST LEDGER --- */}
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
              <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 w-fit">
                <button
                  onClick={() => setActiveTab("success")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === "success" ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-slate-400 hover:text-white"}`}
                >
                  <ListIcon size={14} /> Success Log
                </button>
                <button
                  onClick={() => setActiveTab("missed")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === "missed" ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "text-slate-400 hover:text-white"}`}
                >
                  <AlertCircle size={14} /> Missed Log
                </button>
              </div>

              <div className="flex items-center gap-3">
                {activeTab === "success" ? (
                  <button
                    onClick={handleManualLog}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 group/btn"
                  >
                    <Plus size={12} className="group-hover/btn:rotate-90 transition-transform" />
                    Log Entry
                  </button>
                ) : (
                  <button
                    onClick={handleAddMissed}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 group/btn"
                  >
                    <Plus size={12} className="group-hover/btn:rotate-90 transition-transform" />
                    Add Missed
                  </button>
                )}
              </div>
            </div>

            {activeTab === "success" ? (
              /* SUCCESS LOG VIEW */
              completedDates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-20 opacity-20 bg-slate-900/10 rounded-2xl sm:rounded-[32px] border border-dashed border-white/5">
                  <Clock size={40} className="mb-4 text-slate-600" />
                  <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500">Empty Success Log</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...completedDates]
                    .sort((a, b) => a.localeCompare(b))
                    .reverse()
                    .map((dateStr, index) => (
                      <div
                        key={index}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-white/[0.01] border border-white/5 rounded-xl sm:rounded-2xl transition-all hover:bg-white/[0.03] hover:border-white/10"
                      >
                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center text-[10px] sm:text-sm font-black text-slate-700 group-hover:text-emerald-500 transition-colors shrink-0">
                            {(completedDates.length - index).toString().padStart(2, '0')}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs sm:text-sm font-black text-slate-100 tracking-wider">
                              COMPLETED EVENT
                            </span>
                            <div className="flex items-center gap-2 mt-1 truncate">
                              <Clock size={10} className="text-emerald-500/50 shrink-0" />
                              <span className="text-[8px] sm:text-[10px] font-mono font-bold text-slate-500 tracking-tight truncate">
                                TS: {dateStr}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-4 sm:mt-0">
                          <button
                            onClick={() => handleVoidLog(dateStr)}
                            className="flex items-center gap-2 px-3 py-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 bg-white/5 border border-white/5 hover:border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                          >
                            <RotateCcw size={12} /> Void
                          </button>
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <Check size={18} className="stroke-[4]" />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )
            ) : (
              /* MISSED LOG VIEW */
              missedEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-20 bg-emerald-500/[0.02] rounded-2xl sm:rounded-[32px] border border-dashed border-emerald-500/10">
                  <Trophy size={40} className="mb-4 text-emerald-500/20" />
                  <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-500/40">Manifest Perfection</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {missedEntries.slice().reverse().map((dateStr, index) => (
                    <div
                      key={index}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-rose-500/[0.02] border border-rose-500/10 rounded-xl sm:rounded-2xl transition-all hover:bg-rose-500/[0.04] hover:border-rose-500/20"
                    >
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-slate-950 border border-rose-500/20 flex items-center justify-center text-[10px] sm:text-sm font-black text-rose-500/30 group-hover:text-rose-500 transition-colors shrink-0">
                          M
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-sm font-black text-rose-300 tracking-wider">
                            MISSED EVENT
                          </span>
                          <div className="flex items-center gap-2 mt-1 truncate">
                            <Clock size={10} className="text-rose-500/50 shrink-0" />
                            <span className="text-[8px] sm:text-[10px] font-mono font-bold text-slate-500 tracking-tight truncate">
                              PLAN: {formatDate(dateStr)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 sm:mt-0">
                        <button
                          onClick={() => handleIgnoreMissed(dateStr)}
                          className="flex items-center justify-center gap-2 px-3 py-2 text-slate-500 hover:text-white hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          <MinusCircle size={14} /> Ignore
                        </button>
                        <button
                          onClick={() => handleResolveMissed(dateStr)}
                          className="flex items-center justify-center gap-2 px-6 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-black border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          Resolve <TrendingUp size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* --- STICKY FOOTER (Responsive) --- */}
        <div className="p-6 sm:p-8 border-t border-white/5 bg-[#0a0f18]/90 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4 sm:gap-5 self-start">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 border border-white/5">
              <Calendar size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Next Scheduled Entry</span>
              <span className="text-sm sm:text-lg font-black text-white tracking-widest uppercase truncate max-w-[200px] sm:max-w-[280px]">
                {item.due_date ? formatDate(item.due_date) : "Manual"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-cyan-500/10 border border-cyan-400/20 rounded-xl sm:rounded-[20px] text-cyan-400 text-[10px] sm:text-sm font-black uppercase tracking-[0.15em] shadow-lg w-full sm:w-auto justify-center">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            Manifest: {item.recurrence}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}