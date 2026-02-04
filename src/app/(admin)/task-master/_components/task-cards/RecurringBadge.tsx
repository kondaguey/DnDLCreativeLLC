import React from "react";
import { Repeat } from "lucide-react";
import CountdownTimer from "../widgets/CountdownTimer";

interface RecurringBadgeProps {
    recurrence: string;
    dueDate: string | null | undefined;
    isDoneToday: boolean;
}

export default function RecurringBadge({ recurrence, dueDate, isDoneToday }: RecurringBadgeProps) {
    if (!recurrence || recurrence === "one_off") return null;

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-mono flex items-center gap-1.5 px-2 py-1 rounded-md border ${isDoneToday ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-purple-500/20 bg-purple-500/10 text-purple-400"} uppercase tracking-wider`}>
                <Repeat size={12} /> {recurrence}
                {isDoneToday && <span className="ml-1 text-[8px] opacity-70">(Logged)</span>}
            </span>
            {dueDate && <CountdownTimer targetDate={dueDate} />}
        </div>
    );
}
