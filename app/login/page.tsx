import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { routeForUser } from "@/lib/auth/guards";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(routeForUser(user));

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Sign in</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500">
          Use the username and password your admin gave you.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
