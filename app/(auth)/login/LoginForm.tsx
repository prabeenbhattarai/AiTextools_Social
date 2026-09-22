"use client";

import { useState } from "react";
import { sendSignInLinkToEmail } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";

const EMAIL_KEY = "emailForSignIn";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const url = `${window.location.origin}/auth/callback`;
      await sendSignInLinkToEmail(getClientAuth(), email, {
        url,
        handleCodeInApp: true,
      });
      window.localStorage.setItem(EMAIL_KEY, email);
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not send the sign-in link.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        <p className="font-medium">Check your inbox 📬</p>
        <p className="mt-1">
          We sent a sign-in link to <strong>{email}</strong>. Open it on this
          device to continue.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-3 text-emerald-700 underline underline-offset-2"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700"
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? "Sending link…" : "Send magic link"}
      </button>
      <p className="text-center text-xs text-slate-500">
        No password needed — we email you a secure sign-in link.
      </p>
    </form>
  );
}
