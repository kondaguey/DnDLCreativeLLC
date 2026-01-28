"use client";

import { useState } from "react";
import { Menu, X, Lightbulb, CheckSquare, Bug, GraduationCap, Code2, Share2, ChevronRight } from "lucide-react";
import { ViewType } from "./types";

interface MobileNavProps {
    activeView: ViewType;
    onChange: (view: ViewType) => void;
}

export default function MobileNav({ activeView, onChange }: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        {
            id: "idea_board",
            label: "Quick Notes",
            sub: "Idea Lab",
            icon: <Lightbulb size={24} />,
        },
        {
            id: "task",
            label: "Protocol Tasks",
            sub: "Daily Ops",
            icon: <CheckSquare size={24} />,
        },
        {
            id: "ledger",
            label: "App Ledger",
            sub: "Bugs & Features",
            icon: <Bug size={24} />,
        },
        {
            id: "level_up",
            label: "Leveling Up",
            sub: "Skill Tree",
            icon: <GraduationCap size={24} />,
        },
        {
            id: "code_snippet",
            label: "Tech Codex",
            sub: "Snippets",
            icon: <Code2 size={24} />,
        },
        {
            id: "resource",
            label: "Signal Archive",
            sub: "Vault & Bookmarks",
            icon: <Share2 size={24} />,
        },
    ];

    const handleSelect = (id: string) => {
        onChange(id as ViewType);
        setIsOpen(false);
    };

    return (
        <div className="md:hidden">
            {/* HAMBURGER BUTTON - ABSOLUTE POSITIONED ON MOBILE */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-4 left-4 z-40 p-2.5 bg-[#0A0F1E]/80 backdrop-blur-md border border-white/10 rounded-xl text-slate-300 shadow-lg hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            >
                <Menu size={24} />
            </button>

            {/* OVERLAY & DRAWER */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex flex-col">
                    {/* BACKDROP BLUR */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* MENU CONTENT - SLIDE IN FROM LEFT */}
                    <div className="relative w-[300px] h-full bg-[#020617] border-r border-white/10 shadow-2xl flex flex-col p-6 animate-in slide-in-from-left duration-300">
                        {/* HEADER */}
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-white tracking-widest uppercase">
                                Menu
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* NAV ITEMS */}
                        <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar pb-10">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelect(item.id)}
                                    className={`group w-full flex items-center gap-4 p-4 rounded-2xl border transition-all active:scale-95 text-left ${activeView === item.id
                                            ? "bg-purple-900/40 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                                            : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/5"
                                        }`}
                                >
                                    <div
                                        className={`p-3 rounded-xl shrink-0 transition-all ${activeView === item.id
                                                ? "bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                                : "bg-black/40 text-slate-500 group-hover:text-slate-300"
                                            }`}
                                    >
                                        {item.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div
                                            className={`font-black text-base leading-tight ${activeView === item.id ? "text-white" : "text-slate-300"
                                                }`}
                                        >
                                            {item.label}
                                        </div>
                                        <div
                                            className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${activeView === item.id ? "text-purple-300/70" : "text-slate-600"
                                                }`}
                                        >
                                            {item.sub}
                                        </div>
                                    </div>
                                    {activeView === item.id && (
                                        <ChevronRight size={16} className="text-purple-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
