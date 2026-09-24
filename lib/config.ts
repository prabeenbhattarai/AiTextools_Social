import type {
  Platform,
  LinkType,
  AccountCheck,
  PlatformProfiles,
  PricingOverride,
  PricingTable,
} from "@/lib/types";

// Add a new social platform here — the whole app (forms, filters, pricing)
// is driven by this config, so extending is a one-line change plus pricing.
export const PLATFORMS: { id: Platform; label: string }[] = [
  { id: "reddit", label: "Reddit" },
  { id: "linkedin", label: "LinkedIn" },
];

export const LINK_TYPES: { id: LinkType; label: string }[] = [
  { id: "post", label: "Post" },
  { id: "comment", label: "Comment" },
];

// Seed/default payout per approved item, in NPR (Rs). The live global rates are
// stored in Firestore (settings/pricing) and editable by the admin; this is the
// fallback used before any edit and the initial value shown in the editor.
export const DEFAULT_PRICING: PricingTable = {
  reddit: { post: 50, comment: 10 },
  linkedin: { post: 20, comment: 10 },
};

export const CURRENCY = "Rs";

// Nepali class-A commercial banks (for the member payment form).
export const NEPALI_BANKS: string[] = [
  "Nepal Bank Limited",
  "Rastriya Banijya Bank",
  "Agriculture Development Bank",
  "Nabil Bank",
  "Nepal Investment Mega Bank",
  "Standard Chartered Bank Nepal",
  "Himalayan Bank",
  "Nepal SBI Bank",
  "Everest Bank",
  "Kumari Bank",
  "Laxmi Sunrise Bank",
  "Citizens Bank International",
  "Prime Commercial Bank",
  "Sanima Bank",
  "Machhapuchchhre Bank",
  "NIC Asia Bank",
  "Global IME Bank",
  "NMB Bank",
  "Prabhu Bank",
  "Siddhartha Bank",
  "Nepal Credit and Commerce Bank",
];

/**
 * The amount a specific user earns for a platform/type: their override if set,
 * otherwise the global rate, otherwise the built-in default.
 */
export function effectivePrice(
  platform: Platform,
  type: LinkType,
  global: PricingTable | null | undefined,
  override?: PricingOverride | null,
): number {
  const o = override?.[platform]?.[type];
  if (typeof o === "number" && !Number.isNaN(o)) return o;
  const g = global?.[platform]?.[type];
  if (typeof g === "number" && !Number.isNaN(g)) return g;
  return DEFAULT_PRICING[platform]?.[type] ?? 0;
}

export function platformLabel(id: Platform): string {
  return PLATFORMS.find((p) => p.id === id)?.label ?? id;
}

/** Build a full rate table for a user (their overrides applied over global). */
export function effectiveTable(
  global: PricingTable | null | undefined,
  override?: PricingOverride | null,
): PricingTable {
  const out = {} as PricingTable;
  for (const p of PLATFORMS) {
    out[p.id] = {} as PricingTable[Platform];
    for (const t of LINK_TYPES) {
      out[p.id][t.id] = effectivePrice(p.id, t.id, global, override);
    }
  }
  return out;
}

/** Normalise a raw profile input to a bare handle for matching in a URL. */
export function extractHandle(platform: Platform, raw: string): string {
  const h = (raw ?? "").trim().toLowerCase();
  if (!h) return "";
  if (platform === "reddit") {
    const m = h.match(/reddit\.com\/(?:user|u)\/([^/?#\s]+)/);
    if (m) return m[1];
    return h.replace(/^https?:\/\//, "").replace(/^\/?(?:u|user)\//, "").replace(/^@/, "").replace(/\/.*$/, "");
  }
  if (platform === "linkedin") {
    const m = h.match(/linkedin\.com\/in\/([^/?#\s]+)/);
    if (m) return m[1];
    return h.replace(/^@/, "").replace(/\/.*$/, "");
  }
  return h.replace(/^@/, "");
}

/** Convert stored profiles (old single-string or new array) into a clean array map. */
export function normalizeProfiles(raw: unknown): PlatformProfiles {
  const out: PlatformProfiles = {};
  if (!raw || typeof raw !== "object") return out;
  const obj = raw as Record<string, unknown>;
  for (const p of PLATFORMS) {
    const v = obj[p.id];
    let arr: string[] = [];
    if (Array.isArray(v)) arr = v.filter((x): x is string => typeof x === "string");
    else if (typeof v === "string") arr = [v];
    arr = [...new Set(arr.map((s) => s.trim()).filter(Boolean))];
    if (arr.length) out[p.id] = arr;
  }
  return out;
}

/** All registered handles for a platform. */
export function handlesFor(
  platform: Platform,
  profiles: PlatformProfiles | null | undefined,
): string[] {
  return (profiles?.[platform] ?? [])
    .map((h) => extractHandle(platform, h))
    .filter(Boolean);
}

/**
 * Heuristic same-account check: does the submitted URL contain ANY of the
 * member's registered handles for that platform? Advisory only.
 */
export function checkAccount(
  platform: Platform,
  url: string,
  profiles: PlatformProfiles | null | undefined,
): AccountCheck {
  const handles = handlesFor(platform, profiles);
  if (!handles.length) return "unset";
  const u = url.toLowerCase();
  return handles.some((h) => u.includes(h)) ? "match" : "mismatch";
}

// Reddit: how long a post/comment must stay live before it can be approved.
export const REDDIT_HOLD_DAYS: Record<LinkType, number> = { post: 3, comment: 4 };
const DAY_MS = 24 * 60 * 60 * 1000;

/** Timestamp when a link becomes approvable (0 = immediately). */
export function approvableAt(
  platform: Platform,
  type: LinkType,
  createdAt: number,
): number {
  if (platform === "reddit") return createdAt + REDDIT_HOLD_DAYS[type] * DAY_MS;
  return 0;
}

export function isApprovable(
  platform: Platform,
  type: LinkType,
  createdAt: number,
  now: number = Date.now(),
): boolean {
  return now >= approvableAt(platform, type, createdAt);
}
