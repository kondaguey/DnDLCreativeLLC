
import Link from 'next/link';

export default function RefundPolicyPage() {
    return (
        <div className="min-h-screen bg-white py-24 px-6">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-12 block">
                    ← Back to Corporate
                </Link>

                <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900 mb-4">Refund & Delivery Policy</h1>
                <p className="text-slate-500 font-medium mb-12">Last Updated: February 2026</p>

                <div className="space-y-12 text-slate-700 leading-relaxed font-medium">
                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">1. Digital Delivery</h2>
                        <p>
                            DnDL Creative LLC specializes in digital creative assets. All products (Audio files, Video master files, Strategy documents, Codebases) are delivered via secure cloud-based download links or encrypted direct transfers.
                        </p>
                        <p className="mt-4">
                            Physical delivery is not supported unless explicitly negotiated and specified in a standalone physical service contract.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">2. Refund & Cancellation Policy</h2>
                        <p>
                            All refund and cancellation terms are primarily governed by the specific provisions outlined in your individual <strong>DBA (Doing Business As)</strong> or service contract.
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-4">
                            <li><strong>Mandatory Deposits</strong>: A non-refundable deposit is required for all projects to secure production scheduling and resource allocation.</li>
                            <li><strong>Cancellations</strong>: Upon written notice of cancellation, work will cease immediately. Clients remain liable for all work performed up to the point of cancellation as per the contract terms.</li>
                            <li><strong>Partial Refunds</strong>: May be granted at the Company's discretion, depending on the volume of work completed and the specific circumstances surrounding the request.</li>
                            <li><strong>Full Refunds</strong>: Reserved exclusively for extremely rare exceptions and are subject to rigid corporate review.</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
