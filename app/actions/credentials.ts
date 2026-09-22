"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/session";
import { checkMaster } from "@/lib/auth/master";
import { getMemberCredentials, updateMemberCredentials } from "@/lib/data";

export interface CredResult {
  ok: boolean;
  error?: string;
  username?: string;
  password?: string | null;
  fullName?: string;
}

async function guard(master: string): Promise<string | null> {
  const admin = await getSessionUser();
  if (admin?.role !== "superadmin") return "Forbidden.";
  if (!process.env.MASTER_PASSWORD) return "Master password is not configured.";
  if (!checkMaster(master)) return "Wrong master password.";
  return null;
}

export async function viewCredentialsAction(
  uid: string,
  master: string,
): Promise<CredResult> {
  const err = await guard(master);
  if (err) return { ok: false, error: err };

  const cred = await getMemberCredentials(uid);
  if (!cred) return { ok: false, error: "Member not found." };
  return {
    ok: true,
    username: cred.username,
    password: cred.password,
    fullName: cred.fullName,
  };
}

export async function changeCredentialsAction(
  uid: string,
  master: string,
  patch: { username?: string; password?: string },
): Promise<CredResult> {
  const err = await guard(master);
  if (err) return { ok: false, error: err };

  const res = await updateMemberCredentials(uid, patch);
  if (!res.ok) return { ok: false, error: res.error };

  revalidatePath("/admin", "layout");
  const cred = await getMemberCredentials(uid);
  return {
    ok: true,
    username: cred?.username,
    password: cred?.password,
    fullName: cred?.fullName,
  };
}
