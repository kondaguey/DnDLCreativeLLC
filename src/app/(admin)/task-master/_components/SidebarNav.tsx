"use client";

import {
  CheckSquare,
  Code2,
  Share2,
  ChevronLeft,
  GraduationCap,
  Bug,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import styles from "../task-master.module.css";
import { ViewType } from "./types";

interface SidebarNavProps {
  activeView: ViewType;
  onChange: (view: ViewType) => void;
}

export default function SidebarNav({ activeView, onChange }: SidebarNavProps) {
  const navItems = [
    {
      id: "idea_board",
      label: "Quick Notes",
      sub: "Idea Lab",
      icon: <Lightbulb size={20} />,
    },
    {
      id: "task",
      label: "Protocol Tasks",
      sub: "Daily Ops",
      icon: <CheckSquare size={20} />,
    },
    {
      id: "ledger",
      label: "App Ledger",
      sub: "Bugs & Features",
      icon: <Bug size={20} />,
    },
    {
      id: "level_up",
      label: "Leveling Up",
      sub: "Skill Tree",
      icon: <GraduationCap size={20} />,
    },
    {
      id: "code_snippet",
      label: "Tech Codex",
      sub: "Snippets",
      icon: <Code2 size={20} />,
    },
    {
      id: "resource",
      label: "Signal Archive",
      sub: "Vault & Bookmarks",
      icon: <Share2 size={20} />,
    },
  ];

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className={`${styles.sidebar} hidden lg:flex flex-col`}>
        <div className="mb-8 px-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all hover:-translate-x-1"
          >
            <ChevronLeft size={16} /> Command Center
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavButton
              key={item.id}
              active={activeView === item.id}
              onClick={() => onChange(item.id as ViewType)}
              {...item}
            />
          ))}
        </div>
      </aside>

      {/* --- MOBILE HORIZONTAL SCROLLER --- */}
      <div className="lg:hidden w-full overflow-x-auto pb-4 mb-6 flex gap-3 no-scrollbar snap-x snap-mandatory mask-linear-fade">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id as ViewType)}
            className={`snap-center min-w-[150px] flex flex-col p-4 rounded-3xl border text-left transition-all shadow-lg active:scale-95 ${
              activeView === item.id
                ? "bg-purple-900/40 backdrop-blur-xl border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)] shadow-inner"
                : "bg-slate-900/60 backdrop-blur-md border-white/5 hover:bg-white/5"
            }`}
          >
            <div
              className={`p-2.5 rounded-xl w-fit ${
                activeView === item.id
                  ? "bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                  : "bg-white/5 text-slate-400"
              } transition-all`}
            >
              {item.icon}
            </div>
            <span
              className={`font-black text-sm mt-3 ${activeView === item.id ? "text-white" : "text-slate-300"}`}
            >
              {item.label}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${activeView === item.id ? "text-purple-300/80" : "text-slate-600"}`}
            >
              {item.sub}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

// --- DESKTOP BUTTON COMPONENT ---
function NavButton({ active, onClick, icon, label, sub }: any) {
  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${
        active
          ? "bg-purple-900/40 backdrop-blur-xl border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)] shadow-inner"
          : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
      }`}
    >
      <div
        className={`p-2 rounded-xl transition-all ${active ? "bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]" : "bg-white/5 text-slate-400 group-hover:text-slate-200"}`}
      >
        {icon}
      </div>
      <div className="text-left flex-1 min-w-0">
        <div
          className={`font-black leading-none text-sm truncate transition-colors ${active ? "text-white" : "text-slate-300 group-hover:text-white"}`}
        >
          {label}
        </div>
        <div
          className={`text-[10px] uppercase tracking-widest font-bold mt-1.5 transition-colors ${active ? "text-purple-300/70" : "text-slate-600"}`}
        >
          {sub}
        </div>
      </div>
    </button>
  );
}
