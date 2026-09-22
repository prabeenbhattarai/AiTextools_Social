export type Role = "superadmin" | "member";
export type Platform = "reddit" | "linkedin";
export type LinkType = "post" | "comment";
export type LinkStatus = "pending" | "approved" | "rejected";

/** Safe user shape (never includes the password hash). */
export interface AppUser {
  uid: string;
  username: string;
  role: Role;
  active: boolean;
  createdAt: number;
  createdBy: string | null;
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
  createdAt: number;
  updatedAt: number;
  reviewedBy: string | null;
  reviewedAt: number | null;
}
