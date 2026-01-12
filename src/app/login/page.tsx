import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server"; // Server-side connection
import HomeClient from "./CommandCenter";

export const metadata: Metadata = {
  title: "DnDL Creative LLC",
  description: "Company tools to run like smooth unsalted butter",
};

export default async function Page() {
  // 1. Initialize Server Client
  const supabase = await createClient();

  // 2. Check for active session
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // 3. Security Gate: If no user, redirect immediately
  if (error || !user) {
    redirect("/login");
  }

  // 4. Render the dashboard (user is confirmed)
  return <HomeClient />;
}
