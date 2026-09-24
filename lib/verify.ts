import "server-only";
import { checkAccount, handlesFor } from "@/lib/config";
import type { AccountCheck, LinkType, Platform, PlatformProfiles } from "@/lib/types";

/**
 * Verify a submitted link belongs to the member's registered account.
 * - Reddit: fetches the public `.json` and compares the real author.
 * - Others (LinkedIn): falls back to matching the handle inside the URL.
 * On any network/parse failure, returns "unset" so the admin reviews manually
 * (never a false "mismatch").
 */
export async function verifyAccount(
  platform: Platform,
  type: LinkType,
  url: string,
  profiles: PlatformProfiles | null | undefined,
): Promise<AccountCheck> {
  if (platform === "reddit") {
    return verifyReddit(type, url, profiles);
  }
  return checkAccount(platform, url, profiles);
}

async function verifyReddit(
  type: LinkType,
  url: string,
  profiles: PlatformProfiles | null | undefined,
): Promise<AccountCheck> {
  const handles = handlesFor("reddit", profiles);
  if (!handles.length) return "unset";

  const author = await fetchRedditAuthor(url, type);
  if (author === null) return "unset"; // could not determine — manual review
  const a = author.toLowerCase();
  return handles.some((h) => h.toLowerCase() === a) ? "match" : "mismatch";
}

async function fetchRedditAuthor(
  url: string,
  type: LinkType,
): Promise<string | null> {
  try {
    const clean = url.split("?")[0].split("#")[0].replace(/\/+$/, "");
    if (!/reddit\.com\//i.test(clean)) return null;
    const jsonUrl = `${clean}.json?raw_json=1&limit=1`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(jsonUrl, {
      headers: { "User-Agent": "LinkTracker/1.0 (verification)" },
      signal: controller.signal,
      cache: "no-store",
    }).finally(() => clearTimeout(timer));

    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;

    // data[0] = the post listing, data[1] = the comment listing (if any).
    const idx = type === "comment" && data[1] ? 1 : 0;
    const author = data[idx]?.data?.children?.[0]?.data?.author;
    return typeof author === "string" && author ? author : null;
  } catch {
    return null;
  }
}
