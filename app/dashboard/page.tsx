import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import {
  computeStats,
  getGlobalPricing,
  getMemberPaid,
  getUserPayment,
  listLinksByUser,
} from "@/lib/data";
import { effectiveTable } from "@/lib/config";
import { StatCard, money } from "@/components/ui";
import RatesCard from "@/components/RatesCard";
import Rules from "@/components/Rules";

export const dynamic = "force-dynamic";

export default async function MemberOverview() {
  const user = await getSessionUser();
  if (!user) return null;

  const [links, global, payment, paid] = await Promise.all([
    listLinksByUser(user.uid),
    getGlobalPricing(),
    getUserPayment(user.uid),
    getMemberPaid(user.uid),
  ]);
  const stats = computeStats(links);
  const approvedAmount = stats.earnings; // only approved links count
  const remaining = approvedAmount - paid;
  const rates = effectiveTable(global, user.pricing);
  const custom = !!user.pricing && Object.keys(user.pricing).length > 0;

  const noProfiles = Object.keys(user.profiles).length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome, @{user.username}
        </h1>
        <p className="mt-1 text-sm text-slate-500">Here&apos;s your activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Approved (payable)" value={money(approvedAmount)} accent="text-slate-900" />
        <StatCard label="Paid to you" value={money(paid)} accent="text-emerald-600" />
        <StatCard label="Remaining" value={money(remaining)} accent="text-amber-600" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Approved posts" value={stats.approvedPosts} accent="text-emerald-600" />
        <StatCard label="Approved comments" value={stats.approvedComments} accent="text-emerald-600" />
        <StatCard label="Pending review" value={stats.pending} accent="text-amber-600" />
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        Amounts are counted <strong className="text-slate-800">only after the admin approves</strong> a link.
        Pending links aren&apos;t earnings yet. <strong className="text-slate-800">Approved (payable)</strong> is
        what you&apos;ve qualified for, <strong className="text-slate-800">Paid</strong> is what you&apos;ve
        received, and <strong className="text-slate-800">Remaining</strong> is what&apos;s still owed to you.
      </div>

      {noProfiles && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Set your Reddit &amp; LinkedIn account handles so your links can be
          verified.{" "}
          <Link href="/dashboard/accounts" className="font-medium underline">
            Add accounts →
          </Link>
        </div>
      )}

      {!payment && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Add your payment details so you can receive payouts.{" "}
          <Link href="/dashboard/payment" className="font-medium underline">
            Add payment →
          </Link>
        </div>
      )}

      <RatesCard rates={rates} custom={custom} />

      <Rules rates={rates} custom={custom} />

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Submit a link
        </Link>
        <Link
          href="/dashboard/links"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white"
        >
          My links ({links.length})
        </Link>
      </div>
    </div>
  );
}
