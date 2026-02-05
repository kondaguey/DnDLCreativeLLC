"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2,
  Plus,
  Code,
  AlignLeft,
  FileText,
  Link as LinkIcon,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import styles from "../../task-master.module.css";
import { TaskItem, ViewType, RecurrenceType, SortOption } from "../utils/types";

// UI Components
import SidebarNav from "../navigation/SidebarNav";
import TechCodex from "../views/TechCodex";
import TaskView from "../views/TaskView";
import ResourceGrid from "../views/ResourceGrid";
import LevelUpView from "../views/LevelUpView";
import LedgerView from "../views/LedgerView";
import IdeaBoard from "../views/IdeaBoard";
import PromptLibrary from "../views/PromptLibrary";
import FilterBar from "../navigation/FilterBar";
import { getTodayString } from "../utils/dateUtils";
import TagManager from "../navigation/TagManager";
import MobileNav from "../navigation/MobileNav";

import {
  Toast,
  ToastType,
  EditableFields,
  PromoteModal,
} from "./NotificationUI";
import ConfirmModal from "../modals/ConfirmModal";
import ConfirmationModal from "../modals/ConfirmationModal"; // NEW Custom Modal
import EditModal from "../modals/EditModal";
import RecurringModal from "../modals/RecurringModal";
import BonusModal from "../modals/BonusModal";
import IdeaDetailModal from "../modals/IdeaDetailModal";

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

  const [uncheckCandidate, setUncheckCandidate] = useState<string | null>(null);
  const [bonusCandidate, setBonusCandidate] = useState<{ id: string, periodText: string } | null>(null);
  const [voidCandidate, setVoidCandidate] = useState<{ id: string, dateEntry: string, onConfirm: () => void } | null>(null);

  const [recurringItemId, setRecurringItemId] = useState<string | null>(null);
  const activeRecurringItem =
    items.find((i) => i.id === recurringItemId) || null;

  const [tagToDelete, setTagToDelete] = useState<string | null>(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const showToast = useCallback((type: "success" | "error" | "info", message: string) => {
    setToast({ id: Date.now().toString(), type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleSwitchView = useCallback((view: ViewType) => {
    setActiveView(view);
    setFilterTags([]);
    setGlobalSearchQuery("");
    setGlobalActivePeriod("all");
  }, []);

  const handleDeleteTag = useCallback(async (tag: string) => {
    setTagToDelete(null);
    try {
      const { deleteGlobalTag } = await import("../../actions");
      const res = await deleteGlobalTag(tag);
      if (res.success) {
        setAllSystemTags((prev) => prev.filter((t) => t !== tag));
        setFilterTags((prev) => prev.filter((t) => t !== tag));
        setItems((prev) =>
          prev.map((item) => ({
            ...item,
            tags: (item.tags || []).filter((t) => t !== tag),
          })),
        );
        showToast("success", `Tag #${tag} purged.`);
      } else {
        showToast("error", "Failed to delete tag.");
      }
    } catch (err) {
      showToast("error", "Error deleting tag.");
    }
  }, [showToast]);

  const handleAddItem = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeView === "level_up") return;
    setIsAdding(true);

    const typeToAdd: any =
      activeView === "idea_board"
        ? "idea_board"
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

    const today = getTodayString();

    let payload: any = {
      type: typeToAdd,
      status: "active",
      user_id: userId,
      position: maxPos + 1024,
      due_date: today,
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

    try {
      const { data, error } = await supabase
        .from("task_master_items")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setItems((prev) => [...prev, { ...data, subtasks: [] }]);
        setNewItemInput("");
        setNewCodexTitle("");
        setNewCodexNotes("");
        setNewCodexCode("");
        setNewResourceTitle("");
        setNewResourceLink("");
        setNewResourceNotes("");
        showToast(
          "success",
          activeView === "resource" ? "Resource added." : "Added.",
        );
      }
    } catch (err) {
      console.error("Add failed:", err);
      showToast("error", "Failed to add.");
    } finally {
      setIsAdding(false);
    }
  }, [activeView, items, userId, newCodexCode, newCodexTitle, newCodexNotes, newResourceTitle, newResourceLink, newResourceNotes, newItemInput, activeRecurrence, supabase, showToast]);

  const handleAddQuickNote = useCallback(async (title: string, content: string, tags: string[], isFavorite: boolean, stage: "spark" | "solidified") => {
    setIsAdding(true);
    try {
      const today = getTodayString();

      const { data, error } = await supabase
        .from("task_master_items")
        .insert([
          {
            type: "idea_board",
            title: title || (content ? (content.length > 30 ? content.slice(0, 30) + "..." : content) : "Quick Spark"),
            content,
            status: "active",
            user_id: userId,
            metadata: { stage: stage || "spark", is_favorite: isFavorite },
            due_date: today,
            tags: tags || [],
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setItems((prev) => [data, ...prev]);
        showToast("success", "Spark captured.");
      }
    } catch (err) {
      console.error("Quick note failed:", err);
      showToast("error", "Failed to capture spark.");
    } finally {
      setIsAdding(false);
    }
  }, [userId, supabase, showToast]);

  const requestPromote = (item: TaskItem) => setPromoteCandidate(item);
  const handleConfirmPromote = async (
    id: string,
    newTitle: string,
    newRecurrence: string,
  ) => {
    const updatedItems = items.map((i) =>
      i.id === id
        ? {
          ...i,
          type: "task" as const,
          status: "active" as const,
          recurrence: newRecurrence as RecurrenceType,
          title: newTitle,
          metadata: {},
        }
        : i,
    );
    setItems(updatedItems);
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

  const handleSmartComplete = useCallback(async (id: string, currentStatus: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (
      item.recurrence &&
      item.recurrence !== "one_off" &&
      currentStatus === "active"
    ) {
      const { getTodayString, calcNextDueDate, calculateStats, isCycleSatisfied, calculateStandardDueDate } = await import("../utils/dateUtils");

      const todayVal = getTodayString();
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const currentLog = (item.metadata?.completed_dates as string[]) || [];

      // OVERACHIEVER LOGIC
      const isSatisfied = isCycleSatisfied(currentLog, item.recurrence || "daily");
      if (isSatisfied) {
        let periodText = "today";
        if (item.recurrence === "weekly") periodText = "the week";
        if (item.recurrence === "monthly") periodText = "this month";
        if (item.recurrence === "quarterly") periodText = "this quarter";

        setBonusCandidate({ id, periodText });
        return;
      }

      // CHECK LOGIC
      const logEntry = `${todayVal} @ ${nowTime}`;
      const newLog = [...currentLog, logEntry];

      // Reset subtasks for the next occurrence
      const resetSubtasks = (item.subtasks || []).map((s: any) => ({
        ...s,
        status: "active" as const
      }));

      const stats = calculateStats(newLog.map(d => d.split(" @ ")[0]), item.created_at || new Date().toISOString(), item.recurrence || "daily", item.metadata);
      const nextDate = calculateStandardDueDate(newLog, item.recurrence || "daily");

      const newMeta = {
        ...item.metadata,
        completed_dates: newLog,
        streak: stats.streak
      };

      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, due_date: nextDate, metadata: newMeta, subtasks: resetSubtasks } : i,
        ),
      );

      await supabase
        .from("task_master_items")
        .update({
          due_date: nextDate,
          metadata: newMeta,
          subtasks: resetSubtasks
        })
        .eq("id", id);

      showToast("success", `Nice! Logged. Next: ${nextDate}`);
      return;
    }

    const newStatus = currentStatus === "active" ? "completed" : "active";
    setItems((prevItems) =>
      prevItems.map((item) => {
        // If the toggled ID is the parent item itself
        if (item.id === id) {
          const updatedItem = { ...item, status: newStatus as any };
          // For one-off tasks, sync all subtasks to the parent's new status
          if (!item.recurrence || item.recurrence === "one_off") {
            if (item.subtasks && item.subtasks.length > 0) {
              updatedItem.subtasks = item.subtasks.map((s) => ({
                ...s,
                status: newStatus as "active" | "completed",
              }));
            }
          }
          return updatedItem;
        }

        // Check if the toggled ID is a subtask within this item
        const subIndex = item.subtasks?.findIndex((s) => s.id === id);
        if (subIndex !== undefined && subIndex > -1) {
          const updatedSubtasks = [...(item.subtasks || [])];
          updatedSubtasks[subIndex] = {
            ...updatedSubtasks[subIndex],
            status: newStatus as "active" | "completed",
          };
          return { ...item, subtasks: updatedSubtasks };
        }

        return item;
      }),
    );

    // Sync to DB (Parent status)
    const { error: parentError } = await supabase
      .from("task_master_items")
      .update({ status: newStatus })
      .eq("id", id);

    // Also sync subtasks to DB if it was a parent toggle for a one-off
    if (item.id === id && (!item.recurrence || item.recurrence === "one_off") && item.subtasks && item.subtasks.length > 0) {
      const syncedSubtasks = item.subtasks.map(s => ({ ...s, status: newStatus as "active" | "completed" }));
      await supabase
        .from("task_master_items")
        .update({ subtasks: syncedSubtasks })
        .eq("id", id);
    }

    if (parentError) {
      showToast("error", "Failed to update protocol status.");
    }
  }, [items, supabase, showToast]);

  const handleLogBonus = useCallback(async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const { getTodayString, calculateStandardDueDate } = await import("../utils/dateUtils");
    const todayVal = getTodayString();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const logEntry = `${todayVal} @ ${nowTime} (BONUS)`;
    const newLog = [...((item.metadata?.completed_dates as string[]) || []), logEntry];
    const nextDate = calculateStandardDueDate(newLog, item.recurrence || "daily");

    const newMeta = {
      ...item.metadata,
      completed_dates: newLog
    };

    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, due_date: nextDate, metadata: newMeta } : i,
      ),
    );

    const { error } = await supabase
      .from("task_master_items")
      .update({ due_date: nextDate, metadata: newMeta })
      .eq("id", id);

    if (error) {
      showToast("error", "Failed to log bonus event.");
    } else {
      showToast("success", "Bonus event logged! Look at you go!");
    }
  }, [items, supabase, showToast]);

  const handleUpdate = useCallback(async (id: string, field: string, value: any) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (JSON.stringify(item[field as keyof TaskItem]) === JSON.stringify(value)) {
      showToast("info", "Changes already saved.");
      return;
    }

    let updatePayload: any = { [field]: value };

    // DETECT METADATA / LOG UPDATES FOR AUTO-SYNC
    if (field === "metadata" && value.completed_dates && item.recurrence !== "one_off") {
      const { calculateStandardDueDate, calculateStats, isCycleSatisfied } = await import("../utils/dateUtils");
      const nextDate = calculateStandardDueDate(value.completed_dates, item.recurrence || "daily");
      const stats = calculateStats(value.completed_dates, item.created_at || new Date().toISOString(), item.recurrence || "daily", value);

      const syncedMeta = { ...value, streak: stats.streak };
      updatePayload = {
        metadata: syncedMeta,
        due_date: nextDate
      };

      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, due_date: nextDate, metadata: syncedMeta } : i,
        ),
      );
    } else if (field === "due_date") {
      const isNoRush = value === "no_rush";
      const dbDate = isNoRush ? null : value;
      updatePayload = {
        due_date: dbDate,
        metadata: {
          ...item.metadata,
          is_no_rush: isNoRush,
        },
      };
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, due_date: dbDate, metadata: updatePayload.metadata } : i,
        ),
      );
    } else {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
    }

    const { error } = await supabase
      .from("task_master_items")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      console.error("Update failed:", error);
      showToast("error", "Failed to save changes.");
    } else {
      showToast("success", "Changes saved.");
    }
  }, [items, supabase, showToast]);

  const handleUpdatePriority = async (id: string, priority: string) => {
    const targetItem = items.find((i) => i.id === id);
    if (!targetItem) return;

    if (targetItem.metadata?.priority === priority) {
      showToast("info", "Priority already set.");
      return;
    }

    const updatedMetadata = {
      ...targetItem.metadata,
      priority: priority as "critical" | "high" | "normal" | "low" | "no_rush",
    };

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, metadata: updatedMetadata } : i)),
    );

    const { error } = await supabase
      .from("task_master_items")
      .update({ metadata: updatedMetadata })
      .eq("id", id);

    if (error) {
      showToast("error", "Failed to update priority.");
    } else {
      showToast("success", `Priority set to ${priority}.`);
    }
  };

  const handleAddCodex = async (title: string, content: string, notes: string) => {
    setIsAdding(true);
    try {
      const { data, error } = await supabase
        .from("task_master_items")
        .insert([{
          type: "code_snippet",
          title,
          content,
          metadata: { notes },
          status: "active",
          user_id: userId
        }])
        .select()
        .single();
      if (error) throw error;
      if (data) {
        setItems(prev => [...prev, data]);
        showToast("success", "Snippet added.");
      }
    } catch (err) {
      showToast("error", "Failed to add.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddResource = async (title: string, link: string, notes: string, tags: string[], isFavorite: boolean) => {
    setIsAdding(true);
    try {
      const { data, error } = await supabase
        .from("task_master_items")
        .insert([{
          type: "resource",
          title,
          content: notes,
          status: "active",
          metadata: { url: link, is_favorite: isFavorite },
          user_id: userId,
          tags: tags || [],
        }])
        .select()
        .single();
      if (error) throw error;
      if (data) {
        setItems(prev => [...prev, data]);
        showToast("success", "Resource added.");
      }
    } catch (err) {
      showToast("error", "Failed to add.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddLog = async (title: string, content: string, priority: string, tags: string[], isFavorite: boolean) => {
    setIsAdding(true);
    try {
      const { data, error } = await supabase
        .from("task_master_items")
        .insert([{
          type: "task",
          title,
          content,
          status: "completed",
          metadata: { priority, is_favorite: isFavorite },
          user_id: userId,
          tags: tags || []
        }])
        .select()
        .single();
      if (error) throw error;
      if (data) {
        setItems(prev => [...prev, data]);
        showToast("success", "Logged.");
      }
    } catch (err) {
      showToast("error", "Failed to log.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddLevelUp = async (title: string, totalHours: number, link: string) => {
    setIsAdding(true);
    try {
      const { data, error } = await supabase
        .from("task_master_items")
        .insert([{
          type: "level_up",
          title,
          status: "active",
          metadata: {
            total_hours: totalHours,
            hours_completed: 0,
            course_link: link
          },
          user_id: userId
        }])
        .select()
        .single();
      if (error) throw error;
      if (data) {
        setItems(prev => [...prev, data]);
        showToast("success", "Path initiated.");
      }
    } catch (err) {
      showToast("error", "Failed to initiate.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddPrompt = async (title: string, systemContext: string, prompt: string, tags: string[], isFavorite: boolean) => {
    setIsAdding(true);
    try {
      const { data, error } = await supabase
        .from("task_master_items")
        .insert([{
          type: "ai_prompt",
          title,
          content: prompt,
          status: "active",
          metadata: { system_context: systemContext, is_favorite: isFavorite },
          user_id: userId,
          tags: tags || [],
        }])
        .select()
        .single();
      if (error) throw error;
      if (data) {
        setItems(prev => [...prev, data]);
        showToast("success", "Prompt stored.");
      }
    } catch (err) {
      showToast("error", "Failed to store prompt.");
    } finally {
      setIsAdding(false);
    }
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
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const updates: any = {};
    let hasChanges = false;

    if (fields.title !== undefined && fields.title !== item.title) {
      updates.title = fields.title;
      hasChanges = true;
    }
    if (fields.content !== undefined && fields.content !== item.content) {
      updates.content = fields.content;
      hasChanges = true;
    }
    if (fields.due_date !== undefined && fields.due_date !== item.due_date) {
      updates.due_date = fields.due_date;
      hasChanges = true;
    }
    if (fields.tags !== undefined && JSON.stringify(fields.tags) !== JSON.stringify(item.tags)) {
      updates.tags = fields.tags;
      hasChanges = true;
    }
    if (fields.metadata !== undefined && JSON.stringify(fields.metadata) !== JSON.stringify(item.metadata)) {
      updates.metadata = fields.metadata;
      hasChanges = true;
    }

    if (!hasChanges) {
      showToast("info", "Changes already saved.");
      setEditCandidate(null);
      return;
    }

    setItems(items.map((i) => (i.id === id ? { ...i, ...updates } : i)));
    const { error } = await supabase.from("task_master_items").update(updates).eq("id", id);

    if (error) {
      showToast("error", "Failed to update item.");
    } else {
      showToast("success", "Item updated.");
      setEditCandidate(null);
    }
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
    const { error } = await supabase
      .from("task_master_items")
      .update({ subtasks: updatedSubtasks })
      .eq("id", parentId);

    if (error) {
      showToast("error", "Failed to add subtask.");
    } else {
      showToast("success", "Subtask added.");
    }
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
    const { error } = await supabase
      .from("task_master_items")
      .update({ subtasks: updatedSubtasks })
      .eq("id", parentId);

    if (error) {
      showToast("error", "Failed to delete subtask.");
    } else {
      showToast("success", "Subtask removed.");
    }
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

  const handleUpdateSubtasks = async (
    parentId: string,
    updatedSubtasks: any[],
  ) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === parentId ? { ...i, subtasks: updatedSubtasks } : i,
      ),
    );

    const { error } = await supabase
      .from("task_master_items")
      .update({ subtasks: updatedSubtasks })
      .eq("id", parentId);

    if (error) {
      showToast("error", "Failed to secure protocol updates.");
    } else {
      showToast("success", "Changes saved to the grid.");
    }
  };

  const handleUpdateSubtaskTitle = async (
    parentId: string,
    subtaskId: string,
    newTitle: string,
  ) => {
    const parent = items.find((i) => i.id === parentId);
    if (!parent || !parent.subtasks) return;

    const subtask = parent.subtasks.find((s: any) => s.id === subtaskId);
    if (subtask && subtask.title === newTitle) {
      return;
    }

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

  const currentViewItems = useMemo(() => {
    return items.filter((item) => {
      if (activeView === "resource")
        return item.type === "resource" || item.type === "social_bookmark";
      return item.type === activeView;
    });
  }, [items, activeView]);

  const timeline = useMemo(() => {
    const periods = new Set<string>();
    currentViewItems.forEach((item) => {
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
        className={`flex flex-col md:flex-row h-screen min-h-0 bg-[#020617] text-slate-200 overflow-hidden ${styles.taskMasterContainer}`}
      >
        <div className={`hidden md:block shrink-0 border-r border-white/5 bg-[#020617]/50 backdrop-blur-xl z-20 transition-all duration-300 ${sidebarCollapsed ? "w-20" : "w-64"}`}>
          <SidebarNav
            activeView={activeView}
            onChange={handleSwitchView}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        <main className="flex-1 flex flex-col min-h-0 min-w-0 relative z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/50 via-[#020617] to-[#020617]">
          {/* Mobile Padding Fix: p-2 on mobile, p-8 on desktop */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-2 pt-20 md:p-8 md:pt-8 relative scroll-smooth">
            {/* BACKGROUND EFFECTS */}
            <div className="fixed inset-0 pointer-events-none z-0">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] opacity-20" />
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] opacity-20" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto w-full">
              <header className="flex flex-col gap-4 md:gap-8 mb-6 md:mb-12">
                <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left px-2">
                  <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white drop-shadow-2xl flex items-center justify-center md:justify-start gap-3">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 pb-4 px-4 inline-block">
                      {activeView === "task" && "Task Master"}
                      {activeView === "code_snippet" && "Tech Codex"}
                      {activeView === "resource" && "Resource Grid"}
                      {activeView === "level_up" && "Level Up"}
                      {activeView === "ledger" && "Ledger"}
                      {activeView === "idea_board" && "Idea Board"}
                      {activeView === "ai_prompt" && "Prompt Lab"}
                    </span>
                  </h1>
                  <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-500">
                    {activeView === "task" && "Command Center"}
                    {activeView === "code_snippet" && "Knowledge Base"}
                    {activeView === "resource" && "Asset Library"}
                    {activeView === "level_up" && "Skill Tree"}
                    {activeView === "ledger" && "History Log"}
                    {activeView === "idea_board" && "Spark Incubator"}
                    {activeView === "ai_prompt" && "Instruction Vault"}
                  </p>
                </div>

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
                          : activeView === "ai_prompt"
                            ? "Search prompts..."
                            : activeView === "resource"
                              ? "Search resources..."
                              : activeView === "ledger"
                                ? "Search ledger..."
                                : "Search..."
                  }
                  activePeriod={globalActivePeriod}
                  onPeriodChange={setGlobalActivePeriod}
                  timeline={timeline}
                  showDateFilter={true}
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
                    onUpdateSubtasks={handleUpdateSubtasks}
                    onOpenRecurring={(item) => setRecurringItemId(item.id)}
                    onBulkDelete={requestBulkDelete}
                    onVoidRequest={(id, dateEntry, onConfirm) => setVoidCandidate({ id, dateEntry, onConfirm })}
                    isAdding={isAdding}
                    onQuickAdd={async (title, content, priority, dueDate, tags, isFavorite) => {
                      console.log("Inline Add Triggered:", { title, content, activeRecurrence, priority, dueDate, tags, isFavorite });
                      setIsAdding(true);
                      try {
                        const maxPos =
                          items.length > 0
                            ? Math.max(...items.map((i) => i.position || 0))
                            : 0;

                        const { data, error } = await supabase
                          .from("task_master_items")
                          .insert([
                            {
                              type: "task",
                              title,
                              content,
                              status: "active",
                              user_id: userId,
                              recurrence: activeRecurrence,
                              due_date: dueDate,
                              position: maxPos + 1024,
                              metadata: { priority, is_favorite: isFavorite },
                              tags: tags || [],
                            },
                          ])
                          .select()
                          .single();

                        if (error) throw error;

                        if (data) {
                          setItems((prev) => [
                            ...prev,
                            { ...data, subtasks: [] },
                          ]);
                          showToast("success", "Task added to queue.");
                        }
                      } catch (err) {
                        console.error("Quick add failed:", err);
                        showToast("error", "Failed to add task.");
                      } finally {
                        setIsAdding(false);
                      }
                    }}
                    onDeleteTag={(tag) => setTagToDelete(tag)}
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
                    isAdding={isAdding}
                    onDeleteTag={(tag) => setTagToDelete(tag)}
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
                    onAdd={handleAddCodex}
                    isAdding={isAdding}
                    onDeleteTag={(tag: string) => setTagToDelete(tag)}
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
                    onUpdateContent={(id, c) => handleUpdate(id, "content", c)}
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
                    onUpdateSubtasks={handleUpdateSubtasks}
                    onToggleSubtask={handleToggleSubtask}
                    onDeleteSubtask={handleDeleteSubtask}
                    onReorderSubtask={handleManualSubtaskMove}
                    onUpdateSubtaskTitle={handleUpdateSubtaskTitle}
                    onAdd={handleAddLog}
                    isAdding={isAdding}
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
                    onAdd={handleAddLevelUp}
                  />
                )}
                {activeView === "ai_prompt" && (
                  <PromptLibrary
                    items={currentViewItems}
                    sortOption={sortOption}
                    filterTags={filterTags}
                    allSystemTags={allSystemTags}
                    searchQuery={globalSearchQuery}
                    onAdd={handleAddPrompt}
                    onUpdateMetadata={(id, m) => handleUpdate(id, "metadata", m)}
                    onUpdateTitle={(id, t) => handleUpdate(id, "title", t)}
                    onUpdateContent={(id, c) => handleUpdate(id, "content", c)}
                    onDelete={requestDelete}
                    onEdit={requestEdit}
                    isAdding={isAdding}
                  />
                )}
                {(activeView === "social_bookmark" ||
                  activeView === "resource") && (
                    <ResourceGrid
                      items={currentViewItems}
                      type={activeView as "resource" | "social_bookmark"}
                      sortOption={sortOption}
                      filterTags={filterTags}
                      allSystemTags={allSystemTags}
                      searchQuery={globalSearchQuery}
                      activePeriod={globalActivePeriod}
                      onUpdateTitle={(id, t) => handleUpdate(id, "title", t)}
                      onUpdateContent={(id, c) => handleUpdate(id, "content", c)}
                      onUpdateTags={(id, t) => handleUpdate(id, "tags", t)}
                      onUpdateDate={(id, d) => handleUpdate(id, "due_date", d)}
                      onUpdateMetadata={(id, m) => handleUpdate(id, "metadata", m)}
                      onDelete={requestDelete}
                      onArchive={(id) => handleUpdate(id, "status", "archived")}
                      onReorder={handleReorder}
                      onManualMove={handleManualMove}
                      onEdit={(item) => { }}
                      onAdd={handleAddResource}
                      isAdding={isAdding}
                    />
                  )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
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

      {activeView === "idea_board" ? (
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
      )}

      <PromoteModal
        isOpen={!!promoteCandidate}
        item={promoteCandidate}
        onConfirm={handleConfirmPromote}
        onCancel={() => setPromoteCandidate(null)}
      />

      {activeRecurringItem && (
        <RecurringModal
          isOpen={!!recurringItemId}
          onClose={() => setRecurringItemId(null)}
          item={activeRecurringItem}
          onUpdateMetadata={(id, meta) => handleUpdate(id, "metadata", meta)}
          onVoidRequest={(id, dateEntry, onConfirm) => setVoidCandidate({ id, dateEntry, onConfirm })}
        />
      )}

      <BonusModal
        isOpen={!!bonusCandidate}
        onClose={() => setBonusCandidate(null)}
        periodText={bonusCandidate?.periodText || ""}
        onLogBonus={() => bonusCandidate && handleLogBonus(bonusCandidate.id)}
        onUncheck={() => {
          if (bonusCandidate) {
            setUncheckCandidate(bonusCandidate.id);
            setBonusCandidate(null);
          }
        }}
      />

      <ConfirmationModal
        isOpen={!!voidCandidate}
        onClose={() => setVoidCandidate(null)}
        onConfirm={() => {
          if (voidCandidate) {
            voidCandidate.onConfirm();
            setVoidCandidate(null);
          }
        }}
        title="Delete this event?"
        message={`Are you sure you want to remove the log entry for ${voidCandidate?.dateEntry}? This cannot be undone.`}
        confirmLabel="Yes, Delete"
        isDanger={true}
      />

      <ConfirmationModal
        isOpen={!!uncheckCandidate}
        onClose={() => setUncheckCandidate(null)}
        onConfirm={() => {
          if (uncheckCandidate) {
            // Execute uncheck logic here
            const id = uncheckCandidate;
            const item = items.find(i => i.id === id);
            if (item) {
              import("../utils/dateUtils").then(({ getTodayString, calculateStats, calculateStandardDueDate }) => {
                const todayVal = getTodayString();
                const currentLog = (item.metadata?.completed_dates as string[]) || [];
                // Filter out any entry starting with today's date
                const newLog = currentLog.filter(entry => !entry.startsWith(todayVal));
                const nextDate = calculateStandardDueDate(newLog, item.recurrence || "daily");
                const stats = calculateStats(newLog.map(d => d.split(" @ ")[0]), item.created_at || new Date().toISOString(), item.recurrence || "daily", item.metadata);
                const newMeta = { ...item.metadata, completed_dates: newLog, streak: stats.streak };

                setItems(prev => prev.map(i => i.id === id ? { ...i, due_date: nextDate, metadata: newMeta } : i));
                supabase.from("task_master_items").update({ due_date: nextDate, metadata: newMeta }).eq("id", id).then();
                showToast("success", "Task unchecked. Due today.");
              });
            }
          }
        }}
        title="Uncheck Task?"
        message="This will remove today's completion and reset your streak calculation for today. Are you sure?"
        confirmLabel="Yes, Uncheck"
        isDanger={true}
      />

      <ConfirmModal
        isOpen={!!tagToDelete}
        onClose={() => setTagToDelete(null)}
        onConfirm={() => tagToDelete && handleDeleteTag(tagToDelete)}
        title="Delete Tag Globally?"
        message={`This will permanently delete the tag #${tagToDelete} from the entire system. It will also be removed from all existing items. This cannot be undone.`}
        confirmText="Confirm Purge"
        isDestructive={true}
      />
    </>
  );
}
