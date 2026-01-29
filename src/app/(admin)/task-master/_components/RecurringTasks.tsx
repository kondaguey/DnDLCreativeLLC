"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Check, Repeat, Calendar, CalendarRange, CalendarClock, Layers } from "lucide-react";

export type RecurrenceType = "daily" | "weekly" | "monthly" | "quarterly" | null;

interface RecurringTasksProps {
    item: any;
    isOpen: boolean;
    onClose: () => void;
    onUpdateRecurrence: (id: string, type: RecurrenceType, metadata?: any) => void;
}

export default function RecurringTasks({
    item,
    isOpen,
    onClose,
    onUpdateRecurrence,
}: RecurringTasksProps) {
    const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(item.recurrence || null);
    const [selectedDays, setSelectedDays] = useState<number[]>(item.metadata?.days || []);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setRecurrenceType(item.recurrence || null);
            setSelectedDays(item.metadata?.days || []);
        }
    }, [isOpen, item]);

    if (!isOpen) return null;

    const handleSave = () => {
        onUpdateRecurrence(item.id, recurrenceType, { days: selectedDays });
        onClose();
    };

    const toggleDay = (dayIndex: number) => {
        if (selectedDays.includes(dayIndex)) {
            setSelectedDays(selectedDays.filter(d => d !== dayIndex));
        } else {
            setSelectedDays([...selectedDays, dayIndex].sort());
        }
    };

    const modalContent = (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className={`relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${isMobile ? "mb-0" : ""}`}>

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-800/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Repeat size={18} className="text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm uppercase tracking-wide">Recurrence</h3>
                            <p className="text-[10px] text-slate-400 font-mono">Configure repetition</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-6">

                    {/* Recurrence Type Selector */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setRecurrenceType(null)}
                            className={`p-3 rounded-xl border text-xs font-bold uppercase transition-all flex items-center justify-between ${recurrenceType === null
                                    ? "bg-slate-700 border-slate-600 text-white"
                                    : "bg-white/5 border-transparent text-slate-500 hover:bg-white/10"
                                }`}
                        >
                            <span>One-off</span>
                            {recurrenceType === null && <Check size={14} />}
                        </button>
                        <button
                            onClick={() => setRecurrenceType("daily")}
                            className={`p-3 rounded-xl border text-xs font-bold uppercase transition-all flex items-center justify-between ${recurrenceType === "daily"
                                    ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                                    : "bg-white/5 border-transparent text-slate-500 hover:bg-white/10"
                                }`}
                        >
                            <span>Daily</span>
                            {recurrenceType === "daily" && <Check size={14} />}
                        </button>
                        <button
                            onClick={() => setRecurrenceType("weekly")}
                            className={`p-3 rounded-xl border text-xs font-bold uppercase transition-all flex items-center justify-between ${recurrenceType === "weekly"
                                    ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                                    : "bg-white/5 border-transparent text-slate-500 hover:bg-white/10"
                                }`}
                        >
                            <span>Weekly</span>
                            {recurrenceType === "weekly" && <Check size={14} />}
                        </button>
                        <button
                            onClick={() => setRecurrenceType("monthly")}
                            className={`p-3 rounded-xl border text-xs font-bold uppercase transition-all flex items-center justify-between ${recurrenceType === "monthly"
                                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                                    : "bg-white/5 border-transparent text-slate-500 hover:bg-white/10"
                                }`}
                        >
                            <span>Monthly</span>
                            {recurrenceType === "monthly" && <Check size={14} />}
                        </button>
                    </div>

                    {/* Weekly Options */}
                    {recurrenceType === "weekly" && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                            <label className="text-xs font-bold text-slate-500 uppercase">Repeat On</label>
                            <div className="flex justify-between bg-black/20 p-2 rounded-xl">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                                    <button
                                        key={index}
                                        onClick={() => toggleDay(index)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${selectedDays.includes(index)
                                                ? "bg-blue-500 text-white shadow-lg"
                                                : "text-slate-500 hover:bg-white/10 hover:text-slate-300"
                                            }`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Summary */}
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                        <p className="text-xs text-slate-400">
                            {recurrenceType === null
                                ? "This task will not repeat."
                                : recurrenceType === "daily"
                                    ? "Repeats every day."
                                    : recurrenceType === "weekly"
                                        ? selectedDays.length > 0
                                            ? `Repeats weekly on ${selectedDays.length} specific day(s).`
                                            : "Repeats weekly (select days)."
                                        : `Repeats ${recurrenceType}.`
                            }
                        </p>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-slate-800/50 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-500 text-white hover:bg-purple-600 transition-colors shadow-lg shadow-purple-500/20">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );

    return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}
