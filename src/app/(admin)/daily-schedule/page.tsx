
import { fetchPersonalItems } from './actions';
import PersonalShell from './PersonalShell';

export const dynamic = 'force-dynamic';

export default async function Page() {
    const res = await fetchPersonalItems();

    // If auth fails, handle it (though middleware should catch this)
    if (!res.success) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <p className="text-slate-500 font-bold uppercase tracking-widest">
                    Authentication Required: {res.error}
                </p>
            </div>
        );
    }

    return <PersonalShell initialItems={res.data || []} />;
}
