"use client";

import React from "react";

export function PaypalCard() {
    return (
        <div className="bg-[#00457C] text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden group border border-[#0079C1]/30 h-full flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0079C1]/30 rounded-full -mr-16 -mt-16 blur-2xl transition-opacity group-hover:opacity-100 opacity-50" />
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                    <a
                        href="/digital-wallet/ways-to-pay/add-payment-method"
                        title="How PayPal Works"
                        onClick={(e) => {
                            e.preventDefault();
                            window.open(
                                "/digital-wallet/ways-to-pay/add-payment-method",
                                "WIPaypal",
                                "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=1060, height=700",
                            );
                        }}
                        className="block hover:scale-105 transition-transform"
                    >
                        <img
                            src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_74x46.jpg"
                            alt="PayPal Logo"
                            className="h-6 md:h-8 w-auto rounded"
                        />
                    </a>
                    <span className="text-[8px] font-black text-slate-400 uppercase italic">
                        Built for Convenience
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-4 flex-grow">
                    <div className="space-y-2">
                        <p className="text-[8px] font-black uppercase tracking-widest text-[#0079C1]">
                            The Pros
                        </p>
                        <ul className="text-[9px] text-slate-300 space-y-1 font-bold italic">
                            <li>• One-Click Checkout</li>
                            <li>• Trusted Buyer Protection</li>
                        </ul>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[8px] font-black uppercase tracking-widest text-red-400/60">
                            The Cons
                        </p>
                        <ul className="text-[9px] text-slate-500 space-y-1 font-medium">
                            <li>• Premium Transaction Fees</li>
                            <li>• Potential Asset Holds</li>
                        </ul>
                    </div>
                </div>
                <div className="pt-3 border-t border-white/5 text-[8px] font-black text-slate-500 uppercase">
                    Legacy Consumer Trust
                </div>
            </div>
        </div>
    );
}
