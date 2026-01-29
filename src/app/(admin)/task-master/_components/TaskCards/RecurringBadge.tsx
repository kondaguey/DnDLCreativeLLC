import React from "react";
import { Repeat } from "lucide-react";
import CountdownTimer from "../CountdownTimer";

interface RecurringBadgeProps {
    recurrence: string;
    dueDate: string | null | undefined;
    isDoneToday: boolean;
}

export default function RecurringBadge({ recurrence, dueDate, isDoneToday }: RecurringBadgeProps) {
    if (!recurrence || recurrence === "one_off") return null;

    if (isDoneToday && dueDate) {
        return <CountdownTimer targetDate={dueDate} />;
    }

    return (
        <span className="text-[10px] font-mono flex items-center gap-1.5 px-2 py-1 rounded-md border border-purple-500/20 bg-purple-500/10 text-purple-400 uppercase tracking-wider">
            <Repeat size={12} /> {recurrence}
        </span>
    );
}
