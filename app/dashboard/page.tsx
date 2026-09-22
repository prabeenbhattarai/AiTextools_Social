import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.isAdmin) redirect("/admin");
  if (!user.profile) redirect("/onboarding/profile");
  if (user.profile.status !== "approved") redirect("/post-login");

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <span className="font-semibold text-slate-900">Dashboard</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <h1 className="text-xl font-semibold text-emerald-900">
            Welcome, {user.profile.fullName} 🎉
          </h1>
          <p className="mt-1 text-sm text-emerald-800">
            Your account is approved. Next up (Phase 2): choose a platform
            (Reddit or LinkedIn) and complete the required instructions before
            you can start on tasks.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <PlaceholderCard
            title="Choose a platform"
            body="Pick Reddit or LinkedIn to begin. Coming in Phase 2."
          />
          <PlaceholderCard
            title="Instructions & videos"
            body="Watch and read the required onboarding, no skipping. Coming in Phase 2."
          />
          <PlaceholderCard
            title="Your projects"
            body="Assigned projects and tasks will appear here. Coming in Phase 3."
          />
          <PlaceholderCard
            title="Earnings (Nrs.)"
            body="Your balance and payout history. Coming in Phase 4."
          />
        </div>
      </div>
    </main>
  );
}

function PlaceholderCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="font-medium text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{body}</p>
    </div>
  );
}
