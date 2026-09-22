import { getGlobalPricing, listMembers } from "@/lib/data";
import PricingSettings from "../../PricingSettings";
import SpecialConsideration from "../../SpecialConsideration";

export const dynamic = "force-dynamic";

export default async function RatesSettingsPage() {
  const [global, members] = await Promise.all([getGlobalPricing(), listMembers()]);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Pay rates</h1>
        <p className="mt-1 text-sm text-slate-500">
          Set default payouts, and give special consideration to individual
          members.
        </p>
      </div>
      <PricingSettings rates={global} />
      <SpecialConsideration members={members} global={global} />
    </div>
  );
}
