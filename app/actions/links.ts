"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/session";
import { createLink, deleteOwnLink, getGlobalPricing, updateOwnLink } from "@/lib/data";
import { PLATFORMS, LINK_TYPES, checkAccount, effectivePrice } from "@/lib/config";
import type { LinkType, Platform } from "@/lib/types";

export interface LinkFormState {
  error?: string;
  ok?: boolean;
}

function parseLink(formData: FormData) {
  const platform = String(formData.get("platform") ?? "") as Platform;
  const type = String(formData.get("type") ?? "") as LinkType;
  const url = String(formData.get("url") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!PLATFORMS.some((p) => p.id === platform)) return { error: "Choose a platform." };
  if (!LINK_TYPES.some((t) => t.id === type)) return { error: "Choose post or comment." };
  if (!/^https?:\/\/.+/i.test(url)) return { error: "Enter a valid link (http/https)." };
  return { platform, type, url, note };
}

export async function createLinkAction(
  _prev: LinkFormState,
  formData: FormData,
): Promise<LinkFormState> {
  const user = await getSessionUser();
  if (!user || user.role !== "member") return { error: "Forbidden." };

  const parsed = parseLink(formData);
  if ("error" in parsed) return { error: parsed.error };

  const global = await getGlobalPricing();
  await createLink({
    userId: user.uid,
    username: user.username,
    platform: parsed.platform,
    type: parsed.type,
    url: parsed.url,
    note: parsed.note,
    price: effectivePrice(parsed.platform, parsed.type, global, user.pricing),
    accountCheck: checkAccount(parsed.platform, parsed.url, user.profiles),
  });
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function updateLinkAction(
  id: string,
  formData: FormData,
): Promise<LinkFormState> {
  const user = await getSessionUser();
  if (!user) return { error: "Forbidden." };
  const parsed = parseLink(formData);
  if ("error" in parsed) return { error: parsed.error };

  const global = await getGlobalPricing();
  const res = await updateOwnLink(id, user.uid, {
    ...parsed,
    price: effectivePrice(parsed.platform, parsed.type, global, user.pricing),
    accountCheck: checkAccount(parsed.platform, parsed.url, user.profiles),
  });
  if (!res.ok) return { error: res.error };
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function deleteLinkAction(id: string): Promise<LinkFormState> {
  const user = await getSessionUser();
  if (!user) return { error: "Forbidden." };
  const res = await deleteOwnLink(id, user.uid);
  if (!res.ok) return { error: res.error };
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
