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

// --- SINGLE SOURCE OF TRUTH FOR TAGS ---
export const SYSTEM_TAGS = [
  "CineSonic",
  "Design",
  "Dev",
  "Finance",
  "Marketing",
  "Money",
  "Ops",
  "Strategy",
  "Urgent",
];

export type TaskItem = {
  id: string;
  type: ViewType;
  title: string;
  content?: string;
  status: "active" | "completed" | "archived";
  recurrence?: string;
  due_date?: string | null;
  parent_id?: string | null;
  subtasks?: TaskItem[];
  tags?: string[];
  position?: number;
  metadata?: {
    // Idea Board
    stage?: "spark" | "solidified";
    label?: { name: string; color: string; border: string; text: string };

    // Level Up
    platform?: string;
    total_hours?: number;
    hours_completed?: number;
    course_link?: string;
    start_date?: string;
    end_date?: string;

    // Ledger
    app_name?: string;
    ticket_type?: "bug" | "feature" | "refactor";
    priority?: "critical" | "high" | "normal" | "low";
  };
  created_at: string;
  user_id: string;
};
