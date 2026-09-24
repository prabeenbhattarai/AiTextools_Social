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
    const vals = formData
      .getAll(`profile_${p.id}`)
      .map((v) => String(v).trim())
      .filter(Boolean);
    const uniq = [...new Set(vals)];
    if (uniq.length) profiles[p.id] = uniq;
  }
  await setUserProfiles(user.uid, profiles);
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
