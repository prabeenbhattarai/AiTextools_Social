import { listAllLinks, listMembers, listPayouts } from "@/lib/data";
import { StatCard, money } from "@/components/ui";
import PayoutRow from "./PayoutRow";
import type { Payout } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PayoutsPage() {
  const [links, members, payouts] = await Promise.all([
    listAllLinks(),
    listMembers(),
    listPayouts(),
  ]);

  // Earned = sum of approved link prices per member.
  const earnedByUser = new Map<string, number>();
  for (const l of links) {
    if (l.status === "approved") {
      earnedByUser.set(l.userId, (earnedByUser.get(l.userId) ?? 0) + l.price);
    }
  }

  // Paid = sum of recorded payouts per member.
  const paidByUser = new Map<string, number>();
  const historyByUser = new Map<string, Payout[]>();
  for (const p of payouts) {
    paidByUser.set(p.userId, (paidByUser.get(p.userId) ?? 0) + p.amount);
    const arr = historyByUser.get(p.userId) ?? [];
    arr.push(p);
    historyByUser.set(p.userId, arr);
  }

  const rows = members
    .map((m) => {
      const earned = earnedByUser.get(m.uid) ?? 0;
      const paid = paidByUser.get(m.uid) ?? 0;
      return {
        member: m,
        earned,
        paid,
        remaining: earned - paid,
        history: historyByUser.get(m.uid) ?? [],
      };
    })
    // Show members who owe money (or have activity) first.
    .sort((a, b) => b.remaining - a.remaining);

  const totalEarned = [...earnedByUser.values()].reduce((s, n) => s + n, 0);
  const totalPaid = [...paidByUser.values()].reduce((s, n) => s + n, 0);
  const totalRemaining = totalEarned - totalPaid;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Payouts</h1>
        <p className="mt-1 text-sm text-slate-500">
          What each member has earned, what you&apos;ve paid, and what&apos;s
          still owed.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total earned" value={money(totalEarned)} />
        <StatCard label="Total paid" value={money(totalPaid)} accent="text-emerald-600" />
        <StatCard label="Remaining to pay" value={money(totalRemaining)} accent="text-amber-600" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {rows.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No members yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Member</th>
                <th className="px-4 py-2 font-medium">Earned</th>
                <th className="px-4 py-2 font-medium">Paid</th>
                <th className="px-4 py-2 font-medium">Remaining</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <PayoutRow
                  key={r.member.uid}
                  member={r.member}
                  earned={r.earned}
                  paid={r.paid}
                  remaining={r.remaining}
                  history={r.history}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Earned is the sum of each member&apos;s approved links at their rate.
        Recording a payment increases &ldquo;Paid&rdquo; and reduces
        &ldquo;Remaining&rdquo;.
      </p>
    </div>
  );
}
