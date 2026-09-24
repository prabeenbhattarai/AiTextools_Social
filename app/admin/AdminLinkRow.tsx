"use client";

import { useState, useTransition } from "react";
import { reviewLinkAction } from "@/app/actions/admin";
import {
  AccountBadge,
  PlatformBadge,
  StatusBadge,
  formatDate,
  money,
} from "@/components/ui";
import { approvableAt } from "@/lib/config";
import type { LinkItem } from "@/lib/types";

function daysLeft(ms: number): number {
  return Math.ceil((ms - Date.now()) / (24 * 60 * 60 * 1000));
}

export default function AdminLinkRow({ link }: { link: LinkItem }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const eligibleAt = approvableAt(link.platform, link.type, link.createdAt);
  const locked = Date.now() < eligibleAt;

  function review(decision: "approve" | "reject") {
    setError(null);
    startTransition(async () => {
      const res = await reviewLinkAction(link.id, decision);
      if (!res.ok) setError(res.error ?? "Failed");
    });
  }

  return (
    <tr className="border-t border-slate-100 align-top">
      <td className="px-4 py-3">
        <div className="font-medium text-slate-900">@{link.username}</div>
        <div className="text-xs text-slate-400">{formatDate(link.createdAt)}</div>
      </td>
      <td className="px-4 py-3">
        <PlatformBadge platform={link.platform} />
      </td>
      <td className="px-4 py-3 capitalize text-slate-700">{link.type}</td>
      <td className="px-4 py-3">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block max-w-[280px] truncate text-slate-800 underline underline-offset-2 hover:text-slate-950"
        >
          {link.url}
        </a>
        {link.note && <div className="text-xs text-slate-400">{link.note}</div>}
      </td>
      <td className="px-4 py-3 text-slate-700">{money(link.price)}</td>
      <td className="px-4 py-3">
        <div className="flex flex-col items-start gap-1">
          <StatusBadge status={link.status} />
          <AccountBadge check={link.accountCheck} />
        </div>
        {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        {link.status !== "approved" &&
          (locked ? (
            <span
              className="inline-block rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500"
              title={`Approvable on ${formatDate(eligibleAt)}`}
            >
              Hold · {daysLeft(eligibleAt)}d
            </span>
          ) : (
            <button
              onClick={() => review("approve")}
              disabled={pending}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Approve
            </button>
          ))}
        {link.status !== "rejected" && (
          <button
            onClick={() => review("reject")}
            disabled={pending}
            className="ml-2 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Reject
          </button>
        )}
      </td>
    </tr>
  );
}
