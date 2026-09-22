"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PLATFORMS } from "@/lib/config";

const STATUSES = ["pending", "approved", "rejected"];
const ACCOUNTS = [
  { id: "match", label: "Same account" },
  { id: "mismatch", label: "Different account" },
  { id: "unset", label: "No profile" },
];

export default function Filters() {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "all") next.delete(key);
    else next.set(key, value);
    router.push(`/admin/links?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        label="Platform"
        value={params.get("platform") ?? "all"}
        onChange={(v) => update("platform", v)}
        options={[{ id: "all", label: "All platforms" }, ...PLATFORMS]}
      />
      <Select
        label="Status"
        value={params.get("status") ?? "all"}
        onChange={(v) => update("status", v)}
        options={[
          { id: "all", label: "All statuses" },
          ...STATUSES.map((s) => ({ id: s, label: s[0].toUpperCase() + s.slice(1) })),
        ]}
      />
      <Select
        label="Account"
        value={params.get("account") ?? "all"}
        onChange={(v) => update("account", v)}
        options={[{ id: "all", label: "All" }, ...ACCOUNTS]}
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <label className="text-sm text-slate-600">
      <span className="mr-2">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-slate-900"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
