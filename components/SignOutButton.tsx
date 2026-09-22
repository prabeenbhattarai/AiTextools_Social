"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";

export default function SignOutButton({
  className = "",
}: {
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      await signOut(getClientAuth());
    } catch {
      // ignore — we still clear the server session below
    }
    await fetch("/api/auth/session", { method: "DELETE" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className={
        "text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50 " +
        className
      }
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
