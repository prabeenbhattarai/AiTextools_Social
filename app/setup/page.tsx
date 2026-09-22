import Link from "next/link";
import { superadminExists } from "@/lib/data";
import SetupForm from "./SetupForm";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const exists = await superadminExists().catch(() => false);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">First-time setup</h1>
        {exists ? (
          <div className="mt-4 text-sm text-slate-600">
            <p>A superadmin already exists — setup is closed.</p>
            <Link href="/login" className="mt-3 inline-block text-slate-900 underline">
              Go to sign in
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-1 mb-6 text-sm text-slate-500">
              Create the first superadmin account. This works only once.
            </p>
            <SetupForm />
          </>
        )}
      </div>
    </main>
  );
}
