"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Filter, SortAsc, ChevronDown, Check, X } from "lucide-react";
import { SortOption, SYSTEM_TAGS } from "./types"; // <--- Import from types

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

  // Merge DB tags with System Defaults
  const allTags = useMemo(() => {
    const unique = new Set([...SYSTEM_TAGS, ...(availableTags || [])]);
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
    <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-white/5 border border-white/5 rounded-2xl items-center z-40 relative">
      <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center gap-1">
          <SortAsc size={12} /> Sort:
        </span>
        <select
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="bg-black/20 border border-white/10 rounded-lg text-xs text-slate-300 px-3 py-1.5 focus:outline-none focus:border-purple-500 w-full md:w-auto transition-colors"
        >
          <option value="manual">Manual / Default</option>
          <option value="alpha_asc">Alphabetical (A-Z)</option>
          <option value="alpha_desc">Alphabetical (Z-A)</option>
          <option value="date_asc">Due Date (Soonest)</option>
          <option value="date_desc">Due Date (Latest)</option>
          <option value="created_desc">Newest Added</option>
        </select>
      </div>

      <div className="w-px h-8 bg-white/10 hidden md:block mx-2" />

      <div className="w-full md:w-auto relative" ref={dropdownRef}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center gap-1 shrink-0">
            <Filter size={12} /> Filter:
          </span>

          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all min-w-[140px] ${
              activeTags.length > 0
                ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                : "bg-black/20 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
            }`}
          >
            <span>
              {activeTags.length === 0
                ? "All Tags"
                : `${activeTags.length} Active`}
            </span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {activeTags.length > 0 && (
            <button
              onClick={() => activeTags.forEach((t) => onToggleTagFilter(t))}
              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 md:left-auto md:right-auto mt-2 w-64 max-h-60 overflow-y-auto bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 p-2 animate-in zoom-in-95 duration-200">
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
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-between transition-colors ${
                        isActive
                          ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
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
