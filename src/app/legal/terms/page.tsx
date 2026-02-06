
import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white py-24 px-6">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-12 block">
                    ← Back to Creative
                </Link>

                <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900 mb-4">Terms & Conditions</h1>
                <p className="text-slate-500 font-medium mb-12">Last Updated: February 2026</p>

                <div className="space-y-12 text-slate-700 leading-relaxed font-medium">
                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using the services provided by DnDL Creative LLC ("the Company"), including our production, narration, and marketing services, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">2. Description of Services</h2>
                        <p>
                            DnDL Creative LLC provides professional creative services including, but not limited to:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li>Audiobook narration and production services.</li>
                            <li>Voice-over and acting services for stage and screen.</li>
                            <li>Digital marketing, SEO, AEO, and GEO strategic consulting.</li>
                            <li>Creative production for film and audio media.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">3. Payments and Currency</h2>
                        <p>
                            All service fees are quoted and processed in <strong>US Dollars (USD)</strong>. While we may offer payment options in other global currencies (EUR, KRW, TWD, PLN, CNY), the exchange rate is determined at the time of transaction via our primary payment partners, including <strong>Wise, Stripe, PayPal, and bill.com</strong>.
                        </p>
                        <p className="mt-4">
                            Full payment or an agreed-upon retainer is required before work commences as specified in individual project contracts.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">4. Refund & Cancellation</h2>
                        <p>
                            Compliance with refund and cancellation requests is strictly dependent upon the specific terms of the applicable <strong>DBA contract</strong>.
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li><strong>Deposits</strong>: Non-refundable deposits are mandatory for securing production windows.</li>
                            <li><strong>Partial Refunds</strong>: May be offered based on situational assessment and work-to-date.</li>
                            <li><strong>Full Refunds</strong>: Granted only in extremely rare, documented exceptions.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">5. Delivery</h2>
                        <p>
                            Assets are delivered digitally via secure download links or direct repository transfers. Timelines provided are estimates and contingent on client feedback and material provision.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">6. Security & Data Privacy</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Encryption</strong>: All sensitive payment data transmission is secured via <strong>Transport Layer Security (TLS/SSL)</strong>.</li>
                            <li><strong>Data Isolation</strong>: We do not store, process, or transmit raw credit card data on our servers. All financial data is handled by PCI-DSS Level 1 compliant partners.</li>
                            <li><strong>Privacy</strong>: DnDL Creative LLC does not sell buyer data to third parties.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">7. Governing Law</h2>
                        <p>
                            These terms are governed by the laws of the State of Ohio, United States. Any disputes shall be settled in the courts of Cincinnati, OH.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
