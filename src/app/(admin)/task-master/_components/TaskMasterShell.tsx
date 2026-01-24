"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Plus, Code, AlignLeft, FileText } from "lucide-react";
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

import {
  Toast,
  ConfirmModal,
  ToastType,
  EditableFields,
  PromoteModal,
} from "./NotificationUI";
import EditModal from "./EditModal";
import RecurringModal from "./RecurringModal";

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

  // INPUT STATE
  const [newItemInput, setNewItemInput] = useState("");
  const [newCodexTitle, setNewCodexTitle] = useState("");
  const [newCodexNotes, setNewCodexNotes] = useState("");
  const [newCodexCode, setNewCodexCode] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState<ToastType | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editCandidate, setEditCandidate] = useState<TaskItem | null>(null);
  const [promoteCandidate, setPromoteCandidate] = useState<TaskItem | null>(
    null,
  );

  // =========================================================================
  // THE FIX: Only store the ID, so the modal always gets the LIVE data.
  // =========================================================================
  const [recurringItemId, setRecurringItemId] = useState<string | null>(null);
  const activeRecurringItem = items.find(i => i.id === recurringItemId) || null;

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ id: Date.now().toString(), type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSwitchView = (view: ViewType) => {
    setActiveView(view);
    setFilterTags([]);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const isCodex = activeView === "code_snippet";

    if (isCodex && !newCodexCode.trim() && !newCodexTitle.trim()) return;
    if (!isCodex && !newItemInput.trim()) return;

    setIsAdding(true);
    const maxPos =
      items.length > 0 ? Math.max(...items.map((i) => i.position || 0)) : 0;
    const typeToAdd = activeView === "resource" ? "resource" : activeView;

    const payload = isCodex
      ? {
        type: typeToAdd,
        title: newCodexTitle || "Untitled Snippet",
        content: newCodexCode,
        metadata: { notes: newCodexNotes },
        status: "active",
        user_id: userId,
        position: maxPos + 1024,
      }
      : {
        type: typeToAdd,
        title: newItemInput,
        content: "",
        status: "active",
        user_id: userId,
        recurrence: activeView === "task" ? activeRecurrence : null,
        position: maxPos + 1024,
      };

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
      showToast("success", isCodex ? "Codex updated." : "Added.");
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

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);

    const { error } = await supabase
      .from("task_master_items")
      .delete()
      .eq("id", deleteCandidate);

    if (!error) {
      setItems((prev) =>
        prev.filter(
          (p) =>
            p.id !== deleteCandidate &&
            (!p.subtasks || !p.subtasks.find((s) => s.id === deleteCandidate)),
        ),
      );
      showToast("success", "Purged.");
    } else {
      showToast("error", "Delete failed.");
    }

    setIsDeleting(false);
    setDeleteCandidate(null);
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

  // --- VIEW FILTERING ---
  const currentViewItems = items.filter((item) => {
    if (activeView === "resource")
      return item.type === "resource" || item.type === "social_bookmark";
    return item.type === activeView;
  });

  return (
    <>
      <div className={styles.container}>
        <SidebarNav activeView={activeView} onChange={handleSwitchView} />
        <main className={styles.workspace}>
          <header className={styles.header}>
            <div className={styles.headerTitleBlock}>
              <div className={styles.subtitle}>DnDL Creative LLC</div>
              <h1 className={styles.title}>
                {activeView === "task"
                  ? "Task Operations"
                  : activeView === "ledger"
                    ? "App Ledger"
                    : activeView === "level_up"
                      ? "Level Up"
                      : activeView === "code_snippet"
                        ? "Tech Codex"
                        : activeView === "idea_board"
                          ? "Quick Notes"
                          : "Resources"}
              </h1>
            </div>

            {/* --- SMART HEADER FORM --- */}
            {activeView !== "idea_board" && (
              <form
                onSubmit={handleAddItem}
                className="flex flex-col md:flex-row gap-2 w-full md:max-w-2xl items-stretch md:items-start bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md"
              >
                {activeView === "code_snippet" ? (
                  <div className="flex-1 flex flex-col gap-2 p-1">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                      <FileText size={16} className="text-slate-500" />
                      <input
                        type="text"
                        value={newCodexTitle}
                        onChange={(e) => setNewCodexTitle(e.target.value)}
                        placeholder="Snippet Title..."
                        className="bg-transparent text-sm font-bold text-white w-full focus:outline-none"
                      />
                    </div>
                    <div className="flex items-start gap-2 border-b border-white/10 pb-2">
                      <AlignLeft size={16} className="text-slate-500 mt-1" />
                      <textarea
                        value={newCodexNotes}
                        onChange={(e) => setNewCodexNotes(e.target.value)}
                        placeholder="Context / Notes..."
                        className="bg-transparent text-xs text-slate-300 w-full focus:outline-none resize-none h-12 scrollbar-thin"
                      />
                    </div>
                    <div className="flex items-start gap-2 pt-1">
                      <Code size={16} className="text-emerald-500 mt-1" />
                      <textarea
                        value={newCodexCode}
                        onChange={(e) => setNewCodexCode(e.target.value)}
                        placeholder="Paste system code..."
                        className="bg-black/20 text-xs font-mono text-emerald-400 w-full p-2 rounded-lg focus:outline-none min-h-[100px] max-h-[300px] resize-y scrollbar-thin"
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
                    : "bg-purple-600 hover:bg-purple-500 shadow-purple-500/20"
                    } shadow-lg`}
                >
                  {isAdding ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : activeView === "code_snippet" ? (
                    <Code size={20} />
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
            />

            {activeView === "task" && (
              <TaskView
                items={currentViewItems}
                activeRecurrence={activeRecurrence}
                sortOption={sortOption}
                filterTags={filterTags}
                allSystemTags={allSystemTags}
                onRecurrenceChange={setActiveRecurrence}
                onToggleStatus={handleSmartComplete}
                onDelete={requestDelete}
                onArchive={(id) => handleUpdate(id, "status", "archived")}
                onRestore={(id) => handleUpdate(id, "status", "active")}
                onReorder={handleReorder}
                onAddSubtask={handleAddSubtask}
                onUpdateDate={(id, date) => handleUpdate(id, "due_date", date)}
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
                onManualMove={handleManualMove}
                onEdit={requestEdit}
                onToggleSubtask={handleToggleSubtask}
                onDeleteSubtask={handleDeleteSubtask}
                // --- PASSING THE ID INSTEAD OF THE OBJECT ---
                onOpenRecurring={(item) => setRecurringItemId(item.id)}
              />
            )}
            {activeView === "idea_board" && (
              <IdeaBoard
                items={currentViewItems}
                sortOption={sortOption}
                filterTags={filterTags}
                allSystemTags={allSystemTags}
                onAdd={handleAddQuickNote}
                onUpdateContent={(id, c) => handleUpdate(id, "content", c)}
                onUpdateTitle={(id, t) => handleUpdate(id, "title", t)}
                onUpdateTags={(id, t) => handleUpdate(id, "tags", t)}
                onUpdateMetadata={(id, m) => handleUpdate(id, "metadata", m)}
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
                onUpdateMetadata={(id, m) => handleUpdate(id, "metadata", m)}
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
                onEdit={requestEdit}
              />
            )}
            {activeView === "level_up" && (
              <LevelUpView
                items={currentViewItems}
                sortOption={sortOption}
                filterTags={filterTags}
                allSystemTags={allSystemTags}
                onUpdateMetadata={(id, m) => handleUpdate(id, "metadata", m)}
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
                  onUpdateTitle={(id, t) => handleUpdate(id, "title", t)}
                  onUpdateContent={(id, c) => handleUpdate(id, "content", c)}
                  onUpdateTags={(id, t) => handleUpdate(id, "tags", t)}
                  onUpdateDate={(id, d) => handleUpdate(id, "due_date", d)}
                  onUpdateMetadata={(id, m) => handleUpdate(id, "metadata", m)}
                  onDelete={requestDelete}
                  onArchive={(id) => handleUpdate(id, "status", "archived")}
                  onReorder={handleReorder}
                  onManualMove={handleManualMove}
                  onEdit={requestEdit}
                />
              )}
          </div>
        </main>
      </div>

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      <ConfirmModal
        isOpen={!!deleteCandidate}
        title="Confirm System Purge"
        description="Action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteCandidate(null)}
        isProcessing={isDeleting}
      />

      <EditModal
        isOpen={!!editCandidate}
        item={editCandidate}
        itemType={activeView}
        onSave={handleEditSave}
        onClose={() => setEditCandidate(null)}
        TagManagerComponent={TagManager}
        allSystemTags={allSystemTags}
      />

      <PromoteModal
        isOpen={!!promoteCandidate}
        item={promoteCandidate}
        onConfirm={handleConfirmPromote}
        onCancel={() => setPromoteCandidate(null)}
      />

      {/* --- THE FIX: Pass the LIVE item derived from the state array --- */}
      {activeRecurringItem && (
        <RecurringModal
          isOpen={!!recurringItemId}
          onClose={() => setRecurringItemId(null)}
          item={activeRecurringItem}
          onUpdateMetadata={(id, meta) => handleUpdate(id, "metadata", meta)}
        />
      )}
    </>
  );
}