"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/session";
import { setUserProfiles } from "@/lib/data";
import { PLATFORMS } from "@/lib/config";
import type { PlatformProfiles } from "@/lib/types";

export interface ProfileState {
  error?: string;
  ok?: boolean;
}

export async function saveProfilesAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await getSessionUser();
  if (!user || user.role !== "member") return { error: "Forbidden." };

  const profiles: PlatformProfiles = {};
  for (const p of PLATFORMS) {
    const v = String(formData.get(`profile_${p.id}`) ?? "").trim();
    if (v) profiles[p.id] = v;
  }
  await setUserProfiles(user.uid, profiles);
  revalidatePath("/dashboard");
  return { ok: true };
}
