import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import {
  computeStats,
  getGlobalPricing,
  listAllLinks,
  listMembers,
} from "@/lib/data";
import { StatCard, money } from "@/components/ui";
import SignOutButton from "@/components/SignOutButton";
import Filters from "./Filters";
import AdminLinkRow from "./AdminLinkRow";
import CreateMemberForm from "./CreateMemberForm";
import MemberRow from "./MemberRow";
import PricingSettings from "./PricingSettings";
import type { LinkStatus, Platform } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; status?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "superadmin") redirect("/dashboard");

  const sp = await searchParams;
  const platform = (sp.platform ?? "all") as Platform | "all";
  const status = (sp.status ?? "all") as LinkStatus | "all";

  const [allLinks, members, global] = await Promise.all([
    listAllLinks(),
    listMembers(),
    getGlobalPricing(),
  ]);
  const stats = computeStats(allLinks);

  const filtered = allLinks.filter(
    (l) =>
      (platform === "all" || l.platform === platform) &&
      (status === "all" || l.status === status),
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="font-semibold text-slate-900">Admin · Link Tracker</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">@{user.username}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        {/* Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Approved posts" value={stats.approvedPosts} accent="text-emerald-600" />
          <StatCard label="Approved comments" value={stats.approvedComments} accent="text-emerald-600" />
          <StatCard label="Pending" value={stats.pending} accent="text-amber-600" />
          <StatCard label="Members" value={members.length} />
          <StatCard label="Total payout" value={money(stats.earnings)} />
        </div>

        {/* Global rates */}
        <PricingSettings rates={global} />

        {/* Members */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Members</h2>
          <p className="mt-1 text-sm text-slate-500">
            Create accounts and share the username &amp; password with your team.
            Use <span className="font-medium">Rate</span> to give a member a
            custom price.
          </p>
          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-5">
            <CreateMemberForm />
          </div>
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {members.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">No members yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {members.map((m) => (
                  <MemberRow key={m.uid} member={m} global={global} />
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Links */}
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              All links{" "}
              <span className="text-sm font-normal text-slate-400">
                ({filtered.length})
              </span>
            </h2>
            <Filters />
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            {filtered.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">No links match these filters.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">Member</th>
                    <th className="px-4 py-2 font-medium">Platform</th>
                    <th className="px-4 py-2 font-medium">Type</th>
                    <th className="px-4 py-2 font-medium">Link</th>
                    <th className="px-4 py-2 font-medium">Price</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((link) => (
                    <AdminLinkRow key={link.id} link={link} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
