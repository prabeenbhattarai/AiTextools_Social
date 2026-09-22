"use client";

import { useActionState, useEffect, useRef } from "react";
import { createMemberAction, type MemberFormState } from "@/app/actions/auth";

const initial: MemberFormState = {};

export default function CreateMemberForm() {
  const [state, action, pending] = useActionState(createMemberAction, initial);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <div className="space-y-4">
      <form ref={ref} action={action} className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs font-medium text-slate-600">
            Full name
          </label>
          <input
            name="fullName"
            required
            placeholder="e.g. Kushal Bhattarai"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {pending ? "Creating…" : "Create member"}
        </button>
      </form>

      <p className="text-xs text-slate-500">
        A unique username and password are generated from the first name. Share
        them with the member.
      </p>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      {state.credentials && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-900">
            Member created — {state.credentials.fullName}
          </p>
          <p className="mt-1 text-xs text-emerald-700">
            Copy these now and share with the member:
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <CredField label="Username" value={state.credentials.username} />
            <CredField label="Password" value={state.credentials.password} />
          </div>
        </div>
      )}
    </div>
  );
}

function CredField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-emerald-200 bg-white px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="font-mono text-sm text-slate-900">{value}</div>
    </div>
  );
}
