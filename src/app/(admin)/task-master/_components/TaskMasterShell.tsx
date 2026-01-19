"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Plus } from "lucide-react";
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
import {
  Toast,
  ConfirmModal,
  ToastType,
  EditModal,
  EditableFields,
  PromoteModal,
} from "./NotificationUI";
import TagManager from "./TagManager";

export default function TaskMasterShell() {
  const supabase = createClient();
  const router = useRouter();

  // --- STATE ---
  const [activeView, setActiveView] = useState<ViewType>("task");
  const [activeRecurrence, setActiveRecurrence] =
    useState<RecurrenceType>("daily");
  const [sortOption, setSortOption] = useState<SortOption>("manual");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [allSystemTags, setAllSystemTags] = useState<string[]>([]);
  const [items, setItems] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [newItemTitle, setNewItemTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState<ToastType | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editCandidate, setEditCandidate] = useState<TaskItem | null>(null);
  const [promoteCandidate, setPromoteCandidate] = useState<TaskItem | null>(
    null,
  );

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ id: Date.now().toString(), type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) router.push("/login");
      else {
        setUser(user);
        fetchItems(user.id, activeView);
        fetchSystemTags();
      }
    };
    checkUser();
  }, []);

  const fetchSystemTags = async () => {
    const { data } = await supabase.from("distinct_tags").select("tag_name");
    if (data) setAllSystemTags(data.map((r: any) => r.tag_name));
  };

  const fetchItems = useCallback(
    async (userId: string, view: ViewType) => {
      setLoading(true);

      let query = supabase
        .from("task_master_items")
        .select("*")
        .eq("user_id", userId)
        .order("position", { ascending: true });

      // MERGED VIEW LOGIC
      if (view === "resource") {
        query = query.in("type", ["resource", "social_bookmark"]);
      } else {
        query = query.eq("type", view);
      }

      const { data, error } = await query;

      if (!error && data) {
        const allItems = data as TaskItem[];
        if (view === "task") {
          const parents = allItems.filter((i) => !i.parent_id);
          const children = allItems.filter((i) => i.parent_id);
          const nestedItems = parents.map((parent) => ({
            ...parent,
            subtasks: children
              .filter((child) => child.parent_id === parent.id)
              .sort((a, b) => (a.position || 0) - (b.position || 0)),
          }));
          setItems(nestedItems);
        } else {
          setItems(allItems);
        }
      }
      setLoading(false);
    },
    [supabase],
  );

  const handleSwitchView = (view: ViewType) => {
    setActiveView(view);
    setFilterTags([]);
    if (user) fetchItems(user.id, view);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !user) return;
    setIsAdding(true);
    const maxPos =
      items.length > 0 ? Math.max(...items.map((i) => i.position || 0)) : 0;

    // Determine Type (Resource adds default to 'resource', but view shows both)
    const typeToAdd = activeView === "resource" ? "resource" : activeView;

    const { data } = await supabase
      .from("task_master_items")
      .insert([
        {
          type: typeToAdd,
          title: newItemTitle,
          status: "active",
          user_id: user.id,
          recurrence: activeView === "task" ? activeRecurrence : null,
          content: "",
          position: maxPos + 1024,
        },
      ])
      .select()
      .single();

    if (data) {
      setItems([...items, { ...data, subtasks: [] }]);
      setNewItemTitle("");
      showToast("success", "Added.");
    }
    setIsAdding(false);
  };

  const handleAddQuickNote = async (title: string, content: string) => {
    if (!user) return;
    const { data } = await supabase
      .from("task_master_items")
      .insert([
        {
          type: "idea_board",
          title,
          content,
          status: "active",
          user_id: user.id,
          metadata: { stage: "spark" },
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
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);
    setItems(newItems);

    const prevPos = newItems[targetIndex - 1]?.position || 0;
    const nextPos = newItems[targetIndex + 1]?.position || prevPos + 2048;
    const newPosition = (prevPos + nextPos) / 2;

    await supabase
      .from("task_master_items")
      .update({ position: newPosition })
      .eq("id", draggedId);
  };

  const handleManualMove = async (id: string, direction: "up" | "down") => {
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return;
    const newItems = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    [newItems[index], newItems[targetIndex]] = [
      newItems[targetIndex],
      newItems[index],
    ];
    setItems(newItems);

    const itemA = newItems[index];
    const itemB = newItems[targetIndex];
    const tempPos = itemA.position;
    itemA.position = itemB.position;
    itemB.position = tempPos;

    await supabase
      .from("task_master_items")
      .update({ position: itemA.position })
      .eq("id", itemA.id);
    await supabase
      .from("task_master_items")
      .update({ position: itemB.position })
      .eq("id", itemB.id);
  };

  // GENERIC UPDATE HANDLER
  const handleUpdate = async (id: string, field: string, value: any) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
    await supabase
      .from("task_master_items")
      .update({ [field]: value })
      .eq("id", id);
    if (field === "tags") fetchSystemTags();
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
    if (fields.tags) fetchSystemTags();
    showToast("success", "Updated.");
  };

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
            {activeView !== "idea_board" && (
              <form onSubmit={handleAddItem} className={styles.headerForm}>
                <input
                  type="text"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder={`+ Add entry...`}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white w-full focus:outline-none focus:border-purple-500"
                />
                <button
                  disabled={isAdding}
                  className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white p-3 rounded-xl transition-all shadow-lg shadow-purple-500/20 shrink-0 flex items-center justify-center aspect-square"
                >
                  {isAdding ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <Plus size={24} />
                  )}
                </button>
              </form>
            )}
          </header>

          <div className={styles.panel}>
            {loading ? (
              <div className="flex h-full items-center justify-center text-slate-500 gap-2">
                <Loader2 className="animate-spin" /> Retrieving Data...
              </div>
            ) : (
              <>
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
                    items={items}
                    activeRecurrence={activeRecurrence}
                    sortOption={sortOption}
                    filterTags={filterTags}
                    allSystemTags={allSystemTags}
                    onRecurrenceChange={setActiveRecurrence}
                    onToggleStatus={(id, status) =>
                      handleToggleStatus(id, status)
                    }
                    onDelete={requestDelete}
                    onArchive={(id) => handleUpdate(id, "status", "archived")}
                    onRestore={(id) => handleUpdate(id, "status", "active")}
                    onReorder={handleReorder}
                    onAddSubtask={(pid, title) => {}}
                    onUpdateDate={(id, date) =>
                      handleUpdate(id, "due_date", date)
                    }
                    onUpdateTags={(id, tags) => handleUpdate(id, "tags", tags)}
                    onUpdateContent={(id, content) =>
                      handleUpdate(id, "content", content)
                    }
                    onManualMove={handleManualMove}
                    onEdit={requestEdit}
                  />
                )}

                {activeView === "idea_board" && (
                  <IdeaBoard
                    items={items}
                    sortOption={sortOption}
                    filterTags={filterTags}
                    allSystemTags={allSystemTags}
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
                  />
                )}

                {activeView === "code_snippet" && (
                  <TechCodex
                    items={items}
                    sortOption={sortOption}
                    filterTags={filterTags}
                    allSystemTags={allSystemTags}
                    onUpdateContent={(id, c) => handleUpdate(id, "content", c)}
                    onUpdateTags={(id, t) => handleUpdate(id, "tags", t)}
                    onDelete={requestDelete}
                    onReorder={handleReorder}
                    onManualMove={handleManualMove}
                    onEdit={requestEdit}
                  />
                )}

                {activeView === "ledger" && (
                  <LedgerView
                    items={items}
                    sortOption={sortOption}
                    filterTags={filterTags}
                    allSystemTags={allSystemTags}
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
                    onEdit={requestEdit}
                  />
                )}

                {activeView === "level_up" && (
                  <LevelUpView
                    items={items}
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
                    items={items}
                    type={activeView}
                    sortOption={sortOption}
                    filterTags={filterTags}
                    allSystemTags={allSystemTags}
                    onUpdateTitle={(id, t) => handleUpdate(id, "title", t)}
                    onUpdateContent={(id, c) => handleUpdate(id, "content", c)}
                    onUpdateTags={(id, t) => handleUpdate(id, "tags", t)}
                    onUpdateDate={(id, d) => handleUpdate(id, "due_date", d)}
                    onUpdateMetadata={(id, m) =>
                      handleUpdate(id, "metadata", m)
                    } // <--- CRITICAL FIX: Added this prop
                    onDelete={requestDelete}
                    onArchive={(id) => handleUpdate(id, "status", "archived")}
                    onReorder={handleReorder}
                    onManualMove={handleManualMove}
                    onEdit={requestEdit}
                  />
                )}
              </>
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
    </>
  );
}
