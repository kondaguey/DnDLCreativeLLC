"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom"; // <--- THE FIX: Allows us to escape the card
import {
  Tag,
  Plus,
  X,
  Check,
  Loader2,
  Search,
  ChevronDown,
} from "lucide-react";
import { addGlobalTag } from "../actions";

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
  const [isCreating, setIsCreating] = useState(false);

  // Refs for portal positioning
  const triggerRef = useRef<HTMLDivElement>(null);
  const [dropdownCoords, setDropdownCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const AVAILABLE_TAGS = useMemo(() => {
    const set = new Set([...allSystemTags, ...selectedTags]);
    return Array.from(set).sort();
  }, [allSystemTags, selectedTags]);

  const filteredTags = useMemo(() => {
    return AVAILABLE_TAGS.filter((tag) =>
      tag.toLowerCase().includes(inputValue.toLowerCase()),
    );
  }, [AVAILABLE_TAGS, inputValue]);

  const exactMatchFound = AVAILABLE_TAGS.some(
    (tag) => tag.toLowerCase() === inputValue.trim().toLowerCase(),
  );

  // --- THE FIX: CALCULATE EXACT SCREEN POSITION FOR THE PORTAL ---
  const openDropdown = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const MENU_HEIGHT = 240;
      const spaceBelow = window.innerHeight - rect.bottom;

      // FLIP UP if not enough space
      const topPos = spaceBelow < MENU_HEIGHT + 20
        ? rect.top - MENU_HEIGHT - 8
        : rect.bottom + 8;

      setDropdownCoords({
        top: topPos,
        left: rect.left,
        width: 240,
      });
    }
    setIsOpen(true);
  };

  // Close on outside click or scroll (since scrolling detaches the portal)
  useEffect(() => {
    function handleInteraction(event: Event) {
      if (
        isOpen &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        // If the click is inside the portal itself, don't close
        const dropdown = document.getElementById("tag-portal-menu");
        if (dropdown && dropdown.contains(event.target as Node)) return;

        setIsOpen(false);
        setInputValue("");
      }
    }

    document.addEventListener("mousedown", handleInteraction);
    // Auto-close on scroll to prevent the floating menu from detaching
    window.addEventListener("scroll", () => setIsOpen(false), true);

    return () => {
      document.removeEventListener("mousedown", handleInteraction);
      window.removeEventListener("scroll", () => setIsOpen(false), true);
    };
  }, [isOpen]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onUpdateTags(selectedTags.filter((t) => t !== tag));
    } else {
      onUpdateTags([...selectedTags, tag]);
    }
  };

  const handleCreateTag = async () => {
    const clean = inputValue.trim();
    if (!clean || isCreating) return;

    onUpdateTags([...selectedTags, clean]);
    setIsCreating(true);
    try {
      await addGlobalTag(clean);
    } catch (err) {
      console.error("Failed to create global tag:", err);
    } finally {
      setIsCreating(false);
      setInputValue("");
    }
  };

  return (
    <div
      className="relative flex items-center"
      ref={triggerRef}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 text-xs md:text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 md:px-2 md:py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 shadow-inner"
          >
            {tag}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateTags(selectedTags.filter((t) => t !== tag));
              }}
              className="hover:text-white transition-colors"
            >
              <X size={12} />
            </button>
          </span>
        ))}

        <button
          onClick={(e) => {
            e.stopPropagation();
            isOpen ? setIsOpen(false) : openDropdown();
          }}
          className={`flex items-center gap-1.5 text-xs md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 md:px-2 md:py-1 rounded-lg border transition-all shadow-inner ${isOpen
              ? "bg-purple-500 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
            }`}
        >
          <Tag size={12} />
          {selectedTags.length === 0 ? "Add Tag" : "Add"}
          <ChevronDown
            size={12}
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* --- THE FIX: RENDER DROP DOWN IN A REACT PORTAL --- */}
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id="tag-portal-menu"
            style={{
              position: "fixed",
              top: `${dropdownCoords.top}px`,
              left: `${dropdownCoords.left}px`,
              width: `${dropdownCoords.width}px`,
            }}
            className="flex flex-col bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-[99999] p-2 animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()} // Prevent card expansion
          >
            <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-xl px-3 py-2.5 mb-2 shadow-inner">
              <Search size={14} className="text-slate-500 shrink-0" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search or add..."
                className="w-full bg-transparent text-base md:text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (exactMatchFound) toggleTag(inputValue.trim());
                    else handleCreateTag();
                  }
                }}
              />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 max-h-[220px]">
              {filteredTags.length === 0 && !inputValue && (
                <div className="px-3 py-4 text-xs font-bold text-slate-600 text-center uppercase tracking-widest">
                  No tags yet. Type to create.
                </div>
              )}

              {filteredTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTag(tag);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-colors ${isSelected
                        ? "bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                        : "hover:bg-white/5 text-slate-300 hover:text-white"
                      }`}
                  >
                    {tag} {isSelected && <Check size={14} />}
                  </button>
                );
              })}

              {inputValue.trim() !== "" && !exactMatchFound && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateTag();
                  }}
                  disabled={isCreating}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 mt-2 border border-emerald-500/20"
                >
                  {isCreating ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}
                  Create "{inputValue.trim()}"
                </button>
              )}
            </div>
          </div>,
          document.body, // <-- Teleports HTML directly to the end of the webpage
        )}
    </div>
  );
}
