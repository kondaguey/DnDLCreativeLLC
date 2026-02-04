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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* BACKDROP */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* MODAL */}
            <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>

                <div className="flex flex-col items-center text-center gap-4">
                    <div className={`p-4 rounded-full ${isDanger ? "bg-rose-500/10 text-rose-500" : "bg-purple-500/10 text-purple-500"}`}>
                        <AlertTriangle size={32} />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            {message}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full mt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white transition-all text-sm font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 px-4 py-2 rounded-xl text-white transition-all text-sm font-bold ${isDanger
                                    ? "bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-500/20"
                                    : "bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/20"
                                }`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
