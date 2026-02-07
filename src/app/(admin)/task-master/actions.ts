"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getTodayString, calcNextDueDate, calculateStats, isCycleSatisfied } from "./_components/utils/dateUtils";

export async function fetchAllTaskMasterItems() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
        .from("task_master_items")
        .select("*")
        .eq("user_id", user.id)
        .order("position", { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data };
}

export async function smartCompleteTaskMasterItem(itemId: string, isBonus: boolean = false) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // 1. Fetch the item
    const { data: item, error: fetchError } = await supabase
        .from("task_master_items")
        .select("*")
        .eq("id", itemId)
        .eq("user_id", user.id)
        .single();

    if (fetchError || !item) return { success: false, error: "Item not found or access denied" };

    const recurrence = item.recurrence;
    const todayVal = getTodayString();

    let updatePayload: any = {};
    let nextDate = item.due_date;

    // Handle Periodic Tasks (Recurrence)
    if (recurrence && recurrence !== "one_off") {
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const currentLog = (item.metadata?.completed_dates as string[]) || [];

        // If not a bonus and already satisfied, we don't do anything or return a message
        if (!isBonus && isCycleSatisfied(currentLog, recurrence)) {
            return { success: true, message: "Cycle already satisfied" };
        }

        const logEntry = `${todayVal} @ ${nowTime}${isBonus ? " (BONUS)" : ""}`;
        const newLog = [...currentLog, logEntry];

        const stats = calculateStats(
            newLog.map(d => d.split(" @ ")[0]),
            item.created_at || new Date().toISOString(),
            recurrence,
            item.metadata
        );

        nextDate = calcNextDueDate(item.due_date || todayVal, recurrence);

        const newMeta = {
            ...item.metadata,
            completed_dates: newLog,
            streak: stats.streak
        };

        updatePayload = {
            due_date: nextDate,
            metadata: newMeta,
            status: "active"
        };
    } else {
        // Handle One-off Tasks
        const subtasks = item.subtasks || [];
        const syncedSubtasks = subtasks.map((s: any) => ({ ...s, status: "completed" }));
        updatePayload = {
            status: "completed",
            subtasks: syncedSubtasks
        };
    }

    const { error: updateError } = await supabase
        .from("task_master_items")
        .update(updatePayload)
        .eq("id", itemId);

    if (updateError) return { success: false, error: updateError.message };

    // 2. Bidirectional Sync: Update linked items in Daily Schedule
    // We search for any dndlcreative_personal item that links to THIS task_master_id
    await supabase
        .from("dndlcreative_personal")
        .update({
            status: updatePayload.status || "active",
            metadata: {
                ...updatePayload.metadata,
                // Ensure we don't accidentally overwrite the personal item's own essential metadata
                // but keep the protocol-relevant parts (streak, completed_dates) in sync
            }
        })
        .filter('metadata->>task_master_id', 'eq', itemId);

    revalidatePath("/(admin)/task-master", "page");
    revalidatePath("/daily-schedule");
    return { success: true, nextDate };
}

export async function voidProtocolItem(itemId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // 1. Mark as voided in Task-Master
    const { error: tmError } = await supabase
        .from("task_master_items")
        .update({ status: "voided" }) // or archived based on system preference
        .eq("id", itemId)
        .eq("user_id", user.id);

    if (tmError) return { success: false, error: tmError.message };

    // 2. Sync to Daily Schedule
    await supabase
        .from("dndlcreative_personal")
        .update({ status: "archived" })
        .filter('metadata->>task_master_id', 'eq', itemId);

    revalidatePath("/(admin)/task-master", "page");
    revalidatePath("/daily-schedule");
    return { success: true };
}
export async function syncTaskMasterSubtask(itemId: string, subtaskTitle: string, isCompleted: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data: item, error: fetchError } = await supabase
        .from("task_master_items")
        .select("*")
        .eq("id", itemId)
        .eq("user_id", user.id)
        .single();

    if (fetchError || !item) return { success: false, error: "Item not found" };

    const subtasks = item.subtasks || [];
    const updatedSubtasks = subtasks.map((s: any) =>
        s.title === subtaskTitle ? { ...s, status: isCompleted ? "completed" : "todo" } : s
    );

    const { error: updateError } = await supabase
        .from("task_master_items")
        .update({ subtasks: updatedSubtasks })
        .eq("id", itemId);

    if (updateError) return { success: false, error: updateError.message };

    revalidatePath("/(admin)/task-master", "page");
    return { success: true };
}

export async function addGlobalTag(tagName: string) {
    const supabase = await createClient();

    // Attempt to insert into distinct_tags table
    // NOTE: If distinct_tags is a VIEW that aggregates from tasks, this might fail unless it's a real table.
    // Given the requirement to "add a new tag globally", we assume there is a table to hold these.
    const { error } = await supabase
        .from("distinct_tags")
        .insert([{ tag_name: tagName }]);

    if (error) {
        // Ignore duplicate key errors (code 23505 in Postgres)
        if (error.code === '23505') {
            return { success: true, message: "Tag already exists" };
        }
        console.error("Error adding global tag:", error);
        return { success: false, error: error.message };
    }

    // Revalidate the task master page so the new tag appears in the list
    revalidatePath("/(admin)/task-master", "page");
    return { success: true };
}

export async function deleteGlobalTag(tagName: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("distinct_tags")
        .delete()
        .eq("tag_name", tagName);

    if (error) {
        console.error("Error deleting global tag:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/(admin)/task-master", "page");
    return { success: true };
}
