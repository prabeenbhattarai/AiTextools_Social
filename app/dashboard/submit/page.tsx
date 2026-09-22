import { getSessionUser } from "@/lib/auth/session";
import { getGlobalPricing } from "@/lib/data";
import { effectiveTable } from "@/lib/config";
import Rules from "@/components/Rules";
import AddLinkForm from "../AddLinkForm";

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const global = await getGlobalPricing();
  const rates = effectiveTable(global, user.pricing);
  const custom = !!user.pricing && Object.keys(user.pricing).length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Submit a link</h1>
        <p className="mt-1 text-sm text-slate-500">
          Paste the direct link to your post or comment for review.
        </p>
      </div>
      <AddLinkForm />
      <Rules rates={rates} custom={custom} />
    </div>
  );
}
