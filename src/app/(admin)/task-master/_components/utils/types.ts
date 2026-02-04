export type ViewType =
  | "task"
  | "code_snippet"
  | "social_bookmark"
  | "resource"
  | "level_up"
  | "ledger"
  | "idea_board"
  | "ai_prompt";

export type RecurrenceType =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "one_off"
  | "archived";

export type SortOption =
  | "manual"
  | "date_asc"
  | "date_desc"
  | "created_desc"
  | "alpha_asc"
  | "alpha_desc"
  | "priority_desc"
  | "priority_asc";

export type SubtaskItem = {
  id: string;
  title: string;
  status: "active" | "completed";
};

export type TaskItem = {
  id: string;
  type: ViewType;
  title: string;
  content?: string;
  status: "active" | "completed" | "archived";
  recurrence?: RecurrenceType; // <--- LOCKED TO TYPE
  due_date?: string | null;
  subtasks?: SubtaskItem[];
  tags?: string[];
  position?: number;
  metadata?: {
    // Global Features
    is_favorite?: boolean;
    url?: string; // <--- ADDED: Crucial for Resource Grid & Codex

    // Incubator
    stage?: "spark" | "solidified";
    incubator_metadata?: {
      effort: "low" | "medium" | "high";
      impact: "low" | "medium" | "high";
      status: "raw" | "incubating" | "ready" | "archived";
    };

    // Level Up
    platform?: string;
    total_hours?: number;
    hours_completed?: number;
    course_link?: string;
    start_date?: string;
    end_date?: string;

    // Ledger (UPDATED to match all 8 UI options)
    app_name?: string;
    ticket_type?:
    | "task"
    | "bug"
    | "feature"
    | "refactor"
    | "security"
    | "performance"
    | "design"
    | "devops";
    priority?: "critical" | "high" | "normal" | "low";

    // --- RECURRENCE TRACKING ---
    completed_dates?: string[]; // Date Strings YYYY-MM-DD
    history?: string[]; // ISO Timestamps
    preferred_weekday?: string; // "Monday"
    preferred_day_num?: number; // 1-31
    active_days?: string[]; // <--- THE FIX FOR VERCEL (e.g., ["Mon", "Tue"])
    streak?: number;
    voided_gaps?: string[]; // Dates users specifically want to ignore from missed count
    manual_missed?: string[]; // Dates users manually flag as missed

    // prompt
    notes?: string;
    system_context?: string;
  };
  created_at: string;
  user_id: string;
};