"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
    targetDate: string; // ISO String or YYYY-MM-DD
    variant?: "gray" | "green";
    label?: string;
}

export default function CountdownTimer({ targetDate, variant = "gray", label }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const calculateTimeLeft = () => {
            if (!targetDate) return "00:00:00:00";

            const now = new Date();
            let target: Date;

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
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    const isGreen = variant === "green";
    const colors = isGreen
        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
        : "text-slate-400 bg-slate-500/10 border-white/5";

    return (
        <div className={`flex items-center gap-1.5 text-[10px] font-mono tabular-nums ${colors} px-2 py-1 rounded-lg border backdrop-blur-sm`}>
            {label && <span className="opacity-50 uppercase tracking-tighter mr-1">{label}</span>}
            <Clock size={10} className={`${(isGreen || label === "Upcoming") ? "animate-none" : "animate-pulse"}`} />
            <span>{timeLeft}</span>
        </div>
    );
}
