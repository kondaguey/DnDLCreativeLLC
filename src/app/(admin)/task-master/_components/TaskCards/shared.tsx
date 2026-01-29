"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    Calendar,
    HelpCircle,
    AlertCircle,
    ArrowUp,
    ArrowDown,
    Check,
} from "lucide-react";
import { formatDate, getDaysUntil, toInputDate } from "../dateUtils";

// ==============================================================================
// DATE CONTROL
// ==============================================================================
export function DateControl({
    dueDate,
    onChange,
    statusColor,
    disabled = false,
}: {
    dueDate: string | null;
    onChange: (val: string | null) => void;
    statusColor: string;
    disabled?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const dateInputRef = useRef<HTMLInputElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [viewDate, setViewDate] = useState(
        dueDate ? new Date(dueDate) : new Date(),
    );

    const daysUntil = getDaysUntil(dueDate);
    const humanTime = formatDate(dueDate);

    let displayTime = humanTime || "TBA";
    let statusText = "text-slate-400";
    let statusBorder = "border-white/10";
    let statusBg = "bg-transparent";

    if (!dueDate) {
        statusText = "text-slate-500";
        statusBorder = "border-white/10 border-dashed";
    } else if (statusColor === "rose") {
        statusText = "text-rose-400";
        statusBorder = "border-rose-500/30";
        statusBg = "bg-rose-500/10";
        displayTime = daysUntil < 0 ? "OVERDUE" : "Due Today";
    } else if (statusColor === "orange") {
        statusText = "text-orange-400";
        statusBorder = "border-orange-500/30";
        statusBg = "bg-orange-500/10";
        displayTime = `${daysUntil} days left`;
    } else if (statusColor === "yellow") {
        statusText = "text-yellow-400";
        statusBorder = "border-yellow-400/20";
        statusBg = "bg-yellow-400/10";
        displayTime = `${daysUntil} days left`;
    }

    const handleOpen = (e: React.PointerEvent) => {
        e.stopPropagation();
        if (disabled) return;

        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const calendarWidth = 260;
            const calendarHeight = 350;

            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            const finalLeft =
                rect.left + calendarWidth > screenWidth
                    ? rect.right - calendarWidth
                    : rect.left;

            const finalTop =
                rect.bottom + calendarHeight > screenHeight
                    ? rect.top - calendarHeight - 8
                    : rect.bottom + 8;

            setCoords({ top: finalTop, left: finalLeft });
        }
        setIsOpen(!isOpen);
        setViewDate(dueDate ? new Date(dueDate) : new Date());
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (triggerRef.current && triggerRef.current.contains(e.target as Node))
                return;
            if (dropdownRef.current && dropdownRef.current.contains(e.target as Node))
                return;
            setIsOpen(false);
        };
        const handleScroll = () => setIsOpen(false);

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            window.addEventListener("scroll", handleScroll, true);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [isOpen]);

    const setToday = () => {
        const d = new Date();
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        onChange(d.toISOString().split("T")[0]);
        setIsOpen(false);
    };

    const setTomorrow = () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        onChange(d.toISOString().split("T")[0]);
        setIsOpen(false);
    };

    const setTBA = () => {
        onChange(null);
        setIsOpen(false);
    };

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const handlePrevMonth = (e: React.PointerEvent) => {
        e.stopPropagation();
        setViewDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const handleNextMonth = (e: React.PointerEvent) => {
        e.stopPropagation();
        setViewDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const selectDate = (day: number) => {
        const selected = new Date(currentYear, currentMonth, day);
        const offset = selected.getTimezoneOffset();
        selected.setMinutes(selected.getMinutes() - offset);
        onChange(selected.toISOString().split("T")[0]);
        setIsOpen(false);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()
        );
    };

    const isSelected = (day: number) => {
        if (!dueDate) return false;
        const selected = new Date(dueDate);
        return (
            day === selected.getUTCDate() &&
            currentMonth === selected.getUTCMonth() &&
            currentYear === selected.getUTCFullYear()
        );
    };

    return (
        <>
            <button
                ref={triggerRef}
                onPointerDown={handleOpen}
                disabled={disabled}
                className={`flex items-center gap-1.5 text-xs md:text-[10px] uppercase font-black px-3 py-2 md:px-2 md:py-1 rounded-xl border transition-all whitespace-nowrap shadow-inner ${statusBg} ${statusBorder} ${statusText} ${isOpen
                    ? "bg-purple-500 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                    : disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:border-purple-500/50 hover:text-purple-300"
                    }`}
            >
                {dueDate ? <Calendar size={14} /> : <HelpCircle size={14} />}
                {displayTime}
            </button>
            <input
                ref={dateInputRef}
                type="date"
                className="invisible absolute top-0 left-0 w-0 h-0"
                value={toInputDate(dueDate)}
                onChange={(e) => onChange(e.target.value)}
            />
            {isOpen && mounted && createPortal(
                <div
                    ref={dropdownRef}
                    style={{
                        position: "fixed",
                        top: `${coords.top}px`,
                        left: `${coords.left}px`,
                    }}
                    className="w-[260px] bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-[99999] p-4 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-100"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    {/* Quick Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={setToday}
                            className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg py-1.5 text-xs font-bold uppercase"
                        >
                            Today
                        </button>
                        <button
                            onClick={setTomorrow}
                            className="flex-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-lg py-1.5 text-xs font-bold uppercase"
                        >
                            Tmrw
                        </button>
                        <button
                            onClick={setTBA}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10 rounded-lg py-1.5 text-xs font-bold uppercase"
                        >
                            Clear
                        </button>
                    </div>

                    <div className="h-px bg-white/10" />

                    {/* Calendar Header */}
                    <div className="flex items-center justify-between">
                        <button
                            onPointerDown={handlePrevMonth}
                            className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
                        >
                            &lt;
                        </button>
                        <span className="font-bold text-white text-sm">
                            {viewDate.toLocaleDateString("en-US", {
                                month: "long",
                                year: "numeric",
                            })}
                        </span>
                        <button
                            onPointerDown={handleNextMonth}
                            className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
                        >
                            &gt;
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                            <div key={`header-${i}`} className="text-slate-500 font-bold py-1">
                                {day}
                            </div>
                        ))}
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const d = i + 1;
                            const today = isToday(d);
                            const selected = isSelected(d);
                            return (
                                <button
                                    key={d}
                                    onClick={() => selectDate(d)}
                                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${selected
                                        ? "bg-purple-500 text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                        : today
                                            ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30"
                                            : "text-slate-300 hover:bg-white/10 hover:text-white"
                                        }`}
                                >
                                    {d}
                                </button>
                            );
                        })}
                    </div>

                    <div className="h-px bg-white/10" />

                    <button
                        onClick={() => {
                            if (dateInputRef.current) dateInputRef.current.showPicker();
                        }}
                        className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold uppercase text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                        Custom Picker
                    </button>
                </div>,
                document.body
            )}
        </>
    );
}

// ==============================================================================
// PRIORITY SWITCHER
// ==============================================================================
export function PrioritySwitcher({
    current,
    onChange,
    disabled = false,
}: {
    current: string;
    onChange: (val: string) => void;
    disabled?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const options = [
        {
            id: "critical",
            label: "Critical",
            color: "text-rose-500",
            icon: AlertCircle,
        },
        { id: "high", label: "High", color: "text-orange-400", icon: ArrowUp },
        { id: "normal", label: "Normal", color: "text-slate-300", icon: null },
        { id: "low", label: "Low", color: "text-slate-500", icon: ArrowDown },
    ];

    const handleOpen = (e: React.PointerEvent) => {
        e.stopPropagation();
        if (disabled) return;

        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const menuHeight = 200;
            const screenHeight = window.innerHeight;

            const finalTop =
                rect.bottom + menuHeight > screenHeight
                    ? rect.top - menuHeight - 8
                    : rect.bottom + 8;

            setCoords({ top: finalTop, left: rect.left });
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (triggerRef.current && triggerRef.current.contains(e.target as Node))
                return;
            if (dropdownRef.current && dropdownRef.current.contains(e.target as Node))
                return;
            setIsOpen(false);
        };
        const handleScroll = () => setIsOpen(false);

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            window.addEventListener("scroll", handleScroll, true);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [isOpen]);

    const currentOpt = options.find((o) => o.id === current) || options[2];
    const Icon = currentOpt.icon;

    return (
        <>
            <button
                ref={triggerRef}
                onPointerDown={handleOpen}
                disabled={disabled}
                className={`flex items-center gap-1.5 text-xs md:text-[10px] uppercase font-black px-3 py-2 md:px-2 md:py-1 rounded-xl border border-white/5 transition-all bg-black/20 ${current === "critical"
                    ? "text-rose-400 border-rose-500/20 bg-rose-500/5"
                    : current === "high"
                        ? "text-orange-400 border-orange-500/20 bg-orange-500/5"
                        : "text-slate-400"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-white/5 hover:border-white/10"}`}
            >
                {Icon && <Icon size={14} />}
                {currentOpt.label}
            </button>

            {isOpen && mounted && createPortal(
                <div
                    ref={dropdownRef}
                    style={{
                        position: "fixed",
                        top: `${coords.top}px`,
                        left: `${coords.left}px`,
                    }}
                    className="w-36 flex flex-col bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-[99999] p-1.5 animate-in fade-in zoom-in-95 duration-100"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    {options.map((opt) => (
                        <button
                            key={opt.id}
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                onChange(opt.id);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-colors ${current === opt.id
                                ? "bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                                : "hover:bg-white/5 text-slate-300 hover:text-white"
                                }`}
                        >
                            {opt.label}
                            {current === opt.id && <Check size={14} />}
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </>
    );
}

export const ActionButton = ({
    icon,
    onClick,
    color,
}: {
    icon: React.ReactNode;
    onClick: () => void;
    color: string;
}) => (
    <button
        onClick={(e) => {
            e.stopPropagation();
            onClick();
        }}
        className={`p-2 rounded-lg transition-colors ${color}`}
    >
        {icon}
    </button>
);
