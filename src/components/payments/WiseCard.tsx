"use client";

import React from "react";
import { CurrencyTicker } from "./CurrencyTicker";

export function WiseCard() {
    return (
        <div className="bg-slate-900 text-white p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden group border border-slate-800">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#9FE870]/10 rounded-full -mr-32 -mt-32 blur-3xl transition-opacity group-hover:opacity-100 opacity-50" />
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                    <img
                        src="/images/payments/wise-logo.png"
                        alt="Wise Logo"
                        className="h-20 md:h-24 w-auto"
                    />
                    <div className="pl-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">
                        Preferred for ACH / Direct Transfers
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">
                        Domestic & International Settlement
                    </h3>
                    <p className="text-slate-400 font-medium text-sm leading-relaxed">
                        Our primary engine for high-value direct transfers and international business settlements. Optimized for zero-margin exchange rates and fast ACH routing.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#9FE870]">
                            The Pros
                        </p>
                        <ul className="text-[11px] text-slate-300 space-y-1 font-bold italic">
                            <li>• Lowest possible fees</li>
                            <li>• Real-time exchange rates</li>
                            <li>• Efficient ACH routing</li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-widest text-red-500">
                                The Cons
                            </p>
                            <ul className="text-[11px] text-slate-500 space-y-1 font-medium">
                                <li>• Strict KYC requirements</li>
                                <li>• No Amex/Discover/PayPal</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Extreme Fee Warning */}
                <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/20 mb-6">
                    <p className="text-[9px] font-black uppercase tracking-widest text-red-400 mb-1">
                        Fee Warning
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold leading-tight italic">
                        Extreme Credit Card Processing Fees (3.5%+) —{" "}
                        <span className="text-red-400 font-black">ACH Highly Recommended</span> for all settlements over $1k.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-wrap gap-4 items-center">
                        <img src="/images/payment-icons/visa.svg" alt="Visa" className="h-4 md:h-6 w-auto" />
                        <img src="/images/payment-icons/mastercard.svg" alt="Mastercard" className="h-6 md:h-8 w-auto" />
                        <img src="/images/payments/apple-pay-logo.jpg" alt="Apple Pay" className="h-6 md:h-10 w-auto rounded-sm" />
                    </div>

                    <CurrencyTicker />
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                    <p className="text-[9px] text-red-400/60 font-black uppercase tracking-widest italic leading-tight">
                        Strictly No Amex / No Discover / No PayPal per Compliance
                    </p>
                </div>
            </div>
        </div>
    );
}
