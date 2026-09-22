import { CURRENCY, platformLabel } from "@/lib/config";
import type { AccountCheck, LinkStatus, Platform } from "@/lib/types";

export function money(n: number): string {
  return `${CURRENCY} ${n.toLocaleString()}`;
}

export function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const STATUS_STYLES: Record<LinkStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: LinkStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

const PLATFORM_STYLES: Record<Platform, string> = {
  reddit: "bg-orange-100 text-orange-700",
  linkedin: "bg-sky-100 text-sky-700",
};

export function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        PLATFORM_STYLES[platform] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {platformLabel(platform)}
    </span>
  );
}

const ACCOUNT_STYLES: Record<AccountCheck, string> = {
  match: "bg-emerald-100 text-emerald-800",
  mismatch: "bg-red-100 text-red-700",
  unset: "bg-slate-100 text-slate-500",
};
const ACCOUNT_LABELS: Record<AccountCheck, string> = {
  match: "✓ Same account",
  mismatch: "⚠ Different account",
  unset: "No profile set",
};

export function AccountBadge({ check }: { check: AccountCheck }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ACCOUNT_STYLES[check]}`}
    >
      {ACCOUNT_LABELS[check]}
    </span>
  );
}

export function StatCard({
  label,
  value,
  accent = "text-slate-900",
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${accent}`}>{value}</div>
    </div>
  );
}
