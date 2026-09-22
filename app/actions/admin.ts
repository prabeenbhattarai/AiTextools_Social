"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { sendStatusEmail } from "@/lib/email";
import type { UserProfile } from "@/lib/types";

export type ReviewDecision = "approve" | "reject";

export interface ReviewResult {
  ok: boolean;
  error?: string;
}

/**
 * Approve or reject a pending applicant. Only callable by an admin.
 * Writes the status change and notifies the user by email.
 */
export async function reviewUser(
  uid: string,
  decision: ReviewDecision,
  reason?: string,
): Promise<ReviewResult> {
  const admin = await getSessionUser();
  if (!admin?.isAdmin) return { ok: false, error: "Forbidden" };
  if (!uid) return { ok: false, error: "Missing user id" };

  const db = getAdminDb();
  const ref = db.collection("users").doc(uid);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, error: "User not found" };

  const data = snap.data() as UserProfile;
  const status = decision === "approve" ? "approved" : "rejected";

  await ref.update({
    status,
    approvedAt: decision === "approve" ? Date.now() : null,
    reviewedBy: admin.email,
    rejectionReason: decision === "reject" ? reason ?? null : null,
    updatedAt: Date.now(),
  });

  try {
    await sendStatusEmail(data.email, data.fullName, status, reason);
  } catch (e) {
    // Don't fail the review if the email provider is down; log it.
    console.error("Failed to send status email:", e);
  }

  revalidatePath("/admin");
  return { ok: true };
}
