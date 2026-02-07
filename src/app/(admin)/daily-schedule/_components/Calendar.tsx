
import React from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon, ChevronUp, ChevronDown } from 'lucide-react';

interface CalendarProps {
    isDarkMode: boolean;
    calendarView: 'week' | 'month' | 'year';
    setCalendarView: (view: 'week' | 'month' | 'year') => void;
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    calendarDays: string[];
    getLocalDateString: (date: Date) => string;
}

export default function Calendar({
    isDarkMode,
    calendarView,
    setCalendarView,
    selectedDate,
    setSelectedDate,
    calendarDays,
    getLocalDateString
}: CalendarProps) {
    return (
        <div className={`mb-6 overflow-hidden rounded-[2.5rem] border backdrop-blur-md transition-all ${isDarkMode ? 'bg-slate-900/40 border-white/5' : 'bg-white/60 border-slate-200'}`}>
            {/* Calendar Header with View Mode Selector */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                <div className="flex items-center gap-4">
                    <CalendarIcon size={20} className="text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Daily Scheduler</span>
                </div>
                <div className="flex items-center gap-2">
                    {(['week', 'month', 'year'] as const).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setCalendarView(mode)}
                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${calendarView === mode
                                ? 'bg-emerald-600 text-white'
                                : isDarkMode
                                    ? 'text-slate-500 hover:text-white hover:bg-white/5'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {mode}
                        </button>
                    ))}
                    <Link
                        href="/daily-schedule/templates"
                        className={`ml-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${isDarkMode
                            ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                            : 'border-amber-500/30 text-amber-600 hover:bg-amber-50'
                            }`}
                    >
                        Edit Templates
                    </Link>
                </div>
            </div>

            {/* WEEK VIEW - Horizontal Scroll */}
            {calendarView === 'week' && (
                <div className="flex items-center gap-4 px-8 py-6 overflow-x-auto no-scrollbar snap-x">
                    {calendarDays.map((dateStr) => {
                        const [year, month, day] = dateStr.split('-').map(Number);
                        const d = new Date(year, month - 1, day);
                        const todayStr = getLocalDateString(new Date());
                        const isToday = todayStr === dateStr;
                        const isActive = selectedDate === dateStr;
                        const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });
                        const dayNum = d.toLocaleDateString(undefined, { day: 'numeric' });
                        const monthName = d.toLocaleDateString(undefined, { month: 'short' });

                        return (
                            <button
                                key={dateStr}
                                onClick={() => setSelectedDate(dateStr)}
                                className={`snap-center shrink-0 flex flex-col items-center min-w-[70px] py-4 rounded-2xl border transition-all active:scale-95 ${isActive
                                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/20'
                                    : isDarkMode
                                        ? 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                            >
                                <span className="text-[9px] font-black uppercase tracking-tighter opacity-60 mb-1">{monthName}</span>
                                <span className="text-lg font-black leading-none mb-1">{dayNum}</span>
                                <span className="text-[10px] font-bold opacity-60 uppercase">{dayName}</span>
                                {isToday && !isActive && <div className="mt-2 w-1 h-1 rounded-full bg-emerald-500" />}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* MONTH VIEW - Calendar Grid */}
            {calendarView === 'month' && (() => {
                const today = new Date();
                const year = today.getFullYear();
                const month = today.getMonth();
                const firstDay = new Date(year, month, 1);
                const lastDay = new Date(year, month + 1, 0);
                const startPadding = firstDay.getDay();
                const daysInMonth = lastDay.getDate();
                const todayStr = getLocalDateString(new Date());
                const monthName = firstDay.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

                return (
                    <div className="p-6">
                        <h3 className={`text-lg font-black uppercase tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{monthName}</h3>
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className={`text-center text-[9px] font-black uppercase tracking-widest py-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: startPadding }).map((_, i) => (
                                <div key={`pad-${i}`} className="aspect-square" />
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const isToday = todayStr === dateStr;
                                const isActive = selectedDate === dateStr;

                                return (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDate(dateStr)}
                                        className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all ${isActive
                                            ? 'bg-emerald-600 text-white shadow-lg'
                                            : isToday
                                                ? isDarkMode ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50' : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/30'
                                                : isDarkMode
                                                    ? 'hover:bg-white/5 text-slate-400'
                                                    : 'hover:bg-slate-100 text-slate-600'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            {/* YEAR VIEW - 12 Mini Calendars */}
            {calendarView === 'year' && (
                <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-h-[600px] overflow-y-auto">
                    {Array.from({ length: 12 }).map((_, monthIdx) => {
                        const year = 2026;
                        const firstDay = new Date(year, monthIdx, 1);
                        const lastDay = new Date(year, monthIdx + 1, 0);
                        const startPadding = firstDay.getDay();
                        const daysInMonth = lastDay.getDate();
                        const monthName = firstDay.toLocaleDateString(undefined, { month: 'short' });
                        const todayStr = getLocalDateString(new Date());

                        return (
                            <div key={monthIdx} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                <h4 className={`text-xs font-black uppercase tracking-tight mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{monthName}</h4>
                                <div className="grid grid-cols-7 gap-0.5 mb-1">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                        <div key={i} className={`text-center text-[7px] font-bold ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>{d}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-0.5">
                                    {Array.from({ length: startPadding }).map((_, i) => (
                                        <div key={`pad-${i}`} className="aspect-square" />
                                    ))}
                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const day = i + 1;
                                        const dateStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                        const isToday = todayStr === dateStr;
                                        const isActive = selectedDate === dateStr;

                                        return (
                                            <button
                                                key={day}
                                                onClick={() => setSelectedDate(dateStr)}
                                                className={`aspect-square rounded flex items-center justify-center text-[8px] font-bold transition-all ${isActive
                                                    ? 'bg-emerald-600 text-white'
                                                    : isToday
                                                        ? 'bg-emerald-500/30 text-emerald-400'
                                                        : isDarkMode
                                                            ? 'hover:bg-white/10 text-slate-500'
                                                            : 'hover:bg-slate-200 text-slate-600'
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
