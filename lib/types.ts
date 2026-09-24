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

/** A member's account handles per platform (used to verify links). Multiple allowed. */
export type PlatformProfiles = Partial<Record<Platform, string[]>>;

/** Result of checking whether a link belongs to the member's own account. */
export type AccountCheck = "match" | "mismatch" | "unset";

/* ----------------------------- Payment ----------------------------- */
export type PaymentMethod = "esewa" | "bank";

export interface EsewaDetails {
  fullName: string;
  number: string;
  /** Optional QR as a data: URL. */
  qr: string | null;
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  contact: string;
}

export interface PaymentDetails {
  method: PaymentMethod;
  esewa: EsewaDetails | null;
  bank: BankDetails | null;
  updatedAt: number;
}

/** A recorded payout made to a member. */
export interface Payout {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  amount: number;
  note: string;
  createdAt: number;
  createdBy: string;
}

/** Safe user shape (never includes secrets). */
export interface AppUser {
  uid: string;
  username: string;
  fullName: string;
  role: Role;
  active: boolean;
  createdAt: number;
  createdBy: string | null;
  /** Custom per-user rate override; null/absent = use global rates. */
  pricing: PricingOverride | null;
  /** The member's account handle per platform. */
  profiles: PlatformProfiles;
}

/** Firestore document for a user (server-only — has secrets). */
export interface UserDoc extends Omit<AppUser, "uid"> {
  passwordHash: string;
  /** AES-encrypted copy of the password so the admin can view it. */
  passwordEnc: string;
  /** How the member wants to be paid. */
  payment: PaymentDetails | null;
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
