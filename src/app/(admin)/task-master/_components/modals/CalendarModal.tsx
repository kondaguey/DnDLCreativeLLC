"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { createPortal } from "react-dom";

interface CalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date | null;
    onSelectDate: (date: Date) => void;
    triggerRect?: DOMRect | null; // For positioning near the trigger on desktop
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default function CalendarModal({
    isOpen,
    onClose,
    selectedDate,
    onSelectDate,
    triggerRect
}: CalendarModalProps) {
    const [viewDate, setViewDate] = useState(new Date());
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (selectedDate) {
                setViewDate(new Date(selectedDate));
            } else {
                setViewDate(new Date());
            }
        }
    }, [isOpen, selectedDate]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Calendar Logic
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Previous month padding
    const prevMonthDays = getDaysInMonth(year, month - 1);
    const daysFromPrevMonth = Array.from({ length: firstDay }, (_, i) => {
        return {
            day: prevMonthDays - firstDay + i + 1,
            month: month - 1,
            year: month === 0 ? year - 1 : year,
            isCurrentMonth: false
        };
    });

    // Current month days
    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
        return {
            day: i + 1,
            month: month,
            year: year,
            isCurrentMonth: true
        };
    });

    // Next month padding (to fill 42 grid cells - 6 rows)
    const remainingCells = 42 - daysFromPrevMonth.length - currentMonthDays.length;
    const daysFromNextMonth = Array.from({ length: remainingCells }, (_, i) => {
        return {
            day: i + 1,
            month: month + 1,
            year: month === 11 ? year + 1 : year,
            isCurrentMonth: false
        };
    });

    const allDays = [...daysFromPrevMonth, ...currentMonthDays, ...daysFromNextMonth];

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(new Date(year, month + 1, 1));
    };

    const handleSelectDay = (dayObj: typeof allDays[0]) => {
        const newDate = new Date(dayObj.year, dayObj.month, dayObj.day);
        // Preserve time if needed, but usually just date for this context
        // Assuming noon to avoid timezone edge cases locally
        newDate.setHours(12, 0, 0, 0);
        onSelectDate(newDate);
        onClose();
    };

    const isToday = (d: number, m: number, y: number) => {
        const today = new Date();
        return d === today.getDate() && m === today.getMonth() && y === today.getFullYear();
    };

    const isSelected = (d: number, m: number, y: number) => {
        if (!selectedDate) return false;
        return d === selectedDate.getDate() && m === selectedDate.getMonth() && y === selectedDate.getFullYear();
    };

    // Positioning Logic
    let positionStyles: React.CSSProperties = {};
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    if (!isMobile && triggerRect) {
        // Desktop: Position near trigger
        // Default to below-left aligned, flip if space is limited (simplified here)
        const top = triggerRect.bottom + 8;
        const left = triggerRect.left;

        // Check if it goes off screen right
        // const rightEdge = left + 320; // approx width
        // if (rightEdge > window.innerWidth) left = window.innerWidth - 340;

        positionStyles = {
            position: 'absolute',
            top: `${top + window.scrollY}px`,
            left: `${left + window.scrollX}px`,
            zIndex: 50
        };
    } else {
        // Mobile: Center fixed
        positionStyles = {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 100
        };
    }

    const modalContent = (
        <>
            {/* Backdrop for mobile (and desktop to catch clicks outside logic if portal used) */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:z-[40]"
                onClick={onClose}
            />

            <div
                ref={modalRef}
                style={isMobile ? undefined : positionStyles}
                className={`
          ${isMobile ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[320px]" : "absolute w-[300px]"}
          bg-[#0F172A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[100] md:z-[50] animate-in zoom-in-95 duration-200
        `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-900/50">
                    <button
                        onClick={handlePrevMonth}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <h3 className="font-bold text-slate-200 text-sm md:text-base">
                        {MONTHS[month]} {year}
                    </h3>

                    <button
                        onClick={handleNextMonth}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Grid */}
                <div className="p-4">
                    <div className="grid grid-cols-7 mb-2">
                        {DAYS.map(day => (
                            <div key={day} className="text-center text-[10px] uppercase font-bold text-slate-500 tracking-wider py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {allDays.map((dayObj, index) => {
                            const isCurrent = dayObj.isCurrentMonth;
                            const isDayToday = isToday(dayObj.day, dayObj.month, dayObj.year);
                            const isDaySelected = isSelected(dayObj.day, dayObj.month, dayObj.year);

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleSelectDay(dayObj)}
                                    className={`
                    h-9 w-9 rounded-xl flex items-center justify-center text-xs font-semibold transition-all relative
                    ${!isCurrent ? "text-slate-700 font-normal" : "text-slate-300"}
                    ${isDaySelected ? "bg-cyan-500 text-[#020617] font-black shadow-[0_0_15px_rgba(6,182,212,0.5)]" : "hover:bg-white/5 hover:text-white"}
                    ${isDayToday && !isDaySelected && "border border-cyan-500/30 text-cyan-400"}
                  `}
                                >
                                    {dayObj.day}
                                    {isDayToday && !isDaySelected && (
                                        <div className="absolute bottom-1 w-1 h-1 rounded-full bg-cyan-400" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer actions */}
                <div className="p-3 border-t border-white/5 bg-slate-900/50 flex justify-between">
                    <button
                        onClick={() => {
                            onSelectDate(new Date());
                            onClose();
                        }}
                        className="text-xs font-bold text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded-lg hover:bg-cyan-500/10 transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={onClose}
                        className="text-xs font-bold text-slate-500 hover:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </>
    );

    if (typeof document === 'undefined') return null;

    // Render to body
    return createPortal(modalContent, document.body);
}
