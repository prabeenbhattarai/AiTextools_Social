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

/**
 * Heuristic same-account check: does the submitted URL contain the member's
 * registered handle for that platform? Advisory only — the admin decides.
 */
export function checkAccount(
  platform: Platform,
  url: string,
  profiles: PlatformProfiles | null | undefined,
): AccountCheck {
  const handle = extractHandle(platform, profiles?.[platform] ?? "");
  if (!handle) return "unset";
  return url.toLowerCase().includes(handle) ? "match" : "mismatch";
}
