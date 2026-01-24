import Link from "next/link";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative">
      {/* 🚨 SINGLE EXIT BUTTON - BOTTOM LEFT */}
      <div className="fixed bottom-14 left-4 z-[100] flex items-center justify-center p-1.5 bg-slate-900/90 backdrop-blur-md rounded-full border border-slate-700/50 shadow-2xl opacity-40 hover:opacity-100 transition-all duration-300">
        <Link
          href="/"
          className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-red-600/80 transition-all"
          title="Exit to Command Center"
        >
          <LogOut size={20} className="translate-x-0.5" />
        </Link>
      </div>

      <main className="w-full">{children}</main>
    </div>
  );
}
