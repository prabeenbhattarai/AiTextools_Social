"use client";

import { useActionState, useEffect, useRef } from "react";
import { createLinkAction, type LinkFormState } from "@/app/actions/links";
import { PLATFORMS, LINK_TYPES } from "@/lib/config";

const initial: LinkFormState = {};

export default function AddLinkForm() {
  const [state, action, pending] = useActionState(createLinkAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Submit a link</h2>
      <p className="mt-1 mb-4 text-sm text-slate-500">
        Paste the direct link to your post or comment. It will be reviewed by the
        admin.
      </p>

      <form ref={formRef} action={action} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Platform</label>
            <select name="platform" required defaultValue="" className={input}>
              <option value="" disabled>
                Select…
              </option>
              {PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Type</label>
            <select name="type" required defaultValue="" className={input}>
              <option value="" disabled>
                Select…
              </option>
              {LINK_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Link URL</label>
          <input
            name="url"
            type="url"
            required
            placeholder="https://www.reddit.com/r/.../comments/..."
            className={input}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Note <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input name="note" placeholder="Subreddit, campaign, etc." className={input} />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.ok && <p className="text-sm text-emerald-600">Link submitted for review ✓</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {pending ? "Submitting…" : "Submit link"}
        </button>
      </form>
    </section>
  );
}

const input =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900";
