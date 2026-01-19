"use client";

import {
  CheckSquare,
  Code2,
  Share2, // Using Share2 as the icon for the combined archive
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
      // MERGED VIEW: Maps to 'resource' internally, but fetches both types
      id: "resource",
      label: "Signal Archive",
      sub: "Vault & Bookmarks",
      icon: <Share2 size={20} />,
    },
  ];

  return (
    <>
      {/* DESKTOP */}
      <aside className={`${styles.sidebar} hidden lg:flex`}>
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
          >
            <ChevronLeft size={14} /> Back to Command
          </Link>
        </div>

        <div className="flex flex-col gap-3">
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

      {/* MOBILE */}
      <div className="lg:hidden w-full overflow-x-auto pb-4 mb-4 flex gap-3 no-scrollbar snap-x">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id as ViewType)}
            className={`snap-start min-w-[140px] flex flex-col p-3 rounded-xl border text-left transition-all ${
              activeView === item.id
                ? "bg-purple-500/10 border-purple-500/50 text-purple-300"
                : "bg-white/5 border-white/10 text-slate-400"
            }`}
          >
            <div
              className={
                activeView === item.id ? "text-purple-400" : "text-slate-500"
              }
            >
              {item.icon}
            </div>
            <span className="font-bold text-sm mt-2">{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function NavButton({ active, onClick, icon, label, sub }: any) {
  return (
    <button
      onClick={onClick}
      className={`${styles.navButton} ${active ? styles.navButtonActive : ""}`}
    >
      <div className={active ? "text-purple-400" : "text-slate-400"}>
        {icon}
      </div>
      <div>
        <div className="font-bold leading-none">{label}</div>
        <div className="text-[10px] uppercase tracking-wider font-bold opacity-50 mt-1">
          {sub}
        </div>
      </div>
    </button>
  );
}
