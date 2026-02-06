"use client";

import React from "react";
import { CurrencyTicker } from "./CurrencyTicker";
import { Globe, ArrowRightLeft, ShieldCheck, Zap } from "lucide-react";

export function WiseCard() {
    return (
        <div className="bg-slate-900 text-white p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden group border border-slate-800 flex flex-col min-h-[600px] lg:min-h-full">
            {/* Dynamic Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#9FE870]/10 rounded-full -mr-48 -mt-48 blur-[100px] transition-opacity group-hover:opacity-100 opacity-40 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full -ml-32 -mb-32 blur-[80px] opacity-40" />

            {/* Creative Data Visual: Global Settlement Network */}
            <div className="absolute top-1/4 right-[10%] w-32 h-32 opacity-20 group-hover:opacity-40 transition-opacity duration-1000 hidden md:block">
                <div className="relative w-full h-full">
                    <div className="absolute inset-0 border-2 border-[#9FE870]/30 rounded-full animate-[spin_20s_linear_infinite]" />
                    <div className="absolute inset-4 border border-teal-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                    <div className="absolute top-0 left-1/2 -ml-1.5 w-3 h-3 bg-[#9FE870] rounded-full shadow-[0_0_10px_#9FE870]" />
                    <div className="absolute bottom-4 right-0 w-2 h-2 bg-teal-400 rounded-full shadow-[0_0_8px_#2dd4bf]" />
                </div>
            </div>

            <div className="relative z-10 flex flex-col h-full flex-grow">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="flex flex-col items-start gap-4">
                        <img
                            src="/images/payments/wise-logo.png"
                            alt="Wise Logo"
                            className="h-20 md:h-28 w-auto filter drop-shadow-[0_0_8px_rgba(159,232,112,0.2)]"
                        />
                        <div className="px-3 py-1 bg-[#9FE870]/10 border border-[#9FE870]/20 rounded-full">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9FE870] whitespace-nowrap">
                                Preferred Settlement Engine
                            </span>
                        </div>
                    </div>
                    <div className="hidden lg:flex flex-col items-end text-right">
                        <div className="flex items-center gap-2 text-slate-500 font-black uppercase tracking-widest text-[10px] mb-1">
                            <Zap size={10} className="text-[#9FE870]" />
                            <span>Real-Time Speed</span>
                        </div>
                        <div className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">
                            optimized for ACH / direct transfers
                        </div>
                    </div>
                </div>

                {/* Main Title & Description */}
                <div className="mb-10 max-w-2xl">
                    <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 leading-[0.95] italic">
                        Domestic & <br />
                        <span className="text-[#9FE870]">International</span> Settlement
                    </h3>
                    <p className="text-slate-400 font-medium text-base md:text-lg leading-relaxed">
                        Our high-performance engine for direct treasury transfers and cross-border settlements. Leveraging mid-market exchange rates and optimized routing for zero-margin value preservation.
                    </p>
                </div>

                {/* Feature Grid with Glass Badges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Superior Terms</span>
                        </div>
                        <ul className="text-sm md:text-base text-slate-200 space-y-3 font-bold italic">
                            <li className="flex items-center gap-3">
                                <ArrowRightLeft size={16} className="text-[#9FE870] shrink-0" />
                                <span>Zero-Margin Exchange Fee</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Globe size={16} className="text-[#9FE870] shrink-0" />
                                <span>Global Multi-Currency Rails</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <ShieldCheck size={16} className="text-[#9FE870] shrink-0" />
                                <span>Enterprise-Grade Security</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Strict Compliance</span>
                        </div>
                        <ul className="text-sm text-slate-500 space-y-2 font-medium">
                            <li>• Mandatory KYC Verification</li>
                            <li>• Direct B2B Settlements Only</li>
                            <li>• Institutional Transaction Monitoring</li>
                        </ul>
                    </div>
                </div>

                {/* Fee Alert - More Prominent */}
                <div className="p-6 bg-red-500/5 rounded-[1.5rem] border border-red-500/20 mb-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Zap size={40} className="text-red-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[.25em] text-red-500 mb-2">
                        ⚠️ Fee Optimization Warning
                    </p>
                    <p className="text-sm md:text-base text-slate-300 font-bold leading-snug italic">
                        Avoid 3.5%+ card processing fees—use <span className="text-red-400 underline decoration-red-500/40 underline-offset-4">ACH/Wire settlements</span> for all transactions exceeding $1,000 USD.
                    </p>
                </div>

                {/* Cards & Ticker Integration */}
                <div className="mt-auto space-y-8">
                    <div className="flex flex-col gap-4">
                        <div className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">Accepted Settlement Brands</div>
                        <div className="flex flex-wrap gap-6 items-center opacity-70 grayscale group-hover:grayscale-0 transition-all duration-500">
                            <img src="/images/payment-icons/visa.svg" alt="Visa" className="h-4 md:h-5 w-auto" />
                            <img src="/images/payment-icons/mastercard.svg" alt="Mastercard" className="h-6 md:h-7 w-auto" />
                            <img src="/images/payments/apple-pay-logo.jpg" alt="Apple Pay" className="h-6 md:h-8 w-auto rounded-sm" />
                        </div>
                    </div>

                    <div className="bg-slate-950/40 rounded-3xl p-4 border border-white/5">
                        <CurrencyTicker />
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                    <p className="text-[9px] text-red-400/40 font-black uppercase tracking-[0.3em] italic">
                        Strictly No Amex / Discover / PayPal per Compliance
                    </p>
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-1 h-1 rounded-full bg-slate-800" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
