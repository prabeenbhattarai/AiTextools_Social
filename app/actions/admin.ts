"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/session";
import { reviewLink, setUserActive } from "@/lib/data";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function reviewLinkAction(
  id: string,
  decision: "approve" | "reject",
): Promise<ActionResult> {
  const admin = await getSessionUser();
  if (admin?.role !== "superadmin") return { ok: false, error: "Forbidden." };
  await reviewLink(id, decision, admin.username);
  revalidatePath("/admin");
  return { ok: true };
}

export async function setMemberActiveAction(
  uid: string,
  active: boolean,
): Promise<ActionResult> {
  const admin = await getSessionUser();
  if (admin?.role !== "superadmin") return { ok: false, error: "Forbidden." };
  await setUserActive(uid, active);
  revalidatePath("/admin");
  return { ok: true };
}
