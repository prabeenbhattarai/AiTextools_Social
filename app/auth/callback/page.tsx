"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";

const EMAIL_KEY = "emailForSignIn";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Signing you in…");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard against React strict-mode double run
    ran.current = true;

    (async () => {
      try {
        const auth = getClientAuth();
        if (!isSignInWithEmailLink(auth, window.location.href)) {
          setStatus("This sign-in link is invalid or has expired.");
          return;
        }

        let email = window.localStorage.getItem(EMAIL_KEY);
        if (!email) {
          email = window.prompt("Please confirm your email to finish signing in");
        }
        if (!email) {
          setStatus("An email is required to complete sign-in.");
          return;
        }

        const cred = await signInWithEmailLink(
          auth,
          email,
          window.location.href,
        );
        window.localStorage.removeItem(EMAIL_KEY);

        const idToken = await cred.user.getIdToken();
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
        if (!res.ok) throw new Error("Could not create a session.");

        // Server decides where to send the user based on profile/status.
        router.replace("/post-login");
      } catch (err) {
        setStatus(
          err instanceof Error
            ? err.message
            : "Something went wrong while signing you in.",
        );
      }
    })();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-slate-700">{status}</p>
        <a
          href="/login"
          className="mt-4 inline-block text-sm text-slate-500 underline underline-offset-2"
        >
          Back to sign in
        </a>
      </div>
    </main>
  );
}
