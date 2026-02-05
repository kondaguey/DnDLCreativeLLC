// Force local date interpretation without timezone shifting
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  // Split YYYY-MM-DD and create date using local arguments
  // This prevents the "UTC Midnight" shift
  const parts = dateString.split("T")[0].split("-");
  if (parts.length !== 3) return dateString;

  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1; // Months are 0-indexed
  const day = parseInt(parts[2]);

  const date = new Date(year, month, day);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Parse date string (YYYY-MM-DD or ISO) safely without UTC shifts for local dates
export function parseSafeDate(dateString: string | null | undefined): Date {
  if (!dateString) return new Date();
  const parts = dateString.split("T")[0].split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    return new Date(year, month, day);
  }
  return new Date(dateString);
}

// Get 'YYYY-MM-DD' for input values
export function toInputDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  return dateString.split("T")[0];
}

export function isTaskOverdue(dateString: string | null): boolean {
  if (!dateString) return false;
  const today = getTodayString();
  return dateString < today;
}

// Check urgency
export function getDaysUntil(dateString: string | null): number {
  if (!dateString) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = dateString.split("T")[0].split("-");
  const due = new Date(
    parseInt(parts[0]),
    parseInt(parts[1]) - 1,
    parseInt(parts[2])
  );

  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getTodayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function calcNextDueDate(currentDate: string | null, interval: string): string {
  const today = getTodayString();
  const baseStr = currentDate || today;
  const baseDate = parseSafeDate(baseStr);
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());

  switch (interval) {
    case "daily": d.setDate(d.getDate() + 1); break;
    case "weekly": d.setDate(d.getDate() + 7); break;
    case "monthly": d.setMonth(d.getMonth() + 1); break;
    case "quarterly": d.setMonth(d.getMonth() + 3); break;
    case "yearly": d.setFullYear(d.getFullYear() + 1); break;
    default: return today;
  }

  const yStr = d.getFullYear();
  const mStr = String(d.getMonth() + 1).padStart(2, '0');
  const dStr = String(d.getDate()).padStart(2, '0');
  let result = `${yStr}-${mStr}-${dStr}`;

  // If calculated date is in the past, jump to next occurrence
  while (result < today) {
    const rd = parseSafeDate(result);
    switch (interval) {
      case "daily": rd.setDate(rd.getDate() + 1); break;
      case "weekly": rd.setDate(rd.getDate() + 7); break;
      case "monthly": rd.setMonth(rd.getMonth() + 1); break;
      case "quarterly": rd.setMonth(rd.getMonth() + 3); break;
      case "yearly": rd.setFullYear(rd.getFullYear() + 1); break;
    }
    const ry = rd.getFullYear();
    const rm = String(rd.getMonth() + 1).padStart(2, '0');
    const rd_ = String(rd.getDate()).padStart(2, '0');
    result = `${ry}-${rm}-${rd_}`;
  }

  return result;
}

export function getPrevCycleDeadline(nextDate: string | null, interval: string): string {
  if (!nextDate) return getTodayString();
  const baseDate = parseSafeDate(nextDate);
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());

  switch (interval) {
    case "daily": d.setDate(d.getDate() - 1); break;
    case "weekly": d.setDate(d.getDate() - 7); break;
    case "monthly": d.setMonth(d.getMonth() - 1); break;
    case "quarterly": d.setMonth(d.getMonth() - 3); break;
    case "yearly": d.setFullYear(d.getFullYear() - 1); break;
  }

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Get ISO Week Number
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Get the Monday of the current week
export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust so Monday is start
  return new Date(d.setDate(diff));
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return d1.toISOString().split("T")[0] === d2.toISOString().split("T")[0];
}

export function isDateInWeek(dateStr: string, weekStart: Date): boolean {
  const d = new Date(dateStr);
  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return d >= start && d <= end;
}

// Generate all weeks for a given year (for Contribution Graph)
export function generateYearWeeks(year: number): { start: Date; end: Date; weekNum: number }[] {
  const weeks = [];
  const firstDay = new Date(year, 0, 1);

  // Find the first Monday of the year (or start of first week)
  const startOffset = firstDay.getDay() === 0 ? -6 : 1 - firstDay.getDay();
  let current = new Date(year, 0, 1 + startOffset);

  while (current.getFullYear() <= year) {
    const end = new Date(current);
    end.setDate(current.getDate() + 6);
    weeks.push({
      start: new Date(current),
      end: new Date(end),
      weekNum: getWeekNumber(current)
    });
    current.setDate(current.getDate() + 7);
  }
  return weeks;
}

// Calculate Streak & Missed stats
export function calculateStats(
  completedDates: string[] | undefined,
  createdAt: string,
  interval: string,
  metadata?: any
): { streak: number; missed: number } {
  const dates = [...(completedDates || [])].sort();
  const voidedGaps = (metadata?.voided_gaps as string[]) || [];
  const created = parseSafeDate(createdAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Calculate Streak
  let streak = 0;
  if (dates.length > 0) {
    let currentStreak = 0;
    const lastCompletion = new Date(dates[dates.length - 1].split(" @ ")[0]);
    lastCompletion.setHours(0, 0, 0, 0);

    let tolerance = 1;
    if (interval === "weekly") tolerance = 7;
    if (interval === "monthly") tolerance = 31;
    if (interval === "quarterly") tolerance = 92;

    const diffSinceLast = Math.ceil((today.getTime() - lastCompletion.getTime()) / (1000 * 60 * 60 * 24));

    if (diffSinceLast <= tolerance) {
      currentStreak = 1;
      for (let i = dates.length - 1; i > 0; i--) {
        const curr = new Date(dates[i].split(" @ ")[0]);
        const prev = new Date(dates[i - 1].split(" @ ")[0]);
        const diffDays = Math.ceil(Math.abs(curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= tolerance) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    streak = currentStreak;
  }

  // 2. Calculate Missed (Accounting for voided gaps)
  const missedDates = calculateMissedDates(completedDates || [], createdAt, interval, metadata);
  const missed = missedDates.length;

  return { streak, missed };
}

// Helper to identify specific missed dates
export function calculateMissedDates(
  completedDates: string[],
  createdAt: string,
  interval: string,
  metadata?: any
): string[] {
  const completedSet = new Set(completedDates.map(d => d.split(" @ ")[0]));
  const voidedSet = new Set((metadata?.voided_gaps as string[]) || []);
  const created = parseSafeDate(createdAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const missedDates: string[] = [];
  let current = new Date(created);
  current.setHours(0, 0, 0, 0);

  // We start checking from the day AFTER creation or the creation date itself?
  // Usually, a task created today isn't "missed" yet. 
  // But if it was created yesterday and not done, it's missed.

  // To be safe and precise, we check every expected occurrence from 'created' up to but not including 'today'
  while (current < today) {
    const dateStr = current.toISOString().split("T")[0];

    // Check if this specific date was expected based on interval
    let isExpected = false;
    if (interval === "daily") {
      isExpected = true;
    } else if (interval === "weekly") {
      const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][current.getDay()];
      const preferred = metadata?.preferred_weekday; // e.g. "Mon"
      isExpected = preferred ? dayName === preferred : true; // If no preference, every day in weekly? No, usually weekly means "once a week".
      // ... simplified for now: if weekly and no preferred day, we skip specific date tracking for missed unless specified.
    } else if (interval === "monthly") {
      const dayNum = current.getDate();
      const preferred = metadata?.preferred_day_num || 1;
      isExpected = dayNum === preferred;
    } else if (interval === "quarterly") {
      const month = current.getMonth();
      const dayNum = current.getDate();
      const preferred = metadata?.preferred_day_num || 1;
      isExpected = (dayNum === preferred) && ([0, 3, 6, 9].includes(month));
    }

    if (isExpected && !completedSet.has(dateStr) && !voidedSet.has(dateStr)) {
      missedDates.push(dateStr);
    }

    // Increment runner
    current.setDate(current.getDate() + 1);
  }

  // Add manual missed entries that aren't already flagged
  const manualMissed = (metadata?.manual_missed as string[]) || [];
  manualMissed.forEach(m => {
    if (!completedSet.has(m) && !voidedSet.has(m) && !missedDates.includes(m)) {
      missedDates.push(m);
    }
  });

  return missedDates.sort();
}

// Generate trend data for Recharts (Completion volume over time)
export function generateTrendData(completedDates: string[]) {
  const sorted = [...completedDates].sort();
  const map: Record<string, number> = {};

  // Last 6 months or cycles
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = d.toLocaleString('default', { month: 'short' });
    map[monthKey] = 0;
  }

  sorted.forEach(dStr => {
    const d = new Date(dStr.split(" @ ")[0]);
    const key = d.toLocaleString('default', { month: 'short' });
    if (map[key] !== undefined) map[key]++;
  });

  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

// Check if the current cycle (today, this week, etc.) is already satisfied
export function isCycleSatisfied(completedDates: string[], interval: string): boolean {
  if (!completedDates || completedDates.length === 0) return false;
  const todayStr = getTodayString();
  const sorted = [...completedDates].sort().reverse();
  const lastEntry = sorted[0].split(" @ ")[0];

  if (interval === "daily") {
    return lastEntry === todayStr;
  }

  const lastDate = parseSafeDate(lastEntry);
  const todayDate = parseSafeDate(todayStr);

  if (interval === "weekly") {
    return getStartOfWeek(lastDate).toISOString().split("T")[0] ===
      getStartOfWeek(todayDate).toISOString().split("T")[0];
  }

  if (interval === "monthly") {
    return lastDate.getMonth() === todayDate.getMonth() &&
      lastDate.getFullYear() === todayDate.getFullYear();
  }

  if (interval === "quarterly") {
    const lastQ = Math.floor(lastDate.getMonth() / 3);
    const currentQ = Math.floor(todayDate.getMonth() / 3);
    return lastQ === currentQ && lastDate.getFullYear() === todayDate.getFullYear();
  }

  return false;
}

// Determine the correct "Next Due Date" based on historical logs and current recurrence
export function calculateStandardDueDate(completedDates: string[], recurrence: string): string {
  const todayVal = getTodayString();
  if (recurrence === "one_off") return todayVal;

  if (isCycleSatisfied(completedDates, recurrence)) {
    const sorted = [...completedDates].sort().reverse();
    const lastEntryDate = sorted[0].split(" @ ")[0];
    return calcNextDueDate(lastEntryDate, recurrence);
  } else {
    // If NOT satisfied, we default to today to show it as due now/soon
    return todayVal;
  }
}
