"use client";

import { useState, useTransition } from "react";
import { setMemberActiveAction } from "@/app/actions/admin";
import { formatDate } from "@/components/ui";
import type { AppUser } from "@/lib/types";

export default function MemberRow({ member }: { member: AppUser }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    setError(null);
    startTransition(async () => {
      const res = await setMemberActiveAction(member.uid, !member.active);
      if (!res.ok) setError(res.error ?? "Failed");
    });
  }

  return (
    <li className="flex items-center justify-between px-4 py-3 text-sm">
      <div>
        <span className="font-medium text-slate-900">@{member.username}</span>
        <span className="ml-2 text-xs text-slate-400">
          added {formatDate(member.createdAt)}
        </span>
        {error && <div className="text-xs text-red-600">{error}</div>}
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            member.active
              ? "bg-emerald-100 text-emerald-800"
              : "bg-slate-200 text-slate-600"
          }`}
        >
          {member.active ? "active" : "disabled"}
        </span>
        <button
          onClick={toggle}
          disabled={pending}
          className="text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50"
        >
          {member.active ? "Deactivate" : "Activate"}
        </button>
      </div>
    </li>
  );
}
