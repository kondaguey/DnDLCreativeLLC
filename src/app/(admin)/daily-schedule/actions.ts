"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function fetchPersonalItems(date?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    let query = supabase
        .from("dndlcreative_personal")
        .select("*")
        .eq("user_id", user.id);

    if (date) {
        // Only fetch items for this specific date (not templates)
        query = query.eq("due_date", date);
    } else {
        // If no date specified, fetch non-template items
        query = query.or("metadata->>is_template.is.null,metadata->>is_template.neq.true");
    }

    const { data, error } = await query.order("position", { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data };
}

export async function fetchTemplates() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
        .from("dndlcreative_personal")
        .select("*")
        .eq("user_id", user.id)
        .eq("metadata->>is_template", "true")
        .order("position", { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data };
}

export async function loadTemplateToDate(date: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // First, fetch all templates
    const { data: templates, error: fetchError } = await supabase
        .from("dndlcreative_personal")
        .select("*")
        .eq("user_id", user.id)
        .eq("metadata->>is_template", "true")
        .order("position", { ascending: true });

    if (fetchError) return { success: false, error: fetchError.message };
    if (!templates || templates.length === 0) {
        return { success: false, error: "No templates found. Create some templates first!" };
    }

    // Create copies of templates for the specific date
    const newItems = templates.map((t, idx) => ({
        user_id: user.id,
        type: t.type,
        title: t.title,
        content: t.content,
        recurrence: t.recurrence,
        due_date: date,
        position: (idx + 1) * 1000,
        status: "active",
        metadata: {
            ...t.metadata,
            is_template: false, // The copy is not a template
            template_source_id: t.id, // Track which template it came from
            completed_dates: [],
            completed_sub_actions: [],
            streak: 0
        }
    }));

    const { data, error } = await supabase
        .from("dndlcreative_personal")
        .insert(newItems)
        .select();

    if (error) return { success: false, error: error.message };

    revalidatePath("/daily-schedule");
    return { success: true, data };
}

export async function updatePersonalItem(id: string, updates: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
        .from("dndlcreative_personal")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/daily-schedule");
    return { success: true };
}

export async function updatePersonalPositions(updates: { id: string, position: number }[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // Supabase doesn't have a great way to do multiple different updates in one call 
    // without using a RPC or multiple calls. But we can at least wait for all and revalidate once.
    const promises = updates.map(u =>
        supabase
            .from("dndlcreative_personal")
            .update({ position: u.position })
            .eq("id", u.id)
            .eq("user_id", user.id)
    );

    const results = await Promise.all(promises);
    const firstError = results.find(r => r.error);

    if (firstError?.error) return { success: false, error: firstError.error.message };

    revalidatePath("/daily-schedule");
    return { success: true };
}

export async function createPersonalItem(item: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
        .from("dndlcreative_personal")
        .insert([{ ...item, user_id: user.id }])
        .select();

    if (error) return { success: false, error: error.message };
    revalidatePath("/daily-schedule");
    return { success: true, data: data[0] };
}

export async function deletePersonalItem(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
        .from("dndlcreative_personal")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/daily-schedule");
    return { success: true };
}

export async function resetAllPersonalItems() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // We set status back to active for all items
    const { error } = await supabase
        .from("dndlcreative_personal")
        .update({ status: "active" })
        .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/daily-schedule");
    return { success: true };
}

export async function initializePersonalProtocol() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const magnusModeItems = [
        {
            user_id: user.id,
            type: "task",
            title: "Waking Routine",
            content: "Neti pot #1, Mushroom Coffee, Morning Tai Chi sequence, Reading + Think and Grow Rich Statement.",
            recurrence: "daily",
            position: 1000,
            metadata: { duration: "45 min", routine_type: "morning" }
        },
        {
            user_id: user.id,
            type: "task",
            title: "The Big 6 Circuit",
            content: "Pushups, Assisted Pullups, Air Squats, Band Pull-Aparts, Core x5. Post-workout: Intake 1 (Creatine/BCAAs/Walnut).",
            recurrence: "daily",
            position: 2000,
            metadata: { duration: "1 hr", routine_type: "training" }
        },
        {
            user_id: user.id,
            type: "task",
            title: "Deep Work: DnDL Creative LLC",
            content: "Founder/Hacker focus. Skill up. Mid-Shift: Meal 1 + Intake 2 (Berberine/Omega 3/D3/CLA).",
            recurrence: "daily",
            position: 3000,
            metadata: { duration: "8 hrs", routine_type: "work" }
        },
        {
            user_id: user.id,
            type: "task",
            title: "Admin & Audio Block",
            content: "30m Tasks, 3h Audio, 30m Admin. Hydration: 0-Cal Electrolytes.",
            recurrence: "daily",
            position: 4000,
            metadata: { duration: "4 hrs", routine_type: "work" }
        },
        {
            user_id: user.id,
            type: "task",
            title: "Pimsleur Lesson",
            content: "30 Min Cooking / Pimsleur Lesson.",
            recurrence: "daily",
            position: 5000,
            metadata: { duration: "30 min", routine_type: "education" }
        },
        {
            user_id: user.id,
            type: "task",
            title: "Cardio & Reality Transurfing",
            content: "Run 3-5k or HIIT Sprints. Sync with Reality Transurfing audio.",
            recurrence: "daily",
            position: 6000,
            metadata: { duration: "1 hr", routine_type: "training" }
        },
        {
            user_id: user.id,
            type: "task",
            title: "Meal 2",
            content: "Protein + Strategic Carbs. Intake 3 (Magnesium/Relora/Glucosamine/Collagen).",
            recurrence: "daily",
            position: 7000,
            metadata: { duration: "Closing Window", routine_type: "recovery" }
        },
        {
            user_id: user.id,
            type: "task",
            title: "Self-Care Routine",
            content: "Neti pot #2, Cold Shower, Stretching, Miracle Journal, Think and Grow Rich Statement. Sleep.",
            recurrence: "daily",
            position: 8000,
            metadata: { duration: "30 min", routine_type: "recovery" }
        }
    ];

    const { error } = await supabase
        .from("dndlcreative_personal")
        .insert(magnusModeItems);

    if (error) return { success: false, error: error.message };

    revalidatePath("/daily-schedule");
    return { success: true };
}
