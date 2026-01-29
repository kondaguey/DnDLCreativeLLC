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
            const now = new Date();
            const target = new Date(targetDate);

            // If target is just a date (YYYY-MM-DD), assume midnight of that date?
            // Or if it's "Next Available", it might be midnight tomorrow.
            // Let's assume targetDate is the *start* of the next active period.
            // If targetDate has no time, set it to midnight local time?
            if (targetDate.length === 10) {
                target.setHours(0, 0, 0, 0);
            }

            const diff = target.getTime() - now.getTime();

            if (diff <= 0) {
                return "READY";
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 0) {
                return `${days}d ${hours}h ${minutes}m`;
            }
            return `${hours}h ${minutes}m ${seconds}s`;
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
