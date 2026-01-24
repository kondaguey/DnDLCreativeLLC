"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Check,
  Settings,
  Target,
  BarChart2,
  List as ListIcon,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { TaskItem } from "./types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: TaskItem;
  onUpdateMetadata: (id: string, metadata: any) => void;
}

type ModalTab = "calendar" | "analytics";
type CalendarView = "month" | "year";

const DAY_STRINGS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// FEB 1, 2026 FLOOR: Prevents the calendar from showing "Missed" reds prior to this date.
const FEB_START = new Date(2026, 1, 1);

export default function RecurringModal({
  isOpen,
  onClose,
  item,
  onUpdateMetadata,
}: RecurringModalProps) {
  const isMonthlyOrQuarterly = ["monthly", "quarterly"].includes(item.recurrence || "");
  const initialView = isMonthlyOrQuarterly ? "year" : "month";

  const [activeTab, setActiveTab] = useState<ModalTab>("calendar");
  const [view, setView] = useState<CalendarView>(initialView);
  const [focusDate, setFocusDate] = useState(new Date());

  const [showSettings, setShowSettings] = useState(false);
  const [pendingTargetDay, setPendingTargetDay] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFocusDate(new Date());
      if (isMonthlyOrQuarterly && !item.metadata?.preferred_day_num) {
        setView("month");
      } else {
        setView(initialView);
      }
      setActiveTab("calendar");
      setShowSettings(!isMonthlyOrQuarterly && !item.metadata?.preferred_weekday);
      setPendingTargetDay(null);
    }
  }, [isOpen, initialView, isMonthlyOrQuarterly, item.metadata?.preferred_weekday, item.metadata?.preferred_day_num]);

  if (!isOpen) return null;

  const completedDates = (item.metadata?.completed_dates as string[]) || [];

  const handleToggleDate = (dateStr: string) => {
    const isDone = completedDates.includes(dateStr);
    const newCompleted = isDone
      ? completedDates.filter((d) => d !== dateStr)
      : [...completedDates, dateStr];
    onUpdateMetadata(item.id, {
      ...item.metadata,
      completed_dates: newCompleted,
    });
  };

  const confirmTargetDay = () => {
    if (pendingTargetDay !== null) {
      onUpdateMetadata(item.id, {
        ...item.metadata,
        preferred_day_num: pendingTargetDay,
        preferred_weekday: null,
      });
      setPendingTargetDay(null);
    }
  };

  const clearTargetDay = () => {
    onUpdateMetadata(item.id, {
      ...item.metadata,
      preferred_day_num: null,
    });
  };

  const handleWeeklySelect = (day: string) => {
    const isActive = item.metadata?.preferred_weekday === day;
    onUpdateMetadata(item.id, {
      ...item.metadata,
      preferred_weekday: isActive ? null : day,
      preferred_day_num: null,
    });
  };

  // =====================================================================
  // THE FIX: "as any" added to bypass strict Vercel type checking
  // =====================================================================
  const handleDailyToggle = (day: string) => {
    const currentActive = (item.metadata as any)?.active_days || DAY_STRINGS;
    const nextActive = currentActive.includes(day)
      ? currentActive.filter((d: string) => d !== day)
      : [...currentActive, day];
    onUpdateMetadata(item.id, { ...item.metadata, active_days: nextActive });
  };

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative">

        {/* --- CUSTOM CONFIRM MODAL (Overlay) --- */}
        {pendingTargetDay !== null && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm text-center shadow-2xl">
              <Target size={32} className="text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-black text-white mb-2">Set Target?</h3>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Make the <span className="text-amber-400 font-bold">{getOrdinal(pendingTargetDay)}</span> your recurring target? This will project out for the next {item.recurrence === 'quarterly' ? '4 years' : 'year'}.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setPendingTargetDay(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmTargetDay}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-black uppercase tracking-widest text-xs shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- HEADER --- */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-950/50">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
              <Calendar className="text-purple-500" />
              {item.title}
            </h2>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                {item.recurrence} • {completedDates.length} Logs
              </span>

              {isMonthlyOrQuarterly && item.metadata?.preferred_day_num && (
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
                  <Target size={10} className="text-amber-500" />
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                    Target: {getOrdinal(item.metadata.preferred_day_num)}
                  </span>
                  <button
                    onClick={clearTargetDay}
                    className="ml-1 text-amber-500/50 hover:text-rose-500 transition-colors"
                    title="Clear Target"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isMonthlyOrQuarterly && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-full transition-colors active:scale-95 ${showSettings ? "bg-white/10 text-white" : "bg-white/5 text-slate-400 hover:text-white"}`}
                title="Preferences"
              >
                <Settings size={20} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* --- DAILY/WEEKLY PREFERENCES PANEL --- */}
        {showSettings && !isMonthlyOrQuarterly && (
          <div className="bg-slate-950 border-b border-white/10 p-6 animate-in slide-in-from-top-4">
            <div className="flex items-center gap-2 mb-4">
              <Target size={16} className="text-amber-500" />
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Define Goal Target
              </h4>
            </div>

            <div className="flex flex-wrap gap-8">
              {item.recurrence === "daily" && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">
                    Active Days (Un-check to ignore)
                  </label>
                  <div className="flex gap-1">
                    {DAY_STRINGS.map((day) => {
                      // =======================================================
                      // THE FIX: "as any" added here to bypass Vercel TS
                      // =======================================================
                      const isActive = ((item.metadata as any)?.active_days || DAY_STRINGS).includes(day);
                      return (
                        <button
                          key={day}
                          onClick={() => handleDailyToggle(day)}
                          className={`px-3 py-2 text-xs font-black rounded-lg border transition-all active:scale-90 ${isActive
                              ? "bg-amber-500 border-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                              : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                            }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {item.recurrence === "weekly" && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Select Target Day</label>
                  <div className="flex gap-1">
                    {DAY_STRINGS.map((day) => {
                      const isActive = item.metadata?.preferred_weekday === day;
                      return (
                        <button
                          key={day}
                          onClick={() => handleWeeklySelect(day)}
                          className={`px-3 py-2 text-xs font-black rounded-lg border transition-all active:scale-90 ${isActive
                              ? "bg-amber-500 border-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                              : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                            }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TABS --- */}
        <div className="flex items-center gap-4 px-6 pt-4 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-white/5">
          <button
            onClick={() => setActiveTab("calendar")}
            className={`pb-3 text-sm font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${activeTab === "calendar" ? "text-purple-400 border-purple-400" : "text-slate-600 border-transparent hover:text-white"}`}
          >
            <Calendar size={16} /> Matrix
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`pb-3 text-sm font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${activeTab === "analytics" ? "text-emerald-400 border-emerald-400" : "text-slate-600 border-transparent hover:text-white"}`}
          >
            <BarChart2 size={16} /> Analytics & Ledger
          </button>
        </div>

        {/* --- BODY CONTENT --- */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-950 min-h-[400px]">
          {activeTab === "calendar" && (
            <div className="animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => {
                    const d = new Date(focusDate);
                    if (view === "month") d.setMonth(d.getMonth() - 1);
                    if (view === "year") d.setFullYear(d.getFullYear() - 1);
                    setFocusDate(d);
                  }}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all active:scale-90"
                >
                  <ChevronLeft size={20} />
                </button>

                <h3 className="text-2xl font-black text-white uppercase tracking-widest">
                  {view === "month" && focusDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                  {view === "year" && focusDate.getFullYear()}
                </h3>

                <button
                  onClick={() => {
                    const d = new Date(focusDate);
                    if (view === "month") d.setMonth(d.getMonth() + 1);
                    if (view === "year") d.setFullYear(d.getFullYear() + 1);
                    setFocusDate(d);
                  }}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all active:scale-90"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {view === "month" && (
                <MonthGrid
                  item={item}
                  focusDate={focusDate}
                  completedDates={completedDates}
                  onToggle={handleToggleDate}
                  onSetTarget={setPendingTargetDay}
                />
              )}
              {view === "year" && (
                <YearGrid
                  item={item}
                  focusDate={focusDate}
                  completedDates={completedDates}
                  onToggleMonth={handleToggleDate}
                />
              )}
            </div>
          )}

          {activeTab === "analytics" && (
            <AnalyticsView recurrence={item.recurrence || "daily"} completedDates={completedDates} onToggle={handleToggleDate} />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ----------------------------------------------------------------------
// GRIDS ENGINE 
// ----------------------------------------------------------------------

function isMissedTarget(date: Date, today: Date) {
  const d1 = new Date(date);
  const d2 = new Date(today);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return d1 < d2 && d1 >= FEB_START;
}

function MonthGrid({ item, focusDate, completedDates, onToggle, onSetTarget }: any) {
  const year = focusDate.getFullYear();
  const month = focusDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = Array(firstDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

  const isMonthlyOrQuarterly = ["monthly", "quarterly"].includes(item.recurrence);
  const targetDayNum = item.metadata?.preferred_day_num;

  return (
    <div className="grid grid-cols-7 gap-3 max-w-2xl mx-auto">
      {DAY_STRINGS.map((d) => (
        <div key={d} className="text-center text-xs font-black uppercase tracking-widest text-slate-500 mb-2">{d}</div>
      ))}

      {days.map((date, idx) => {
        if (!date) return <div key={`pad-${idx}`} />;

        const dateStr = date.toISOString().split("T")[0];
        const isDone = completedDates.includes(dateStr);
        const todayObj = new Date();
        const isToday = dateStr === todayObj.toISOString().split("T")[0];
        const isFuture = date > todayObj && !isToday;

        // TARGET CALCULATION
        let isTarget = false;
        if (item.recurrence === "daily") {
          // =======================================================
          // THE FIX: "as any" added here
          // =======================================================
          const activeDays = (item.metadata as any)?.active_days || DAY_STRINGS;
          if (activeDays.includes(DAY_STRINGS[date.getDay()])) isTarget = true;
        } else if (item.recurrence === "weekly" && item.metadata?.preferred_weekday === DAY_STRINGS[date.getDay()]) {
          isTarget = true;
        } else if (isMonthlyOrQuarterly && targetDayNum === date.getDate()) {
          if (item.recurrence === 'monthly') isTarget = true;
          if (item.recurrence === 'quarterly' && [0, 3, 6, 9].includes(date.getMonth())) isTarget = true;
        }

        // CLICK HANDLER
        const handleCellClick = () => {
          if (isFuture && !isMonthlyOrQuarterly) return;
          if (isMonthlyOrQuarterly && !targetDayNum) { onSetTarget(date.getDate()); return; }
          if (isMonthlyOrQuarterly && targetDayNum && !isTarget) { onSetTarget(date.getDate()); return; }
          if (!isFuture || (isTarget && isFuture)) onToggle(dateStr);
        };

        // STYLES
        let styles = "bg-white/5 border-transparent text-slate-400 hover:bg-white/10";
        if (isDone) styles = "bg-emerald-500 border-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-105 z-10";
        else if (isTarget && isToday) styles = "bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse";
        else if (isTarget && isMissedTarget(date, todayObj)) styles = "bg-rose-500/10 border-rose-500/50 text-rose-500";
        else if (isTarget && isFuture) styles = "bg-transparent border-dashed border-amber-500/50 text-amber-500";
        else if (isToday) styles = "bg-cyan-500/10 border-cyan-500/50 text-cyan-400";
        else if (isMonthlyOrQuarterly && !targetDayNum) styles = "bg-white/5 border-transparent text-slate-400 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-400";

        return (
          <button
            key={dateStr}
            onClick={handleCellClick}
            className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all relative active:scale-90 ${styles} ${isFuture && !isMonthlyOrQuarterly ? "cursor-default opacity-50" : "cursor-pointer"}`}
          >
            <span className="text-lg font-bold">{date.getDate()}</span>
            {isDone && <Check size={18} strokeWidth={4} />}
            {isTarget && isMissedTarget(date, todayObj) && !isDone && <AlertCircle size={12} className="absolute top-1.5 right-1.5" />}
            {isMonthlyOrQuarterly && !targetDayNum && !isFuture && !isToday && !isDone && <HelpCircle size={12} className="absolute top-1.5 right-1.5 opacity-20" />}
          </button>
        );
      })}
    </div>
  );
}

function YearGrid({ item, focusDate, completedDates, onToggleMonth }: any) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = focusDate.getFullYear();
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  if (item.recurrence === "quarterly") {
    const quarters = [
      { label: "Q1", months: [0, 1, 2] },
      { label: "Q2", months: [3, 4, 5] },
      { label: "Q3", months: [6, 7, 8] },
      { label: "Q4", months: [9, 10, 11] },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {quarters.map((q) => (
          <div key={q.label} className="bg-slate-900 border border-white/5 rounded-3xl p-4 flex flex-col shadow-inner">
            <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">{q.label}</h4>
            <div className="grid grid-cols-3 gap-2 flex-1">
              {q.months.map(i => {
                const monthStamp = `${currentYear}-${String(i + 1).padStart(2, "0")}-01`;
                const isDone = completedDates.includes(monthStamp);
                const isCurrent = i === thisMonth && currentYear === thisYear;
                const isFuture = new Date(currentYear, i, 1) > new Date(thisYear, thisMonth, 1);
                const monthDate = new Date(currentYear, i, 1);
                const isPastAndQualifies = monthDate < new Date(thisYear, thisMonth, 1) && monthDate >= FEB_START;

                const isTarget = !!item.metadata?.preferred_day_num && [0, 3, 6, 9].includes(i);

                let styles = "bg-white/5 border-transparent text-slate-400 hover:bg-white/10";
                if (isDone) styles = "bg-emerald-500 border-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]";
                else if (isTarget && isCurrent) styles = "bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse";
                else if (isTarget && isPastAndQualifies) styles = "bg-rose-500/10 border-rose-500/50 text-rose-500";
                else if (isTarget && isFuture) styles = "bg-transparent border-dashed border-amber-500/50 text-amber-500";
                else if (isCurrent) styles = "bg-cyan-500/10 border-cyan-500/50 text-cyan-400";

                return (
                  <button
                    key={i}
                    onClick={() => !isFuture && onToggleMonth(monthStamp)}
                    disabled={isFuture}
                    className={`rounded-2xl border-2 flex flex-col items-center justify-center p-3 transition-all active:scale-95 ${styles} ${isFuture ? "cursor-default opacity-50" : "cursor-pointer"}`}
                  >
                    {isDone ? <Check size={20} strokeWidth={3} /> : <Calendar size={20} className={isCurrent || isTarget ? "text-current" : "text-slate-600"} />}
                    <span className="text-xs font-black uppercase tracking-widest mt-1.5">{months[i]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {months.map((m, i) => {
        const monthStamp = `${currentYear}-${String(i + 1).padStart(2, "0")}-01`;
        const isDone = completedDates.includes(monthStamp);
        const isCurrent = i === thisMonth && currentYear === thisYear;
        const isFuture = new Date(currentYear, i, 1) > new Date(thisYear, thisMonth, 1);
        const monthDate = new Date(currentYear, i, 1);
        const isPastAndQualifies = monthDate < new Date(thisYear, thisMonth, 1) && monthDate >= FEB_START;

        const isTarget = !!item.metadata?.preferred_day_num;

        let styles = "bg-white/5 border-transparent text-slate-400 hover:bg-white/10";
        if (isDone) styles = "bg-emerald-500 border-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105";
        else if (isTarget && isCurrent) styles = "bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse";
        else if (isTarget && isPastAndQualifies) styles = "bg-rose-500/10 border-rose-500/50 text-rose-500";
        else if (isTarget && isFuture) styles = "bg-transparent border-dashed border-amber-500/50 text-amber-500";
        else if (isCurrent) styles = "bg-cyan-500/10 border-cyan-500/50 text-cyan-400";

        return (
          <button
            key={m}
            onClick={() => !isFuture && onToggleMonth(monthStamp)}
            disabled={isFuture}
            className={`p-6 rounded-[24px] border-2 flex flex-col items-center justify-center gap-3 transition-all active:scale-95 ${styles} ${isFuture ? "cursor-default opacity-50" : "cursor-pointer"}`}
          >
            {isDone ? <Check size={32} strokeWidth={3} /> : <Calendar size={32} className={isCurrent || isTarget ? "text-current" : "text-slate-600"} />}
            <span className="text-sm font-black uppercase tracking-widest">{m}</span>
          </button>
        );
      })}
    </div>
  );
}

// ----------------------------------------------------------------------
// ANALYTICS VIEW
// ----------------------------------------------------------------------
function AnalyticsView({ recurrence, completedDates, onToggle }: { recurrence: string, completedDates: string[], onToggle: (d: string) => void }) {
  const sortedDates = [...completedDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const isYearlyGroup = ["monthly", "quarterly", "yearly"].includes(recurrence);
  const metricLabel = recurrence === "daily" ? "Days Completed" : recurrence === "weekly" ? "Weeks Completed" : "Cycles Completed";

  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    sortedDates.forEach(dateStr => {
      const [year, month, day] = dateStr.split("-").map(Number);
      const d = new Date(year, month - 1, day);

      const key = isYearlyGroup
        ? d.getFullYear().toString()
        : d.toLocaleString('default', { month: 'short', year: '2-digit' });
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count })).reverse();
  }, [sortedDates, isYearlyGroup]);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300 h-full">
      {chartData.length > 0 ? (
        <div className="h-64 w-full bg-slate-900/50 rounded-3xl border border-white/5 p-6 shadow-inner">
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <BarChart2 size={14} className="text-emerald-500" /> {metricLabel} ({isYearlyGroup ? 'Yearly' : 'Monthly'} View)
          </h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                itemStyle={{ color: '#34d399', fontWeight: 'bold' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                labelFormatter={(label) => `${label}`}
                formatter={(value) => [value, metricLabel]}
              />
              <Bar dataKey="count" radius={[6, 6, 6, 6]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#34d399' : '#64748b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 w-full bg-slate-900/50 rounded-3xl border border-white/5 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest">
          No data to chart yet
        </div>
      )}

      <div>
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <ListIcon size={14} className="text-purple-500" /> Master Ledger
        </h4>

        {sortedDates.length === 0 ? (
          <p className="text-sm text-slate-600">No logs recorded.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedDates.map(dateStr => {
              const [year, month, day] = dateStr.split("-").map(Number);
              const d = new Date(year, month - 1, day);

              const humanDate = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
              const ledgerDisplay = isYearlyGroup
                ? d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
                : humanDate;

              return (
                <div key={dateStr} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group">
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-300">
                    <Check size={14} className="text-emerald-500" />
                    {ledgerDisplay}
                  </span>
                  <button
                    onClick={() => onToggle(dateStr)}
                    className="text-xs font-black uppercase text-slate-600 hover:text-rose-500 bg-black/40 px-2 py-1 rounded transition-all md:opacity-0 md:group-hover:opacity-100"
                    title="Undo Log"
                  >
                    Undo
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}