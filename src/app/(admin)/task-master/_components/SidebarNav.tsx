"use client";

import {
  CheckSquare,
  Code2,
  Share2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Bug,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import styles from "../task-master.module.css";
import { ViewType } from "./types";

interface SidebarNavProps {
  activeView: ViewType;
  onChange: (view: ViewType) => void;
}

export default function SidebarNav({ activeView, onChange }: SidebarNavProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      {/* --- DESKTOP/IPAD LANDSCAPE SIDEBAR --- */}
      <aside
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : styles.expanded} hidden lg:flex flex-col`}
      >
        <div
          className={`mb-8 px-2 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}
        >
          {!isCollapsed && (
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all hover:-translate-x-1"
            >
              <ChevronLeft size={16} /> Command Center
            </Link>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all active:scale-95"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavButton
              key={item.id}
              active={activeView === item.id}
              isCollapsed={isCollapsed}
              onClick={() => onChange(item.id as ViewType)}
              {...item}
            />
          ))}
        </div>
      </aside>

      {/* --- IPAD PORTRAIT & MOBILE HORIZONTAL SCROLLER --- */}
      {/* iOS optimized touch scrolling (Webkit overflow scrolling handled by no-scrollbar + snap) */}
      <div className="lg:hidden w-full overflow-x-auto pb-4 md:pb-6 mb-6 flex gap-3 md:gap-5 no-scrollbar snap-x snap-mandatory mask-linear-fade items-stretch px-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id as ViewType)}
            /* iPad scaling: Wider min-width, larger padding (md:p-5), and rounded-3xl for that iOS feel */
            className={`snap-center shrink-0 min-w-[140px] md:min-w-[180px] max-w-[200px] h-full flex flex-col p-4 md:p-5 rounded-3xl md:rounded-[32px] border text-left transition-all shadow-lg active:scale-95 ${activeView === item.id
                ? "bg-purple-900/40 backdrop-blur-xl border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] shadow-inner"
                : "bg-slate-900/60 backdrop-blur-md border-white/5 hover:bg-white/5"
              }`}
          >
            <div
              className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl w-fit ${activeView === item.id
                  ? "bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                  : "bg-white/5 text-slate-400"
                } transition-all`}
            >
              {item.icon}
            </div>
            {/* iPad font scaling: md:text-base */}
            <span
              className={`font-black text-sm md:text-base mt-3 md:mt-4 leading-tight ${activeView === item.id ? "text-white" : "text-slate-300"}`}
            >
              {item.label}
            </span>
            <span
              className={`text-[10px] md:text-xs font-bold uppercase tracking-wider mt-1 leading-tight ${activeView === item.id ? "text-purple-300/80" : "text-slate-600"}`}
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
function NavButton({ active, isCollapsed, onClick, icon, label, sub }: any) {
  return (
    <button
      onClick={onClick}
      title={isCollapsed ? `${label} - ${sub}` : undefined}
      className={`group w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${active
          ? "bg-purple-900/40 backdrop-blur-xl border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)] shadow-inner"
          : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
        } ${isCollapsed ? "justify-center" : "justify-start"}`}
    >
      <div
        className={`p-2 rounded-xl shrink-0 transition-all ${active ? "bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]" : "bg-white/5 text-slate-400 group-hover:text-slate-200"}`}
      >
        {icon}
      </div>

      {!isCollapsed && (
        <div className="text-left flex-1 min-w-0">
          <div
            className={`font-black leading-tight text-sm transition-colors ${active ? "text-white" : "text-slate-300 group-hover:text-white"}`}
          >
            {label}
          </div>
          <div
            className={`text-[10px] uppercase tracking-widest font-bold mt-1.5 leading-tight transition-colors ${active ? "text-purple-300/70" : "text-slate-600"}`}
          >
            {sub}
          </div>
        </div>
      )}
    </button>
  );
}
