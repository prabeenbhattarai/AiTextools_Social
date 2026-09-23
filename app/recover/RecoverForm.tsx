"use client";

import { useActionState } from "react";
import { recoverAdminAction, type FormState } from "@/app/actions/auth";

const initial: FormState = {};

export default function RecoverForm() {
  const [state, action, pending] = useActionState(recoverAdminAction, initial);

  return (
    <form action={action} className="space-y-4">
      <Field name="master" label="Master password" type="password" placeholder="your master password" />
      <Field name="username" label="Admin username" placeholder="e.g. admin" />
      <Field name="password" label="New admin password" type="password" placeholder="set a new password" />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {pending ? "Recovering…" : "Recover admin access"}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
      />
    </div>
  );
}
