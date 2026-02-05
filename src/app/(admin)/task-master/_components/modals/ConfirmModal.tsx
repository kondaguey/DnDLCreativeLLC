"use client";

import { createPortal } from "react-dom";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDestructive = false,
}: ConfirmModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 overflow-hidden">
            {/* BACKDROP */}
            <div
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl transition-all animate-in fade-in duration-500"
                onClick={onClose}
            />

            <div
                className="relative bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] w-full max-w-md shadow-[0_0_100px_rgba(0,0,0,0.6)] overflow-hidden scale-100 animate-in zoom-in-95 duration-500 ring-1 ring-white/20"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="px-8 py-6 border-b border-white/5 flex items-center gap-4 bg-white/5 relative">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    <div
                        className={`p-3 rounded-2xl ${isDestructive
                            ? "bg-rose-500/20 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
                            : "bg-purple-500/20 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                            }`}
                    >
                        <AlertTriangle size={24} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-black text-white tracking-tight uppercase italic">
                            {title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="p-8">
                    <p className="text-slate-400 text-base leading-relaxed font-medium">{message}</p>
                </div>

                {/* FOOTER */}
                <div className="px-8 py-6 bg-white/5 border-t border-white/5 flex gap-4 justify-end items-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-200 transition-all"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl transition-all flex items-center gap-3 ${isDestructive
                            ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20 hover:shadow-rose-500/40"
                            : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20 hover:shadow-purple-500/40"
                            }`}
                    >
                        {isDestructive && <Trash2 size={18} className="animate-pulse" />}
                        <span>{confirmText}</span>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
