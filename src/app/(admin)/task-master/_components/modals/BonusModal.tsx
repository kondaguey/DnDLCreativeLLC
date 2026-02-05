"use client";

import React from "react";
import { X, Trophy, CheckCircle2, RotateCcw } from "lucide-react";

interface BonusModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogBonus: () => void;
    onUncheck: () => void;
    periodText: string;
}

export default function BonusModal({
    isOpen,
    onClose,
    onLogBonus,
    onUncheck,
    periodText
}: BonusModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[20002] flex items-center justify-center p-4 h-full">
            {/* BACKDROP */}
            <div
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl transition-all animate-in fade-in duration-500"
                onClick={onClose}
            />

            {/* MODAL */}
            <div className="relative bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-12 max-w-md w-full shadow-[0_0_100px_rgba(0,0,0,0.6)] animate-in zoom-in-95 fade-in duration-500 overflow-hidden ring-1 ring-white/20">
                {/* DECORATIVE AMBIENT GLOW */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

                {/* TOP ACCENT LINE */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all duration-300"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center gap-8 py-4">
                    {/* ICON HEXAGON */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-purple-500/30 blur-3xl rounded-full animate-pulse group-hover:bg-purple-500/50 transition-colors" />
                        <div className="relative w-24 h-24 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-[2.5rem] flex items-center justify-center text-purple-400 rotate-12 group-hover:rotate-0 transition-all duration-700 shadow-2xl">
                            <Trophy size={48} className="-rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                            Overachiever Alert!
                        </h3>
                        <p className="text-slate-400 text-base leading-relaxed max-w-[280px] mx-auto text-center">
                            Look at you go. You've already mastered this for <span className="text-purple-400 font-black italic">{periodText}</span>.
                            What's the play?
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 w-full mt-2">
                        <button
                            onClick={() => {
                                onLogBonus();
                                onClose();
                            }}
                            className="group flex items-center justify-center gap-4 px-8 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-3xl transition-all shadow-[0_10px_30px_rgba(139,92,246,0.3)] hover:shadow-purple-500/40 font-black uppercase tracking-widest text-sm"
                        >
                            <CheckCircle2 size={22} className="group-hover:scale-125 transition-transform duration-500" />
                            <span>Log a Bonus Event</span>
                            <span className="text-[10px] opacity-60 font-mono">+1 WIN</span>
                        </button>

                        <button
                            onClick={() => {
                                onUncheck();
                                onClose();
                            }}
                            className="group flex items-center justify-center gap-4 px-8 py-5 bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 rounded-3xl transition-all duration-300 font-black uppercase tracking-widest text-xs"
                        >
                            <RotateCcw size={20} className="group-hover:rotate-[-180deg] transition-transform duration-700" />
                            <span>Uncheck (Mistake)</span>
                        </button>

                        <div className="flex justify-center w-full mt-4">
                            <button
                                onClick={onClose}
                                className="px-8 py-2 text-slate-500 hover:text-slate-200 transition-all duration-300 font-black uppercase tracking-widest text-[10px] opacity-40 hover:opacity-100"
                            >
                                Nevermind
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
