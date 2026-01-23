export type ViewType =
  | "task"
  | "code_snippet"
  | "social_bookmark"
  | "resource"
  | "level_up"
  | "ledger"
  | "idea_board";

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
  | "alpha_desc";

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

    // Idea Board
    stage?: "spark" | "solidified";

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

    // Codex
    notes?: string;
  };
  created_at: string;
  user_id: string;
};
