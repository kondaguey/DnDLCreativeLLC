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

// Get 'YYYY-MM-DD' for input values
export function toInputDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  return dateString.split("T")[0];
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
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
}

export function calcNextDueDate(currentDate: string | null, interval: string): string {
  // If no date, start from today
  const baseDate = currentDate ? new Date(currentDate) : new Date();
  // Adjust for timezone to ensure we are doing math on the "visual" date
  const parts = (currentDate || getTodayString()).split("-");
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const day = parseInt(parts[2]);

  const d = new Date(year, month, day);

  switch (interval) {
    case "daily": d.setDate(d.getDate() + 1); break;
    case "weekly": d.setDate(d.getDate() + 7); break;
    case "monthly": d.setMonth(d.getMonth() + 1); break;
    case "quarterly": d.setMonth(d.getMonth() + 3); break;
    case "yearly": d.setFullYear(d.getFullYear() + 1); break;
    default: return getTodayString();
  }

  // Format back to YYYY-MM-DD
  return d.toLocaleDateString('en-CA'); // en-CA is standard YYYY-MM-DD
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
  interval: string
): { streak: number; missed: number } {
  const dates = (completedDates || []).sort();
  const created = new Date(createdAt);
  const today = new Date();

  // 1. Calculate Streak (Consecutive chains ending today or yesterday)
  let streak = 0;
  if (dates.length > 0) {
    const todayStr = getTodayString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Check if the chain is alive (completed today or yesterday)
    let currentCheck = new Date();
    // If last completion was today, start check from today.
    // If last completion was yesterday, start check from yesterday.
    // If older, streak is 0.
    const lastDate = dates[dates.length - 1];

    if (lastDate === todayStr) {
      // Good, streak includes today
    } else if (lastDate === yesterdayStr && interval === "daily") {
      currentCheck.setDate(currentCheck.getDate() - 1); // Allow validation from yesterday
    } else {
      // Gap detected for daily?
      // For weekly/monthly, logic is looser.
      // Simplified: Just count consecutive entries in the array based on interval spacing?
      // Let's stick to a robust "Chain" check starting from the end of the array.
    }

    // NAIVE STREAK: Just count how many consecutive intervals exist at the end of the array
    // This is hard with varying gaps. 
    // ALTERNATIVE: Simpler "Current Streak" definition:
    // "How many times in a row have I done this recently?"
    // Let's use a "Gap Tolerance" based on interval.

    // WORKING REVERSE FROM MOST RECENT COMPLETION
    for (let i = dates.length - 1; i > 0; i--) {
      const curr = new Date(dates[i]);
      const prev = new Date(dates[i - 1]);
      const diffTime = Math.abs(curr.getTime() - prev.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let tolerance = 1;
      if (interval === "weekly") tolerance = 8;
      if (interval === "monthly") tolerance = 32;

      if (diffDays <= tolerance) {
        streak++;
      } else {
        break;
      }
    }
    if (dates.length > 0) streak++; // Count the first one
  }

  // 2. Calculate Missed (Expected vs Actual)
  // Expected = (Now - CreatedAt) / IntervalDays
  const diffTime = Math.abs(today.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let intervalDays = 1;
  if (interval === "weekly") intervalDays = 7;
  if (interval === "monthly") intervalDays = 30;
  if (interval === "quarterly") intervalDays = 90;
  if (interval === "yearly") intervalDays = 365;

  const expected = Math.floor(diffDays / intervalDays);
  // Ensure missed isn't negative if user over-achieved (e.g. checked in early)
  const missed = Math.max(0, expected - dates.length);

  return { streak, missed };
}
