import Link from "next/link";
import { computeStats, listAllLinks, listMembers } from "@/lib/data";
import { StatCard, money } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [allLinks, members] = await Promise.all([listAllLinks(), listMembers()]);
  const stats = computeStats(allLinks);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Snapshot of activity across all members.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Approved posts" value={stats.approvedPosts} accent="text-emerald-600" />
        <StatCard label="Approved comments" value={stats.approvedComments} accent="text-emerald-600" />
        <StatCard label="Pending review" value={stats.pending} accent="text-amber-600" />
        <StatCard label="Rejected" value={stats.rejected} accent="text-red-600" />
        <StatCard label="Members" value={members.length} />
        <StatCard label="Total payout" value={money(stats.earnings)} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/links?status=pending"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Review pending ({stats.pending})
        </Link>
        <Link
          href="/admin/members"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white"
        >
          Manage members
        </Link>
      </div>
    </div>
  );
}
