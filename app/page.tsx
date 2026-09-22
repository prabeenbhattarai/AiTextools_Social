import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { routeForUser } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getSessionUser();
  if (user) redirect(routeForUser(user));

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <h1 className="max-w-xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Reddit &amp; LinkedIn Post Tracker
      </h1>
      <p className="mt-4 max-w-md text-slate-600">
        Team members submit their post &amp; comment links; the admin reviews and
        approves them. Simple, transparent, trackable.
      </p>
      <Link
        href="/login"
        className="mt-8 rounded-md bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-800"
      >
        Sign in
      </Link>
    </main>
  );
}
