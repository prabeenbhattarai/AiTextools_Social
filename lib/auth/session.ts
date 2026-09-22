import "server-only";
import { cookies } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import type { UserProfile } from "@/lib/types";

export const SESSION_COOKIE = "session";
// Session cookie lifetime (Firebase allows up to 14 days).
export const SESSION_EXPIRES_IN_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

/** Emails that are treated as admins, from the ADMIN_EMAILS env (comma separated). */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

export interface SessionUser {
  uid: string;
  email: string;
  profile: UserProfile | null;
  isAdmin: boolean;
}

/**
 * Reads and verifies the Firebase session cookie, then loads the user's
 * Firestore profile. Returns null when there is no valid session.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  if (!session) return null;

  try {
    const decoded = await getAdminAuth().verifySessionCookie(session, true);
    const email = (decoded.email ?? "").toLowerCase();

    const snap = await getAdminDb().collection("users").doc(decoded.uid).get();
    const profile = snap.exists ? (snap.data() as UserProfile) : null;

    return {
      uid: decoded.uid,
      email,
      profile,
      isAdmin: isAdminEmail(email) || profile?.role === "admin",
    };
  } catch {
    // Expired / revoked / tampered cookie.
    return null;
  }
}
