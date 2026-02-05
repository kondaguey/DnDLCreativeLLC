"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import { createPortal } from "react-dom";
import {
    Calendar,
    HelpCircle,
    AlertCircle,
    ArrowUp,
    ArrowDown,
    Check,
    MinusCircle,
    Info,
} from "lucide-react";
import { formatDate, getDaysUntil, toInputDate } from "../utils/dateUtils";

// ==============================================================================
// DATE CONTROL
// ==============================================================================
function DateControlComponent({
    dueDate,
    isNoRush = false,
    onChange,
    statusColor,
    disabled = false,
}: {
    dueDate: string | null;
    isNoRush?: boolean;
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
        dueDate && dueDate !== "no_rush" ? new Date(dueDate) : new Date(),
    );

    const daysUntil = getDaysUntil(dueDate);
    const humanTime = formatDate(dueDate);
    let displayTime = isNoRush ? "No Rush" : (humanTime || "TBD");
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

        const calendarWidth = 260;
        const calendarHeight = 400; // Account for padding/extra buttons
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Start position: to the right of the click, centered vertically
        let finalLeft = e.clientX + 15;
        let finalTop = e.clientY - (calendarHeight / 3);

        // Horizontal Clamping (Pop sideways to left if no space on right)
        if (finalLeft + calendarWidth > screenWidth - 10) {
            finalLeft = e.clientX - calendarWidth - 15;
        }

        // Vertical Clamping
        if (finalTop + calendarHeight > screenHeight - 20) {
            finalTop = screenHeight - calendarHeight - 20;
        }
        if (finalTop < 20) finalTop = 20;

        // Final safety check for left edge
        if (finalLeft < 10) finalLeft = 10;

        setCoords({ top: finalTop, left: finalLeft });
        setIsOpen(!isOpen);
        setViewDate(dueDate && dueDate !== "no_rush" ? new Date(dueDate) : new Date());
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (triggerRef.current && triggerRef.current.contains(e.target as Node))
                return;
            if (dropdownRef.current && dropdownRef.current.contains(e.target as Node))
                return;
            setIsOpen(false);
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
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

    const setTBD = () => {
        onChange(null);
        setIsOpen(false);
    };

    const setNoRush = () => {
        onChange("no_rush");
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
        if (!dueDate || dueDate === "no_rush") return false;
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
                type="button"
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
                            type="button"
                            onClick={setToday}
                            className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg py-1.5 text-xs font-bold uppercase"
                        >
                            Today
                        </button>
                        <button
                            type="button"
                            onClick={setTomorrow}
                            className="flex-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-lg py-1.5 text-xs font-bold uppercase"
                        >
                            Tmrw
                        </button>
                        <button
                            type="button"
                            onClick={setNoRush}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10 rounded-lg py-1.5 text-[10px] font-black uppercase"
                        >
                            No Rush
                        </button>
                        <button
                            type="button"
                            onClick={setTBD}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10 rounded-lg py-1.5 text-[10px] font-black uppercase"
                        >
                            TBD
                        </button>
                    </div>

                    <div className="h-px bg-white/10" />

                    {/* Calendar Header */}
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
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
                            type="button"
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
                                    type="button"
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
                        type="button"
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

export const DateControl = memo(DateControlComponent);

// ==============================================================================
// PRIORITY SWITCHER
// ==============================================================================
function PrioritySwitcherComponent({
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
        { id: "normal", label: "Normal", color: "text-slate-300", icon: Info },
        { id: "low", label: "Low", color: "text-slate-400", icon: ArrowDown },
        { id: "no_rush", label: "No Rush", color: "text-slate-600", icon: MinusCircle },
    ];

    const handleOpen = (e: React.PointerEvent) => {
        e.stopPropagation();
        if (disabled) return;

        const menuWidth = 144; // w-36
        const menuHeight = 220;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        let finalLeft = e.clientX + 10;
        let finalTop = e.clientY - (menuHeight / 2);

        if (finalLeft + menuWidth > screenWidth - 10) {
            finalLeft = e.clientX - menuWidth - 10;
        }
        if (finalTop + menuHeight > screenHeight - 20) {
            finalTop = screenHeight - menuHeight - 20;
        }
        if (finalTop < 20) finalTop = 20;
        if (finalLeft < 10) finalLeft = 10;

        setCoords({ top: finalTop, left: finalLeft });
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
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const currentOpt = options.find((o) => o.id === current) || options[2];
    const Icon = currentOpt.icon;

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                onPointerDown={handleOpen}
                disabled={disabled}
                className={`flex items-center gap-1.5 text-xs md:text-[10px] uppercase font-black px-3 py-2 md:px-2 md:py-1 rounded-xl border border-white/5 transition-all bg-black/20 ${current === "critical"
                    ? "text-rose-400 border-rose-500/20 bg-rose-500/5"
                    : current === "high"
                        ? "text-orange-400 border-orange-500/20 bg-orange-500/5"
                        : current === "no_rush"
                            ? "text-slate-500 border-white/5 bg-white/5"
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
                            type="button"
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

export const PrioritySwitcher = memo(PrioritySwitcherComponent);

function ActionButtonComponent({
    icon,
    onClick,
    color,
}: {
    icon: React.ReactNode;
    onClick: () => void;
    color: string;
}) {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={`p-2 rounded-lg transition-colors ${color}`}
        >
            {icon}
        </button>
    );
}

export const ActionButton = memo(ActionButtonComponent);
