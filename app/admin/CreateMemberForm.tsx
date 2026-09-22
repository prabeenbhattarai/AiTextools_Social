"use client";

import { useActionState, useEffect, useRef } from "react";
import { createMemberAction, type FormState } from "@/app/actions/auth";

const initial: FormState = {};

export default function CreateMemberForm() {
  const [state, action, pending] = useActionState(createMemberAction, initial);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs font-medium text-slate-600">Username</label>
        <input name="username" required placeholder="member1" className={input} />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Password</label>
        <input name="password" required placeholder="min 6 chars" className={input} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create member"}
      </button>
      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
      {state.ok && <p className="w-full text-sm text-emerald-600">Member created ✓</p>}
    </form>
  );
}

const input =
  "mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900";
