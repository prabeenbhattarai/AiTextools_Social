import { getSessionUser } from "@/lib/auth/session";
import { getUserPayment, listPayoutsForUser } from "@/lib/data";
import { money, formatDate } from "@/components/ui";
import PaymentForm from "../PaymentForm";

export const dynamic = "force-dynamic";

export default async function PaymentPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const [payment, history] = await Promise.all([
    getUserPayment(user.uid),
    listPayoutsForUser(user.uid),
  ]);
  const totalReceived = history.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Payment details</h1>
        <p className="mt-1 text-sm text-slate-500">
          Where and how you&apos;d like to receive your approved payouts.
        </p>
      </div>

      <PaymentForm payment={payment} />

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Payment history</h2>
          <span className="text-sm text-slate-500">
            Total received: <strong className="text-slate-900">{money(totalReceived)}</strong>
          </span>
        </div>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No payments received yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {history.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-slate-900">{money(p.amount)}</div>
                  {p.note && <div className="text-xs text-slate-500">{p.note}</div>}
                </div>
                <div className="text-sm text-slate-400">{formatDate(p.createdAt)}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
