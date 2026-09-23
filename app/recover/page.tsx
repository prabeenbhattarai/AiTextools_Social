import RecoverForm from "./RecoverForm";

export const dynamic = "force-dynamic";

export default function RecoverPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Admin recovery</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500">
          Enter your master password to set the admin username &amp; password.
          If the username exists, its password is reset; otherwise a new admin is
          created.
        </p>
        <RecoverForm />
      </div>
    </main>
  );
}
