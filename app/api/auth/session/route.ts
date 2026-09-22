import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase/admin";
import { SESSION_COOKIE, SESSION_EXPIRES_IN_MS } from "@/lib/auth/session";

// Exchange a freshly minted Firebase ID token for an httpOnly session cookie.
export async function POST(req: NextRequest) {
  let idToken: string | undefined;
  try {
    ({ idToken } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!idToken) {
    return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
  }

  try {
    const auth = getAdminAuth();
    await auth.verifyIdToken(idToken);
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_IN_MS,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, sessionCookie, {
      maxAge: SESSION_EXPIRES_IN_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

// Sign out: clear the session cookie.
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
