"use client";

import { useActionState } from "react";
import { setGlobalPricingAction, type PricingState } from "@/app/actions/admin";
import { PLATFORMS, LINK_TYPES, CURRENCY } from "@/lib/config";
import type { PricingTable } from "@/lib/types";

const initial: PricingState = {};

export default function PricingSettings({ rates }: { rates: PricingTable }) {
  const [state, action, pending] = useActionState(setGlobalPricingAction, initial);

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">Global rates</h2>
      <p className="mt-1 text-sm text-slate-500">
        Default payout ({CURRENCY}) per approved item. Applies to every member
        unless they have a custom rate.
      </p>

      <form
        action={action}
        className="mt-3 rounded-xl border border-slate-200 bg-white p-5"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          {PLATFORMS.map((p) => (
            <div key={p.id}>
              <h3 className="font-medium text-slate-800">{p.label}</h3>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {LINK_TYPES.map((t) => (
                  <label key={t.id} className="text-sm text-slate-600">
                    <span className="block">{t.label}</span>
                    <div className="mt-1 flex items-center rounded-md border border-slate-300 px-2 focus-within:border-slate-900">
                      <span className="text-xs text-slate-400">{CURRENCY}</span>
                      <input
                        name={`${p.id}_${t.id}`}
                        type="number"
                        min={0}
                        defaultValue={rates[p.id][t.id]}
                        className="w-full px-2 py-1.5 text-slate-900 outline-none"
                      />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save rates"}
          </button>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          {state.ok && <p className="text-sm text-emerald-600">Rates updated ✓</p>}
        </div>
      </form>
    </section>
  );
}
