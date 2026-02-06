"use client";

import React from "react";

export const currencies = [
    { flag: "🇺🇸", name: "United States Dollar", symbol: "$", code: "USD" },
    { flag: "🇪🇺🇮🇹", name: "Euro", symbol: "€", code: "EUR" },
    { flag: "🇨🇦", name: "Canadian Dollar", symbol: "$", code: "CAD" },
    { flag: "🇬🇧", name: "British Pound Sterling", symbol: "£", code: "GBP" },
    { flag: "🇳🇿", name: "New Zealand Dollar", symbol: "$", code: "NZD" },
    { flag: "🇦🇺", name: "Australian Dollar", symbol: "$", code: "AUD" },
    { flag: "🇹🇼", name: "New Taiwan Dollar", symbol: "$", code: "TWD" },
    { flag: "🇰🇷", name: "South Korean Won", symbol: "₩", code: "KRW" },
    { flag: "🇯🇵", name: "Japanese Yen", symbol: "¥", code: "JPY" },
    { flag: "🇭🇰", name: "Hong Kong Dollar", symbol: "$", code: "HKD" },
    { flag: "🇨🇳", name: "Chinese Yuan", symbol: "¥", code: "CNY" },
    { flag: "🇵🇱", name: "Polish Złoty", symbol: "zł", code: "PLN" },
    { flag: "🇲🇽", name: "Mexican Peso", symbol: "$", code: "MXN" },
    { isLabel: true, text: "plus dozens more" }
];

export function CurrencyTicker() {
    return (
        <div className="p-5 bg-white/5 rounded-2xl border border-white/10 overflow-hidden relative group/ticker">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#9FE870] mb-3 italic">
                Worldwide Settlement Engine
            </p>
            {/* Added pr-8 to ensure the gap is accounted for in the 50% translate loop */}
            <div className="flex animate-ticker whitespace-nowrap gap-8 py-1 pr-8 w-max">
                {[...currencies, ...currencies].map((curr, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 shrink-0">
                        {"isLabel" in curr ? (
                            <span className="text-[11px] font-black uppercase tracking-widest text-[#9FE870] italic">
                                {curr.text}
                            </span>
                        ) : (
                            <>
                                <span className="text-lg">{(curr as any).flag}</span>
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">
                                    {(curr as any).name} {(curr as any).symbol}
                                </span>
                                <span className="text-[11px] font-black text-[#9FE870] opacity-80">
                                    ({(curr as any).code})
                                </span>
                            </>
                        )}
                    </div>
                ))}
            </div>
            <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-slate-900 to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-slate-900 to-transparent z-10" />
        </div>
    );
}
