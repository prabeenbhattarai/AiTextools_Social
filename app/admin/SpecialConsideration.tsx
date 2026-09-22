"use client";

import { useState, useTransition } from "react";
import { setMemberPricingAction } from "@/app/actions/admin";
import { PLATFORMS, LINK_TYPES, CURRENCY } from "@/lib/config";
import { money } from "@/components/ui";
import type { AppUser, PricingOverride, PricingTable } from "@/lib/types";

export default function SpecialConsideration({
  members,
  global,
}: {
  members: AppUser[];
  global: PricingTable;
}) {
  const [uid, setUid] = useState("");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ error?: string; ok?: string } | null>(null);

  const selected = members.find((m) => m.uid === uid) ?? null;
  const withCustom = members.filter(
    (m) => m.pricing && Object.keys(m.pricing).length > 0,
  );

  function save(formData: FormData) {
    if (!selected) return;
    const override: PricingOverride = {};
    for (const p of PLATFORMS) {
      for (const t of LINK_TYPES) {
        const raw = String(formData.get(`${p.id}_${t.id}`) ?? "").trim();
        if (raw === "") continue;
        const n = Number(raw);
        if (Number.isNaN(n) || n < 0) continue;
        (override[p.id] ??= {})[t.id] = n;
      }
    }
    setMsg(null);
    start(async () => {
      const res = await setMemberPricingAction(
        selected.uid,
        Object.keys(override).length ? override : null,
      );
      setMsg(res.ok ? { ok: "Custom rate saved." } : { error: res.error });
    });
  }

  function reset() {
    if (!selected) return;
    setMsg(null);
    start(async () => {
      const res = await setMemberPricingAction(selected.uid, null);
      setMsg(res.ok ? { ok: "Reset to global rate." } : { error: res.error });
    });
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">Special consideration</h2>
      <p className="mt-1 text-sm text-slate-500">
        Give a specific member their own manual rate. Blank fields use the global
        rate.
      </p>

      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-5">
        <label className="block text-sm font-medium text-slate-700">
          Select member
        </label>
        <select
          value={uid}
          onChange={(e) => {
            setUid(e.target.value);
            setMsg(null);
          }}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 sm:max-w-md"
        >
          <option value="">Choose a member…</option>
          {members.map((m) => (
            <option key={m.uid} value={m.uid}>
              {m.fullName} (@{m.username})
              {m.pricing && Object.keys(m.pricing).length > 0 ? " · custom" : ""}
            </option>
          ))}
        </select>

        {selected && (
          <form action={save} key={selected.uid} className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {PLATFORMS.map((p) => (
                <div key={p.id}>
                  <div className="text-sm font-medium text-slate-800">{p.label}</div>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {LINK_TYPES.map((t) => (
                      <label key={t.id} className="text-xs text-slate-600">
                        <span className="block">{t.label}</span>
                        <input
                          name={`${p.id}_${t.id}`}
                          type="number"
                          min={0}
                          defaultValue={selected.pricing?.[p.id]?.[t.id] ?? ""}
                          placeholder={`${CURRENCY} ${global[p.id][t.id]}`}
                          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-slate-900 outline-none focus:border-slate-900"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {msg?.error && <p className="mt-3 text-sm text-red-600">{msg.error}</p>}
            {msg?.ok && <p className="mt-3 text-sm text-emerald-600">{msg.ok}</p>}
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                Save custom rate
              </button>
              <button
                type="button"
                onClick={reset}
                disabled={pending}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 disabled:opacity-50"
              >
                Reset to global
              </button>
            </div>
          </form>
        )}
      </div>

      {withCustom.length > 0 && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-medium text-slate-800">
            Members on a custom rate
          </div>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {withCustom.map((m) => (
              <li key={m.uid} className="flex flex-wrap gap-x-3">
                <span className="font-medium text-slate-800">{m.fullName}</span>
                {PLATFORMS.map((p) =>
                  LINK_TYPES.map((t) =>
                    m.pricing?.[p.id]?.[t.id] !== undefined ? (
                      <span key={`${p.id}${t.id}`} className="text-xs text-slate-500">
                        {p.label} {t.label}: {money(m.pricing[p.id]![t.id]!)}
                      </span>
                    ) : null,
                  ),
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
