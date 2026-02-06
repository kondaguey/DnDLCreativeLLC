"use client";

import React from "react";
import { StripeRegionalPanel } from "./StripeRegionalPanel";

export function StripeCard() {
    return (
        <div className="bg-[#0A2540] text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group border border-[#635BFF]/20">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#635BFF]/20 rounded-full -mr-24 -mt-24 blur-3xl transition-opacity group-hover:opacity-100 opacity-50" />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <img
                        src="/images/payments/stripe-logo.png"
                        alt="Stripe"
                        className="h-10 md:h-12 w-auto rounded-xl border border-white/10 hover:scale-105 transition-transform"
                    />
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">
                        Built for Access
                    </div>
                </div>
                <h4 className="text-xl font-black uppercase tracking-tight mb-4">
                    Omnichannel Checkout
                </h4>
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#635BFF]">
                            The Pros
                        </p>
                        <ul className="text-[10px] text-slate-300 space-y-1 font-bold italic">
                            <li>• Exhaustive Global Coverage</li>
                            <li>• 50+ Payment Families</li>
                            <li>• Advanced AI Fraud Filtering</li>
                        </ul>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-red-400/80">
                            The Cons
                        </p>
                        <ul className="text-[10px] text-slate-500 space-y-1 font-medium">
                            <li>• Standard Tx Fees</li>
                            <li>• Verification Overhead</li>
                        </ul>
                    </div>
                </div>

                <StripeRegionalPanel />
            </div>
        </div>
    );
}
