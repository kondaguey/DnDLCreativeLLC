
import Link from 'next/link';

export default function ContractorProtocolPage() {
    return (
        <div className="min-h-screen bg-white py-24 px-6">
            <div className="max-w-4xl mx-auto">
                <Link href="/legal/terms" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-12 block">
                    ← Back to Terms
                </Link>

                <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900 mb-4">Contractor Protocol</h1>
                <p className="text-slate-500 font-medium mb-12">Last Updated: February 2026</p>

                <div className="space-y-12 text-slate-700 leading-relaxed font-medium">
                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">1. Independent Contractor Status</h2>
                        <p>
                            All individuals and entities engaged by DnDL Creative LLC for creative, talent, or technical services are engaged as <strong>Independent Contractors</strong>. This relationship does not constitute an employment, agency, or partnership agreement. Contractors are responsible for their own tools, equipment, workspace, and professional expenses.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">2. Non-Misclassification Protocol</h2>
                        <p>
                            DnDL Creative LLC strictly adheres to Department of Labor and IRS guidelines to ensure proper classification of all contributors. Our protocol includes:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li><strong>Autonomy</strong>: Contractors retain full control over the methods and means used to achieve the desired project results.</li>
                            <li><strong>Right to Market</strong>: Contractors are encouraged and expected to maintain a separate business presence and provide services to other clients.</li>
                            <li><strong>Specific Engagements</strong>: All work is performed on a project-by-project basis, defined by individual DBA (Doing Business As) contracts.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">3. Payment Gateways & Processing</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Talent Contributors</h3>
                                <p>
                                    Talent contributors (voice-over, actors, performers) may be required to receive payments through our <strong>Talent Gateway Processor</strong> to fulfill union (SAG-AFTRA) requirements or specific licensing tracking needs.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Technical & Creative Contributors</h3>
                                <p>
                                    Non-talent contractors (videographers, editors, social media managers, AI consultants) may be paid via <strong>Wise, PayPal, or bill.com</strong>, as specified in their project agreement.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">4. Tax Compliance & Documentation</h2>
                        <p>
                            Before any payments are disbursed, contractors must provide current tax documentation:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li><strong>U.S. Based Contractors</strong>: Completed Form W-9.</li>
                            <li><strong>International Contractors</strong>: Completed Form W-8BEN or W-8BEN-E.</li>
                            <li><strong>Reporting</strong>: DnDL Creative LLC will issue Form 1099-NEC to all qualifying U.S. contractors for total payments exceeding the annual IRS threshold.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">5. Governing Law</h2>
                        <p>
                            This protocol and all contractor engagements are governed by the laws of the State of Ohio, with venue in Cincinnati, OH.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
