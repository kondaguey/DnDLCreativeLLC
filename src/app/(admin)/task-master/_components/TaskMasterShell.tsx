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
import FilterBar from "./FilterBar";
import { Toast, ConfirmModal, ToastType, EditModal, EditableFields } from "./NotificationUI";
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

  // Edit modal state
  const [editCandidate, setEditCandidate] = useState<TaskItem | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ id: Date.now().toString(), type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // --- HANDLER: Subtask Reorder ---
  const handleReorderSubtask = async (
    parentId: string,
    subtaskId: string,
    direction: "up" | "down"
  ) => {
    const parent = items.find((i) => i.id === parentId);
    if (!parent || !parent.subtasks) return;

    const subIndex = parent.subtasks.findIndex((s) => s.id === subtaskId);
    if (subIndex === -1) return;

    const newSubtasks = [...parent.subtasks];
    const targetIndex = direction === "up" ? subIndex - 1 : subIndex + 1;

    if (targetIndex < 0 || targetIndex >= newSubtasks.length) return;

    // Swap in Array
    [newSubtasks[subIndex], newSubtasks[targetIndex]] = [
      newSubtasks[targetIndex],
      newSubtasks[subIndex],
    ];

    // Swap Positions for DB
    const itemA = newSubtasks[subIndex];
    const itemB = newSubtasks[targetIndex];
    const tempPos = itemA.position || 0;
    itemA.position = itemB.position || 0;
    itemB.position = tempPos;

    // Optimistic UI Update
    setItems(
      items.map((i) =>
        i.id === parentId ? { ...i, subtasks: newSubtasks } : i
      )
    );

    // DB Update
    await supabase
      .from("task_master_items")
      .update({ position: itemA.position })
      .eq("id", itemA.id);
    await supabase
      .from("task_master_items")
      .update({ position: itemB.position })
      .eq("id", itemB.id);
  };

  // --- HANDLER: Manual Main Item Move ---
  const handleManualMove = async (id: string, direction: "up" | "down") => {
    // Find item index
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return;

    const newItems = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    // Swap in UI
    [newItems[index], newItems[targetIndex]] = [
      newItems[targetIndex],
      newItems[index],
    ];
    setItems(newItems);

    // Swap DB Positions
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSystemTags = async () => {
    const { data } = await supabase.from("distinct_tags").select("tag_name");
    if (data) setAllSystemTags(data.map((r: any) => r.tag_name));
  };

  const fetchItems = useCallback(
    async (userId: string, view: ViewType) => {
      setLoading(true);
      const { data, error } = await supabase
        .from("task_master_items")
        .select("*")
        .eq("type", view)
        .eq("user_id", userId)
        .order("position", { ascending: true });

      if (!error && data) {
        const allItems = data as TaskItem[];
        // Only process hierarchy for tasks, others are flat
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
    [supabase]
  );

  const handleSwitchView = (view: ViewType) => {
    setActiveView(view);
    setFilterTags([]);
    if (user) fetchItems(user.id, view);
  };

  // --- ACTIONS ---

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !user) return;
    setIsAdding(true);

    const maxPos =
      items.length > 0 ? Math.max(...items.map((i) => i.position || 0)) : 0;
    const newItem = {
      type: activeView,
      title: newItemTitle,
      status: "active",
      user_id: user.id,
      recurrence: activeView === "task" ? activeRecurrence : null,
      content: "",
      position: maxPos + 1024,
    };

    const { data } = await supabase
      .from("task_master_items")
      .insert([newItem])
      .select()
      .single();

    if (data) {
      setItems([...items, { ...data, subtasks: [] }]);
      setNewItemTitle("");
      showToast("success", "Added.");
    } else {
      showToast("error", "Error adding item.");
    }
    setIsAdding(false);
  };

  const handleAddSubtask = async (parentId: string, title: string) => {
    if (!user) return;
    const parent = items.find((i) => i.id === parentId);
    const subMax = parent?.subtasks?.length
      ? Math.max(...parent.subtasks.map((s) => s.position || 0))
      : 0;
    const { data } = await supabase
      .from("task_master_items")
      .insert([
        {
          type: "task",
          title,
          status: "active",
          user_id: user.id,
          parent_id: parentId,
          recurrence: null,
          position: subMax + 1024,
        },
      ])
      .select()
      .single();
    if (data)
      setItems(
        items.map((p) =>
          p.id === parentId
            ? { ...p, subtasks: [...(p.subtasks || []), data] }
            : p
        )
      );
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

    draggedItem.position = newPosition;
    await supabase
      .from("task_master_items")
      .update({ position: newPosition })
      .eq("id", draggedId);
  };

  const handleRestore = async (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "active" } : i))
    );
    await supabase
      .from("task_master_items")
      .update({ status: "active" })
      .eq("id", id);
    showToast("success", "Restored.");
  };

  const handleUpdateDate = async (id: string, date: string) => {
    const finalDate = date === "" ? null : date;
    setItems(
      items.map((i) => (i.id === id ? { ...i, due_date: finalDate } : i))
    );
    await supabase
      .from("task_master_items")
      .update({ due_date: finalDate })
      .eq("id", id);
  };

  const handleUpdateTags = async (id: string, tags: string[]) => {
    setItems(items.map((i) => (i.id === id ? { ...i, tags } : i)));
    await supabase.from("task_master_items").update({ tags }).eq("id", id);
    fetchSystemTags();
  };

  const handleUpdateTitle = async (id: string, title: string) => {
    setItems(items.map((i) => (i.id === id ? { ...i, title } : i)));
    await supabase.from("task_master_items").update({ title }).eq("id", id);
  };

  const handleUpdateContent = async (id: string, content: string) => {
    await supabase.from("task_master_items").update({ content }).eq("id", id);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "completed" : "active";
    setItems(
      items.map((parent) => {
        if (parent.id === id) return { ...parent, status: newStatus as any };
        if (parent.subtasks?.some((s) => s.id === id)) {
          return {
            ...parent,
            subtasks: parent.subtasks.map((s) =>
              s.id === id ? { ...s, status: newStatus as any } : s
            ),
          };
        }
        return parent;
      })
    );
    await supabase
      .from("task_master_items")
      .update({ status: newStatus })
      .eq("id", id);
  };

  const handleArchive = async (id: string) => {
    setItems(
      items.map((i) => (i.id === id ? { ...i, status: "archived" } : i))
    );
    await supabase
      .from("task_master_items")
      .update({ status: "archived" })
      .eq("id", id);
    showToast("success", "Archived.");
  };

  const handleUpdateMetadata = async (id: string, metadata: any) => {
    setItems(items.map((i) => (i.id === id ? { ...i, metadata } : i)));
    await supabase.from("task_master_items").update({ metadata }).eq("id", id);
  };

  // --- UNIFIED EDIT HANDLER ---
  const handleEditItem = async (id: string, fields: EditableFields) => {
    // Build update object
    const updateData: any = {};
    if (fields.title !== undefined) updateData.title = fields.title;
    if (fields.content !== undefined) updateData.content = fields.content;
    if (fields.due_date !== undefined) updateData.due_date = fields.due_date;
    if (fields.tags !== undefined) updateData.tags = fields.tags;
    if (fields.metadata !== undefined) updateData.metadata = fields.metadata;

    // Optimistic UI update
    setItems(items.map((i) => {
      if (i.id === id) {
        return {
          ...i,
          ...updateData,
        };
      }
      return i;
    }));

    // DB update
    await supabase.from("task_master_items").update(updateData).eq("id", id);

    // Refresh tags if they were updated
    if (fields.tags) fetchSystemTags();

    showToast("success", "Updated.");
  };

  const requestEdit = (item: TaskItem) => setEditCandidate(item);

  const requestDelete = (id: string) => setDeleteCandidate(id);
  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    const id = deleteCandidate;
    const { error } = await supabase
      .from("task_master_items")
      .delete()
      .eq("id", id);

    if (!error) {
      setItems((prev) =>
        prev.filter((parent) => {
          if (parent.id === id) return false;
          if (parent.subtasks)
            parent.subtasks = parent.subtasks.filter((s) => s.id !== id);
          return true;
        })
      );
      showToast("success", "Purged.");
    } else {
      showToast("error", "Delete failed.");
    }
    setIsDeleting(false);
    setDeleteCandidate(null);
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
                        : activeView === "social_bookmark"
                          ? "Signal Archive"
                          : "Resources"}
              </h1>
            </div>

            <form onSubmit={handleAddItem} className={styles.headerForm}>
              <input
                type="text"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder={`+ Add entry...`}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white w-full focus:outline-none focus:border-purple-500 transition-colors"
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
                  onToggleTagFilter={(tag) => {
                    if (filterTags.includes(tag))
                      setFilterTags(filterTags.filter((t) => t !== tag));
                    else setFilterTags([...filterTags, tag]);
                  }}
                />

                {activeView === "task" && (
                  <TaskView
                    items={items}
                    activeRecurrence={activeRecurrence}
                    sortOption={sortOption}
                    filterTags={filterTags}
                    allSystemTags={allSystemTags}
                    onRecurrenceChange={setActiveRecurrence}
                    onToggleStatus={handleToggleStatus}
                    onDelete={requestDelete}
                    onArchive={handleArchive}
                    onRestore={handleRestore}
                    onReorder={handleReorder}
                    onAddSubtask={handleAddSubtask}
                    onUpdateDate={handleUpdateDate}
                    onUpdateTags={handleUpdateTags}
                    onUpdateContent={handleUpdateContent}
                    onManualMove={handleManualMove}
                    onReorderSubtask={handleReorderSubtask}
                    onEdit={requestEdit}
                  />
                )}

                {activeView === "ledger" && (
                  <LedgerView
                    items={items}
                    sortOption={sortOption}
                    filterTags={filterTags}
                    onUpdateMetadata={handleUpdateMetadata}
                    onUpdateTitle={handleUpdateTitle}
                    onDelete={requestDelete}
                    onToggleStatus={handleToggleStatus}
                    onReorder={handleReorder}
                    onArchive={handleArchive}
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
                    onUpdateMetadata={handleUpdateMetadata}
                    onUpdateTags={handleUpdateTags}
                    onDelete={requestDelete}
                    onReorder={handleReorder}
                    onToggleStatus={handleToggleStatus}
                    onManualMove={handleManualMove}
                    onEdit={requestEdit}
                  />
                )}

                {activeView === "code_snippet" && (
                  <TechCodex
                    items={items}
                    sortOption={sortOption}
                    filterTags={filterTags}
                    allSystemTags={allSystemTags}
                    onUpdateContent={handleUpdateContent}
                    onUpdateTags={handleUpdateTags}
                    onDelete={requestDelete}
                    onReorder={handleReorder}
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
                      onUpdateTitle={handleUpdateTitle}
                      onUpdateContent={handleUpdateContent}
                      onUpdateTags={handleUpdateTags}
                      onUpdateDate={handleUpdateDate}
                      onDelete={requestDelete}
                      onArchive={handleArchive}
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
        onSave={handleEditItem}
        onClose={() => setEditCandidate(null)}
        TagManagerComponent={TagManager}
        allSystemTags={allSystemTags}
      />
    </>
  );
}
