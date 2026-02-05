"use client";

import { useState } from "react";
import {
  Clapperboard,
  BookOpen,
  TrendingUp,
  Mic2,
  ShieldCheck,
  CreditCard,
  Truck,
  Mail,
  MapPin,
  Scale,
  Globe,
  Activity,
  Phone,
  ArrowUpRight,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// --- Components ---

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-12 text-center">
      <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function BrandCard({
  icon,
  logo,
  name,
  desc,
  url,
  variant = "default"
}: {
  icon?: React.ReactNode;
  logo?: string;
  name: string;
  desc: string;
  url?: string;
  variant?: "default" | "daniel" | "dineout" | "steel" | "cine" | "anti";
}) {
  const styles = {
    default: "bg-white border-slate-100 shadow-slate-200/50 text-slate-900",
    // Daniel Lewis - Teal/Tan from dndl-new-website/globals.css
    daniel: "bg-gradient-to-br from-[#0d9488]/10 to-[#d4a373]/10 border-[#0d9488]/30 shadow-[#0d9488]/10 text-slate-900",
    // Dine Out - Sriracha Red from dine-out-digital/globals.css
    dineout: "bg-gradient-to-br from-[#E31837]/5 to-[#ff6b6b]/5 border-[#E31837]/20 shadow-[#E31837]/10 text-slate-900",
    // Anti-Marketing - Industrial Cyan/Charcoal (raw, uncensored, electric)
    steel: "bg-gradient-to-br from-[#212529] to-[#2b2d42] border-[#00F0FF]/30 shadow-[#00F0FF]/20 text-white",
    // CineSonic - Gold/Deep Space from cinesonic-website-webapp/globals.css
    cine: "bg-gradient-to-br from-[#020010] to-[#0c0442] border-[#D4AF37]/30 shadow-[#D4AF37]/20 text-white",
    anti: "bg-white border-black border-[3px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black font-black",
  };

  const iconStyles = {
    default: "bg-transparent text-white shadow-none",
    daniel: "bg-transparent text-white shadow-none",
    dineout: "bg-transparent text-white shadow-none",
    steel: "bg-transparent text-white shadow-none",
    cine: "bg-transparent text-white shadow-none",
    anti: "bg-transparent text-white shadow-none",
  };

  const content = (
    <>
      <div className={`${iconStyles[variant]} ${variant === 'cine' || variant === 'steel' ? 'w-28 h-28 md:w-40 md:h-40 p-0' : 'w-16 h-16 md:w-20 md:h-20 p-3'} rounded-2xl flex items-center justify-center mb-6 z-10 transition-transform group-hover:scale-110 overflow-hidden shadow-lg`}>
        {logo ? (
          <Image
            src={logo}
            alt={`${name} logo`}
            width={200}
            height={200}
            className="w-full h-full object-contain"
          />
        ) : (
          icon
        )}
      </div>
      <h3 className="text-lg md:text-xl font-black uppercase tracking-tight mb-3 italic z-10 flex items-center gap-2 justify-center">
        {name}
        {url && <ArrowUpRight size={18} className="md:size-[20px] opacity-60 group-hover:opacity-100 transition-opacity" />}
      </h3>
      <p className={`${variant === 'daniel' || variant === 'cine' || variant === 'steel' ? 'text-slate-400' : 'text-slate-500'} text-sm md:text-base font-medium leading-relaxed z-10`}>
        {desc}
      </p>
    </>
  );

  if (url) {
    return (
      <Link href={url} className={`${styles[variant]} p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border h-full hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group block`}>
        {content}
      </Link>
    );
  }

  return (
    <div className={`${styles[variant]} p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border h-full hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group`}>
      {content}
    </div>
  );
}

function PolicyCard({ icon, title, content }: { icon: React.ReactNode; title: string; content: React.ReactNode }) {
  return (
    <div className="bg-slate-50/50 p-6 md:p-8 rounded-[2rem] md:rounded-3xl border border-slate-200/60 h-full">
      <div className="flex items-center gap-4 mb-6 text-slate-900">
        <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 italic">
          {icon}
        </div>
        <h3 className="font-black uppercase tracking-wider text-xs md:text-sm">{title}</h3>
      </div>
      <div className="text-slate-600 text-[13px] md:text-sm leading-relaxed space-y-4 font-medium">
        {content}
      </div>
    </div>
  );
}

export default function Page() {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.toLocaleString('default', { month: 'long' });
  const day = now.getDate();

  return (
    <div className="min-h-screen bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-12 md:pt-40 md:pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-teal-50 rounded-full blur-[80px] md:blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-50 rounded-full blur-[80px] md:blur-[120px] opacity-60" />
        </div>

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-8 md:mb-10 animate-fade-in shadow-xl shadow-slate-900/10">
            Official Corporate Headquarters
          </div>
          <h1 className="h1-wave mb-6 md:mb-8 block w-full text-4xl md:text-7xl">DnDL Creative LLC</h1>
          <p className="text-slate-500 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed font-medium px-4 md:px-0">
            Innovative creative production house specializing in <br className="hidden md:block" />
            audiobooks, audio/film entertainment, and digital marketing.
          </p>
        </div>
      </section>

      {/* 2. DIVISIONS GRID */}
      <section className="py-20 px-6 bg-slate-50/30">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="Our Divisions" subtitle="Managed under the umbrella of DnDL Creative LLC, these specialized units deliver world-class creative services." />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 1. Daniel Lewis */}
            <BrandCard
              variant="daniel"
              logo="/images/brands/daniel-not-day-lewis-logo.png"
              url="https://danielnotdaylewis.com"
              name="Daniel (not Day) Lewis"
              desc="The personal brand and creative home of Daniel Lewis. This division represents Daniel's professional performance services—audiobook narration, voice-over production, and acting—alongside the personal content and creative life behind the craft. Marketed as a personal brand; contracted and operated under DnDL Creative LLC."
            />

            {/* 2. Anti-Marketing */}
            <div className="lg:order-2">
              <BrandCard
                variant="steel"
                logo="/images/brands/anti-logo.png"
                url="https://anti-marketingmarketing.com"
                name="Anti-Marketing Marketing"
                desc="Going against the grain. We blend battle-tested traditional marketing with emerging AI-driven strategies—SEO, AEO, GEO, and social—while keeping a raw, uncensored edge. No fluff, no corporate speak. Marketed as a DBA of DnDL Creative LLC."
              />
            </div>

            {/* 4. Dine Out Digital with bridge - MOVED HERE for mobile connection */}
            <div className="flex flex-col items-center lg:order-5">
              <div className="flex flex-col items-center">
                <div className="w-[1.5px] h-6 md:h-8 bg-gradient-to-b from-slate-200 to-teal-500" />
                <div className="px-2 md:px-3 py-1 bg-white border border-teal-200 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest text-teal-600 -mt-1 -mb-1 z-10 shadow-sm italic">
                  Marketed as a Division
                </div>
                <div className="w-[1.5px] h-6 md:h-8 bg-gradient-to-b from-teal-500 to-slate-200" />
              </div>

              <div className="w-full">
                <BrandCard
                  variant="dineout"
                  logo="/images/brands/dine-out-logo.png"
                  url="https://dineoutdigital.com"
                  name="Dine Out Digital"
                  desc="Specialized restaurant marketing and tech solutions—from SEO and social to custom apps and operational tools. Marketed as a division of Anti-Marketing Marketing. (DBA of DnDL Creative LLC)"
                />
              </div>
            </div>

            {/* 3. CineSonic */}
            <div className="lg:order-3">
              <BrandCard
                variant="cine"
                logo="/images/brands/cinesonic-official.png"
                url="https://cinesonicproductions.com"
                name="CineSonic Productions"
                desc="A full-service audiobook and audio drama production house. Featuring in-house originals, proprietary audio-based language learning, a creator academy, and merch shop—with plans to expand into EU and Asian markets. Marketed as a DBA of DnDL Creative LLC."
              />
            </div>

            {/* Spacer for alignment */}
            <div className="hidden lg:block lg:order-4" />
            <div className="hidden lg:block lg:order-6" />
          </div>
        </div>
      </section>

      {/* 3. BUSINESS DISCLOSURES (Wise Requirements) */}
      <section className="py-24 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="Corporate Compliance" subtitle="Business and payment information providing transparency for our clients and partners." />

          {/* US Business Confirmation - Premium Polished Centerpiece - MOVED ABOVE PAYMENTS */}
          <div className="mb-16">
            <div className="bg-[#12294B] text-white p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] shadow-[0_20px_60px_rgba(18,41,75,0.4)] relative overflow-hidden text-center max-w-4xl mx-auto border border-white/10 group">
              {/* Ohio Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#8C1D24] via-[#12294B] to-[#0A1629]" />

              {/* Subtle Flag BG Pattern */}
              <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none">
                <img src="/images/ohio-flag.webp" alt="" className="w-full h-full object-cover scale-150 rotate-12" />
              </div>

              <div className="absolute -top-24 -right-24 w-80 h-80 bg-red-600/10 rounded-full blur-3xl group-hover:opacity-100 opacity-60 transition-opacity" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-8 md:mb-12">
                  <a
                    href="https://businesssearch.ohiosos.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group/flag block cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl group-hover/flag:bg-white/40 transition-colors animate-pulse" />
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white/30 relative z-10 shadow-[0_0_40px_rgba(255,255,255,0.2)] group-hover/flag:scale-110 transition-transform duration-700 overflow-hidden bg-white/10 p-3 md:p-4 flex items-center justify-center backdrop-blur-md">
                      <img
                        src="/images/ohio-flag.webp"
                        alt="Ohio State Flag"
                        className="w-full h-full object-contain hover:rotate-6 transition-transform duration-500"
                      />
                    </div>
                  </a>
                  <div className="h-16 w-px bg-white/10 hidden md:block" />
                  <div className="flex flex-col items-center md:items-start translate-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/20 rounded-full border border-red-500/30 mb-3 backdrop-blur-sm">
                      <ShieldCheck size={12} className="text-red-400" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-100">Verified Jurisdiction</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none text-white italic tracking-[-0.04em]">Ohio licensed entity</h3>
                  </div>
                </div>

                <h3 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-8 leading-none tracking-[-0.06em]">Official US-Based Business</h3>

                <p className="text-white/90 text-sm md:text-xl font-medium leading-relaxed max-w-3xl mx-auto mb-10">
                  DnDL Creative LLC is a <span className="text-white font-black underline decoration-red-600/50 underline-offset-4">USA-based</span> and <span className="text-white font-black underline decoration-red-600/50 underline-offset-4">Ohio-verified</span> business. Our corporate infrastructure is fully documented with a registered <span className="text-red-400 font-bold italic">EIN</span>, formal <span className="text-red-400 font-bold italic">Articles of Organization</span>, and active <span className="text-red-400 font-bold italic">Ohio Registered Agents</span>. All governance is managed via our <span className="text-red-400 font-black italic">Cincinnati, Ohio</span> headquarters.
                </p>

                <div className="mt-4 pt-10 border-t border-white/10 w-full flex flex-col md:flex-row items-center justify-between gap-8 px-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-600/10 rounded-2xl border border-red-500/20">
                      <MapPin className="text-red-500" size={24} />
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Headquarters</span>
                      <span className="text-sm font-black text-white italic">Cincinnati, OH (US HQ)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-[11px] font-black uppercase tracking-[0.5em] text-white/30">Established 2026</div>
                    <div className="flex gap-2 items-center">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-red-500/40" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible Payment Details */}
          <div className="mb-20">
            <button
              onClick={() => setIsPaymentOpen(!isPaymentOpen)}
              className="w-full flex items-center justify-between p-5 md:p-8 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-[1.5rem] md:rounded-[2.5rem] transition-all duration-300 group shadow-sm text-center md:text-left"
            >
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
                <div className="p-3 md:p-4 bg-white rounded-xl md:rounded-2xl shadow-md border border-slate-100 group-hover:scale-110 transition-transform">
                  <CreditCard size={24} className="md:size-[28px] text-slate-800" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 italic">Payment Options & Policies</h3>
                  <p className="text-xs md:text-sm text-slate-500 font-medium">Click to view accepted methods, global currencies, and security protocols</p>
                </div>
              </div>
              <div className={`p-2 rounded-full bg-white border border-slate-200 transition-transform duration-500 hidden md:block ${isPaymentOpen ? 'rotate-180 bg-slate-200' : ''}`}>
                <ChevronDown size={20} className="text-slate-600" />
              </div>
            </button>

            {/* Collapsible Content */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isPaymentOpen ? 'max-h-[5000px] opacity-100 mt-12' : 'max-h-0 opacity-0'}`}>
              {!isPolicyAccepted ? (
                /* Click to Accept Gateway (Wise Requirement #4) */
                <div className="mb-16 bg-slate-50 border-2 border-indigo-100 rounded-[2.5rem] p-8 md:p-12 text-center shadow-xl shadow-indigo-500/5 ring-4 ring-white">
                  <div className="max-w-2xl mx-auto">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/20">
                      <ShieldCheck size={32} className="text-white" />
                    </div>
                    <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900 mb-4 italic">Policy & Compliance Gateway</h4>
                    <p className="text-slate-600 text-sm md:text-lg font-medium mb-8 leading-relaxed">
                      To view our payment instructions and global settlement details, you must first acknowledge our corporate policies. This ensures full transparency regarding refunds, data privacy, and delivery terms.
                    </p>
                    <button
                      onClick={() => setIsPolicyAccepted(true)}
                      className="bg-indigo-600 text-white px-8 md:px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-indigo-600/30 flex items-center gap-3 mx-auto"
                    >
                      I Accept Terms & Refund Policy
                      <ArrowUpRight size={20} />
                    </button>
                    <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-6 opacity-60">
                      <Link href="/legal/terms" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 underline">Terms of Service</Link>
                      <Link href="/legal/refunds-and-delivery" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 underline">Refund Policy</Link>
                      <Link href="/legal/privacy" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 underline">Privacy Policy</Link>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Security & Capability Disclosure */}
                  <div className="mb-8 md:mb-16 p-6 md:p-8 bg-blue-50/50 border border-blue-100 rounded-[2rem] md:rounded-[2.5rem]">
                    <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 md: gap-6">
                      <div className="p-3 bg-white rounded-2xl shadow-sm border border-blue-200 shrink-0">
                        <ShieldCheck size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black uppercase tracking-tight text-slate-900 mb-2">Security Capability & Data Policy</h4>
                        <p className="text-slate-600 text-sm font-medium leading-relaxed">
                          DnDL Creative LLC employs industry-leading security practices. All transmission of sensitive buyer information is conducted via Transport Layer Security (TLS) and handled exclusively by our PCI-DSS Level 1 compliant partners. We do not store or process raw credit card data on our infrastructure.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                    {/* 1. WISE - THE ACH PREFERRED SETTLEMENT */}
                    <div className="bg-slate-900 text-white p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden group border border-slate-800">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-[#9FE870]/10 rounded-full -mr-32 -mt-32 blur-3xl transition-opacity group-hover:opacity-100 opacity-50" />
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-8">
                          <img src="/images/payment-icons/wise.svg" alt="Wise Logo" className="h-6 md:h-8 w-auto filter brightness-0 invert" onError={(e) => { e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Wise_logo.svg'; }} />
                          <div className="pl-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Preferred for ACH / Direct Transfers</div>
                        </div>

                        <div className="mb-6">
                          {/* Extreme USD Default Visual */}
                          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-6 backdrop-blur-md relative overflow-hidden group/flag">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-white/5 to-blue-600/10 animate-pulse" />
                            <span className="text-lg relative z-10 leading-none">🇺🇸</span>
                            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-white relative z-10 italic">USD Default Currency ($)</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse relative z-10" />
                          </div>

                          <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Domestic & International Settlement</h3>
                          <p className="text-slate-400 font-medium text-sm leading-relaxed">
                            Our primary engine for high-value direct transfers and international business settlements. Optimized for zero-margin exchange rates and fast ACH routing.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#9FE870]">The Pros</p>
                            <ul className="text-[11px] text-slate-300 space-y-1 font-bold italic">
                              <li>• Lowest possible fees</li>
                              <li>• Real-time exchange rates</li>
                              <li>• Efficient ACH routing</li>
                            </ul>
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <p className="text-[9px] font-black uppercase tracking-widest text-red-500">The Cons</p>
                              <ul className="text-[11px] text-slate-500 space-y-1 font-medium">
                                <li>• Strict KYC requirements</li>
                                <li>• No Amex/Discover/PayPal</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Extreme Fee Warning */}
                        <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/20 mb-6">
                          <p className="text-[9px] font-black uppercase tracking-widest text-red-400 mb-1">Fee Warning</p>
                          <p className="text-[10px] text-slate-400 font-bold leading-tight italic">
                            Extreme Credit Card Processing Fees (3.5%+) — <span className="text-red-400 font-black">ACH Highly Recommended</span> for all settlements over $1k.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-4 items-center">
                            <img src="/images/payment-icons/visa.svg" alt="Visa" className="h-4 md:h-6 w-auto" />
                            <img src="/images/payment-icons/mastercard.svg" alt="Mastercard" className="h-6 md:h-8 w-auto" />
                            <div className="px-3 py-1.5 bg-black text-white rounded-lg text-[10px] font-black border border-white/10 uppercase">Apple Pay</div>
                          </div>

                          <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 italic">Global Currency Capability</p>
                            <p className="text-sm text-slate-200 font-bold tracking-tight leading-relaxed">
                              🇨🇦 CAD, 🇪🇺 EUR, 🇹🇼 TWD, 🇰🇷 KRW, 🇵🇱 PLN, 🇯🇵 JPY, 🇨🇳 CNY, 🇭🇰 HKD, and 10+ other global settlements.
                            </p>
                          </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                          <p className="text-[9px] text-red-400/60 font-black uppercase tracking-widest italic leading-tight">
                            Strictly No Amex / No Discover / No PayPal per Compliance
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 2. SECONDARY PAYMENT PROCESSORS */}
                    <div className="grid grid-cols-1 gap-6">
                      {/* Stripe - Purple themed dark card */}
                      <div className="bg-[#0A2540] text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group border border-[#635BFF]/20">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#635BFF]/20 rounded-full -mr-24 -mt-24 blur-3xl transition-opacity group-hover:opacity-100 opacity-50" />
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-6">
                            <div className="px-4 py-1.5 bg-[#635BFF] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#635BFF]/20">Stripe</div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">Built for Access</div>
                          </div>
                          <h4 className="text-xl font-black uppercase tracking-tight mb-4">Omnichannel Checkout</h4>
                          <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="space-y-2">
                              <p className="text-[9px] font-black uppercase tracking-widest text-[#635BFF]">The Pros</p>
                              <ul className="text-[10px] text-slate-300 space-y-1 font-bold italic">
                                <li>• Accepts Amex & Discover</li>
                                <li>• Fast Digital Wallet Pay</li>
                                <li>• Global Card Coverage</li>
                              </ul>
                            </div>
                            <div className="space-y-2">
                              <p className="text-[9px] font-black uppercase tracking-widest text-red-400/80">The Cons</p>
                              <ul className="text-[10px] text-slate-500 space-y-1 font-medium">
                                <li>• Standard Tx Fees</li>
                                <li>• Verification Overhead</li>
                              </ul>
                            </div>
                          </div>
                          <p className="text-slate-400 text-xs font-medium leading-relaxed">Full network processing including support for premium corporate credit cards.</p>
                        </div>
                      </div>

                      {/* BILL + PayPal Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* BILL - Orange themed dark card */}
                        <div className="bg-[#1A0A00] text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden group border border-[#FF5722]/20 h-full flex flex-col">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5722]/20 rounded-full -mr-16 -mt-16 blur-2xl transition-opacity group-hover:opacity-100 opacity-50" />
                          <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-4">
                              <div className="inline-flex px-3 py-1 bg-[#FF5722] text-white rounded-xl font-black text-[9px] uppercase tracking-widest">BILL</div>
                              <span className="text-[8px] font-black text-slate-500 uppercase italic">Built for Cost</span>
                            </div>

                            <div className="grid grid-cols-1 gap-4 mb-4 flex-grow">
                              <div className="space-y-2">
                                <p className="text-[8px] font-black uppercase tracking-widest text-[#FF5722]">The Pros</p>
                                <ul className="text-[9px] text-slate-300 space-y-1 font-bold italic">
                                  <li>• Lowest Flat-Fee ACH</li>
                                  <li>• Direct B2B Portal</li>
                                </ul>
                              </div>
                              <div className="space-y-2">
                                <p className="text-[8px] font-black uppercase tracking-widest text-red-400/60">The Cons</p>
                                <ul className="text-[9px] text-slate-500 space-y-1 font-medium">
                                  <li>• Domestic (US) Only</li>
                                  <li>• No Credit Card Support</li>
                                </ul>
                              </div>
                            </div>
                            <div className="pt-3 border-t border-white/5 text-[8px] font-black text-slate-500 uppercase">Industrial Standard ACH</div>
                          </div>
                        </div>

                        {/* PayPal - Blue themed dark card */}
                        <div className="bg-[#00457C] text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden group border border-[#0079C1]/30 h-full flex flex-col">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0079C1]/30 rounded-full -mr-16 -mt-16 blur-2xl transition-opacity group-hover:opacity-100 opacity-50" />
                          <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-4">
                              <div className="inline-flex px-3 py-1 bg-[#0079C1] text-white rounded-xl font-black text-[9px] uppercase tracking-widest">PayPal</div>
                              <span className="text-[8px] font-black text-slate-400 uppercase italic">Built for Convenience</span>
                            </div>

                            <div className="grid grid-cols-1 gap-4 mb-4 flex-grow">
                              <div className="space-y-2">
                                <p className="text-[8px] font-black uppercase tracking-widest text-[#0079C1]">The Pros</p>
                                <ul className="text-[9px] text-slate-300 space-y-1 font-bold italic">
                                  <li>• One-Click Checkout</li>
                                  <li>• Trusted Buyer Protection</li>
                                </ul>
                              </div>
                              <div className="space-y-2">
                                <p className="text-[8px] font-black uppercase tracking-widest text-red-400/60">The Cons</p>
                                <ul className="text-[9px] text-slate-500 space-y-1 font-medium">
                                  <li>• Premium Transaction Fees</li>
                                  <li>• Potential Asset Holds</li>
                                </ul>
                              </div>
                            </div>
                            <div className="pt-3 border-t border-white/5 text-[8px] font-black text-slate-500 uppercase">Legacy Consumer Trust</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Legal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/legal/refunds-and-delivery">
              <PolicyCard
                icon={<Truck size={18} />}
                title="Delivery Policy"
                content={
                  <>
                    <p>All services provided by DnDL Creative LLC are delivered digitally unless explicitly stated otherwise in a physical contract.</p>
                    <p>Assets (Audio/Video/Code) are delivered via encrypted cloud links or direct repository access within established project timelines.</p>
                  </>
                }
              />
            </Link>
            <Link href="/legal/refunds-and-delivery">
              <PolicyCard
                icon={<ShieldCheck size={18} />}
                title="Refund & Cancellation"
                content={
                  <>
                    <p>Policies are dependent upon specific terms defined in your <strong>DBA contract</strong>. In general, non-refundable deposits are required to secure production time.</p>
                    <p>Partial refunds may be issued depending on project stage and circumstances. Full refunds are reserved for extremely rare exceptions at corporate discretion.</p>
                  </>
                }
              />
            </Link>
            <Link href="/legal/privacy">
              <PolicyCard
                icon={<Scale size={18} />}
                title="Privacy & Data"
                content={
                  <>
                    <p>We do not sell your personal or business data. We use industry-standard <strong>Transport Layer Security (TLS)</strong> encryption to protect all client sensitive information.</p>
                    <p>Payment card data is never stored on our servers; it is handled exclusively by PCI-compliant payment gateways.</p>
                  </>
                }
              />
            </Link>
            <PolicyCard
              icon={<Globe size={18} />}
              title="Global Standards & Ethics"
              content={
                <>
                  <p>DnDL Creative LLC is committed to global digital ethics, maintaining full compliance with <strong>GDPR</strong> (Data Protection) and the <strong>CAN-SPAM Act</strong>.</p>
                  <p>We ensure all international service delivery meets the highest standards of commercial transparency and cross-border regulatory integrity.</p>
                </>
              }
            />
          </div>

          {/* Audit Compliance Verification Segment (滿足 Wise 的 "click to accept" 要求) */}
          <div className="mt-12 md:mt-16 bg-slate-50 border-2 border-slate-200 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-12 text-center">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-900 mb-4 italic">Corporate Audit Compliance Verification</h3>
              <p className="text-slate-600 text-sm md:text-base font-medium mb-8 leading-relaxed">
                To ensure full transparency and security during the payment process, all clients are required to acknowledge our trade policies. By initiating a payment request, you are confirming acceptance of our <Link href="/legal/terms" className="text-indigo-600 underline">Terms of Service</Link>, <Link href="/legal/refunds-and-delivery" className="text-indigo-600 underline">Refund Policy</Link>, and <Link href="/legal/privacy" className="text-indigo-600 underline">Privacy Policy</Link>.
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                  <div className="w-4 h-4 rounded bg-indigo-600 flex items-center justify-center">
                    <ShieldCheck size={10} className="text-white" />
                  </div>
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-indigo-900 italic">Audit Secure</span>
                </div>
                <div className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] leading-tight">Transaction Verified by Wise, Stripe, PayPal, and bill.com</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER / CONTACT INFO */}
      <footer className="bg-slate-900 text-white py-16 md:py-20 px-6 text-center md:text-left">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-12">
          <div className="max-w-sm flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">DnDL Creative LLC</h3>
            <p className="text-slate-400 font-medium text-sm leading-relaxed mb-6 md:mb-10">
              Innovative creative production house specializing in audiobooks, audio/film entertainment, and digital marketing.
            </p>
            <p className="text-slate-500 text-[10px] md:text-[11px] font-medium mb-8 md:mb-12">
              By accessing our services, you agree to our <Link href="/legal/terms" className="underline hover:text-white transition-colors">Terms of Service</Link>.
            </p>
            <div className="flex gap-4 w-full">
              {/* Click to Accept Acknowledgement */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 w-full text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Notice to Buyers</p>
                <p className="text-[10px] md:text-[11px] text-slate-300 italic font-medium leading-relaxed">
                  As of {month} {day}, {year}, by confirming your order, you acknowledge that you have read and accepted our Refund, Delivery, and Privacy policies.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-center md:text-left w-full md:w-auto">
            <div className="flex flex-col items-center md:items-start">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-teal-400 mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-center justify-center md:justify-start gap-3">
                  <Mail size={16} className="text-slate-500 md:size-[18px]" />
                  <a href="mailto:admin@dndlcreative.com" className="text-sm font-bold hover:text-teal-400 transition-colors">admin@dndlcreative.com</a>
                </li>
                <li className="flex items-center justify-center md:justify-start gap-3">
                  <Phone size={16} className="text-slate-500 md:size-[18px]" />
                  <span className="text-sm font-bold">+1 (513) 836-1273</span>
                </li>
                <li className="flex items-center justify-center md:justify-start gap-3 max-w-[280px]">
                  <div className="p-1 px-2 bg-slate-800 rounded border border-slate-700 text-[9px] md:text-[10px] uppercase font-black text-slate-500 leading-tight">6809 Main St #1118, Cincinnati, OH 45244</div>
                </li>
              </ul>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-6">Corporate Office</h4>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                DnDL Creative LLC <br />
                6809 Main St #1118<br />
                Cincinnati, OH 45244<br />
                United States of America
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
            © {year} DnDL Creative LLC. All Rights Reserved. Fully US-Based Entity.
          </p>
        </div>
      </footer>
    </div>
  );
}
