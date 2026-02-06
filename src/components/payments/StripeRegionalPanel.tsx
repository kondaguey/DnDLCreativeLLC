"use client";

import React, { useState } from "react";

const paymentFamilies = [
    {
        id: "cards",
        name: "Cards",
        icon: "💳",
        methods: [
            { name: "Visa", region: "Global" },
            { name: "Mastercard", region: "Global" },
            { name: "American Express", region: "Global" },
            { name: "Discover", region: "Global" },
            { name: "Diners Club", region: "Global" },
            { name: "JCB", region: "Global" },
            { name: "UnionPay", region: "Global" },
            { name: "Cartes Bancaires", region: "France" },
            { name: "eftpos", region: "Australia" },
            { name: "South Korean Cards", region: "South Korea" },
            { name: "Interac", region: "Canada (In-person)", note: "Terminal Only" }
        ]
    },
    {
        id: "wallets",
        name: "Wallets",
        icon: "📱",
        methods: [
            { name: "Apple Pay", region: "Global" },
            { name: "Google Pay", region: "Global" },
            { name: "Cash App Pay", region: "US" },
            { name: "PayPal", region: "Global" },
            { name: "Alipay", region: "Global" },
            { name: "WeChat Pay", region: "Global" },
            { name: "Link", region: "Global" },
            { name: "GrabPay", region: "SE Asia" },
            { name: "Revolut Pay", region: "Global" },
            { name: "MobilePay", region: "Denmark/Finland" },
            { name: "Satispay", region: "Italy" },
            { name: "Kakao Pay", region: "South Korea" },
            { name: "Naver Pay", region: "South Korea" },
            { name: "Samsung Pay", region: "South Korea" },
            { name: "PayCo", region: "South Korea" }
        ]
    },
    {
        id: "bnpl",
        name: "BNPL",
        icon: "⏳",
        methods: [
            { name: "Affirm", region: "US/Canada" },
            { name: "Klarna", region: "Global" },
            { name: "Afterpay / Clearpay", region: "Global" },
            { name: "Zip", region: "Global" },
            { name: "Meses sin intereses", region: "Mexico" }
        ]
    },
    {
        id: "bank_debits",
        name: "Bank Debits",
        icon: "🏦",
        methods: [
            { name: "ACH Direct Debit", region: "US" },
            { name: "SEPA Direct Debit", region: "Europe" },
            { name: "Bacs Direct Debit", region: "UK" },
            { name: "AU BECS Direct Debit", region: "Australia" },
            { name: "NZ BECS Direct Debit", region: "New Zealand" },
            { name: "Canadian PADs", region: "Canada" },
            { name: "Instant Bank Payments", region: "Global" }
        ]
    },
    {
        id: "bank_redirects",
        name: "Redirects",
        icon: "🔗",
        methods: [
            { name: "iDEAL", region: "Netherlands" },
            { name: "Bancontact", region: "Belgium" },
            { name: "EPS", region: "Austria" },
            { name: "P24", region: "Poland" },
            { name: "BLIK", region: "Poland" },
            { name: "FPX", region: "Malaysia" },
            { name: "PayNow", region: "Singapore" },
            { name: "TWINT", region: "Switzerland" }
        ]
    },
    {
        id: "transfers",
        name: "Transfers/RT",
        icon: "⚡",
        methods: [
            { name: "US Bank Transfer", region: "US" },
            { name: "UK Bank Transfer", region: "UK" },
            { name: "SEPA Bank Transfer", region: "Europe" },
            { name: "JP Bank Transfer (Furikomi)", region: "Japan" },
            { name: "Mexico Bank Transfer", region: "Mexico" },
            { name: "Pix", region: "Brazil" },
            { name: "PromptPay", region: "Thailand" },
            { name: "PayTo", region: "Australia" }
        ]
    },
    {
        id: "vouchers",
        name: "Vouchers",
        icon: "🎟️",
        methods: [
            { name: "OXXO", region: "Mexico" },
            { name: "Konbini", region: "Japan" },
            { name: "Boleto", region: "Brazil" },
            { name: "Multibanco", region: "Portugal" }
        ]
    }
];

export function StripeRegionalPanel() {
    const [activeFamily, setActiveFamily] = useState("cards");

    const currentFamily = paymentFamilies.find(f => f.id === activeFamily);

    return (
        <div className="pt-4 border-t border-white/5 space-y-6">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 items-center">
                {paymentFamilies.map((family) => (
                    <button
                        key={family.id}
                        onClick={() => setActiveFamily(family.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${activeFamily === family.id
                            ? "bg-[#635BFF] border-[#635BFF] text-white shadow-lg shadow-[#635BFF]/30 scale-[1.05]"
                            : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                            }`}
                    >
                        <span className="text-sm">{family.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-wider">
                            {family.name}
                        </span>
                    </button>
                ))}
            </div>

            {/* Methods Grid */}
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 animate-fade-in transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-8xl select-none pointer-events-none">
                    {currentFamily?.icon}
                </div>

                <div className="relative z-10">
                    <div className="mb-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#635BFF] italic">
                            {currentFamily?.name} Support
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {currentFamily?.methods.map((method, idx) => (
                            <div
                                key={idx}
                                className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col justify-center hover:bg-white/10 transition-colors group/method"
                            >
                                <span className="text-[11px] text-slate-200 font-black uppercase tracking-tight mb-1 group-hover/method:text-white transition-colors">
                                    {method.name}
                                </span>
                                <div className="flex items-center justify-between">
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                        {method.region}
                                    </span>
                                    {"note" in method && (
                                        <span className="text-[7px] font-black text-[#635BFF] uppercase px-1.5 py-0.5 bg-[#635BFF]/10 rounded border border-[#635BFF]/20">
                                            {method.note as string}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <p className="text-[9px] text-slate-500 font-medium italic">
                        Stripe automatically optimizes conversion by presenting {currentFamily?.name.toLowerCase()} intelligently based on user locale.
                    </p>
                    <div className="px-2 py-1 bg-[#635BFF]/10 rounded-lg border border-[#635BFF]/20">
                        <span className="text-[8px] font-black text-[#635BFF] uppercase">
                            Global v3.0
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
