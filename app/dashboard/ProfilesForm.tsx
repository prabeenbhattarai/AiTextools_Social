"use client";

import { useActionState, useEffect, useState } from "react";
import { saveProfilesAction, type ProfileState } from "@/app/actions/profile";
import { PLATFORMS } from "@/lib/config";
import type { Platform, PlatformProfiles } from "@/lib/types";

const initial: ProfileState = {};

const PLACEHOLDER: Record<string, string> = {
  reddit: "u/your_username",
  linkedin: "linkedin.com/in/your-name",
};

export default function ProfilesForm({
  profiles,
}: {
  profiles: PlatformProfiles;
}) {
  const [state, action, pending] = useActionState(saveProfilesAction, initial);
  const hasAny = PLATFORMS.some((p) => (profiles[p.id]?.length ?? 0) > 0);
  const [editing, setEditing] = useState(!hasAny);

  useEffect(() => {
    if (state.ok) setEditing(false);
  }, [state]);

  if (!editing) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">My platform accounts</h2>
          <button
            onClick={() => setEditing(true)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit
          </button>
        </div>
        <p className="mt-1 mb-4 text-sm text-slate-500">
          Links you submit are verified against these accounts. You can add more
          than one account per platform.
        </p>
        <div className="space-y-4">
          {PLATFORMS.map((p) => (
            <div key={p.id}>
              <div className="text-sm font-medium text-slate-600">{p.label}</div>
              {(profiles[p.id]?.length ?? 0) === 0 ? (
                <div className="text-sm text-slate-400">Not set</div>
              ) : (
                <ul className="mt-1 flex flex-wrap gap-2">
                  {profiles[p.id]!.map((h) => (
                    <li
                      key={h}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-800"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">My platform accounts</h2>
      <p className="mt-1 mb-4 text-sm text-slate-500">
        Add every account you post from. Add multiple per platform if you use
        more than one.
      </p>

      <form action={action} className="space-y-6">
        {PLATFORMS.map((p) => (
          <PlatformFields
            key={p.id}
            platform={p.id}
            label={p.label}
            values={profiles[p.id] ?? []}
            placeholder={PLACEHOLDER[p.id] ?? "your handle"}
          />
        ))}

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save accounts"}
          </button>
          {hasAny && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

function PlatformFields({
  platform,
  label,
  values,
  placeholder,
}: {
  platform: Platform;
  label: string;
  values: string[];
  placeholder: string;
}) {
  const [rows, setRows] = useState<string[]>(values.length ? values : [""]);

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">
        {label} account(s)
      </label>
      <div className="mt-1 space-y-2">
        {rows.map((val, i) => (
          <div key={i} className="flex gap-2">
            <input
              name={`profile_${platform}`}
              defaultValue={val}
              placeholder={placeholder}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => setRows(rows.filter((_, j) => j !== i))}
                className="rounded-md border border-slate-300 px-3 text-slate-500 hover:bg-slate-50"
                aria-label="Remove"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRows([...rows, ""])}
        className="mt-2 text-sm font-medium text-slate-700 hover:text-slate-900"
      >
        + Add another {label} account
      </button>
    </div>
  );
}
