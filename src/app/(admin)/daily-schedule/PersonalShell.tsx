"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  Clock,
  Utensils,
  Coffee,
  Dumbbell,
  Brain,
  Heart,
  CheckCircle2,
  Activity,
  RefreshCcw,
  Loader2,
  List,
  LayoutGrid,
  Target,
  Undo2,
  Save,
  X,
  Trash2,
  Plus,
  BarChart2,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  Pill,
  PlusCircle,
  MinusCircle,
  Palette,
  Sun,
  Moon,
  Archive,
  RotateCcw,
  Edit3,
  Search,
  Filter,
  SortAsc,
  GripVertical,
  Layout,
  ChevronDown,
  ChevronUp,
  Gauge,
  Menu,
  Command,
  LayoutList,
  Settings2,
  Tag,
  Hash,
  Bookmark,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  updatePersonalItem,
  updatePersonalPositions,
  resetAllPersonalItems,
  createPersonalItem,
  deletePersonalItem,
  fetchPersonalItems,
  loadTemplateToDate,
  fetchTemplates,
} from "./actions";
import {
  fetchAllTaskMasterItems,
  smartCompleteTaskMasterItem,
  syncTaskMasterSubtask,
  voidProtocolItem,
} from "../task-master/actions";
import { TaskItem as TaskMasterItem } from "../task-master/_components/utils/types";
import PersonalStatsModal from "./PersonalStatsModal";
import TaskMasterImportModal from "./TaskMasterImportModal";
import ScheduleSidebar from "./_components/ScheduleSidebar";
import HUD from "./_components/HUD";
import Calendar from "./_components/Calendar";
import ItemCard, { CompactCard, ListItem } from "./_components/ItemCard";
import SortableItem from "./_components/SortableItem";
import { PersonalItem, ViewMode } from "./types";

interface PersonalShellProps {
  initialItems: PersonalItem[];
}

export default function PersonalShell({ initialItems }: PersonalShellProps) {
  const [items, setItems] = useState<PersonalItem[]>(initialItems);
  const [view, setView] = useState<ViewMode>("protocol");
  const [isInitializing, setIsInitializing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Date/Calendar State
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });
  const [calendarView, setCalendarView] = useState<"week" | "month" | "year">(
    "week",
  );
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isYtdOpen, setIsYtdOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // Tags System
  const [availableTags, setAvailableTags] = useState<string[]>(() => {
    // Try to load from localStorage or use defaults
    return [
      "cosmetic",
      "supplement",
      "training",
      "diet",
      "business",
      "work",
      "skill up",
      "creative work",
      "free time",
      "meal prep",
    ];
  });

  const handleAddGlobalTag = (tag: string) => {
    if (tag && !availableTags.includes(tag.toLowerCase())) {
      setAvailableTags((prev) => [...prev, tag.toLowerCase()]);
    }
  };

  const handleRemoveGlobalTag = (tag: string) => {
    setAvailableTags((prev) => prev.filter((t) => t !== tag));
  };
  // Interface Visibility
  const [isHudOpen, setIsHudOpen] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  // Filter/Order state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "completed"
  >("all");
  const [sortMethod, setSortMethod] = useState<"manual" | "az" | "time">(
    "manual",
  );
  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    title: string;
    content: string;
    duration: string;
    timeOfDay: string;
    supplements: string;
    subActions: (string | { text: string; tags: string[] })[];
    cosmetic: string;
    tags: string[];
  }>({
    title: "",
    content: "",
    duration: "",
    timeOfDay: "",
    supplements: "",
    subActions: [],
    cosmetic: "emerald",
    tags: [],
  });

  // Stats Modal state
  const [statsItem, setStatsItem] = useState<PersonalItem | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Custom Toast/Modal state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Date-Bound Fetching
  useEffect(() => {
    const loadDateItems = async () => {
      setIsInitializing(true);
      const res = await fetchPersonalItems(selectedDate);
      if (res.success && res.data) {
        setItems(res.data);
      }
      setIsInitializing(false);
    };
    loadDateItems();
  }, [selectedDate]);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Helper to get local date string in YYYY-MM-DD format
  const getLocalDateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // Date Utils for Navigation
  const getCalendarDays = (viewMode: "week" | "month" | "year") => {
    const days: string[] = [];
    const today = new Date();
    let start: Date;
    let end: Date;

    if (viewMode === "week") {
      // Show 3 days before and 7 days after today
      start = new Date(today);
      start.setDate(today.getDate() - 3);
      end = new Date(today);
      end.setDate(today.getDate() + 7);
    } else if (viewMode === "month") {
      // Show the current month
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else {
      // Year view - show from Jan 1 to Dec 31, 2026
      start = new Date(2026, 0, 1);
      end = new Date(2026, 11, 31);
    }

    let curr = new Date(start);
    while (curr <= end) {
      days.push(getLocalDateString(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return days;
  };

  const isFuture = (dateStr: string) => {
    const today = getLocalDateString(new Date());
    return dateStr > today;
  };

  const handleLoadTemplate = async () => {
    setIsLoadingTemplate(true);
    const res = await loadTemplateToDate(selectedDate);
    if (res.success && res.data) {
      setItems(res.data);
      showToast("Daily template loaded!");
    } else {
      showToast(res.error || "Failed to load template", "error");
    }
    setIsLoadingTemplate(false);
  };

  const calendarDays = useMemo(
    () => getCalendarDays(calendarView),
    [calendarView],
  );
  const filteredItems = useMemo(() => {
    let list = [...items];

    // 1. Status Filter
    if (view === "archive") {
      list = list.filter((i) => i.status === "archived");
    } else {
      // In other views, we only show active/completed items
      list = list.filter((i) => i.status !== "archived");
      if (filterStatus === "active")
        list = list.filter((i) => i.status !== "completed");
      if (filterStatus === "completed")
        list = list.filter((i) => i.status === "completed");
    }

    // 2. Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(query) ||
          i.content.toLowerCase().includes(query) ||
          (i.metadata?.tags &&
            i.metadata.tags.some((tag: string) =>
              tag.toLowerCase().includes(query),
            )) ||
          (i.metadata?.sub_actions &&
            i.metadata.sub_actions.some(
              (sub: string | { text: string; tags: string[] }) => {
                const subText = typeof sub === "string" ? sub : sub.text;
                const subTags = typeof sub === "string" ? [] : sub.tags || [];
                return (
                  subText.toLowerCase().includes(query) ||
                  subTags.some((tag: string) =>
                    tag.toLowerCase().includes(query),
                  )
                );
              },
            )),
      );
    }

    // 3. Sorting
    if (sortMethod === "az") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortMethod === "time") {
      list.sort((a, b) =>
        (a.metadata?.time_of_day || "").localeCompare(
          b.metadata?.time_of_day || "",
        ),
      );
    } else {
      // Manual/Position
      list.sort((a, b) => (a.position || 0) - (b.position || 0));
    }

    return list;
  }, [items, view, filterStatus, searchQuery, sortMethod]);

  const handleMasterReset = async () => {
    setConfirmModal({
      isOpen: true,
      title: "Reset Progress?",
      message:
        "This will reset all daily protocols to active. Your streaks will be preserved.",
      onConfirm: async () => {
        setIsResetting(true);
        const res = await resetAllPersonalItems();
        if (res.success) {
          setItems((prev) =>
            prev.map((item) => ({ ...item, status: "active" })),
          );
          showToast("Daily protocols reset");
        } else {
          showToast("Reset failed: " + res.error, "error");
        }
        setIsResetting(false);
      },
    });
  };

  const handleToggleItem = async (id: string) => {
    if (isFuture(selectedDate)) {
      showToast(
        "You're not a time traveler! We haven't reached this day yet.",
        "error",
      );
      return;
    }

    const item = items.find((i) => i.id === id);
    if (!item) return;

    const isCompleting = item.status !== "completed";
    const newStatus = isCompleting ? "completed" : "active";

    let newMeta = { ...(item.metadata || {}) };

    if (isCompleting) {
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const logEntry = `${todayStr} @ ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      const currentDates = newMeta.completed_dates || [];
      newMeta.completed_dates = [...currentDates, logEntry];
      newMeta.streak = newMeta.completed_dates.length;

      // Sync with Task Master if linked
      if (newMeta.task_master_id) {
        smartCompleteTaskMasterItem(newMeta.task_master_id);
      }
    } else {
      // Undo logic
      if (newMeta.completed_dates?.length > 0) {
        newMeta.completed_dates = newMeta.completed_dates.slice(0, -1);
      }
      newMeta.streak = newMeta.completed_dates?.length || 0;
    }

    // Optimistic update
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: newStatus, metadata: newMeta } : i,
      ),
    );

    const res = await updatePersonalItem(id, {
      status: newStatus,
      metadata: newMeta,
    });
    if (!res.success) {
      showToast("Sync failed: " + res.error, "error");
      window.location.reload();
    }
  };

  const handleToggleSubtask = async (itemId: string, subtaskText: string) => {
    if (isFuture(selectedDate)) {
      showToast(
        "Stop right there! You can't execute future protocols.",
        "error",
      );
      return;
    }

    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const subActions = item.metadata?.sub_actions || [];
    const subAction = subActions.find(
      (s: any) => (typeof s === "string" ? s : s.text) === subtaskText,
    );
    const subActionId =
      typeof subAction === "object" ? subAction.task_master_id : null;

    const completed = item.metadata?.completed_sub_actions || [];
    const isNowCompleted = !completed.includes(subtaskText);
    const newCompleted = isNowCompleted
      ? [...completed, subtaskText]
      : completed.filter((s: string) => s !== subtaskText);

    const newMetadata = {
      ...item.metadata,
      completed_sub_actions: newCompleted,
    };

    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, metadata: newMetadata } : i)),
    );

    const res = await updatePersonalItem(itemId, { metadata: newMetadata });
    if (res.success) {
      // Sync with Task Master if linked
      if (subActionId) {
        // If the sub-action ITSELF is a linked protocol item
        smartCompleteTaskMasterItem(subActionId);
      } else if (item.metadata?.task_master_id) {
        // If the PARENT is a linked protocol item, sync the subtask status
        syncTaskMasterSubtask(
          item.metadata.task_master_id,
          subtaskText,
          isNowCompleted,
        );
      }
    } else {
      showToast("Sync failed: " + res.error, "error");
      // Revert on failure
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, metadata: item.metadata } : i,
        ),
      );
    }
  };

  const handleUpdateMetadata = async (id: string, metadata: any) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, metadata } : i)));
    // Also update statsItem if it's the one being modified
    if (statsItem?.id === id) {
      setStatsItem((prev) => (prev ? { ...prev, metadata } : null));
    }

    const res = await updatePersonalItem(id, { metadata });
    if (!res.success) {
      showToast("Update failed: " + res.error, "error");
      window.location.reload();
    } else {
      showToast("Stats Synchronized");
    }
  };

  const handleArchiveItem = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "archived" } : i)),
    );

    const res = await updatePersonalItem(id, { status: "archived" });
    if (res.success) {
      // Sync Voiding to Task-Master if linked
      if (item.metadata?.task_master_id) {
        voidProtocolItem(item.metadata.task_master_id);
      }
      showToast("Item Archived");
    } else {
      showToast("Archive failed: " + res.error, "error");
      window.location.reload();
    }
  };

  const handleRestoreItem = async (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "active" } : i)),
    );
    const res = await updatePersonalItem(id, { status: "active" });
    if (!res.success) {
      showToast("Restore failed: " + res.error, "error");
      window.location.reload();
    } else {
      showToast("Protocol Restored");
    }
  };

  const openStats = (item: PersonalItem) => {
    setStatsItem(item);
    setIsStatsOpen(true);
  };

  const handleSort = async (id: string, direction: "up" | "down") => {
    const idx = filteredItems.findIndex((i) => i.id === id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === filteredItems.length - 1) return;

    const otherIdx = direction === "up" ? idx - 1 : idx + 1;
    const currentItem = filteredItems[idx];
    const otherItem = filteredItems[otherIdx];

    const newPosCurrent = otherItem.position;
    const newPosOther = currentItem.position;

    // Optimistic update
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === currentItem.id) return { ...i, position: newPosCurrent };
        if (i.id === otherItem.id) return { ...i, position: newPosOther };
        return i;
      }),
    );

    await Promise.all([
      updatePersonalItem(currentItem.id, { position: newPosCurrent }),
      updatePersonalItem(otherItem.id, { position: newPosOther }),
    ]);
  };

  const startEditing = (item: PersonalItem) => {
    setEditingId(item.id);
    const meta = item.metadata || {};
    const subActions = (meta.sub_actions || []).map(
      (sub: string | { text: string; tags: string[] }) => {
        if (typeof sub === "string") {
          return { text: sub, tags: [] };
        }
        return sub;
      },
    );

    setEditValues({
      title: item.title || "",
      content: item.content || "",
      duration: meta.duration || "",
      timeOfDay: meta.time_of_day || "",
      supplements: meta.supplements || "",
      subActions: subActions,
      cosmetic: meta.cosmetic || "emerald",
      tags: meta.tags || [],
    });
  };

  const saveEdit = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newMeta = {
      ...(item.metadata || {}),
      duration: editValues.duration,
      time_of_day: editValues.timeOfDay,
      supplements: editValues.supplements,
      sub_actions: editValues.subActions, // This now contains objects { text, tags }
      cosmetic: editValues.cosmetic,
      tags: editValues.tags,
    };
    const updates = {
      title: editValues.title,
      content: editValues.content,
      metadata: newMeta,
    };

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    );
    setEditingId(null);

    const res = await updatePersonalItem(id, updates);
    if (!res.success) {
      showToast("Save failed: " + res.error, "error");
      window.location.reload();
    } else {
      showToast("Protocol Updated");
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Protocol?",
      message:
        "This will permanently remove this protocol and all its history. This action cannot be undone.",
      onConfirm: async () => {
        setItems((prev) => prev.filter((i) => i.id !== id));
        const res = await deletePersonalItem(id);
        if (!res.success) {
          showToast("Delete failed: " + res.error, "error");
          window.location.reload();
        } else {
          showToast("Protocol Purged");
        }
      },
    });
  };

  const handleImportFromTaskMaster = async (
    tmItem: TaskMasterItem,
    target: { type: "main" | "subtask"; parentId?: string },
  ) => {
    if (target.type === "main") {
      const newItem = {
        title: tmItem.title,
        content: tmItem.content || "",
        type: tmItem.type || "task",
        status: "active",
        position:
          filteredItems.length > 0
            ? filteredItems[filteredItems.length - 1].position + 1000
            : 1000,
        metadata: {
          ...tmItem.metadata,
          task_master_id: tmItem.id,
          sub_actions:
            tmItem.subtasks?.map((s) => ({ text: s.title, tags: [] })) || [],
        },
      };
      const res = await createPersonalItem(newItem);
      if (res.success && res.data) {
        setItems((prev) => [...prev, res.data]);
        setIsImportModalOpen(false);
        showToast("Directive Imported Successfully");
      } else {
        showToast("Import failed: " + (res.error || "Unknown error"), "error");
      }
    } else if (target.type === "subtask" && target.parentId) {
      const parent = items.find((i) => i.id === target.parentId);
      if (!parent) return;

      const newSubAction = {
        text: tmItem.title,
        tags: tmItem.tags || [],
        task_master_id: tmItem.id,
      };

      const newMetadata = {
        ...parent.metadata,
        sub_actions: [...(parent.metadata?.sub_actions || []), newSubAction],
      };

      // Optimistic update
      setItems((prev) =>
        prev.map((i) =>
          i.id === target.parentId ? { ...i, metadata: newMetadata } : i,
        ),
      );

      const res = await updatePersonalItem(target.parentId, {
        metadata: newMetadata,
      });
      if (res.success) {
        setIsImportModalOpen(false);
        showToast("Sub-Action Integrated");
      } else {
        showToast("Sync failed: " + res.error, "error");
        // Revert
        setItems((prev) =>
          prev.map((i) =>
            i.id === target.parentId ? { ...i, metadata: parent.metadata } : i,
          ),
        );
      }
    }
  };

  const handleAddItem = async () => {
    const newItem = {
      title: "",
      content: "",
      type: "task",
      position:
        filteredItems.length > 0
          ? filteredItems[filteredItems.length - 1].position + 1000
          : 1000,
      metadata: {
        duration: "",
        time_of_day: "",
        supplements: "",
        sub_actions: [], // Initialize as empty array of objects
        cosmetic: "emerald",
        tags: [],
      },
    };
    const res = await createPersonalItem(newItem);
    if (res.success && res.data) {
      setItems((prev) => [...prev, res.data]);
      startEditing(res.data);
      showToast("New Protocol Initialized");
    } else {
      showToast(
        "Failed to add item: " + (res.error || "Unknown error"),
        "error",
      );
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      let newList: PersonalItem[] = [];

      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        const temp = arrayMove(prev, oldIndex, newIndex);
        newList = temp.map((item, index) => ({ ...item, position: index }));
        return newList;
      });

      // Update positions in background after state update
      setTimeout(() => {
        const positionUpdates = newList.map((item) => ({
          id: item.id,
          position: item.position,
        }));
        updatePersonalPositions(positionUpdates);
      }, 0);
    }
  };

  // No longer showing empty state - user can add items manually

  const currentFocusItem =
    filteredItems.find((i) => i.status !== "completed") ||
    filteredItems[filteredItems.length - 1];

  // ADVANCED PROGRESS CALCULATION
  const activeItems = items.filter((i) => i.status !== "archived");
  const totalPoints = activeItems.reduce((acc, item) => {
    const subtaskCount = item.metadata?.sub_actions?.length || 0;
    return acc + 1 + subtaskCount; // 1 point for the main task, 1 per subtask
  }, 0);

  const completedPoints = activeItems.reduce((acc, item) => {
    const mainPoint = item.status === "completed" ? 1 : 0;
    const subPoints = item.metadata?.completed_sub_actions?.length || 0;
    return acc + mainPoint + subPoints;
  }, 0);

  const dayProgress =
    totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0;
  const totalActive = activeItems.length;
  const totalCompleted = items.filter((i) => i.status === "completed").length;

  const getProgressColor = (p: number) => {
    if (p < 30) return isDarkMode ? "text-red-400" : "text-red-500";
    if (p < 70) return isDarkMode ? "text-amber-400" : "text-amber-500";
    return isDarkMode ? "text-emerald-400" : "text-emerald-500";
  };

  const getProgressBg = (p: number) => {
    if (p < 30) return "bg-red-500";
    if (p < 70) return "bg-amber-500";
    return "bg-emerald-500";
  };
  return (
    <div
      className={`min-h-screen py-6 sm:py-12 px-4 sm:px-6 transition-colors duration-500 ${isDarkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}
    >
      <div className="max-w-4xl mx-auto pb-12 sm:pb-24">
        {/* YTD (YEAR-TO-DATE) HUD - Collapsible */}
        <div
          className={`mb-6 rounded-[2rem] border overflow-hidden transition-all ${isDarkMode ? "bg-gradient-to-r from-slate-900 to-slate-800 border-white/5" : "bg-gradient-to-r from-slate-50 to-white border-slate-200"}`}
        >
          <button
            onClick={() => setIsYtdOpen(!isYtdOpen)}
            className="w-full flex items-center justify-between p-6 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${isDarkMode ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600"}`}
              >
                <Activity size={18} />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-black uppercase tracking-tight">
                  Year-to-Date Overview
                </h3>
                <p
                  className={`text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                >
                  2026 Performance
                </p>
              </div>
            </div>
            {isYtdOpen ? (
              <ChevronUp size={18} className="text-slate-500" />
            ) : (
              <ChevronDown size={18} className="text-slate-500" />
            )}
          </button>
          {isYtdOpen && (
            <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-3 gap-4">
                <div
                  className={`p-4 rounded-xl ${isDarkMode ? "bg-white/5" : "bg-slate-100/50"}`}
                >
                  <p
                    className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                  >
                    Days Active
                  </p>
                  <p className="text-xl font-black text-emerald-500">
                    {Math.floor(
                      (new Date().getTime() -
                        new Date("2026-01-01").getTime()) /
                        (1000 * 60 * 60 * 24),
                    )}
                  </p>
                </div>
                <div
                  className={`p-4 rounded-xl ${isDarkMode ? "bg-white/5" : "bg-slate-100/50"}`}
                >
                  <p
                    className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                  >
                    Best Streak
                  </p>
                  <p className="text-xl font-black text-amber-500">
                    {Math.max(...items.map((i) => i.metadata?.streak || 0), 0)}
                  </p>
                </div>
                <div
                  className={`p-4 rounded-xl ${isDarkMode ? "bg-white/5" : "bg-slate-100/50"}`}
                >
                  <p
                    className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                  >
                    Active Protocols
                  </p>
                  <p className="text-xl font-black text-blue-500">
                    {items.filter((i) => i.status !== "archived").length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* DAILY VIEW */}
        <div
          className={`transition-all duration-500 ease-in-out ${isHudOpen ? "mb-8" : "mb-4"}`}
        >
          <Calendar
            isDarkMode={isDarkMode}
            calendarView={calendarView}
            setCalendarView={setCalendarView}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            calendarDays={calendarDays}
            getLocalDateString={getLocalDateString}
          />

          <div
            className={`relative overflow-hidden rounded-[2.5rem] sm:rounded-[3.5rem] border shadow-2xl transition-all duration-500 ${isDarkMode ? "bg-slate-900/80 border-white/5 shadow-emerald-900/20" : "bg-white border-slate-200 shadow-slate-200/50"}`}
          >
            <HUD
              isDarkMode={isDarkMode}
              selectedDate={selectedDate}
              isHudOpen={isHudOpen}
              setIsHudOpen={setIsHudOpen}
              setIsImportModalOpen={setIsImportModalOpen}
              dayProgress={dayProgress}
              totalActive={totalActive}
              totalCompleted={totalCompleted}
              currentFocusItem={currentFocusItem}
              getProgressColor={getProgressColor}
              getProgressBg={getProgressBg}
            />
          </div>
        </div>

        {/* TOP NAV */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Link
            href="/dashboard"
            className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-colors ${isDarkMode ? "text-slate-500 hover:text-emerald-400" : "text-slate-400 hover:text-emerald-600"}`}
          >
            &larr; Command Center
          </Link>

          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition-all shadow-lg active:scale-95 ${isDarkMode ? "bg-slate-900 border-white/10 text-amber-400 shadow-amber-400/5" : "bg-white border-slate-200 text-slate-400 hover:text-amber-500 shadow-slate-200/50"}`}
              title={
                isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <div
              className={`flex p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border gap-0.5 sm:gap-1 shadow-xl transition-all ${isDarkMode ? "bg-slate-900 border-white/5 shadow-black/20" : "bg-white border-slate-200 shadow-slate-200/50"}`}
            >
              {[
                { view: "protocol", icon: LayoutGrid, label: "Protocol" },
                { view: "card", icon: Layout, label: "Cards" },
                { view: "list", icon: List, label: "List" },
                { view: "focus", icon: Target, label: "Focus" },
                { view: "archive", icon: Archive, label: "Archive" },
              ].map((item: any) => (
                <button
                  key={item.view}
                  onClick={() => setView(item.view)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${view === item.view ? "bg-emerald-600 text-white font-black" : `${isDarkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-emerald-600"} font-bold`}`}
                  title={`${item.label} View`}
                >
                  <item.icon size={14} />
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-widest hidden md:inline">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsSorting(!isSorting)}
              className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition-all shadow-lg active:scale-95 ${isSorting ? "bg-amber-500 text-white border-amber-500 shadow-xl shadow-amber-500/20" : `${isDarkMode ? "bg-slate-900 border-white/10 text-slate-500 hover:text-slate-300" : "bg-white border-slate-200 text-slate-400 hover:text-slate-600 shadow-slate-200/50"}`}`}
              title={isSorting ? "Lock Sorting" : "Unlock Sorting"}
            >
              {isSorting ? <Unlock size={16} /> : <Lock size={16} />}
            </button>
          </div>

          <button
            onClick={handleMasterReset}
            disabled={isResetting}
            className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border shadow-sm ${isDarkMode ? "bg-slate-900 border-white/10 text-slate-500 hover:text-red-400" : "bg-white border-slate-200 text-slate-400 hover:text-red-500"}`}
          >
            {isResetting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <RefreshCcw size={12} />
            )}
            ResetProtocol()
          </button>
        </div>

        {/* TOAST SYSTEM */}
        {toast && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top duration-300 px-4">
            <div
              className={`px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-4 font-black uppercase tracking-[0.2em] text-[10px] whitespace-nowrap ${toast.type === "success" ? "bg-emerald-500 text-white border-emerald-400/50 shadow-emerald-500/20" : "bg-red-500 text-white border-red-400/50 shadow-red-500/20"}`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 size={16} strokeWidth={3} />
              ) : (
                <X size={16} strokeWidth={3} />
              )}
              {toast.message}
            </div>
          </div>
        )}

        {/* CUSTOM CONFIRM MODAL */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() =>
                setConfirmModal((prev) => ({ ...prev, isOpen: false }))
              }
            />
            <div
              className={`relative w-full max-w-sm rounded-[2.5rem] border p-10 shadow-3xl animate-in zoom-in-95 duration-200 ${isDarkMode ? "bg-slate-900 border-white/10 shadow-emerald-900/40" : "bg-white border-slate-200 shadow-slate-200/50"}`}
            >
              <h2
                className={`text-2xl font-black uppercase tracking-tighter mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                {confirmModal.title}
              </h2>
              <p className="text-sm font-medium text-slate-500 mb-10 lowercase tracking-tight italic leading-relaxed">
                {confirmModal.message}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() =>
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }))
                  }
                  className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 ${isDarkMode ? "bg-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-emerald-600 text-white hover:bg-emerald-500 transition-all active:scale-95 shadow-lg shadow-emerald-600/20"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8 sm:mb-12">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1
                className={`text-4xl sm:text-6xl font-black uppercase tracking-tighter italic leading-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Magnus Mode
              </h1>
              <p
                className={`${isDarkMode ? "text-slate-500" : "text-slate-400"} font-bold uppercase tracking-widest flex items-center gap-2 text-[10px]`}
              >
                <Zap size={14} className="text-emerald-500" />
                {view === "focus"
                  ? "Focus Directive"
                  : "Daily Protocol Evolution"}
              </p>
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-4 rounded-2xl border transition-all flex items-center gap-2 ${isFilterOpen ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20" : `${isDarkMode ? "bg-slate-900 border-white/5 text-slate-500 hover:text-white" : "bg-white border-slate-200 text-slate-400"}`}`}
            >
              <Settings2 size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
                Filters
              </span>
            </button>
          </div>

          {/* FILTER / ORDER BAR (COLLAPSABLE) */}
          {isFilterOpen && (
            <div
              className={`p-3 sm:p-4 rounded-[1.5rem] sm:rounded-[2rem] border mb-6 sm:mb-8 flex flex-col md:flex-row items-stretch md:items-center gap-4 transition-all animate-in slide-in-from-right-4 duration-500 ${isDarkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-200"}`}
            >
              <div className="flex-grow flex items-center gap-3 bg-slate-100/50 dark:bg-white/5 px-4 py-2.5 rounded-2xl border border-transparent focus-within:border-emerald-500/30 transition-all">
                <Search size={16} className="text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Protocol..."
                  className="bg-transparent border-none outline-none font-bold text-xs uppercase tracking-widest w-full placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                <Filter size={14} className="text-slate-500 flex-shrink-0" />
                {(["all", "active", "completed"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterStatus === status ? "bg-emerald-600 text-white" : `${isDarkMode ? "bg-white/5 text-slate-500 hover:text-slate-300" : "bg-slate-50 text-slate-400 hover:text-slate-600"}`}`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 h-10 border-t md:border-t-0 md:border-l dark:border-white/5 border-slate-200 pt-3 md:pt-0 md:pl-4 md:ml-auto">
                <SortAsc size={14} className="text-slate-500 flex-shrink-0" />
                <select
                  value={sortMethod}
                  onChange={(e) => setSortMethod(e.target.value as any)}
                  className={`bg-transparent font-black uppercase tracking-widest text-[9px] sm:text-[10px] outline-none cursor-pointer w-full md:w-auto ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  <option value="manual">Manual Order</option>
                  <option value="az">A-Z Alpha</option>
                  <option value="time">Time of Day</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* EMPTY STATE - Load Template */}
        {filteredItems.length === 0 && view !== "archive" && (
          <div
            className={`mb-8 p-12 rounded-[2.5rem] border text-center ${isDarkMode ? "bg-slate-900/50 border-white/5" : "bg-white border-slate-200"}`}
          >
            <Zap
              size={48}
              className="mx-auto text-emerald-500 mb-4 opacity-50"
            />
            <h3
              className={`text-xl font-black uppercase tracking-tighter mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              No Protocols for{" "}
              {new Date(selectedDate + "T12:00:00").toLocaleDateString(
                undefined,
                { weekday: "long", month: "short", day: "numeric" },
              )}
            </h3>
            <p
              className={`text-sm mb-8 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Load your daily template to populate this day with protocols, or
              add items manually.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleLoadTemplate}
                disabled={isLoadingTemplate}
                className="bg-emerald-600 text-white font-black uppercase tracking-widest px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-emerald-500 transition-all disabled:opacity-50 shadow-xl shadow-emerald-600/20"
              >
                {isLoadingTemplate ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <RefreshCcw size={20} />
                )}
                Load Daily Template
              </button>
              <Link
                href="/daily-schedule/templates"
                className={`px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border transition-all ${
                  isDarkMode
                    ? "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                    : "border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Edit Templates
              </Link>
            </div>
          </div>
        )}

        {/* VIEW RENDERING */}
        {filteredItems.length > 0 && view === "protocol" && (
          <div className="grid gap-6">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredItems.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid gap-6">
                  {filteredItems.map((item, idx) => (
                    <SortableItem
                      key={item.id}
                      id={item.id}
                      showHandle={isSorting}
                    >
                      <ItemCard
                        item={item}
                        index={idx + 1}
                        isEditing={editingId === item.id}
                        editValues={editValues}
                        setEditValues={setEditValues}
                        isSorting={isSorting}
                        isDarkMode={isDarkMode}
                        sensors={sensors}
                        view={view}
                        onSort={handleSort}
                        onLog={() => handleToggleItem(item.id)}
                        onArchive={() => handleArchiveItem(item.id)}
                        onRestore={() => handleRestoreItem(item.id)}
                        onEdit={() => startEditing(item)}
                        onSave={() => saveEdit(item.id)}
                        onCancel={() => setEditingId(null)}
                        onDelete={() => handleDelete(item.id)}
                        onOpenStats={() => openStats(item)}
                        onToggleSubtask={handleToggleSubtask}
                        availableTags={availableTags}
                        expandedIds={expandedIds}
                        toggleExpand={toggleExpand}
                      />
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <button
              onClick={handleAddItem}
              className={`w-full py-8 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 group shadow-sm ${isDarkMode ? "border-white/5 bg-white/[0.02] text-slate-600 hover:text-emerald-400 hover:border-emerald-500/20 hover:bg-emerald-500/[0.02]" : "border-slate-200 bg-white/50 text-slate-400 hover:text-emerald-600 hover:border-emerald-600/30 hover:bg-white"}`}
            >
              <div
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm ${isDarkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-200"}`}
              >
                <Plus size={24} />
              </div>
              <span className="font-black uppercase tracking-[0.2em] text-[10px]">
                Add New Directive
              </span>
            </button>
          </div>
        )}

        {filteredItems.length > 0 && view === "card" && (
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredItems.map((item, idx) =>
              editingId === item.id ? (
                <div key={item.id} className="sm:col-span-2">
                  <ItemCard
                    item={item}
                    index={idx + 1}
                    isEditing={true}
                    editValues={editValues}
                    setEditValues={setEditValues}
                    isSorting={false}
                    isDarkMode={isDarkMode}
                    sensors={sensors}
                    view={view}
                    onSort={handleSort}
                    onLog={() => handleToggleItem(item.id)}
                    onArchive={() => handleArchiveItem(item.id)}
                    onRestore={() => handleRestoreItem(item.id)}
                    onEdit={() => startEditing(item)}
                    onSave={() => saveEdit(item.id)}
                    onCancel={() => setEditingId(null)}
                    onDelete={() => handleDelete(item.id)}
                    onOpenStats={() => openStats(item)}
                    onToggleSubtask={handleToggleSubtask}
                    availableTags={availableTags}
                    expandedIds={expandedIds}
                    toggleExpand={toggleExpand}
                  />
                </div>
              ) : (
                <CompactCard
                  key={item.id}
                  item={item}
                  index={idx + 1}
                  isDarkMode={isDarkMode}
                  onLog={() => handleToggleItem(item.id)}
                  onOpenStats={() => openStats(item)}
                  onToggleSubtask={handleToggleSubtask}
                  onEdit={() => startEditing(item)}
                  onDelete={() => handleDelete(item.id)}
                  onArchive={() => handleArchiveItem(item.id)}
                />
              ),
            )}
          </div>
        )}

        {filteredItems.length > 0 && view === "list" && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredItems.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {filteredItems.map((item, idx) =>
                  editingId === item.id ? (
                    <ItemCard
                      key={item.id}
                      item={item}
                      index={idx + 1}
                      isEditing={true}
                      editValues={editValues}
                      setEditValues={setEditValues}
                      isSorting={false}
                      isDarkMode={isDarkMode}
                      sensors={sensors}
                      view={view}
                      onSort={handleSort}
                      onLog={() => handleToggleItem(item.id)}
                      onArchive={() => handleArchiveItem(item.id)}
                      onRestore={() => handleRestoreItem(item.id)}
                      onEdit={() => startEditing(item)}
                      onSave={() => saveEdit(item.id)}
                      onCancel={() => setEditingId(null)}
                      onDelete={() => handleDelete(item.id)}
                      onOpenStats={() => openStats(item)}
                      onToggleSubtask={handleToggleSubtask}
                      availableTags={availableTags}
                      expandedIds={expandedIds}
                      toggleExpand={toggleExpand}
                    />
                  ) : (
                    <SortableItem
                      key={item.id}
                      id={item.id}
                      showHandle={isSorting}
                    >
                      <div
                        className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all shadow-sm ${item.status === "completed" ? "opacity-40 grayscale" : ""} ${isDarkMode ? "bg-slate-900 border-white/5 shadow-black/20 text-white" : "bg-white border-slate-200 shadow-slate-200/50 text-slate-900"}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`text-xl sm:text-2xl font-black w-6 sm:w-8 ${isDarkMode ? "text-slate-800" : "text-slate-300"}`}
                          >
                            {idx + 1}
                          </div>
                          <div className="flex-grow flex items-center gap-3 sm:gap-4">
                            <button
                              onClick={() => openStats(item)}
                              className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-colors ${isDarkMode ? "bg-white/5 text-slate-500 hover:text-white" : "bg-slate-100 text-slate-400 hover:text-emerald-600"}`}
                            >
                              <BarChart2 size={14} className="sm:size-[16px]" />
                            </button>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <h4
                                  className={`font-black uppercase tracking-tight text-sm sm:text-base ${item.status === "completed" ? "line-through" : ""} ${isDarkMode ? "text-white" : "text-slate-900"}`}
                                >
                                  {item.title}
                                </h4>
                                {item.metadata?.time_of_day && (
                                  <span
                                    className={`text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md uppercase tracking-widest ${isDarkMode ? "text-emerald-400 bg-emerald-500/10" : "text-emerald-600 bg-emerald-50"}`}
                                  >
                                    {item.metadata.time_of_day}
                                  </span>
                                )}
                              </div>
                              <p
                                className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                              >
                                {item.metadata?.duration || "0 min"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                          {!isSorting && (
                            <>
                              <button
                                onClick={() => startEditing(item)}
                                className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-colors ${isDarkMode ? "bg-white/5 text-slate-500 hover:text-white" : "bg-slate-100 text-slate-400 hover:text-slate-900"}`}
                                title="Edit"
                              >
                                <Edit3 size={14} className="sm:size-[16px]" />
                              </button>
                              <button
                                onClick={() => handleArchiveItem(item.id)}
                                className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? "bg-white/5 text-slate-500 hover:text-white" : "bg-slate-100 text-slate-400 hover:text-slate-900"}`}
                                title="Archive"
                              >
                                <Archive size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? "bg-white/5 text-red-500/30 hover:text-red-500" : "bg-slate-100 text-red-300 hover:text-red-500"}`}
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleToggleItem(item.id)}
                            className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all shadow-lg active:scale-90 ${item.status === "completed" ? "bg-emerald-600 text-white shadow-emerald-200" : `${isDarkMode ? "bg-white/5 text-slate-500 hover:text-emerald-400" : "bg-slate-100 text-slate-400 hover:text-emerald-600"}`}`}
                          >
                            {item.status === "completed" ? (
                              <Undo2
                                size={18}
                                className="sm:size-[20px]"
                                strokeWidth={3}
                              />
                            ) : (
                              <CheckCircle2
                                size={18}
                                className="sm:size-[20px]"
                                strokeWidth={2.5}
                              />
                            )}
                          </button>
                        </div>
                      </div>
                    </SortableItem>
                  ),
                )}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {view === "focus" &&
          currentFocusItem &&
          (editingId === currentFocusItem.id ? (
            <div className="max-w-4xl mx-auto w-full">
              <ItemCard
                item={currentFocusItem}
                index={1}
                isEditing={true}
                editValues={editValues}
                setEditValues={setEditValues}
                isSorting={false}
                isDarkMode={isDarkMode}
                sensors={sensors}
                view={view}
                onSort={handleSort}
                onLog={() => handleToggleItem(currentFocusItem.id)}
                onArchive={() => handleArchiveItem(currentFocusItem.id)}
                onRestore={() => handleRestoreItem(currentFocusItem.id)}
                onEdit={() => startEditing(currentFocusItem)}
                onSave={() => saveEdit(currentFocusItem.id)}
                onCancel={() => setEditingId(null)}
                onDelete={() => handleDelete(currentFocusItem.id)}
                onOpenStats={() => openStats(currentFocusItem)}
                onToggleSubtask={handleToggleSubtask}
                availableTags={availableTags}
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-700">
              <div
                className={`mb-6 sm:mb-8 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center border shadow-xl ${isDarkMode ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-900/20" : "bg-emerald-50 border-emerald-100 text-emerald-600 shadow-emerald-100/50"}`}
              >
                <Target size={40} className="sm:size-[48px]" />
              </div>
              <h2
                className={`text-2xl sm:text-4xl font-black uppercase tracking-tighter mb-2 leading-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Current Directive
              </h2>
              <div
                className={`border rounded-[1.5rem] sm:rounded-[3rem] p-6 sm:p-12 max-w-2xl w-full mb-8 sm:mb-12 relative overflow-hidden shadow-2xl transition-all ${isDarkMode ? "bg-slate-900 border-white/5 shadow-black/40" : "bg-white border-slate-200 shadow-slate-200/50"}`}
              >
                <div
                  className={`absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 blur-[80px] sm:blur-[100px] -mr-24 -mt-24 sm:-mr-32 sm:-mt-32 ${isDarkMode ? "bg-emerald-500/5" : "bg-emerald-50 shadow-inner"}`}
                />
                <div className="relative z-10">
                  <h3
                    className={`text-xl sm:text-3xl font-black uppercase tracking-tight mb-4 sm:mb-6 ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}
                  >
                    {currentFocusItem.title}
                  </h3>
                  <p
                    className={`text-sm sm:text-lg font-medium italic mb-6 sm:mb-8 leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                  >
                    {currentFocusItem.content}
                  </p>
                  <div className="flex justify-center flex-wrap gap-3 sm:gap-4">
                    <div
                      className={`px-4 sm:px-6 py-2 sm:py-3 border rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isDarkMode ? "bg-white/5 border-white/5 text-slate-500" : "bg-slate-50 border-slate-200 text-slate-500"}`}
                    >
                      <Clock size={14} /> {currentFocusItem.metadata?.duration}
                    </div>
                    {currentFocusItem.metadata?.time_of_day && (
                      <div
                        className={`px-4 sm:px-6 py-2 sm:py-3 border rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isDarkMode ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-100 text-emerald-700"}`}
                      >
                        <Zap size={14} />{" "}
                        {currentFocusItem.metadata.time_of_day}
                      </div>
                    )}
                    {currentFocusItem.metadata?.streak > 0 && (
                      <div
                        className={`px-4 sm:px-6 py-2 sm:py-3 border rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isDarkMode ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-white border-amber-200 text-amber-600"}`}
                      >
                        <Activity size={14} /> Streak:{" "}
                        {currentFocusItem.metadata?.streak}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center gap-3 mt-10">
                    <button
                      onClick={() => startEditing(currentFocusItem)}
                      className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isDarkMode ? "text-slate-600 hover:text-emerald-400" : "text-slate-400 hover:text-emerald-600"}`}
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleArchiveItem(currentFocusItem.id)}
                      className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isDarkMode ? "text-slate-600 hover:text-emerald-400" : "text-slate-400 hover:text-emerald-600"}`}
                    >
                      <Archive size={14} /> Archive
                    </button>
                    <button
                      onClick={() => handleDelete(currentFocusItem.id)}
                      className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isDarkMode ? "text-red-500/30 hover:text-red-500" : "text-slate-400 hover:text-red-500"}`}
                    >
                      <Trash2 size={14} /> Purge
                    </button>
                    <button
                      onClick={() => openStats(currentFocusItem)}
                      className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isDarkMode ? "text-slate-600 hover:text-emerald-400" : "text-slate-400 hover:text-emerald-600"}`}
                    >
                      <BarChart2 size={14} /> Stats
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggleItem(currentFocusItem.id)}
                className={`text-white font-black uppercase tracking-[0.2em] px-8 sm:px-12 py-4 sm:py-6 rounded-2xl sm:rounded-[2rem] flex items-center gap-4 transition-all shadow-2xl active:scale-95 group text-sm sm:text-base ${isDarkMode ? "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20" : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-200"}`}
              >
                <CheckCircle2
                  size={24}
                  strokeWidth={3}
                  className="group-hover:scale-110 transition-transform"
                />
                Protocol Executed
              </button>
            </div>
          ))}
        {view === "archive" && (
          <div className="grid gap-6">
            <div className="grid gap-6">
              {filteredItems.map((item, idx) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  index={idx + 1}
                  isEditing={editingId === item.id}
                  editValues={editValues}
                  setEditValues={setEditValues}
                  isSorting={isSorting}
                  isDarkMode={isDarkMode}
                  sensors={sensors}
                  view={view}
                  onSort={handleSort}
                  onLog={() => handleToggleItem(item.id)}
                  onArchive={() => handleArchiveItem(item.id)}
                  onRestore={() => handleRestoreItem(item.id)}
                  onEdit={() => startEditing(item)}
                  onSave={() => saveEdit(item.id)}
                  onCancel={() => setEditingId(null)}
                  onDelete={() => handleDelete(item.id)}
                  onOpenStats={() => openStats(item)}
                  onToggleSubtask={handleToggleSubtask}
                  availableTags={availableTags}
                  expandedIds={expandedIds}
                  toggleExpand={toggleExpand}
                />
              ))}
              {filteredItems.length === 0 && (
                <div
                  className={`text-center py-20 rounded-[3rem] border-2 border-dashed ${isDarkMode ? "border-white/5 text-slate-600" : "border-slate-100 text-slate-400"}`}
                >
                  <Archive size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-xs">
                    No Archived Protocols
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <PersonalStatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        item={statsItem}
        isDarkMode={isDarkMode}
        onUpdateMetadata={handleUpdateMetadata}
      />

      <TaskMasterImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportFromTaskMaster}
        isDarkMode={isDarkMode}
        personalItems={items}
      />
    </div>
  );
}
