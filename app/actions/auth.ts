"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSession, destroySession, getSessionUser } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { createUser, findUserByUsername, superadminExists } from "@/lib/data";

export interface FormState {
  error?: string;
  ok?: boolean;
}

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) {
    return { error: "Enter your username and password." };
  }

  const found = await findUserByUsername(username);
  // Generic message so we don't reveal which usernames exist.
  if (!found || !verifyPassword(password, found.doc.passwordHash)) {
    return { error: "Invalid username or password." };
  }
  if (!found.doc.active) {
    return { error: "This account has been deactivated. Contact the admin." };
  }

  await createSession(found.id);
  redirect(found.doc.role === "superadmin" ? "/admin" : "/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function setupAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const secret = String(formData.get("secret") ?? "");
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!process.env.SETUP_SECRET) {
    return { error: "Setup is disabled (SETUP_SECRET not configured)." };
  }
  if (secret !== process.env.SETUP_SECRET) {
    return { error: "Invalid setup secret." };
  }
  if (await superadminExists()) {
    return { error: "A superadmin already exists. Setup is closed." };
  }

  const res = await createUser({
    username,
    password,
    role: "superadmin",
    createdBy: null,
  });
  if (!res.ok) return { error: res.error };

  const found = await findUserByUsername(username);
  if (found) await createSession(found.id);
  redirect("/admin");
}

// Superadmin-only: create a member account.
export async function createMemberAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await getSessionUser();
  if (admin?.role !== "superadmin") return { error: "Forbidden." };

  const res = await createUser({
    username: String(formData.get("username") ?? ""),
    password: String(formData.get("password") ?? ""),
    role: "member",
    createdBy: admin.username,
  });
  if (!res.ok) return { error: res.error };
  revalidatePath("/admin", "layout");
  return { ok: true };
}
