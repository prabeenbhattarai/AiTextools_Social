"use client";

import { useState, useTransition } from "react";
import { deletePayoutAction, recordPayoutAction } from "@/app/actions/admin";
import { money, formatDate } from "@/components/ui";
import MemberPaymentView from "../MemberPaymentView";
import type { AppUser, Payout } from "@/lib/types";

export default function PayoutRow({
  member,
  earned,
  paid,
  remaining,
  history,
}: {
  member: AppUser;
  earned: number;
  paid: number;
  remaining: number;
  history: Payout[];
}) {
  const [recording, setRecording] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function record(formData: FormData) {
    const amount = Number(formData.get("amount"));
    const note = String(formData.get("note") ?? "");
    setError(null);
    start(async () => {
      const res = await recordPayoutAction(member.uid, amount, note);
      if (!res.ok) setError(res.error ?? "Failed");
      else setRecording(false);
    });
  }

  function remove(id: string) {
    if (!confirm("Delete this payout record?")) return;
    start(async () => {
      await deletePayoutAction(id);
    });
  }

  return (
    <>
      <tr className="border-t border-slate-100">
        <td className="px-4 py-3">
          <div className="font-medium text-slate-900">{member.fullName}</div>
          <div className="font-mono text-xs text-slate-500">@{member.username}</div>
        </td>
        <td className="px-4 py-3 text-slate-700">{money(earned)}</td>
        <td className="px-4 py-3 text-slate-700">{money(paid)}</td>
        <td className="px-4 py-3">
          <span
            className={`font-semibold ${
              remaining > 0 ? "text-amber-600" : "text-emerald-600"
            }`}
          >
            {money(remaining)}
          </span>
        </td>
        <td className="px-4 py-3 text-right whitespace-nowrap">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setRecording((v) => !v)}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Record payment
            </button>
            <MemberPaymentView uid={member.uid} name={member.fullName} />
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              History ({history.length})
            </button>
          </div>
        </td>
      </tr>

      {recording && (
        <tr className="bg-slate-50">
          <td colSpan={5} className="px-4 py-3">
            <form action={record} className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Amount (Rs)
                </label>
                <input
                  name="amount"
                  type="number"
                  min={1}
                  defaultValue={remaining > 0 ? remaining : ""}
                  required
                  className="mt-1 w-32 rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-900"
                />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-medium text-slate-600">
                  Note <span className="text-slate-400">(optional)</span>
                </label>
                <input
                  name="note"
                  placeholder="e.g. eSewa 2026-09-23, txn id…"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-900"
                />
              </div>
              <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Save payment
              </button>
              {error && <p className="w-full text-xs text-red-600">{error}</p>}
            </form>
          </td>
        </tr>
      )}

      {showHistory && (
        <tr className="bg-slate-50">
          <td colSpan={5} className="px-4 py-3">
            {history.length === 0 ? (
              <p className="text-sm text-slate-500">No payments recorded yet.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {history.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center gap-x-3">
                    <span className="font-medium text-slate-800">{money(p.amount)}</span>
                    <span className="text-xs text-slate-500">{formatDate(p.createdAt)}</span>
                    {p.note && <span className="text-xs text-slate-500">— {p.note}</span>}
                    <span className="text-xs text-slate-400">by @{p.createdBy}</span>
                    <button
                      onClick={() => remove(p.id)}
                      disabled={pending}
                      className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
