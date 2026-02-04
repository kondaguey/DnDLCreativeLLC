"use client";

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface RecurrenceChartProps {
    items: any[];
    period?: "daily" | "weekly" | "monthly" | "quarterly";
}

export default function RecurrenceChart({ items, period = "daily" }: RecurrenceChartProps) {
    const data = useMemo(() => {
        // Aggregate completed dates
        const dateMap = new Map<string, number>();
        const now = new Date();
        const daysToShow = period === "daily" ? 14 : period === "weekly" ? 12 : 12; // Weeks or Months

        // Generate labels
        const labels: string[] = [];
        for (let i = daysToShow - 1; i >= 0; i--) {
            const d = new Date();
            if (period === "daily") d.setDate(d.getDate() - i);
            if (period === "weekly") d.setDate(d.getDate() - (i * 7));
            if (period === "monthly") d.setMonth(d.getMonth() - i);

            const key = d.toISOString().split("T")[0]; // Use full date as key base
            // Format key for display
            let displayKey = "";
            if (period === "daily") displayKey = d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
            if (period === "weekly") displayKey = `W${getWeekNumber(d)}`;
            if (period === "monthly") displayKey = d.toLocaleDateString(undefined, { month: 'short' });

            labels.push(displayKey);
            // Default 0
            dateMap.set(displayKey, 0);
        }

        // Fill data
        items.forEach(item => {
            const completions = item.metadata?.completed_dates || [];
            completions.forEach((dateStr: string) => {
                const d = new Date(dateStr);
                // Normalize to period bucket
                let key = "";
                if (period === "daily") key = d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
                if (period === "weekly") key = `W${getWeekNumber(d)}`;
                if (period === "monthly") key = d.toLocaleDateString(undefined, { month: 'short' });

                if (dateMap.has(key)) {
                    dateMap.set(key, (dateMap.get(key) || 0) + 1);
                }
            });
        });

        return Array.from(dateMap.entries()).map(([name, value]) => ({ name, value }));
    }, [items, period]);

    return (
        <div className="w-full h-[200px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="name"
                        stroke="#475569"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

function getWeekNumber(d: Date) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
}
