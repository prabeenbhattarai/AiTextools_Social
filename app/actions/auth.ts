"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSession, destroySession, getSessionUser } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import {
  createMember,
  createUser,
  findUserByUsername,
  superadminExists,
  updateMemberCredentials,
} from "@/lib/data";
import { checkMaster } from "@/lib/auth/master";

export interface FormState {
  error?: string;
  ok?: boolean;
}

export interface MemberFormState extends FormState {
  credentials?: { username: string; password: string; fullName: string };
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

// Master-password recovery: create a new superadmin, or reset the password of
// an existing superadmin with that username. Then sign in.
export async function recoverAdminAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const master = String(formData.get("master") ?? "");
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!process.env.MASTER_PASSWORD) {
    return { error: "Recovery is not configured (MASTER_PASSWORD missing)." };
  }
  if (!checkMaster(master)) return { error: "Wrong master password." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const existing = await findUserByUsername(username);
  if (existing) {
    if (existing.doc.role !== "superadmin") {
      return { error: "That username belongs to a member. Choose another." };
    }
    const res = await updateMemberCredentials(existing.id, { password });
    if (!res.ok) return { error: res.error };
    await createSession(existing.id);
    redirect("/admin");
  }

  const res = await createUser({
    username,
    password,
    fullName: username,
    role: "superadmin",
    createdBy: null,
  });
  if (!res.ok) return { error: res.error };
  const found = await findUserByUsername(username);
  if (found) await createSession(found.id);
  redirect("/admin");
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
    fullName: username,
    role: "superadmin",
    createdBy: null,
  });
  if (!res.ok) return { error: res.error };

  const found = await findUserByUsername(username);
  if (found) await createSession(found.id);
  redirect("/admin");
}

// Superadmin-only: create a member from their full name.
// The system generates a unique username and password based on the first name.
export async function createMemberAction(
  _prev: MemberFormState,
  formData: FormData,
): Promise<MemberFormState> {
  const admin = await getSessionUser();
  if (admin?.role !== "superadmin") return { error: "Forbidden." };

  const fullName = String(formData.get("fullName") ?? "");
  const res = await createMember({ fullName, createdBy: admin.username });
  if (!res.ok) return { error: res.error };

  revalidatePath("/admin", "layout");
  return {
    ok: true,
    credentials: {
      username: res.username!,
      password: res.password!,
      fullName: fullName.trim(),
    },
  };
}
