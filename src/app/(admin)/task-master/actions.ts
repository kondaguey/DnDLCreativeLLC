"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
