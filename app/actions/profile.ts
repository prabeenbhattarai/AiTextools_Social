"use server";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import type { Occupation, UserProfile } from "@/lib/types";

export interface ProfileFormState {
  error?: string;
}

const OCCUPATIONS: Occupation[] = ["school", "college", "job", "other"];

export async function saveProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const fullName = String(formData.get("fullName") ?? "").trim();
  const ageRaw = String(formData.get("age") ?? "").trim();
  const occupation = String(formData.get("occupation") ?? "") as Occupation;
  const occupationDetail = String(formData.get("occupationDetail") ?? "").trim();
  const qualifications = String(formData.get("qualifications") ?? "").trim();
  const skills = String(formData.get("skills") ?? "").trim();

  // --- Validation ---
  if (!fullName) return { error: "Full name is required." };
  const age = Number(ageRaw);
  if (!ageRaw || Number.isNaN(age) || age < 13 || age > 100) {
    return { error: "Please enter a valid age between 13 and 100." };
  }
  if (!OCCUPATIONS.includes(occupation)) {
    return { error: "Please select what you are currently doing." };
  }

  const now = Date.now();
  const db = getAdminDb();
  const existing = await db.collection("users").doc(user.uid).get();

  const profile: UserProfile = {
    uid: user.uid,
    email: user.email,
    fullName,
    age,
    occupation,
    occupationDetail,
    qualifications,
    skills,
    // Never let the client change these — always server-controlled.
    status: existing.exists
      ? (existing.data() as UserProfile).status
      : "pending",
    role: existing.exists ? (existing.data() as UserProfile).role : "user",
    createdAt: existing.exists
      ? (existing.data() as UserProfile).createdAt
      : now,
    updatedAt: now,
    approvedAt: existing.exists
      ? (existing.data() as UserProfile).approvedAt ?? null
      : null,
    reviewedBy: existing.exists
      ? (existing.data() as UserProfile).reviewedBy ?? null
      : null,
    rejectionReason: existing.exists
      ? (existing.data() as UserProfile).rejectionReason ?? null
      : null,
  };

  await db.collection("users").doc(user.uid).set(profile, { merge: true });

  redirect("/pending");
}
