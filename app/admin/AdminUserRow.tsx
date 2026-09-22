"use client";

import { useState, useTransition } from "react";
import { reviewUser } from "@/app/actions/admin";
import { OCCUPATION_LABELS } from "@/lib/types";
import type { UserProfile } from "@/lib/types";

export default function AdminUserRow({ user }: { user: UserProfile }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function approve() {
    setError(null);
    startTransition(async () => {
      const res = await reviewUser(user.uid, "approve");
      if (!res.ok) setError(res.error ?? "Failed");
    });
  }

  function reject() {
    const reason = window.prompt("Reason for rejection (optional):") ?? "";
    setError(null);
    startTransition(async () => {
      const res = await reviewUser(user.uid, "reject", reason);
      if (!res.ok) setError(res.error ?? "Failed");
    });
  }

  return (
    <tr className="border-t border-slate-100 align-top">
      <td className="px-4 py-3">
        <div className="font-medium text-slate-900">{user.fullName}</div>
        <div className="text-xs text-slate-500">{user.email}</div>
        {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
      </td>
      <td className="px-4 py-3 text-slate-700">{user.age}</td>
      <td className="px-4 py-3 text-slate-700">
        <div>{OCCUPATION_LABELS[user.occupation]}</div>
        {user.occupationDetail && (
          <div className="text-xs text-slate-500">{user.occupationDetail}</div>
        )}
      </td>
      <td className="px-4 py-3 text-slate-700">
        {user.skills || <span className="text-slate-400">—</span>}
        {user.qualifications && (
          <div className="text-xs text-slate-500">{user.qualifications}</div>
        )}
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <button
          onClick={approve}
          disabled={pending}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Approve
        </button>
        <button
          onClick={reject}
          disabled={pending}
          className="ml-2 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Reject
        </button>
      </td>
    </tr>
  );
}
