"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Plus, Code, AlignLeft, FileText, Link as LinkIcon, ExternalLink } from "lucide-react";
import styles from "../task-master.module.css";
import { TaskItem, ViewType, RecurrenceType, SortOption } from "./types";

// UI Components
import SidebarNav from "./SidebarNav";
import TechCodex from "./TechCodex";
import TaskView from "./TaskView";
import ResourceGrid from "./ResourceGrid";
import LevelUpView from "./LevelUpView";
import LedgerView from "./LedgerView";
import IdeaBoard from "./IdeaBoard";
import FilterBar from "./FilterBar";
import TagManager from "./TagManager";
import MobileNav from "./MobileNav";

import {
  Toast,
  ToastType,
  EditableFields,
  PromoteModal,
} from "./NotificationUI";
import ConfirmModal from "./ConfirmModal";
import EditModal from "./EditModal";
import RecurringModal from "./RecurringModal";
import IdeaDetailModal from "./IdeaDetailModal";

interface ShellProps {
  initialItems: TaskItem[];
  initialTags: string[];
  userId: string;
}

export default function TaskMasterShell({
  initialItems,
  initialTags,
  userId,
}: ShellProps) {
  const supabase = createClient();
  const router = useRouter();

  // --- STATE ---
  const [items, setItems] = useState<TaskItem[]>(initialItems);
  const [allSystemTags, setAllSystemTags] = useState<string[]>(initialTags);

  useEffect(() => {
    setAllSystemTags(initialTags);
  }, [initialTags]);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const [activeView, setActiveView] = useState<ViewType>("idea_board");
  const [activeRecurrence, setActiveRecurrence] =
    useState<RecurrenceType>("daily");
  const [sortOption, setSortOption] = useState<SortOption>("manual");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [globalActivePeriod, setGlobalActivePeriod] = useState<string>("all");

  // INPUT STATE
  const [newItemInput, setNewItemInput] = useState("");
  const [newCodexTitle, setNewCodexTitle] = useState("");
  const [newCodexNotes, setNewCodexNotes] = useState("");
  const [newCodexCode, setNewCodexCode] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState<ToastType | null>(null);
  // New Resource State
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceLink, setNewResourceLink] = useState("");
  const [newResourceNotes, setNewResourceNotes] = useState("");

  const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);
  const [bulkDeleteCandidates, setBulkDeleteCandidates] = useState<
    string[] | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editCandidate, setEditCandidate] = useState<TaskItem | null>(null);
  const [promoteCandidate, setPromoteCandidate] = useState<TaskItem | null>(
    null,
  );

  // =========================================================================
  // THE FIX: Only store the ID, so the modal always gets the LIVE data.
  // =========================================================================
  const [recurringItemId, setRecurringItemId] = useState<string | null>(null);
  const activeRecurringItem =
    items.find((i) => i.id === recurringItemId) || null;

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ id: Date.now().toString(), type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSwitchView = (view: ViewType) => {
    setActiveView(view);
    setFilterTags([]);
    setGlobalSearchQuery(""); // Clear search when switching views
    setGlobalActivePeriod("all"); // Reset date filter when switching views
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeView === "level_up") return;
    setIsAdding(true);

    const typeToAdd =
      activeView === "idea_board"
        ? "idea"
        : activeView === "resource"
          ? "resource"
          : activeView === "social_bookmark"
            ? "social_bookmark"
            : activeView === "code_snippet"
              ? "code_snippet"
              : activeView === "ledger"
                ? "task"
                : "task";

    const maxPos =
      items.length > 0 ? Math.max(...items.map((i) => i.position || 0)) : 0;

    let payload: any = {
      type: typeToAdd,
      status: "active",
      user_id: userId,
      position: maxPos + 1024,
    };

    if (activeView === "code_snippet") {
      if (!newCodexCode.trim() && !newCodexTitle.trim()) {
        setIsAdding(false);
        return;
      }
      payload = {
        ...payload,
        title: newCodexTitle || "Untitled Snippet",
        content: newCodexCode,
        metadata: { notes: newCodexNotes },
      };
    } else if (activeView === "resource") {
      if (!newResourceTitle.trim() && !newResourceLink.trim()) {
        setIsAdding(false);
        return;
      }
      payload = {
        ...payload,
        title: newResourceTitle || newResourceLink,
        content: newResourceNotes,
        metadata: { url: newResourceLink },
        tags: [],
      };
    } else {
      if (!newItemInput.trim()) {
        setIsAdding(false);
        return;
      }
      payload = {
        ...payload,
        title: newItemInput,
        content: "",
        recurrence: activeView === "task" ? activeRecurrence : null,
      };
    }

    const { data } = await supabase
      .from("task_master_items")
      .insert([payload])
      .select()
      .single();

    if (data) {
      setItems([...items, { ...data, subtasks: [] }]);
      setNewItemInput("");
      setNewCodexTitle("");
      setNewCodexNotes("");
      setNewCodexCode("");
      setNewResourceTitle("");
      setNewResourceLink("");
      setNewResourceNotes("");
      showToast("success", activeView === "resource" ? "Resource added." : "Added.");
    }
    setIsAdding(false);
  };

  const handleAddQuickNote = async (title: string, content: string) => {
    const { data } = await supabase
      .from("task_master_items")
      .insert([
        {
          type: "idea_board",
          title,
          content,
          status: "active",
          user_id: userId,
          metadata: { stage: "spark", is_favorite: false },
        },
      ])
      .select()
      .single();
    if (data) {
      setItems([data, ...items]);
      showToast("success", "Spark captured.");
    }
  };

  const requestPromote = (item: TaskItem) => setPromoteCandidate(item);
  const handleConfirmPromote = async (
    id: string,
    newTitle: string,
    newRecurrence: string,
  ) => {
    setItems(items.filter((i) => i.id !== id));
    setPromoteCandidate(null);
    await supabase
      .from("task_master_items")
      .update({
        type: "task",
        status: "active",
        recurrence: newRecurrence,
        title: newTitle,
        metadata: {},
      })
      .eq("id", id);
    showToast("success", `Promoted to ${newRecurrence}.`);
  };

  const handleReorder = async (draggedId: string, targetId: string) => {
    const draggedIndex = items.findIndex((i) => i.id === draggedId);
    const targetIndex = items.findIndex((i) => i.id === targetId);
    if (
      draggedIndex === -1 ||
      targetIndex === -1 ||
      draggedIndex === targetIndex
    )
      return;

    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);

    const prevPos = newItems[targetIndex - 1]?.position || 0;
    const nextPos = newItems[targetIndex + 1]?.position || prevPos + 2048;
    const newPosition = (prevPos + nextPos) / 2;

    draggedItem.position = newPosition;
    setItems(newItems);

    await supabase
      .from("task_master_items")
      .update({ position: newPosition })
      .eq("id", draggedId);
  };

  const handleManualMove = async (id: string, direction: "up" | "down") => {
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const itemA = newItems[index];
    const itemB = newItems[targetIndex];

    const tempPos = itemA.position || 0;
    itemA.position = itemB.position || 0;
    itemB.position = tempPos;

    newItems[index] = itemB;
    newItems[targetIndex] = itemA;

    setItems(newItems);

    await supabase
      .from("task_master_items")
      .update({ position: itemA.position })
      .eq("id", itemA.id);
    await supabase
      .from("task_master_items")
      .update({ position: itemB.position })
      .eq("id", itemB.id);
  };

  const handleSmartComplete = async (id: string, currentStatus: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    // 1. IS THIS A RECURRING TASK?
    if (
      item.recurrence &&
      item.recurrence !== "one_off" &&
      currentStatus === "active"
    ) {
      // --- UNIFIED RECURRENCE LOGIC (Log & Roll) ---
      const { getTodayString, calcNextDueDate } = await import("./dateUtils");

      const todayVal = getTodayString();
      const currentLog = (item.metadata?.completed_dates as string[]) || [];

      // Prevent double-logging for the same day
      if (currentLog.includes(todayVal)) {
        showToast("success", "Already checked in today!");
        return;
      }

      const newLog = [...currentLog, todayVal];
      const nextDate = calcNextDueDate(item.due_date || null, item.recurrence);

      const newMeta = {
        ...item.metadata,
        completed_dates: newLog,
      };

      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, due_date: nextDate, metadata: newMeta } : i,
        ),
      );

      await supabase
        .from("task_master_items")
        .update({ due_date: nextDate, metadata: newMeta })
        .eq("id", id);

      showToast("success", `Nice! Next due: ${nextDate}`);
      return;
    }

    // 2. ONE-OFF / SUBTASK / ALREADY COMPLETED -> STANDARD TOGGLE
    const newStatus = currentStatus === "active" ? "completed" : "active";
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) return { ...item, status: newStatus as any };
        if (item.subtasks && item.subtasks.length > 0) {
          return {
            ...item,
            subtasks: item.subtasks.map((s) =>
              s.id === id
                ? { ...s, status: newStatus as "active" | "completed" }
                : s,
            ),
          };
        }
        return item;
      }),
    );
    await supabase
      .from("task_master_items")
      .update({ status: newStatus })
      .eq("id", id);
  };

  const handleUpdate = async (id: string, field: string, value: any) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
    await supabase
      .from("task_master_items")
      .update({ [field]: value })
      .eq("id", id);
  };

  // =========================================================================
  // PRIORITY UPDATE HANDLER
  // =========================================================================
  const handleUpdatePriority = async (id: string, priority: string) => {
    const targetItem = items.find((i) => i.id === id);
    if (!targetItem) return;

    const updatedMetadata = {
      ...targetItem.metadata,
      priority: priority as "critical" | "high" | "normal" | "low",
    };

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, metadata: updatedMetadata } : i)),
    );

    await supabase
      .from("task_master_items")
      .update({ metadata: updatedMetadata })
      .eq("id", id);
  };

  const handleCodexUpdate = async (
    id: string,
    newTitle: string,
    newContent: string,
    newNotes: string,
  ) => {
    const targetItem = items.find((i) => i.id === id);
    if (!targetItem) return;

    const updatedMetadata = { ...targetItem.metadata, notes: newNotes };

    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
            ...i,
            title: newTitle,
            content: newContent,
            metadata: updatedMetadata,
          }
          : i,
      ),
    );

    const { error } = await supabase
      .from("task_master_items")
      .update({
        title: newTitle,
        content: newContent,
        metadata: updatedMetadata,
      })
      .eq("id", id);

    if (!error) showToast("success", "Saved.");
    else showToast("error", "Failed to save.");
  };

  const requestEdit = (item: TaskItem) => setEditCandidate(item);
  const requestDelete = (id: string) => setDeleteCandidate(id);
  const requestBulkDelete = (ids: string[]) => setBulkDeleteCandidates(ids);

  const confirmDelete = async () => {
    setIsDeleting(true);

    // SINGLE DELETE
    if (deleteCandidate) {
      const { error } = await supabase
        .from("task_master_items")
        .delete()
        .eq("id", deleteCandidate);

      if (!error) {
        setItems((prev) =>
          prev.filter(
            (p) =>
              p.id !== deleteCandidate &&
              (!p.subtasks ||
                !p.subtasks.find((s) => s.id === deleteCandidate)),
          ),
        );
        showToast("success", "Purged.");
      } else {
        showToast("error", "Delete failed.");
      }
      setDeleteCandidate(null);
    }

    // BULK DELETE
    if (bulkDeleteCandidates && bulkDeleteCandidates.length > 0) {
      const { error } = await supabase
        .from("task_master_items")
        .delete()
        .in("id", bulkDeleteCandidates);

      if (!error) {
        setItems((prev) =>
          prev.filter((p) => !bulkDeleteCandidates.includes(p.id)),
        );
        showToast("success", `Purged ${bulkDeleteCandidates.length} items.`);
      } else {
        showToast("error", "Bulk delete failed.");
      }
      setBulkDeleteCandidates(null);
    }

    setIsDeleting(false);
  };

  const handleEditSave = async (id: string, fields: EditableFields) => {
    const updates: any = {};
    if (fields.title !== undefined) updates.title = fields.title;
    if (fields.content !== undefined) updates.content = fields.content;
    if (fields.due_date !== undefined) updates.due_date = fields.due_date;
    if (fields.tags !== undefined) updates.tags = fields.tags;
    if (fields.metadata !== undefined) updates.metadata = fields.metadata;

    setItems(items.map((i) => (i.id === id ? { ...i, ...updates } : i)));
    await supabase.from("task_master_items").update(updates).eq("id", id);
    showToast("success", "Updated.");
  };

  const handleAddSubtask = async (parentId: string, title: string) => {
    const parent = items.find((i) => i.id === parentId);
    if (!parent) return;

    const newSubtask = {
      id: crypto.randomUUID(),
      title,
      status: "active" as const,
    };
    const updatedSubtasks = [...(parent.subtasks || []), newSubtask];

    setItems((prev) =>
      prev.map((i) =>
        i.id === parentId ? { ...i, subtasks: updatedSubtasks } : i,
      ),
    );
    await supabase
      .from("task_master_items")
      .update({ subtasks: updatedSubtasks })
      .eq("id", parentId);
  };

  const handleToggleSubtask = async (
    parentId: string,
    subtaskId: string,
    currentStatus: string,
  ) => {
    const parent = items.find((i) => i.id === parentId);
    if (!parent || !parent.subtasks) return;

    const newStatus = currentStatus === "active" ? "completed" : "active";
    const updatedSubtasks = parent.subtasks.map((sub: any) =>
      sub.id === subtaskId ? { ...sub, status: newStatus } : sub,
    );

    setItems((prev) =>
      prev.map((i) =>
        i.id === parentId ? { ...i, subtasks: updatedSubtasks } : i,
      ),
    );
    await supabase
      .from("task_master_items")
      .update({ subtasks: updatedSubtasks })
      .eq("id", parentId);
  };

  const handleDeleteSubtask = async (parentId: string, subtaskId: string) => {
    const parent = items.find((i) => i.id === parentId);
    if (!parent || !parent.subtasks) return;

    const updatedSubtasks = parent.subtasks.filter(
      (sub: any) => sub.id !== subtaskId,
    );

    setItems((prev) =>
      prev.map((i) =>
        i.id === parentId ? { ...i, subtasks: updatedSubtasks } : i,
      ),
    );
    await supabase
      .from("task_master_items")
      .update({ subtasks: updatedSubtasks })
      .eq("id", parentId);
  };

  const handleManualSubtaskMove = async (
    parentId: string,
    subtaskId: string,
    direction: "up" | "down",
  ) => {
    const parent = items.find((i) => i.id === parentId);
    if (!parent || !parent.subtasks) return;

    const index = parent.subtasks.findIndex((s: any) => s.id === subtaskId);
    if (index === -1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= parent.subtasks.length) return;

    const newSubtasks = [...parent.subtasks];
    const temp = newSubtasks[index];
    newSubtasks[index] = newSubtasks[targetIndex];
    newSubtasks[targetIndex] = temp;

    setItems((prev) =>
      prev.map((i) =>
        i.id === parentId ? { ...i, subtasks: newSubtasks } : i,
      ),
    );

    await supabase
      .from("task_master_items")
      .update({ subtasks: newSubtasks })
      .eq("id", parentId);
  };

  const handleUpdateSubtaskTitle = async (
    parentId: string,
    subtaskId: string,
    newTitle: string,
  ) => {
    const parent = items.find((i) => i.id === parentId);
    if (!parent || !parent.subtasks) return;

    const updatedSubtasks = parent.subtasks.map((sub: any) =>
      sub.id === subtaskId ? { ...sub, title: newTitle } : sub,
    );

    setItems((prev) =>
      prev.map((i) =>
        i.id === parentId ? { ...i, subtasks: updatedSubtasks } : i,
      ),
    );
    await supabase
      .from("task_master_items")
      .update({ subtasks: updatedSubtasks })
      .eq("id", parentId);
  };

  // --- VIEW FILTERING ---
  const currentViewItems = items.filter((item) => {
    if (activeView === "resource")
      return item.type === "resource" || item.type === "social_bookmark";
    return item.type === activeView;
  });

  // DATE HELPER & TIMELINE GENERATION
  const timeline = useMemo(() => {
    const periods = new Set<string>();
    currentViewItems.forEach((item) => {
      // FIX: Check due_date for ALL types first, fallback to created_at
      const dateStr = item.due_date || item.created_at;
      const date = new Date(dateStr);

      if (date && !isNaN(date.getTime())) {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        periods.add(key);
      }
    });
    return Array.from(periods).sort().reverse();
  }, [currentViewItems]);

  return (
    <>
      <MobileNav activeView={activeView} onChange={handleSwitchView} />
      <div
        className={`fixed inset-0 flex flex-col md:flex-row bg-[#020617] text-slate-200 overflow-hidden ${styles.taskMasterContainer}`}
        style={{ height: "100dvh" }} // Inline style fallback or priority for dvh
      >
        <div className="hidden md:block w-20 xl:w-64 shrink-0 border-r border-white/5 bg-[#020617]/50 backdrop-blur-xl z-20">
          <SidebarNav activeView={activeView} onChange={handleSwitchView} />
        </div>

        <main className="flex-1 flex flex-col min-w-0 relative z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/50 via-[#020617] to-[#020617]">
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pt-20 md:p-8 relative scroll-smooth">
            {/* BACKGROUND EFFECTS */}
            <div className="fixed inset-0 pointer-events-none z-0">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] opacity-20" />
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] opacity-20" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto w-full">
              <header className="flex flex-col gap-6 md:gap-8 mb-8 md:mb-12">
                <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left">
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white drop-shadow-2xl flex items-center justify-center md:justify-start gap-3">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                      {activeView === "task" && "Task Master"}
                      {activeView === "code_snippet" && "Tech Codex"}
                      {activeView === "resource" && "Resource Grid"}
                      {activeView === "level_up" && "Level Up"}
                      {activeView === "ledger" && "Ledger"}
                      {activeView === "idea_board" && "Idea Board"}
                    </span>
                  </h1>
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
                    {activeView === "task" && "Command Center"}
                    {activeView === "code_snippet" && "Knowledge Base"}
                    {activeView === "resource" && "Asset Library"}
                    {activeView === "level_up" && "Skill Tree"}
                    {activeView === "ledger" && "History Log"}
                    {activeView === "idea_board" && "Spark Incubator"}
                  </p>
                </div>

                {/* INPUT BAR (Only for Task, Codex, Resource) */}
                {(activeView === "task" ||
                  activeView === "code_snippet" ||
                  activeView === "resource") && (
                    <form
                      onSubmit={handleAddItem}
                      className={`relative group bg-[#0A0F1E] border border-white/10 rounded-2xl p-2 flex flex-col md:flex-row gap-2 transition-all shadow-xl hover:shadow-2xl hover:border-white/20 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-[#020617] z-30 ${activeView === "code_snippet"
                        ? "focus-within:ring-emerald-500/50"
                        : "focus-within:ring-purple-500/50"
                        }`}
                    >
                      {activeView === "code_snippet" ? (
                        <div className="flex flex-col gap-2 w-full p-2">
                          <div className="flex gap-2 border-b border-white/5 pb-2">
                            <Code
                              className="text-emerald-500 shrink-0 mt-1"
                              size={18}
                            />
                            <input
                              type="text"
                              value={newCodexTitle}
                              onChange={(e) => setNewCodexTitle(e.target.value)}
                              placeholder="Snippet Title..."
                              className="bg-transparent text-sm font-bold text-white w-full focus:outline-none placeholder:text-slate-600"
                            />
                          </div>
                          <div className="flex gap-2 items-start">
                            <AlignLeft
                              className="text-slate-600 shrink-0 mt-1"
                              size={18}
                            />
                            <textarea
                              value={newCodexNotes}
                              onChange={(e) => setNewCodexNotes(e.target.value)}
                              placeholder="Description / Context..."
                              className="bg-transparent text-xs text-slate-400 w-full focus:outline-none resize-none h-10 placeholder:text-slate-700"
                            />
                          </div>
                          <div className="flex gap-2 items-start bg-black/30 p-2 rounded-lg border border-white/5 font-mono">
                            <FileText
                              className="text-slate-600 shrink-0 mt-1"
                              size={18}
                            />
                            <textarea
                              value={newCodexCode}
                              onChange={(e) => setNewCodexCode(e.target.value)}
                              placeholder="// Paste code..."
                              className="bg-transparent text-xs text-emerald-400 w-full focus:outline-none resize-none h-20 placeholder:text-slate-800"
                            />
                          </div>
                        </div>
                      ) : activeView === "resource" ? (
                        <div className="flex flex-col gap-2 w-full p-2">
                          <div className="flex gap-2 border-b border-white/5 pb-2">
                            <LinkIcon
                              className="text-cyan-500 shrink-0 mt-1"
                              size={18}
                            />
                            <input
                              type="text"
                              value={newResourceTitle}
                              onChange={(e) => setNewResourceTitle(e.target.value)}
                              placeholder="Resource Title..."
                              className="bg-transparent text-sm font-bold text-white w-full focus:outline-none placeholder:text-slate-600"
                            />
                          </div>
                          <div className="flex gap-2 items-center">
                            <ExternalLink
                              className="text-slate-600 shrink-0"
                              size={16}
                            />
                            <input
                              type="text"
                              value={newResourceLink}
                              onChange={(e) => setNewResourceLink(e.target.value)}
                              placeholder="URL..."
                              className="bg-transparent text-xs text-cyan-400 w-full focus:outline-none placeholder:text-slate-700 font-mono"
                            />
                          </div>
                          <div className="flex gap-2 items-start bg-black/30 p-2 rounded-lg border border-white/5">
                            <AlignLeft
                              className="text-slate-600 shrink-0 mt-0.5"
                              size={16}
                            />
                            <textarea
                              value={newResourceNotes}
                              onChange={(e) => setNewResourceNotes(e.target.value)}
                              placeholder="Context / Description..."
                              className="bg-transparent text-xs text-slate-400 w-full focus:outline-none resize-none h-12 placeholder:text-slate-700"
                            />
                          </div>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={newItemInput}
                          onChange={(e) => setNewItemInput(e.target.value)}
                          placeholder={`+ Add entry...`}
                          className="bg-transparent px-3 py-3 text-sm text-white w-full focus:outline-none"
                        />
                      )}

                      <button
                        disabled={isAdding}
                        className={`disabled:opacity-50 text-white p-3 md:p-4 rounded-xl transition-all shrink-0 flex items-center justify-center self-end md:self-auto aspect-square ${activeView === "code_snippet"
                          ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                          : activeView === "resource"
                            ? "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/20"
                            : "bg-purple-600 hover:bg-purple-500 shadow-purple-500/20"
                          } shadow-lg`}
                      >
                        {isAdding ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : activeView === "code_snippet" ? (
                          <Code size={20} />
                        ) : activeView === "resource" ? (
                          <Plus size={20} />
                        ) : (
                          <Plus size={20} />
                        )}
                      </button>
                    </form>
                  )}
              </header>

              <div className={styles.panel}>
                <FilterBar
                  currentSort={sortOption}
                  onSortChange={setSortOption}
                  availableTags={allSystemTags}
                  activeTags={filterTags}
                  onToggleTagFilter={(tag) =>
                    filterTags.includes(tag)
                      ? setFilterTags(filterTags.filter((t) => t !== tag))
                      : setFilterTags([...filterTags, tag])
                  }
                  searchQuery={globalSearchQuery}
                  onSearchChange={setGlobalSearchQuery}
                  searchPlaceholder={
                    activeView === "task"
                      ? "Search tasks..."
                      : activeView === "idea_board"
                        ? "Search ideas..."
                        : activeView === "code_snippet"
                          ? "Search codex..."
                          : activeView === "resource"
                            ? "Search resources..."
                            : activeView === "ledger"
                              ? "Search ledger..."
                              : "Search..."
                  }
                  // --- NEW PROPS FOR DATE FILTERING ---
                  activePeriod={globalActivePeriod}
                  onPeriodChange={setGlobalActivePeriod}
                  timeline={timeline}
                  showDateFilter={true} // Enabled for all views (logic handled inside views)
                />

                {activeView === "task" && (
                  <TaskView
                    items={currentViewItems}
                    activeRecurrence={activeRecurrence}
                    sortOption={sortOption}
                    filterTags={filterTags}
                    allSystemTags={allSystemTags}
                    searchQuery={globalSearchQuery}
                    activePeriod={globalActivePeriod}
                    onRecurrenceChange={setActiveRecurrence}
                    onToggleStatus={handleSmartComplete}
                    onDelete={requestDelete}
                    onArchive={(id) => handleUpdate(id, "status", "archived")}
                    onRestore={(id) => handleUpdate(id, "status", "active")}
                    onReorder={handleReorder}
                    onAddSubtask={handleAddSubtask}
                    onUpdateDate={(id, date) =>
                      handleUpdate(id, "due_date", date)
                    }
                    onUpdateTags={(id, tags) => handleUpdate(id, "tags", tags)}
                    onUpdateContent={(id, content) =>
                      handleUpdate(id, "content", content)
                    }
                    onUpdateRecurrence={(id, rec) =>
                      handleUpdate(id, "recurrence", rec)
                    }
                    onUpdatePriority={handleUpdatePriority}
                    onUpdateMetadata={(id, meta) =>
                      handleUpdate(id, "metadata", meta)
                    }
                    onUpdateTitle={(id, t) => handleUpdate(id, "title", t)}
                    onManualMove={handleManualMove}
                    onToggleSubtask={handleToggleSubtask}
                    onDeleteSubtask={handleDeleteSubtask}
                    onReorderSubtask={handleManualSubtaskMove}
                    onUpdateSubtaskTitle={handleUpdateSubtaskTitle}
                    // --- PASSING THE ID INSTEAD OF THE OBJECT ---
                    onOpenRecurring={(item) => setRecurringItemId(item.id)}
                    onBulkDelete={requestBulkDelete}
                  />
                )}
                {activeView === "idea_board" && (
                  <IdeaBoard
                    items={currentViewItems}
                    sortOption={sortOption}
                    filterTags={filterTags}
                    allSystemTags={allSystemTags}
                    searchQuery={globalSearchQuery}
                    activePeriod={globalActivePeriod}
                    onAdd={handleAddQuickNote}
                    onUpdateContent={(id, c) => handleUpdate(id, "content", c)}
                    onUpdateTitle={(id, t) => handleUpdate(id, "title", t)}
                    onUpdateTags={(id, t) => handleUpdate(id, "tags", t)}
                    onUpdateMetadata={(id, m) =>
                      handleUpdate(id, "metadata", m)
                    }
                    onDelete={requestDelete}
                    onPromoteToTask={requestPromote}
                    onReorder={handleReorder}
                    onManualMove={handleManualMove}
                    onEdit={requestEdit}
                  />
                )}
                {activeView === "code_snippet" && (
                  <TechCodex
                    items={currentViewItems}
                    sortOption={sortOption}
                    filterTags={filterTags}
                    allSystemTags={allSystemTags}
                    searchQuery={globalSearchQuery}
                    onUpdateTags={(id, t) => handleUpdate(id, "tags", t)}
                    onUpdateCodexData={handleCodexUpdate}
                    onDelete={requestDelete}
                    onReorder={handleReorder}
                    onManualMove={handleManualMove}
                  />
                )}
                {activeView === "ledger" && (
                  <LedgerView
                    items={currentViewItems}
                    sortOption={sortOption}
                    filterTags={filterTags}
                    allSystemTags={allSystemTags}
                    searchQuery={globalSearchQuery}
                    activePeriod={globalActivePeriod}
                    onUpdateMetadata={(id, m) =>
                      handleUpdate(id, "metadata", m)
                    }
                    onUpdateTitle={(id, t) => handleUpdate(id, "title", t)}
                    onUpdateTags={(id, t) => handleUpdate(id, "tags", t)}
                    onDelete={requestDelete}
                    onToggleStatus={(id, s) =>
                      handleUpdate(
                        id,
                        "status",
                        s === "active" ? "completed" : "active",
                      )
                    }
                    onReorder={handleReorder}
                    onArchive={(id) => handleUpdate(id, "status", "archived")}
                    onManualMove={handleManualMove}
                    onBulkDelete={requestBulkDelete}
                    onAddSubtask={handleAddSubtask}
                    onToggleSubtask={handleToggleSubtask}
                    onDeleteSubtask={handleDeleteSubtask}
                    onReorderSubtask={handleManualSubtaskMove}
                    onUpdateSubtaskTitle={handleUpdateSubtaskTitle}
                  />
                )}
                {activeView === "level_up" && (
                  <LevelUpView
                    items={currentViewItems}
                    sortOption={sortOption}
                    filterTags={filterTags}
                    allSystemTags={allSystemTags}
                    onUpdateMetadata={(id, m) =>
                      handleUpdate(id, "metadata", m)
                    }
                    onUpdateTags={(id, t) => handleUpdate(id, "tags", t)}
                    onDelete={requestDelete}
                    onReorder={handleReorder}
                    onToggleStatus={(id, s) =>
                      handleUpdate(
                        id,
                        "status",
                        s === "active" ? "completed" : "active",
                      )
                    }
                    onManualMove={handleManualMove}
                    onEdit={requestEdit}
                  />
                )}
                {(activeView === "social_bookmark" ||
                  activeView === "resource") && (
                    <ResourceGrid
                      items={currentViewItems}
                      type={activeView}
                      sortOption={sortOption}
                      filterTags={filterTags}
                      allSystemTags={allSystemTags}
                      searchQuery={globalSearchQuery}
                      activePeriod={globalActivePeriod}
                      onUpdateTitle={(id, t) => handleUpdate(id, "title", t)}
                      onUpdateContent={(id, c) => handleUpdate(id, "content", c)}
                      onUpdateTags={(id, t) => handleUpdate(id, "tags", t)}
                      onUpdateDate={(id, d) => handleUpdate(id, "due_date", d)}
                      onUpdateMetadata={(id, m) =>
                        handleUpdate(id, "metadata", m)
                      }
                      onDelete={requestDelete}
                      onArchive={(id) => handleUpdate(id, "status", "archived")}
                      onReorder={handleReorder}
                      onManualMove={handleManualMove}
                    />
                  )}
              </div>
            </div>
          </div >
        </main >
      </div >

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />
      }
      <ConfirmModal
        isOpen={!!deleteCandidate || !!bulkDeleteCandidates}
        onClose={() => {
          setDeleteCandidate(null);
          setBulkDeleteCandidates(null);
        }}
        onConfirm={confirmDelete}
        title={
          bulkDeleteCandidates
            ? `Delete ${bulkDeleteCandidates.length} Items?`
            : "Confirm System Purge"
        }
        message={
          bulkDeleteCandidates
            ? "These items will be permanently removed from the database."
            : "Action cannot be undone."
        }
        confirmText="Execute"
        isDestructive={true}
      />

      {
        activeView === "idea_board" ? (
          <IdeaDetailModal
            isOpen={!!editCandidate}
            item={editCandidate!}
            allSystemTags={allSystemTags}
            TagManagerComponent={TagManager}
            onSave={handleEditSave}
            onClose={() => setEditCandidate(null)}
            onPromote={setPromoteCandidate}
          />
        ) : (
          <EditModal
            isOpen={!!editCandidate}
            item={editCandidate}
            itemType={activeView}
            onSave={handleEditSave}
            onClose={() => setEditCandidate(null)}
            TagManagerComponent={TagManager}
            allSystemTags={allSystemTags}
          />
        )
      }

      <PromoteModal
        isOpen={!!promoteCandidate}
        item={promoteCandidate}
        onConfirm={handleConfirmPromote}
        onCancel={() => setPromoteCandidate(null)}
      />

      {
        activeRecurringItem && (
          <RecurringModal
            isOpen={!!recurringItemId}
            onClose={() => setRecurringItemId(null)}
            item={activeRecurringItem}
            onUpdateMetadata={(id, meta) => handleUpdate(id, "metadata", meta)}
          />
        )
      }
    </>
  );
}
