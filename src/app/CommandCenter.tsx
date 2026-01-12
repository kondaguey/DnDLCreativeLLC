"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client"; // Connect to Supabase
import {
  ListTodo,
  CircleDollarSign,
  LogOut,
  Sparkles,
  TrendingUp,
  PenTool,
  Book,
  Mic,
  Activity,
  Clapperboard,
} from "lucide-react";

import styles from "./CommandCenter.module.css";

export default function CommandCenter() {
  const router = useRouter();
  const supabase = createClient(); // Initialize client

  const handleSignOut = async () => {
    // 1. Kill the session on Supabase
    await supabase.auth.signOut();

    // 2. Redirect to login
    router.push("/login");
    router.refresh();
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={`${styles.atmosphereBlob} ${styles.blobPurple}`} />
      <div className={`${styles.atmosphereBlob} ${styles.blobTeal}`} />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl w-full relative z-10">
        <div className="text-center mb-16">
          <div className={styles.statusPill}>
            <div className={styles.statusDot} />
            <span className={styles.systemStatusText}>System Online</span>
          </div>
          <h1 className="h1-wave">DnDL Creative LLC</h1>
          <p className="text-slate-400 font-medium italic mt-4 text-lg">
            Select your interface protocol.
          </p>
        </div>

        {/* FLEX CONTAINER */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {/* 1. TO DO APP (Purple) */}
          <Link
            href="/apps/todo"
            className={`${styles.appCard} ${styles.cardTodo} group`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className={styles.cardContent}>
              <div
                className={`${styles.cardIcon} text-purple-400 group-hover:border-purple-500/30`}
              >
                <ListTodo size={48} />
              </div>
              <div className={styles.cardTextGroup}>
                <h2
                  className={`${styles.cardTitle} bg-gradient-to-r from-purple-300 to-indigo-300 group-hover:from-purple-200 group-hover:to-indigo-200`}
                >
                  Task Master
                </h2>
                <p
                  className={`${styles.cardSubtitle} group-hover:text-purple-400/80`}
                >
                  Project Management
                </p>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 pb-2">
              <Sparkles className="text-purple-500" size={24} />
            </div>
          </Link>

          {/* 2. LEDGER (Teal) */}
          <Link
            href="/apps/bookkeeping"
            className={`${styles.appCard} ${styles.cardLedger} group`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className={styles.cardContent}>
              <div
                className={`${styles.cardIcon} text-teal-400 group-hover:border-teal-500/30`}
              >
                <CircleDollarSign size={48} />
              </div>
              <div className={styles.cardTextGroup}>
                <h2
                  className={`${styles.cardTitle} bg-gradient-to-r from-teal-300 to-emerald-300 group-hover:from-teal-200 group-hover:to-emerald-200`}
                >
                  Ledger Logic
                </h2>
                <p
                  className={`${styles.cardSubtitle} group-hover:text-teal-400/80`}
                >
                  Financial Tracking
                </p>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 pb-2">
              <TrendingUp className="text-teal-500" size={24} />
            </div>
          </Link>

          {/* 3. AUDIOBOOK ACTOR (Amber) */}
          <Link
            href="/admin/audiobook-production-manager"
            className={`${styles.appCard} ${styles.cardAudio} group`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className={styles.cardContent}>
              <div
                className={`${styles.cardIcon} text-amber-400 group-hover:border-amber-500/30`}
              >
                <Book size={48} />
              </div>
              <div className={styles.cardTextGroup}>
                <h2
                  className={`${styles.cardTitleLong} bg-gradient-to-r from-amber-300 to-orange-300 group-hover:from-amber-200 group-hover:to-orange-200`}
                >
                  Daniel (not Day) Lewis
                </h2>
                <p
                  className={`${styles.cardSubtitle} group-hover:text-amber-400/80`}
                >
                  Audiobook Command Center
                </p>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 pb-2">
              <Activity className="text-amber-500" size={24} />
            </div>
          </Link>

          {/* 4. CINESONIC PRODUCTIONS (Indigo) */}
          <Link
            href="/admin/cinesonic"
            className={`${styles.appCard} ${styles.cardCine} group`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className={styles.cardContent}>
              <div
                className={`${styles.cardIcon} text-indigo-400 group-hover:border-indigo-500/30`}
              >
                <Clapperboard size={48} />
              </div>
              <div className={styles.cardTextGroup}>
                <h2
                  className={`${styles.cardTitle} bg-gradient-to-r from-indigo-300 to-blue-300 group-hover:from-indigo-200 group-hover:to-blue-200`}
                >
                  CineSonic Productions
                </h2>
                <p
                  className={`${styles.cardSubtitle} group-hover:text-indigo-400/80`}
                >
                  Production House
                </p>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 pb-2">
              <Sparkles className="text-indigo-500" size={24} />
            </div>
          </Link>

          {/* 5. VOICEOVER TRACKER (Cyan) */}
          <Link
            href="/admin/voiceover-tracker"
            className={`${styles.appCard} ${styles.cardVoice} group`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className={styles.cardContent}>
              <div
                className={`${styles.cardIcon} text-cyan-400 group-hover:border-cyan-500/30`}
              >
                <Mic size={48} />
              </div>
              <div className={styles.cardTextGroup}>
                <h2
                  className={`${styles.cardTitle} bg-gradient-to-r from-cyan-300 to-blue-300 group-hover:from-cyan-200 group-hover:to-blue-200`}
                >
                  Voiceover Tracker
                </h2>
                <p
                  className={`${styles.cardSubtitle} group-hover:text-cyan-400/80`}
                >
                  Auditions & Bookings
                </p>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 pb-2">
              <Activity className="text-cyan-500" size={24} />
            </div>
          </Link>

          {/* 6. VIBE WRITER (Rose) */}
          <Link
            href="/admin/vibe-writer"
            className={`${styles.appCard} ${styles.cardVibe} group`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className={styles.cardContent}>
              <div
                className={`${styles.cardIcon} text-rose-400 group-hover:border-rose-500/30`}
              >
                <PenTool size={48} />
              </div>
              <div className={styles.cardTextGroup}>
                <h2
                  className={`${styles.cardTitle} bg-gradient-to-r from-rose-300 to-pink-300 group-hover:from-rose-200 group-hover:to-pink-200`}
                >
                  Vibe Writer
                </h2>
                <p
                  className={`${styles.cardSubtitle} group-hover:text-rose-400/80`}
                >
                  Content & SEO Engine
                </p>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 pb-2">
              <Sparkles className="text-rose-500" size={24} />
            </div>
          </Link>
        </div>

        <div className="mt-20 flex justify-center gap-8">
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-600 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} /> Terminate Session
          </button>
        </div>
      </div>
    </div>
  );
}
