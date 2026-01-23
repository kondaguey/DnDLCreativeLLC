"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Tag, Plus, X, Check } from "lucide-react";
import { SYSTEM_TAGS } from "./types";

interface TagManagerProps {
  selectedTags: string[];
  allSystemTags: string[];
  onUpdateTags: (newTags: string[]) => void;
}

export default function TagManager({
  selectedTags = [],
  allSystemTags = [],
  onUpdateTags,
}: TagManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Combine System Defaults + DB Tags + Current Selection
  const AVAILABLE_TAGS = useMemo(() => {
    const set = new Set([...SYSTEM_TAGS, ...allSystemTags, ...selectedTags]);
    return Array.from(set).sort();
  }, [allSystemTags, selectedTags]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onUpdateTags(selectedTags.filter((t) => t !== tag));
    } else {
      onUpdateTags([...selectedTags, tag]);
    }
  };

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const clean = inputValue.trim();
    if (!clean) return;
    if (!selectedTags.includes(clean)) {
      onUpdateTags([...selectedTags, clean]);
    }
    setInputValue("");
  };

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 text-xs md:text-[9px] font-black uppercase tracking-widest px-2 py-1 md:px-1.5 md:py-0.5 rounded-lg md:rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 select-none shadow-inner"
          >
            {tag}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateTags(selectedTags.filter((t) => t !== tag));
              }}
              className="hover:text-white cursor-pointer p-0.5 transition-colors"
            >
              <X size={12} className="md:w-2.5 md:h-2.5" />
            </button>
          </span>
        ))}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 text-xs md:text-[9px] font-black uppercase tracking-widest px-2 py-1 md:px-1.5 md:py-0.5 rounded-lg md:rounded-md border transition-all ${
            isOpen
              ? "bg-purple-500/10 border-purple-500/50 text-purple-300"
              : "border-white/10 text-slate-500 hover:text-white hover:border-white/20"
          }`}
        >
          <Tag size={12} className="md:w-2.5 md:h-2.5" />{" "}
          {selectedTags.length === 0 ? "Tag" : "+"}
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 max-h-[300px] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[70] p-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="mb-2 space-y-1">
            {AVAILABLE_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`w-full text-left px-3 py-2 md:py-1.5 rounded-xl text-xs md:text-[10px] font-bold uppercase tracking-wider flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                      : "hover:bg-white/10 text-slate-300"
                  }`}
                >
                  {tag}{" "}
                  {isSelected && <Check size={14} className="md:w-3 md:h-3" />}
                </button>
              );
            })}
          </div>
          <div className="h-px bg-white/10 my-2" />
          <form onSubmit={handleCreateTag} className="flex gap-2 p-1">
            {/* iOS FIX: text-base ensures no zooming, shrinks to text-xs on desktop */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="New tag..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-base md:text-xs text-white focus:outline-none focus:border-purple-500 transition-colors shadow-inner"
              autoFocus
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl px-3 py-2 flex items-center justify-center transition-all shadow-lg"
            >
              <Plus size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
