"use client";

import { useActionState, useEffect, useState } from "react";
import { saveProfilesAction, type ProfileState } from "@/app/actions/profile";
import { PLATFORMS } from "@/lib/config";
import type { PlatformProfiles } from "@/lib/types";

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
  const hasAny = PLATFORMS.some((p) => profiles[p.id]);
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
          Links you submit are verified against these accounts.
        </p>
        <dl className="divide-y divide-slate-100">
          {PLATFORMS.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-3">
              <dt className="text-sm font-medium text-slate-600">{p.label}</dt>
              <dd className="text-sm text-slate-900">
                {profiles[p.id] || <span className="text-slate-400">Not set</span>}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">My platform accounts</h2>
      <p className="mt-1 mb-4 text-sm text-slate-500">
        Enter the account you post from on each platform.
      </p>

      <form action={action} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {PLATFORMS.map((p) => (
            <div key={p.id}>
              <label className="block text-sm font-medium text-slate-700">
                {p.label} account
              </label>
              <input
                name={`profile_${p.id}`}
                defaultValue={profiles[p.id] ?? ""}
                placeholder={PLACEHOLDER[p.id] ?? "your handle"}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>
          ))}
        </div>
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
