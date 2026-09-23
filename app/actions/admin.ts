"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/session";
import {
  addPayout,
  deletePayout,
  getGlobalPricing,
  getLink,
  getUserById,
  reviewLink,
  setGlobalPricing,
  setUserActive,
  setUserPricing,
} from "@/lib/data";
import { PLATFORMS, LINK_TYPES, effectivePrice } from "@/lib/config";
import type { Platform, PricingOverride, PricingTable } from "@/lib/types";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

async function requireAdmin() {
  const admin = await getSessionUser();
  return admin?.role === "superadmin" ? admin : null;
}

export async function reviewLinkAction(
  id: string,
  decision: "approve" | "reject",
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Forbidden." };

  let price: number | undefined;
  if (decision === "approve") {
    const link = await getLink(id);
    if (!link) return { ok: false, error: "Link not found." };
    const [global, owner] = await Promise.all([
      getGlobalPricing(),
      getUserById(link.userId),
    ]);
    price = effectivePrice(link.platform, link.type, global, owner?.pricing);
  }

  await reviewLink(id, decision, admin.username, price);
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function setMemberActiveAction(
  uid: string,
  active: boolean,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Forbidden." };
  await setUserActive(uid, active);
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export interface PricingState {
  ok?: boolean;
  error?: string;
}

export async function setGlobalPricingAction(
  _prev: PricingState,
  formData: FormData,
): Promise<PricingState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden." };

  const table = {} as PricingTable;
  for (const p of PLATFORMS) {
    table[p.id] = { post: 0, comment: 0 };
    for (const t of LINK_TYPES) {
      const n = Number(formData.get(`${p.id}_${t.id}`));
      if (Number.isNaN(n) || n < 0) return { error: "Rates must be 0 or more." };
      table[p.id][t.id] = n;
    }
  }
  await setGlobalPricing(table);
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function recordPayoutAction(
  userId: string,
  amount: number,
  note: string,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Forbidden." };
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Enter an amount greater than 0." };
  }
  const member = await getUserById(userId);
  if (!member) return { ok: false, error: "Member not found." };

  await addPayout({
    userId,
    username: member.username,
    fullName: member.fullName,
    amount: Math.round(amount),
    note: note.trim(),
    createdBy: admin.username,
  });
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function deletePayoutAction(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Forbidden." };
  await deletePayout(id);
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/** Set (or clear, when override is null) a member's custom rate. */
export async function setMemberPricingAction(
  uid: string,
  override: PricingOverride | null,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Forbidden." };
  await setUserPricing(uid, override);
  revalidatePath("/admin", "layout");
  return { ok: true };
}
