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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3 bg-white/5">
                    <div
                        className={`p-2 rounded-xl ${isDestructive
                                ? "bg-rose-500/20 text-rose-400"
                                : "bg-purple-500/20 text-purple-400"
                            }`}
                    >
                        {isDestructive ? (
                            <AlertTriangle size={20} />
                        ) : (
                            <AlertTriangle size={20} />
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="ml-auto text-slate-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="p-6">
                    <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg transition-all flex items-center gap-2 ${isDestructive
                                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/20"
                                : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/20"
                            }`}
                    >
                        {isDestructive && <Trash2 size={16} />}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
