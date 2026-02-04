"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Filter,
  SortAsc,
  ChevronDown,
  Check,
  X,
  Search,
  CalendarDays,
} from "lucide-react";
import { SortOption } from "../utils/types";

interface FilterBarProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  availableTags: string[];
  activeTags: string[];
  onToggleTagFilter: (tag: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  activePeriod?: string;
  onPeriodChange?: (period: string) => void;
  timeline?: string[];
  showDateFilter?: boolean;
}

// Map for Sort Labels
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "manual", label: "Manual" },
  { value: "created_desc", label: "Newest" },
  { value: "priority_desc", label: "Priority (High)" },
  { value: "priority_asc", label: "Priority (Low)" },
  { value: "date_asc", label: "Due Soon" },
  { value: "date_desc", label: "Due Later" },
  { value: "alpha_asc", label: "A-Z" },
  { value: "alpha_desc", label: "Z-A" },
];

export default function FilterBar({
  currentSort,
  onSortChange,
  availableTags,
  activeTags,
  onToggleTagFilter,
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  activePeriod = "all",
  onPeriodChange,
  timeline = [],
  showDateFilter = false,
}: FilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<
    "sort" | "tags" | "date" | null
  >(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatPeriod = (key: string) => {
    if (key === "all") return "All Time";
    const [year, month] = key.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString(undefined, {
      month: "short",
      year: "2-digit",
    });
  };

  const allTags = useMemo(() => {
    const unique = new Set([...(availableTags || [])]);
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [availableTags]);

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === currentSort)?.label || "Sort";

  // --- COMPACT STYLING CLASS ---
  const commonInputClass =
    "w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-lg px-2 py-2 text-[10px] md:text-xs font-bold text-slate-200 uppercase tracking-wide placeholder:text-slate-600 focus:outline-none transition-all shadow-inner flex items-center justify-between gap-2 h-9 md:h-10";

  const dropdownMenuClass =
    "absolute top-full left-0 mt-1 w-full min-w-[160px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 p-1 animate-in zoom-in-95 duration-200 overflow-hidden";

  return (
    <div
      ref={containerRef}
      className="flex flex-col md:flex-row gap-2 mb-6 p-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl items-stretch md:items-center z-40 relative shadow-xl"
    >
      {/* --- SEARCH BAR --- */}
      {onSearchChange && (
        <div className="relative group flex-1 md:w-48 order-first md:order-none shrink-0">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors z-10"
            size={12}
          />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className={`${commonInputClass} pl-8 pr-7 focus:border-purple-500/50 justify-start`}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors z-10"
            >
              <X size={10} />
            </button>
          )}
        </div>
      )}

      {onSearchChange && (
        <div className="hidden md:block w-px h-6 bg-white/10 mx-1 shrink-0" />
      )}

      {/* --- SORT SELECTOR --- */}
      <div className="flex-1 min-w-0 relative">
        <button
          onClick={() =>
            setOpenDropdown(openDropdown === "sort" ? null : "sort")
          }
          className={commonInputClass}
        >
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <SortAsc size={12} className="text-slate-500 shrink-0" />
            <span className="truncate">{currentSortLabel}</span>
          </div>
          <ChevronDown
            size={12}
            className={`text-slate-500 shrink-0 transition-transform ${openDropdown === "sort" ? "rotate-180" : ""}`}
          />
        </button>

        {openDropdown === "sort" && (
          <div className={dropdownMenuClass}>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onSortChange(opt.value);
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center justify-between transition-colors ${currentSort === opt.value
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
              >
                {opt.label}
                {currentSort === opt.value && <Check size={12} />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-white/10 hidden md:block mx-1 shrink-0" />

      {/* --- DATE FILTER --- */}
      {showDateFilter && onPeriodChange && (
        <>
          <div className="flex-1 min-w-0 relative">
            <button
              onClick={() =>
                setOpenDropdown(openDropdown === "date" ? null : "date")
              }
              className={`${commonInputClass} ${activePeriod !== "all" ? "border-cyan-500/50 text-cyan-400 bg-cyan-950/20" : ""}`}
            >
              <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                <CalendarDays
                  size={12}
                  className={
                    activePeriod !== "all" ? "text-cyan-400" : "text-slate-500"
                  }
                />
                <span className="truncate">{formatPeriod(activePeriod!)}</span>
              </div>
              <ChevronDown
                size={12}
                className={`text-slate-500 shrink-0 transition-transform ${openDropdown === "date" ? "rotate-180" : ""}`}
              />
            </button>

            {openDropdown === "date" && (
              <div className={`${dropdownMenuClass} max-h-60 overflow-y-auto`}>
                <button
                  onClick={() => {
                    onPeriodChange("all");
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center justify-between transition-colors mb-1 ${activePeriod === "all"
                      ? "bg-cyan-500 text-black"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  All Time
                  {activePeriod === "all" && <Check size={12} />}
                </button>
                <div className="h-px bg-white/10 my-1" />
                {timeline.map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      onPeriodChange(period);
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center justify-between transition-colors ${activePeriod === period
                        ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    {formatPeriod(period)}
                    {activePeriod === period && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-white/10 hidden md:block mx-1 shrink-0" />
        </>
      )}

      {/* --- TAG FILTER --- */}
      <div className="flex-1 min-w-0 relative">
        <div className="flex items-center gap-1 w-full">
          <button
            onClick={() =>
              setOpenDropdown(openDropdown === "tags" ? null : "tags")
            }
            className={`${commonInputClass} ${activeTags.length > 0 ? "bg-purple-500/20 border-purple-500/50 text-purple-300" : ""}`}
          >
            <div className="flex items-center gap-2 min-w-0 overflow-hidden">
              <Filter
                size={12}
                className={
                  activeTags.length > 0 ? "text-purple-400" : "text-slate-500"
                }
              />
              <span className="truncate">
                {activeTags.length === 0
                  ? "Tags"
                  : `${activeTags.length} Active`}
              </span>
            </div>
            <ChevronDown
              size={12}
              className={`shrink-0 transition-transform duration-200 ${openDropdown === "tags" ? "rotate-180" : ""
                }`}
            />
          </button>

          {activeTags.length > 0 && (
            <button
              onClick={() => activeTags.forEach((t) => onToggleTagFilter(t))}
              className="h-9 w-9 md:h-10 md:w-10 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 shrink-0 transition-all shadow-inner flex items-center justify-center"
              title="Clear Filters"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Tags Dropdown */}
        {openDropdown === "tags" && (
          <div className={`${dropdownMenuClass} max-h-60 overflow-y-auto`}>
            {allTags.length === 0 ? (
              <div className="text-center py-4 text-[10px] text-slate-500 italic">
                No tags found
              </div>
            ) : (
              <div className="space-y-0.5">
                {allTags.map((tag) => {
                  const isActive = activeTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => onToggleTagFilter(tag)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center justify-between transition-colors ${isActive
                          ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                      {tag}
                      {isActive && <Check size={12} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
