"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Tag, Plus, X, Check } from "lucide-react";
import { SYSTEM_TAGS } from "./types"; // <--- Import from types

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
            className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 select-none"
          >
            {tag}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateTags(selectedTags.filter((t) => t !== tag));
              }}
              className="hover:text-white cursor-pointer p-0.5"
            >
              <X size={8} />
            </button>
          </span>
        ))}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-white/10 text-slate-500 hover:text-white hover:border-white/20 transition-colors"
        >
          <Tag size={8} /> {selectedTags.length === 0 ? "Tag" : "+"}
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 max-h-60 overflow-y-auto bg-slate-900 border border-white/10 rounded-lg shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-1">
          <div className="mb-2 space-y-0.5">
            {AVAILABLE_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`w-full text-left px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide flex items-center justify-between transition-colors ${isSelected ? "bg-purple-500/20 text-purple-300" : "hover:bg-white/5 text-slate-400"}`}
                >
                  {tag} {isSelected && <Check size={10} />}
                </button>
              );
            })}
          </div>
          <div className="h-px bg-white/10 my-2" />
          <form onSubmit={handleCreateTag} className="flex gap-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="New tag..."
              className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-purple-500"
              autoFocus
            />
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 text-white rounded px-1.5 flex items-center justify-center"
            >
              <Plus size={10} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
