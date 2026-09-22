import { getSessionUser } from "@/lib/auth/session";
import { getUserPayment } from "@/lib/data";
import PaymentForm from "../PaymentForm";

export const dynamic = "force-dynamic";

export default async function PaymentPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const payment = await getUserPayment(user.uid);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Payment details</h1>
        <p className="mt-1 text-sm text-slate-500">
          Where and how you&apos;d like to receive your approved payouts.
        </p>
      </div>
      <PaymentForm payment={payment} />
    </div>
  );
}
