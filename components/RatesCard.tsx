import { PLATFORMS, LINK_TYPES } from "@/lib/config";
import { money } from "@/components/ui";
import type { PricingTable } from "@/lib/types";

export default function RatesCard({
  rates,
  custom,
}: {
  rates: PricingTable;
  custom?: boolean;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Your rates</h2>
        {custom ? (
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
            custom rate
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            standard rate
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Set by the admin — what you earn per approved item.
      </p>

      <table className="mt-4 w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="pb-2 font-medium">Platform</th>
            {LINK_TYPES.map((t) => (
              <th key={t.id} className="pb-2 font-medium">
                {t.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PLATFORMS.map((p) => (
            <tr key={p.id} className="border-t border-slate-100">
              <td className="py-2 font-medium text-slate-800">{p.label}</td>
              {LINK_TYPES.map((t) => (
                <td key={t.id} className="py-2 text-slate-700">
                  {money(rates[p.id][t.id])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
