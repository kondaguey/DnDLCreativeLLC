"use client";

import React from "react";
import { X, AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    isDanger?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = "Confirm",
    isDanger = false
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[30000] flex items-center justify-center p-4 overflow-hidden">
            {/* BACKDROP */}
            <div
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl transition-all animate-in fade-in duration-500"
                onClick={onClose}
            />

            {/* MODAL */}
            <div className="relative bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full shadow-[0_0_100px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-500 overflow-hidden ring-1 ring-white/20">
                {/* DECORATIVE AMBIENT GLOW */}
                <div className="absolute -top-20 -left-20 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                >
                    <X size={18} />
                </button>

                <div className="flex flex-col items-center text-center gap-6">
                    <div className={`p-4 rounded-[1.5rem] bg-slate-800/40 border border-white/5 shadow-inner ${isDanger ? "text-rose-400 group-hover:text-rose-300" : "text-purple-400 group-hover:text-purple-300"}`}>
                        <AlertTriangle size={32} />
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed font-medium">
                            {message}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 w-full mt-4">
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`w-full px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center gap-2 ${isDanger
                                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20 hover:shadow-rose-500/40"
                                : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20 hover:shadow-purple-500/40"
                                }`}
                        >
                            {confirmLabel}
                        </button>
                        <div className="flex justify-center w-full">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
