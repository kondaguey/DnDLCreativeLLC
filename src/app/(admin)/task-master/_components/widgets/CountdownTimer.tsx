"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
    targetDate: string; // ISO String or YYYY-MM-DD
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const calculateTimeLeft = () => {
            if (!targetDate) return "00:00:00:00";

            const now = new Date();
            let target: Date;

            // We want to target the END of the day for whatever date is provided
            // This prevents the "00:00:00" issue when a task is created for "today"
            // We split by T or space to handle ISO strings or full date strings safely 
            const datePart = targetDate.includes("T") ? targetDate.split("T")[0] : targetDate.split(" ")[0];
            const parts = datePart.split("-");

            if (parts.length === 3) {
                const [y, m, d] = parts.map(Number);
                target = new Date(y, m - 1, d, 23, 59, 59, 999);
            } else {
                target = new Date(targetDate);
                if (isNaN(target.getTime())) return "00:00:00:00";
                target.setHours(23, 59, 59, 999);
            }

            const diff = target.getTime() - now.getTime();

            if (diff <= 0 || isNaN(diff)) {
                return "00:00:00:00";
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            const pad = (n: number) => String(n).padStart(2, '0');
            return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <div className="flex items-center gap-1.5 text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/20">
            <Clock size={12} className="animate-pulse" />
            <span>{timeLeft}</span>
        </div>
    );
}
