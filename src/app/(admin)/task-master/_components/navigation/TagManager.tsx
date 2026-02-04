"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Tag,
  Plus,
  X,
  Check,
  Loader2,
  Search,
  ChevronDown,
} from "lucide-react";
import { addGlobalTag } from "../../actions";

interface TagManagerProps {
  selectedTags: string[];
  allSystemTags: string[];
  onUpdateTags: (newTags: string[]) => void;
  disabled?: boolean;
}

export default function TagManager({
  selectedTags = [],
  allSystemTags = [],
  onUpdateTags,
  disabled = false,
}: TagManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const [dropdownCoords, setDropdownCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const openDropdown = () => {
    if (triggerRef.current && !isMobile) {
      const rect = triggerRef.current.getBoundingClientRect();
      const MENU_HEIGHT = 240;
      const spaceBelow = window.innerHeight - rect.bottom;

      const topPos =
        spaceBelow < MENU_HEIGHT + 20
          ? rect.top - MENU_HEIGHT - 8
          : rect.bottom + 8;

      setDropdownCoords({
        top: topPos,
        left: rect.left,
        width: 240,
      });
    }
    setIsOpen(true);
    setTimeout(() => {
      const input = document.getElementById("tag-search-input");
      if (input) input.focus();
    }, 50);
  };

  useEffect(() => {
    function handleInteraction(event: Event) {
      if (
        isOpen &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        const dropdown = document.getElementById("tag-portal-menu");
        if (dropdown && dropdown.contains(event.target as Node)) return;

        setIsOpen(false);
        setInputValue("");
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleInteraction);
      document.addEventListener("touchstart", handleInteraction);
      if (!isMobile)
        window.addEventListener("scroll", () => setIsOpen(false), true);
    }

    return () => {
      document.removeEventListener("mousedown", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("scroll", () => setIsOpen(false), true);
    };
  }, [isOpen, isMobile]);

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
            className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 shadow-inner"
          >
            {tag}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled)
                  onUpdateTags(selectedTags.filter((t) => t !== tag));
              }}
              className={`transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : "hover:text-white"}`}
              disabled={disabled}
            >
              <X size={10} />
            </button>
          </span>
        ))}

        {/* FIXED: Compact '+' Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            isOpen ? setIsOpen(false) : openDropdown();
          }}
          className={`flex items-center justify-center w-6 h-6 rounded-md border transition-all shadow-inner ${disabled
              ? "opacity-50 cursor-not-allowed bg-white/5 border-white/10 text-slate-500"
              : isOpen
                ? "bg-purple-500 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/10"
            }`}
          disabled={disabled}
          title="Add Tag"
        >
          <Plus size={12} strokeWidth={3} />
        </button>
      </div>

      {/* --- PORTAL MENU --- */}
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            {isMobile && (
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998] animate-in fade-in duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              />
            )}

            <div
              id="tag-portal-menu"
              style={
                isMobile
                  ? {
                    position: "fixed",
                    bottom: "0",
                    left: "0",
                    right: "0",
                    top: "auto",
                    width: "100%",
                    maxHeight: "80vh",
                    borderRadius: "24px 24px 0 0",
                    transform: "none",
                  }
                  : {
                    position: "fixed",
                    top: `${dropdownCoords.top}px`,
                    left: `${dropdownCoords.left}px`,
                    width: `${dropdownCoords.width}px`,
                  }
              }
              className={`flex flex-col bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl z-[99999] p-2 animate-in duration-200 ${isMobile
                  ? "slide-in-from-bottom-10 fade-in"
                  : "rounded-2xl zoom-in-95 fade-in"
                }`}
              onClick={(e) => e.stopPropagation()}
            >
              {isMobile && (
                <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 mt-2" />
              )}

              <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-xl px-3 py-2.5 mb-2 shadow-inner">
                <Search size={14} className="text-slate-500 shrink-0" />
                <input
                  id="tag-search-input"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Search tags..."
                  className="w-full bg-transparent text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none uppercase tracking-wide"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (exactMatchFound) toggleTag(inputValue.trim());
                      else handleCreateTag();
                    }
                  }}
                />
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 max-h-[40vh] md:max-h-[220px] pb-safe">
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
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
