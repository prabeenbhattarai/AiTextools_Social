export type Role = "superadmin" | "member";
export type Platform = "reddit" | "linkedin";
export type LinkType = "post" | "comment";
export type LinkStatus = "pending" | "approved" | "rejected";

/** Full rate table: amount per platform per type (the global default). */
export type PricingTable = Record<Platform, Record<LinkType, number>>;
/** Optional per-user override; any missing entry falls back to the global rate. */
export type PricingOverride = Partial<
  Record<Platform, Partial<Record<LinkType, number>>>
>;

/** A member's account handle/profile per platform (used to verify links). */
export type PlatformProfiles = Partial<Record<Platform, string>>;

/** Result of checking whether a link belongs to the member's own account. */
export type AccountCheck = "match" | "mismatch" | "unset";

/** Safe user shape (never includes the password hash). */
export interface AppUser {
  uid: string;
  username: string;
  role: Role;
  active: boolean;
  createdAt: number;
  createdBy: string | null;
  /** Custom per-user rate override; null/absent = use global rates. */
  pricing: PricingOverride | null;
  /** The member's account handle per platform. */
  profiles: PlatformProfiles;
}

/** Firestore document for a user (server-only — has the hash). */
export interface UserDoc extends Omit<AppUser, "uid"> {
  passwordHash: string;
}

export interface LinkItem {
  id: string;
  userId: string;
  username: string;
  platform: Platform;
  type: LinkType;
  url: string;
  note: string;
  status: LinkStatus;
  price: number;
  accountCheck: AccountCheck;
  createdAt: number;
  updatedAt: number;
  reviewedBy: string | null;
  reviewedAt: number | null;
}
