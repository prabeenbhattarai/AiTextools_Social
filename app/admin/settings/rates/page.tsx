import { getGlobalPricing } from "@/lib/data";
import PricingSettings from "../../PricingSettings";

export const dynamic = "force-dynamic";

export default async function RatesSettingsPage() {
  const global = await getGlobalPricing();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Pay rates</h1>
        <p className="mt-1 text-sm text-slate-500">
          Set the default payout for each platform and type.
        </p>
      </div>
      <PricingSettings rates={global} />
    </div>
  );
}
