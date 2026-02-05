
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white py-24 px-6">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-12 block">
                    ← Back to Corporate
                </Link>

                <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900 mb-4">Privacy Policy</h1>
                <p className="text-slate-500 font-medium mb-12">Last Updated: February 2026</p>

                <div className="space-y-12 text-slate-700 leading-relaxed font-medium">
                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">1. Data Collection</h2>
                        <p>
                            DnDL Creative LLC collects only the data necessary to provide our services, which may include names, contact information, and business details provided during the onboarding process.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">2. Use of Data</h2>
                        <p>
                            Your data is used strictly for project management, service delivery, and legal compliance. We do not sell your personal or business data to third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">3. Security</h2>
                        <p>
                            We implement industry-standard encryption and security protocols to protect sensitive client information. Financial transactions are processed exclusively through PCI-compliant providers (Wise). We do not store credit card details on our local servers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">4. US-Based Processing</h2>
                        <p>
                            All data is processed and stored within the United States. By using our services, you consent to this data handling.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
