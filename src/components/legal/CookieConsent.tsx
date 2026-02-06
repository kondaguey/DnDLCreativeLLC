"use client";

import React, { useState, useEffect } from "react";
import { Cookie, X, Check, ShieldCheck } from "lucide-react";

type ConsentType = "all" | "essentials" | "rejected" | null;

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);
    const [consent, setConsent] = useState<ConsentType>(null);

    useEffect(() => {
        // Check localStorage on mount
        const storedConsent = localStorage.getItem("dndl_cookie_consent");
        if (!storedConsent) {
            // Delay visibility for a smoother entrance
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const saveConsent = (type: ConsentType) => {
        if (!type) return;
        localStorage.setItem("dndl_cookie_consent", type);
        setConsent(type);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 inset-x-0 z-[100] p-4 md:p-8 animate-slide-up">
            <div className="max-w-7xl mx-auto">
                <div className="bg-[#0f172a]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
                    {/* Animated background accent */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-xl">
                                    <Cookie className="w-5 h-5 text-primary-light" />
                                </div>
                                <h4 className="text-xl font-black uppercase tracking-tight text-white">
                                    Privacy Control Center
                                </h4>
                            </div>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-2xl italic">
                                We use cookies mid-optimization to enhance your creative workflow. Some are essential for the engine to run, while others help us analyze performance. <span className="text-primary-light font-bold">Your choice is stored locally and respected globally.</span>
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                            <button
                                onClick={() => saveConsent("rejected")}
                                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/10 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <X className="w-3 h-3" />
                                Reject All
                            </button>
                            <button
                                onClick={() => saveConsent("essentials")}
                                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/10 text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                            >
                                <ShieldCheck className="w-3 h-3 text-primary-light" />
                                Essentials Only
                            </button>
                            <button
                                onClick={() => saveConsent("all")}
                                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary-light hover:text-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                            >
                                <Check className="w-3 h-3" />
                                Accept All
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
