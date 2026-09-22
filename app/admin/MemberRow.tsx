"use client";

import { useState, useTransition } from "react";
import {
  setMemberActiveAction,
  setMemberPricingAction,
} from "@/app/actions/admin";
import { formatDate } from "@/components/ui";
import { PLATFORMS, LINK_TYPES, CURRENCY } from "@/lib/config";
import CredentialsPanel from "./CredentialsPanel";
import MemberPaymentView from "./MemberPaymentView";
import type { AppUser, PricingOverride, PricingTable } from "@/lib/types";

export default function MemberRow({
  member,
  global,
}: {
  member: AppUser;
  global: PricingTable;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingRate, setEditingRate] = useState(false);
  const [showCreds, setShowCreds] = useState(false);
  const hasCustom = !!member.pricing && Object.keys(member.pricing).length > 0;

  function toggleActive() {
    setError(null);
    startTransition(async () => {
      const res = await setMemberActiveAction(member.uid, !member.active);
      if (!res.ok) setError(res.error ?? "Failed");
    });
  }

  function saveRate(formData: FormData) {
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
    setError(null);
    startTransition(async () => {
      const res = await setMemberPricingAction(
        member.uid,
        Object.keys(override).length ? override : null,
      );
      if (!res.ok) setError(res.error ?? "Failed");
      else setEditingRate(false);
    });
  }

  function resetRate() {
    setError(null);
    startTransition(async () => {
      const res = await setMemberPricingAction(member.uid, null);
      if (!res.ok) setError(res.error ?? "Failed");
      else setEditingRate(false);
    });
  }

  return (
    <li className="px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-medium text-slate-900">{member.fullName}</span>
          <span className="ml-2 font-mono text-xs text-slate-500">
            @{member.username}
          </span>
          <span className="ml-2 text-xs text-slate-400">
            added {formatDate(member.createdAt)}
          </span>
          <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate-500">
            {PLATFORMS.map((p) => (
              <span key={p.id}>
                {p.label}:{" "}
                <span className="text-slate-700">
                  {member.profiles[p.id] || "—"}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasCustom && (
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
              custom rate
            </span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              member.active
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {member.active ? "active" : "disabled"}
          </span>
          <MemberPaymentView uid={member.uid} name={member.fullName} />
          <button
            onClick={() => setShowCreds((v) => !v)}
            className="text-slate-600 hover:text-slate-900"
          >
            Credentials
          </button>
          <button
            onClick={() => setEditingRate((v) => !v)}
            className="text-slate-600 hover:text-slate-900"
          >
            Rate
          </button>
          <button
            onClick={toggleActive}
            disabled={pending}
            className="text-slate-600 hover:text-slate-900 disabled:opacity-50"
          >
            {member.active ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>

      {showCreds && <CredentialsPanel uid={member.uid} />}

      {editingRate && (
        <form action={saveRate} className="mt-3 rounded-lg border border-slate-200 p-3">
          <p className="mb-2 text-xs text-slate-500">
            Leave a field blank to use the global rate for that item.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {PLATFORMS.map((p) => (
              <div key={p.id}>
                <div className="text-xs font-medium text-slate-700">{p.label}</div>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {LINK_TYPES.map((t) => (
                    <label key={t.id} className="text-xs text-slate-600">
                      <span className="block">{t.label}</span>
                      <input
                        name={`${p.id}_${t.id}`}
                        type="number"
                        min={0}
                        defaultValue={member.pricing?.[p.id]?.[t.id] ?? ""}
                        placeholder={`${CURRENCY} ${global[p.id][t.id]}`}
                        className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-slate-900 outline-none focus:border-slate-900"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              Save custom rate
            </button>
            <button
              type="button"
              onClick={resetRate}
              disabled={pending}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-600 disabled:opacity-50"
            >
              Reset to global
            </button>
          </div>
        </form>
      )}
      {error && !editingRate && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </li>
  );
}
