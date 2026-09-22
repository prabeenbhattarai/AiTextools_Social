"use client";

import { useState, useTransition } from "react";
import {
  changeCredentialsAction,
  viewCredentialsAction,
} from "@/app/actions/credentials";

export default function CredentialsPanel({ uid }: { uid: string }) {
  const [master, setMaster] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<{ error?: string; ok?: string } | null>(null);
  const [pending, start] = useTransition();

  function unlock() {
    setMsg(null);
    start(async () => {
      const res = await viewCredentialsAction(uid, master);
      if (!res.ok) return setMsg({ error: res.error });
      setUnlocked(true);
      setUsername(res.username ?? "");
      setPassword(res.password ?? null);
      setNewUsername(res.username ?? "");
    });
  }

  function save() {
    setMsg(null);
    const patch: { username?: string; password?: string } = {};
    if (newUsername && newUsername !== username) patch.username = newUsername;
    if (newPassword) patch.password = newPassword;
    if (!patch.username && !patch.password) {
      return setMsg({ error: "Change the username or enter a new password." });
    }
    start(async () => {
      const res = await changeCredentialsAction(uid, master, patch);
      if (!res.ok) return setMsg({ error: res.error });
      setUsername(res.username ?? "");
      setPassword(res.password ?? null);
      setNewUsername(res.username ?? "");
      setNewPassword("");
      setMsg({ ok: "Credentials updated." });
    });
  }

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      {!unlocked ? (
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Master password
            </label>
            <input
              type="password"
              value={master}
              onChange={(e) => setMaster(e.target.value)}
              placeholder="required to view/change"
              className="mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-900"
            />
          </div>
          <button
            onClick={unlock}
            disabled={pending || !master}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Unlock
          </button>
          {msg?.error && <p className="w-full text-xs text-red-600">{msg.error}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Username
              </label>
              <input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 font-mono text-sm outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Current password
              </label>
              <div className="mt-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 font-mono text-sm text-slate-900">
                {password ?? "—"}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">
              New password <span className="text-slate-400">(leave blank to keep)</span>
            </label>
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="min 6 chars"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-900 sm:max-w-xs"
            />
          </div>
          {msg?.error && <p className="text-xs text-red-600">{msg.error}</p>}
          {msg?.ok && <p className="text-xs text-emerald-600">{msg.ok}</p>}
          <button
            onClick={save}
            disabled={pending}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Save changes
          </button>
        </div>
      )}
    </div>
  );
}
