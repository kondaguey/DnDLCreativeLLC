"use client";

import { memo } from "react";
import Link from "next/link";
import {
    Calendar,
    LayoutGrid,
    Layout,
    List,
    Target,
    FileStack,
    Sun,
    Moon,
    ChevronLeft,
    ChevronRight,
    Home,
    Zap,
    Archive,
    Settings
} from "lucide-react";

type ScheduleView = 'protocol' | 'card' | 'list' | 'focus' | 'archive';

interface SidebarNavProps {
    activeView: ScheduleView;
    onViewChange: (view: ScheduleView) => void;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

function ScheduleSidebar({
    activeView,
    onViewChange,
    isDarkMode,
    onToggleDarkMode,
    isCollapsed,
    onToggleCollapse
}: SidebarNavProps) {
    const viewItems = [
        { id: 'protocol', label: 'Protocol View', sub: 'Full Cards', icon: <LayoutGrid size={20} /> },
        { id: 'card', label: 'Card View', sub: 'Compact Grid', icon: <Layout size={20} /> },
        { id: 'list', label: 'List View', sub: 'Minimal', icon: <List size={20} /> },
        { id: 'focus', label: 'Focus Mode', sub: 'One at a Time', icon: <Target size={20} /> },
        { id: 'archive', label: 'Archive', sub: 'Completed', icon: <Archive size={20} /> },
    ];

    const navLinks = [
        { id: 'templates', label: 'Templates', sub: 'Daily Presets', icon: <FileStack size={20} />, href: '/daily-schedule/templates' },
        { id: 'task-master', label: 'Task Master', sub: 'All Tasks', icon: <Zap size={20} />, href: '/task-master' },
        { id: 'dashboard', label: 'Dashboard', sub: 'Command Center', icon: <Home size={20} />, href: '/dashboard' },
    ];

    return (
        <>
            {/* DESKTOP SIDEBAR */}
            <aside
                className={`hidden lg:flex flex-col h-full transition-all duration-300 ${isCollapsed ? 'w-[72px]' : 'w-[240px]'
                    } ${isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200'} border-r`}
            >
                {/* Header */}
                <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isCollapsed && (
                        <Link
                            href="/dashboard"
                            className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors hover:-translate-x-1 duration-200 ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'
                                }`}
                        >
                            <ChevronLeft size={16} /> Back
                        </Link>
                    )}
                    <button
                        onClick={onToggleCollapse}
                        className={`p-1.5 rounded-lg transition-colors active:scale-95 duration-200 ${isDarkMode
                                ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                                : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                            }`}
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>

                {/* Dark Mode Toggle */}
                <div className={`px-3 mb-4`}>
                    <button
                        onClick={onToggleDarkMode}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${isDarkMode
                                ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            } ${isCollapsed ? 'justify-center' : ''}`}
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        {!isCollapsed && (
                            <span className="text-xs font-black uppercase tracking-widest">
                                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                            </span>
                        )}
                    </button>
                </div>

                {/* View Section */}
                {!isCollapsed && (
                    <div className={`px-4 mb-2 text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                        Views
                    </div>
                )}
                <div className="flex flex-col gap-1 px-3">
                    {viewItems.map((item) => (
                        <NavButton
                            key={item.id}
                            active={activeView === item.id}
                            isCollapsed={isCollapsed}
                            isDarkMode={isDarkMode}
                            onClick={() => onViewChange(item.id as ScheduleView)}
                            icon={item.icon}
                            label={item.label}
                            sub={item.sub}
                        />
                    ))}
                </div>

                {/* Divider */}
                <div className={`mx-4 my-4 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`} />

                {/* Navigation Links */}
                {!isCollapsed && (
                    <div className={`px-4 mb-2 text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                        Navigation
                    </div>
                )}
                <div className="flex flex-col gap-1 px-3">
                    {navLinks.map((item) => (
                        <NavButton
                            key={item.id}
                            active={false}
                            isCollapsed={isCollapsed}
                            isDarkMode={isDarkMode}
                            href={item.href}
                            icon={item.icon}
                            label={item.label}
                            sub={item.sub}
                        />
                    ))}
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Footer */}
                {!isCollapsed && (
                    <div className={`p-4 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                                <Calendar size={18} className="text-emerald-500" />
                            </div>
                            <div>
                                <div className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Daily Schedule</div>
                                <div className={`text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Personal Protocol</div>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* MOBILE HORIZONTAL SCROLLER */}
            <div className="lg:hidden w-full overflow-x-auto pb-4 mb-4 flex gap-3 no-scrollbar snap-x snap-mandatory px-4">
                {/* Dark mode toggle for mobile */}
                <button
                    onClick={onToggleDarkMode}
                    className={`snap-center shrink-0 p-4 rounded-2xl border transition-all ${isDarkMode
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {viewItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id as ScheduleView)}
                        className={`snap-center shrink-0 min-w-[120px] flex flex-col p-4 rounded-2xl border text-left transition-all active:scale-95 ${activeView === item.id
                                ? isDarkMode
                                    ? 'bg-emerald-900/40 border-emerald-500/50 shadow-lg'
                                    : 'bg-emerald-50 border-emerald-500/50'
                                : isDarkMode
                                    ? 'bg-slate-900/60 border-white/5 hover:bg-white/5'
                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        <div className={`p-2 rounded-xl w-fit ${activeView === item.id
                                ? 'bg-emerald-500 text-white'
                                : isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'
                            }`}>
                            {item.icon}
                        </div>
                        <span className={`font-black text-sm mt-3 leading-tight ${activeView === item.id
                                ? isDarkMode ? 'text-white' : 'text-slate-900'
                                : isDarkMode ? 'text-slate-300' : 'text-slate-600'
                            }`}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </>
    );
}

export default memo(ScheduleSidebar);

// --- NAV BUTTON COMPONENT ---
const NavButton = memo(function NavButton({
    active,
    isCollapsed,
    isDarkMode,
    onClick,
    icon,
    label,
    sub,
    href
}: {
    active: boolean;
    isCollapsed: boolean;
    isDarkMode: boolean;
    onClick?: () => void;
    icon: React.ReactNode;
    label: string;
    sub: string;
    href?: string;
}) {
    const content = (
        <>
            <div
                className={`p-2 rounded-xl shrink-0 transition-colors duration-200 ${active
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : isDarkMode
                            ? 'bg-white/5 text-slate-400 group-hover:text-slate-200'
                            : 'bg-slate-100 text-slate-500 group-hover:text-slate-700'
                    }`}
            >
                {icon}
            </div>

            {!isCollapsed && (
                <div className="text-left flex-1 min-w-0">
                    <div className={`font-black leading-tight text-sm transition-colors ${active
                            ? isDarkMode ? 'text-white' : 'text-slate-900'
                            : isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'
                        }`}>
                        {label}
                    </div>
                    <div className={`text-[9px] uppercase tracking-widest font-bold mt-1 leading-tight transition-colors ${active
                            ? 'text-emerald-400/70'
                            : isDarkMode ? 'text-slate-600' : 'text-slate-400'
                        }`}>
                        {sub}
                    </div>
                </div>
            )}
        </>
    );

    const className = `group w-full flex items-center gap-3 p-3 rounded-xl transition-colors duration-200 border ${active
            ? isDarkMode
                ? 'bg-emerald-900/30 border-emerald-500/30 shadow-lg'
                : 'bg-emerald-50 border-emerald-500/30'
            : isDarkMode
                ? 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
                : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-100'
        } ${isCollapsed ? 'justify-center' : 'justify-start'}`;

    if (href) {
        return (
            <Link href={href} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <button
            onClick={onClick}
            title={isCollapsed ? `${label} - ${sub}` : undefined}
            className={className}
        >
            {content}
        </button>
    );
});
