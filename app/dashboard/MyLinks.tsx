"use client";

import { useState, useTransition } from "react";
import { deleteLinkAction, updateLinkAction } from "@/app/actions/links";
import { PLATFORMS, LINK_TYPES } from "@/lib/config";
import {
  AccountBadge,
  PlatformBadge,
  StatusBadge,
  formatDate,
  money,
} from "@/components/ui";
import type { LinkItem } from "@/lib/types";

export default function MyLinks({ links }: { links: LinkItem[] }) {
  if (links.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">My links</h2>
        <p className="mt-2 text-sm text-slate-500">
          No links yet. Submit your first one above.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        My links{" "}
        <span className="text-sm font-normal text-slate-400">({links.length})</span>
      </h2>
      <div className="space-y-3">
        {links.map((link) => (
          <LinkRow key={link.id} link={link} />
        ))}
      </div>
    </section>
  );
}

function LinkRow({ link }: { link: LinkItem }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const editable = link.status === "pending";

  function onDelete() {
    if (!confirm("Delete this link?")) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteLinkAction(link.id);
      if (!res.ok) setError(res.error ?? "Failed");
    });
  }

  function onSave(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await updateLinkAction(link.id, formData);
      if (!res.ok) setError(res.error ?? "Failed");
      else setEditing(false);
    });
  }

  if (editing) {
    return (
      <form
        action={onSave}
        className="rounded-lg border border-slate-200 p-3"
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <select name="platform" defaultValue={link.platform} className={mini}>
            {PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <select name="type" defaultValue={link.type} className={mini}>
            {LINK_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <input name="url" type="url" defaultValue={link.url} className={`${mini} mt-2`} />
        <input name="note" defaultValue={link.note} placeholder="Note" className={`${mini} mt-2`} />
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        <div className="mt-3 flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-slate-100 p-3">
      <PlatformBadge platform={link.platform} />
      <span className="text-sm capitalize text-slate-500">{link.type}</span>
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="max-w-[240px] flex-1 truncate text-sm text-slate-800 underline underline-offset-2 hover:text-slate-950"
      >
        {link.url}
      </a>
      <span className="text-sm text-slate-500">{money(link.price)}</span>
      <StatusBadge status={link.status} />
      <AccountBadge check={link.accountCheck} />
      <span className="text-xs text-slate-400">{formatDate(link.createdAt)}</span>
      {editable ? (
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            disabled={pending}
            className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      ) : (
        <span className="text-xs text-slate-400">locked</span>
      )}
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </div>
  );
}

const mini =
  "w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-slate-900";
