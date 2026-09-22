import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { computeStats, listLinksByUser } from "@/lib/data";
import { StatCard, money } from "@/components/ui";
import SignOutButton from "@/components/SignOutButton";
import Rules from "@/components/Rules";
import AddLinkForm from "./AddLinkForm";
import MyLinks from "./MyLinks";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "superadmin") redirect("/admin");

  const links = await listLinksByUser(user.uid);
  const stats = computeStats(links);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="font-semibold text-slate-900">Link Tracker</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">@{user.username}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Approved posts" value={stats.approvedPosts} accent="text-emerald-600" />
          <StatCard label="Approved comments" value={stats.approvedComments} accent="text-emerald-600" />
          <StatCard label="Pending" value={stats.pending} accent="text-amber-600" />
          <StatCard label="Total earnings" value={money(stats.earnings)} />
        </div>

        <Rules />
        <AddLinkForm />
        <MyLinks links={links} />
      </div>
    </main>
  );
}
