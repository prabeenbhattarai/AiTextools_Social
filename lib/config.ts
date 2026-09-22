import type { Platform, LinkType } from "@/lib/types";

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

// Fixed payout per approved item, in NPR (Rs). Edit here to change prices.
export const PRICING: Record<Platform, Record<LinkType, number>> = {
  reddit: { post: 50, comment: 10 },
  linkedin: { post: 20, comment: 10 },
};

export const CURRENCY = "Rs";

export function priceFor(platform: Platform, type: LinkType): number {
  return PRICING[platform]?.[type] ?? 0;
}

export function platformLabel(id: Platform): string {
  return PLATFORMS.find((p) => p.id === id)?.label ?? id;
}
