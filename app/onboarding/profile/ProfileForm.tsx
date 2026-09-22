"use client";

import { useActionState, useState } from "react";
import { saveProfile, type ProfileFormState } from "@/app/actions/profile";
import { OCCUPATION_LABELS } from "@/lib/types";
import type { Occupation } from "@/lib/types";

const initialState: ProfileFormState = {};

export default function ProfileForm() {
  const [state, formAction, pending] = useActionState(
    saveProfile,
    initialState,
  );
  const [occupation, setOccupation] = useState<Occupation | "">("");

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Full name" htmlFor="fullName">
        <input
          id="fullName"
          name="fullName"
          required
          className={inputClass}
          placeholder="Jane Doe"
        />
      </Field>

      <Field label="Age" htmlFor="age">
        <input
          id="age"
          name="age"
          type="number"
          min={13}
          max={100}
          required
          className={inputClass}
          placeholder="21"
        />
      </Field>

      <Field label="What are you currently doing?" htmlFor="occupation">
        <select
          id="occupation"
          name="occupation"
          required
          value={occupation}
          onChange={(e) => setOccupation(e.target.value as Occupation)}
          className={inputClass}
        >
          <option value="" disabled>
            Select one…
          </option>
          {(Object.keys(OCCUPATION_LABELS) as Occupation[]).map((key) => (
            <option key={key} value={key}>
              {OCCUPATION_LABELS[key]}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Details (e.g. school/college name, or job title)"
        htmlFor="occupationDetail"
        optional
      >
        <input
          id="occupationDetail"
          name="occupationDetail"
          className={inputClass}
          placeholder="e.g. Kathmandu University — BSc CS"
        />
      </Field>

      <Field label="Qualifications" htmlFor="qualifications" optional>
        <textarea
          id="qualifications"
          name="qualifications"
          rows={2}
          className={inputClass}
          placeholder="Degrees, certifications…"
        />
      </Field>

      <Field label="Skills" htmlFor="skills" optional>
        <textarea
          id="skills"
          name="skills"
          rows={2}
          className={inputClass}
          placeholder="Writing, design, marketing…"
        />
      </Field>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900";

function Field({
  label,
  htmlFor,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
        {optional && (
          <span className="ml-1 font-normal text-slate-400">(optional)</span>
        )}
      </label>
      {children}
    </div>
  );
}
