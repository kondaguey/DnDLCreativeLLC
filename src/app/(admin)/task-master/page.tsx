import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import styles from "./task-master.module.css";
import TaskMasterShell from "./_components/core/TaskMasterShell";

export default async function TaskMasterPage() {
  // --- THE FIX: ADD 'AWAIT' HERE ---
  const supabase = await createClient();

  // 1. Authenticate on Server
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Fetch ALL Data Upfront
  const { data: allItems } = await supabase
    .from("task_master_items")
    .select("*")
    .eq("user_id", user.id)
    .order("position", { ascending: true });

  const { data: allTags } = await supabase
    .from("distinct_tags")
    .select("tag_name");

  const systemTags = allTags ? allTags.map((r: any) => r.tag_name) : [];

  return (
    <div className={styles.pageWrapper}>
      <div className={`${styles.atmosphereBlob} ${styles.blobPrimary}`} />
      <div className={`${styles.atmosphereBlob} ${styles.blobSecondary}`} />

      {/* Pass the prefetched data to the Client Shell */}
      <TaskMasterShell
        initialItems={allItems || []}
        initialTags={systemTags}
        userId={user.id}
      />
    </div>
  );
}
