"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Filter, SortAsc, ChevronDown, Check, X } from "lucide-react";
import { SortOption } from "./types";

interface FilterBarProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  availableTags: string[];
  activeTags: string[];
  onToggleTagFilter: (tag: string) => void;
}

export default function FilterBar({
  currentSort,
  onSortChange,
  availableTags,
  activeTags,
  onToggleTagFilter,
}: FilterBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Merge DB tags (No more System Defaults)
  const allTags = useMemo(() => {
    const unique = new Set([...(availableTags || [])]);
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [availableTags]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-row gap-3 mb-6 p-3 md:p-4 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl items-center z-40 relative shadow-lg">
      {/* --- SORT SELECTOR (Auto-scales on mobile) --- */}
      <div className="flex items-center gap-2 flex-1 md:flex-none min-w-0">
        <span className="hidden sm:flex text-[10px] md:text-xs uppercase font-bold text-slate-500 tracking-widest items-center gap-1 shrink-0">
          <SortAsc size={12} /> Sort:
        </span>
        <select
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="bg-black/40 border border-white/10 rounded-xl text-xs md:text-sm text-slate-200 px-3 py-2.5 md:py-2 focus:outline-none focus:border-purple-500 w-full transition-colors appearance-none shadow-inner"
        >
          <option value="manual">Manual / Custom</option>
          <option value="created_desc">Newest Added</option>
          <option value="date_asc">Due Soonest</option>
          <option value="date_desc">Due Latest</option>
          <option value="alpha_asc">A-Z (Alpha)</option>
          <option value="alpha_desc">Z-A (Alpha)</option>
        </select>
      </div>

      <div className="w-px h-8 bg-white/10 hidden md:block mx-1" />

      {/* --- TAG FILTER (Auto-scales on mobile) --- */}
      <div className="flex-1 md:flex-none relative min-w-0" ref={dropdownRef}>
        <div className="flex items-center gap-2 w-full">
          <span className="hidden sm:flex text-[10px] md:text-xs uppercase font-bold text-slate-500 tracking-widest items-center gap-1 shrink-0">
            <Filter size={12} /> Filter:
          </span>

          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex-1 md:flex-none flex items-center justify-between gap-3 px-3 py-2.5 md:py-2 rounded-xl border text-xs md:text-sm font-bold uppercase tracking-wider transition-all min-w-0 ${activeTags.length > 0
              ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
              : "bg-black/40 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
              }`}
          >
            <span className="truncate">
              {activeTags.length === 0
                ? "All Tags"
                : `${activeTags.length} Active`}
            </span>
            <ChevronDown
              size={14}
              className={`shrink-0 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {activeTags.length > 0 && (
            <button
              onClick={() => activeTags.forEach((t) => onToggleTagFilter(t))}
              className="p-2 md:p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 shrink-0 transition-all"
              title="Clear Filters"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* --- DROPDOWN LIST --- */}
        {isDropdownOpen && (
          <div className="absolute top-full right-0 md:left-0 md:right-auto mt-2 w-[calc(100vw-32px)] md:w-64 max-h-60 overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 p-2 animate-in zoom-in-95 duration-200">
            {allTags.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-500 italic">
                No tags found
              </div>
            ) : (
              <div className="space-y-1">
                {allTags.map((tag) => {
                  const isActive = activeTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => onToggleTagFilter(tag)}
                      className={`w-full text-left px-4 py-3 md:py-2 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center justify-between transition-colors ${isActive
                        ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                      {tag}
                      {isActive && <Check size={14} />}
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
