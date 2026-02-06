"use client";

import React from "react";

export function BillCard() {
    return (
        <div className="bg-[#1A0A00] text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden group border border-[#FF5722]/20 h-full flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5722]/20 rounded-full -mr-16 -mt-16 blur-2xl transition-opacity group-hover:opacity-100 opacity-50" />
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                    <img
                        src="/images/payments/bill-logo.png"
                        alt="BILL"
                        className="h-8 md:h-10 w-auto rounded-xl border border-white/10 hover:scale-105 transition-transform"
                    />
                    <span className="text-[8px] font-black text-slate-500 uppercase italic">
                        Built for Cost
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-4 flex-grow">
                    <div className="space-y-2">
                        <p className="text-[8px] font-black uppercase tracking-widest text-[#FF5722]">
                            The Pros
                        </p>
                        <ul className="text-[9px] text-slate-300 space-y-1 font-bold italic">
                            <li>• Lowest Flat-Fee ACH</li>
                            <li>• Direct B2B Portal</li>
                        </ul>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[8px] font-black uppercase tracking-widest text-red-400/60">
                            The Cons
                        </p>
                        <ul className="text-[9px] text-slate-500 space-y-1 font-medium">
                            <li>• Domestic (US) Only</li>
                            <li>• No Credit Card Support</li>
                        </ul>
                    </div>
                </div>
                <div className="pt-3 border-t border-white/5 text-[8px] font-black text-slate-500 uppercase">
                    Industrial Standard ACH
                </div>
            </div>
        </div>
    );
}
