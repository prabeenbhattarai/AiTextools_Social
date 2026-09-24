import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";
import { getAdminDb } from "@/lib/firebase/admin";
import { normalizeProfiles } from "@/lib/config";
import type { AppUser, UserDoc } from "@/lib/types";

const COOKIE = "session";
const MAX_AGE_S = 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV !== "production") return "dev-insecure-secret-change-me";
  throw new Error("SESSION_SECRET is not set");
}

function sign(payload: Record<string, unknown>): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verify(token: string): { uid?: string; exp?: number } | null {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = crypto.createHmac("sha256", secret()).update(data).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const p = JSON.parse(Buffer.from(data, "base64url").toString());
    if (p.exp && Date.now() > p.exp) return null;
    return p;
  } catch {
    return null;
  }
}

export async function createSession(uid: string): Promise<void> {
  const token = sign({ uid, exp: Date.now() + MAX_AGE_S * 1000 });
  const c = await cookies();
  c.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export async function destroySession(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE);
}

export async function getSessionUser(): Promise<AppUser | null> {
  const c = await cookies();
  const token = c.get(COOKIE)?.value;
  if (!token) return null;
  const payload = verify(token);
  if (!payload?.uid) return null;

  const snap = await getAdminDb().collection("users").doc(payload.uid).get();
  if (!snap.exists) return null;
  const doc = snap.data() as UserDoc;
  if (!doc.active) return null;

  // Never expose the password hash.
  return {
    uid: snap.id,
    username: doc.username,
    fullName: doc.fullName ?? doc.username,
    role: doc.role,
    active: doc.active,
    createdAt: doc.createdAt,
    createdBy: doc.createdBy ?? null,
    pricing: doc.pricing ?? null,
    profiles: normalizeProfiles(doc.profiles),
  };
}
