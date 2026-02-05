import React from "react";
import { Repeat } from "lucide-react";
import CountdownTimer from "../widgets/CountdownTimer";
import { getPrevCycleDeadline } from "../utils/dateUtils";

interface RecurringBadgeProps {
    recurrence: string;
    dueDate: string | null | undefined;
    isSatisfied: boolean;
}

export default function RecurringBadge({ recurrence, dueDate, isSatisfied }: RecurringBadgeProps) {
    if (!recurrence || recurrence === "one_off") return null;

    // If satisfied, the passed dueDate is actually the NEXT deadline
    const currentDeadline = isSatisfied ? getPrevCycleDeadline(dueDate || null, recurrence) : dueDate;
    const nextDeadline = isSatisfied ? dueDate : null;

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-mono flex items-center gap-1.5 px-3 py-1 rounded-lg border backdrop-blur-sm transition-all duration-500 ${isSatisfied ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-white/5 bg-white/5 text-slate-400"} uppercase tracking-wider`}>
                <Repeat size={12} /> {recurrence}
                {isSatisfied && <span className="ml-1 text-[8px] opacity-70 font-black">(Satisfied)</span>}
            </span>

            {currentDeadline && (
                <CountdownTimer
                    targetDate={currentDeadline}
                    variant={isSatisfied ? "green" : "gray"}
                    label={isSatisfied ? "Claimed" : "Period"}
                />
            )}

            {isSatisfied && nextDeadline && (
                <CountdownTimer
                    targetDate={nextDeadline}
                    variant="gray"
                    label="Upcoming"
                />
            )}
        </div>
    );
}
