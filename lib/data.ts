import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { hashPassword } from "@/lib/auth/password";
import { encryptSecret, decryptSecret } from "@/lib/crypto/secretbox";
import { DEFAULT_PRICING, normalizeProfiles } from "@/lib/config";
import type {
  AccountCheck,
  AppUser,
  LinkItem,
  LinkStatus,
  LinkType,
  PaymentDetails,
  Payout,
  Platform,
  PlatformProfiles,
  PricingOverride,
  PricingTable,
  Role,
  UserDoc,
} from "@/lib/types";

const db = () => getAdminDb();

/* ----------------------------- Users ----------------------------- */

function toAppUser(id: string, d: UserDoc): AppUser {
  return {
    uid: id,
    username: d.username,
    fullName: d.fullName ?? d.username,
    role: d.role,
    active: d.active,
    createdAt: d.createdAt,
    createdBy: d.createdBy ?? null,
    pricing: d.pricing ?? null,
    profiles: normalizeProfiles(d.profiles),
  };
}

export async function getUserById(uid: string): Promise<AppUser | null> {
  const snap = await db().collection("users").doc(uid).get();
  if (!snap.exists) return null;
  return toAppUser(snap.id, snap.data() as UserDoc);
}

export async function findUserByUsername(
  username: string,
): Promise<{ id: string; doc: UserDoc } | null> {
  const uname = username.trim().toLowerCase();
  const snap = await db()
    .collection("users")
    .where("username", "==", uname)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, doc: d.data() as UserDoc };
}

export async function superadminExists(): Promise<boolean> {
  const snap = await db()
    .collection("users")
    .where("role", "==", "superadmin")
    .limit(1)
    .get();
  return !snap.empty;
}

export async function createUser(params: {
  username: string;
  password: string;
  fullName: string;
  role: Role;
  createdBy: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const username = params.username.trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,20}$/.test(username)) {
    return {
      ok: false,
      error:
        "Username must be 3–20 chars: letters, numbers, dot, dash or underscore.",
    };
  }
  if (params.password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }
  if (await findUserByUsername(username)) {
    return { ok: false, error: "That username is already taken." };
  }
  const doc: UserDoc = {
    username,
    fullName: params.fullName.trim() || username,
    passwordHash: hashPassword(params.password),
    passwordEnc: encryptSecret(params.password),
    role: params.role,
    active: true,
    createdAt: Date.now(),
    createdBy: params.createdBy,
    pricing: null,
    profiles: {},
    payment: null,
  };
  await db().collection("users").add(doc);
  return { ok: true };
}

function firstNameSlug(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0] ?? "";
  const slug = first.toLowerCase().replace(/[^a-z0-9]/g, "");
  return slug || "user";
}

async function generateUsername(base: string): Promise<string> {
  // Try the bare first name, then firstname + random digits until unique.
  if (base.length >= 3 && !(await findUserByUsername(base))) return base;
  for (let i = 0; i < 40; i++) {
    const candidate = `${base}${Math.floor(100 + Math.random() * 900)}`;
    if (candidate.length <= 20 && !(await findUserByUsername(candidate))) {
      return candidate;
    }
  }
  return `${base}${Date.now().toString().slice(-5)}`;
}

/**
 * Create a member from a full name: auto-generates a unique username and a
 * password, both based on the first name. Returns the generated credentials so
 * the admin can share them.
 */
export async function createMember(params: {
  fullName: string;
  createdBy: string | null;
}): Promise<{ ok: boolean; error?: string; username?: string; password?: string }> {
  const fullName = params.fullName.trim();
  if (fullName.length < 2) return { ok: false, error: "Enter the member's full name." };

  const base = firstNameSlug(fullName);
  const username = await generateUsername(base);
  const firstCap = base.charAt(0).toUpperCase() + base.slice(1);
  const password = `${firstCap}${Math.floor(1000 + Math.random() * 9000)}`;

  const res = await createUser({
    username,
    password,
    fullName,
    role: "member",
    createdBy: params.createdBy,
  });
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, username, password };
}

export async function getMemberCredentials(
  uid: string,
): Promise<{ username: string; fullName: string; password: string | null } | null> {
  const snap = await db().collection("users").doc(uid).get();
  if (!snap.exists) return null;
  const d = snap.data() as UserDoc;
  return {
    username: d.username,
    fullName: d.fullName ?? d.username,
    password: decryptSecret(d.passwordEnc),
  };
}

export async function updateMemberCredentials(
  uid: string,
  patch: { username?: string; password?: string },
): Promise<{ ok: boolean; error?: string }> {
  const snap = await db().collection("users").doc(uid).get();
  if (!snap.exists) return { ok: false, error: "Member not found." };
  const update: Record<string, unknown> = {};

  if (patch.username !== undefined) {
    const uname = patch.username.trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,20}$/.test(uname)) {
      return { ok: false, error: "Username must be 3–20 chars (letters, numbers, . _ -)." };
    }
    const existing = await findUserByUsername(uname);
    if (existing && existing.id !== uid) {
      return { ok: false, error: "That username is already taken." };
    }
    update.username = uname;
  }

  if (patch.password !== undefined && patch.password !== "") {
    if (patch.password.length < 6) {
      return { ok: false, error: "Password must be at least 6 characters." };
    }
    update.passwordHash = hashPassword(patch.password);
    update.passwordEnc = encryptSecret(patch.password);
  }

  if (Object.keys(update).length === 0) return { ok: false, error: "Nothing to change." };
  await db().collection("users").doc(uid).update(update);
  return { ok: true };
}

export async function listMembers(): Promise<AppUser[]> {
  const snap = await db()
    .collection("users")
    .where("role", "==", "member")
    .get();
  const users = snap.docs.map((d) => toAppUser(d.id, d.data() as UserDoc));
  users.sort((a, b) => b.createdAt - a.createdAt);
  return users;
}

export async function setUserActive(
  uid: string,
  active: boolean,
): Promise<void> {
  await db().collection("users").doc(uid).update({ active });
}

export async function setUserPricing(
  uid: string,
  pricing: PricingOverride | null,
): Promise<void> {
  await db().collection("users").doc(uid).update({ pricing: pricing ?? null });
}

export async function setUserProfiles(
  uid: string,
  profiles: PlatformProfiles,
): Promise<void> {
  await db().collection("users").doc(uid).update({ profiles });
}

export async function getUserPayment(uid: string): Promise<PaymentDetails | null> {
  const snap = await db().collection("users").doc(uid).get();
  if (!snap.exists) return null;
  return (snap.data() as UserDoc).payment ?? null;
}

export async function setUserPayment(
  uid: string,
  payment: PaymentDetails,
): Promise<void> {
  await db().collection("users").doc(uid).update({ payment });
}

/* --------------------------- Global pricing --------------------------- */

export async function getGlobalPricing(): Promise<PricingTable> {
  const snap = await db().collection("settings").doc("pricing").get();
  if (snap.exists) {
    // Merge over defaults so a newly added platform/type never comes back undefined.
    const stored = snap.data() as Partial<PricingTable>;
    return {
      reddit: { ...DEFAULT_PRICING.reddit, ...(stored.reddit ?? {}) },
      linkedin: { ...DEFAULT_PRICING.linkedin, ...(stored.linkedin ?? {}) },
    };
  }
  return DEFAULT_PRICING;
}

export async function setGlobalPricing(table: PricingTable): Promise<void> {
  await db().collection("settings").doc("pricing").set(table);
}

/* ----------------------------- Links ----------------------------- */

export async function createLink(params: {
  userId: string;
  username: string;
  platform: Platform;
  type: LinkType;
  url: string;
  note: string;
  price: number;
  accountCheck: AccountCheck;
}): Promise<void> {
  const now = Date.now();
  const item: Omit<LinkItem, "id"> = {
    userId: params.userId,
    username: params.username,
    platform: params.platform,
    type: params.type,
    url: params.url,
    note: params.note,
    status: "pending",
    price: params.price,
    accountCheck: params.accountCheck,
    createdAt: now,
    updatedAt: now,
    reviewedBy: null,
    reviewedAt: null,
  };
  await db().collection("links").add(item);
}

export async function getLink(id: string): Promise<LinkItem | null> {
  const snap = await db().collection("links").doc(id).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as Omit<LinkItem, "id">) };
}

export async function updateOwnLink(
  id: string,
  userId: string,
  patch: {
    platform: Platform;
    type: LinkType;
    url: string;
    note: string;
    price: number;
    accountCheck: AccountCheck;
  },
): Promise<{ ok: boolean; error?: string }> {
  const link = await getLink(id);
  if (!link || link.userId !== userId) return { ok: false, error: "Not found." };
  if (link.status !== "pending") {
    return { ok: false, error: "Only pending links can be edited." };
  }
  await db()
    .collection("links")
    .doc(id)
    .update({ ...patch, updatedAt: Date.now() });
  return { ok: true };
}

export async function deleteOwnLink(
  id: string,
  userId: string,
): Promise<{ ok: boolean; error?: string }> {
  const link = await getLink(id);
  if (!link || link.userId !== userId) return { ok: false, error: "Not found." };
  if (link.status !== "pending") {
    return { ok: false, error: "Only pending links can be deleted." };
  }
  await db().collection("links").doc(id).delete();
  return { ok: true };
}

export async function reviewLink(
  id: string,
  decision: "approve" | "reject",
  reviewer: string,
  price?: number,
): Promise<void> {
  const patch: Record<string, unknown> = {
    status: decision === "approve" ? "approved" : "rejected",
    reviewedBy: reviewer,
    reviewedAt: Date.now(),
    updatedAt: Date.now(),
  };
  // Lock in the current effective price at approval time.
  if (decision === "approve" && typeof price === "number") patch.price = price;
  await db().collection("links").doc(id).update(patch);
}

export async function listLinksByUser(userId: string): Promise<LinkItem[]> {
  const snap = await db()
    .collection("links")
    .where("userId", "==", userId)
    .get();
  const items = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<LinkItem, "id">),
  }));
  items.sort((a, b) => b.createdAt - a.createdAt);
  return items;
}

export async function listAllLinks(filters?: {
  platform?: Platform | "all";
  status?: LinkStatus | "all";
}): Promise<LinkItem[]> {
  const snap = await db().collection("links").get();
  let items = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<LinkItem, "id">),
  }));
  if (filters?.platform && filters.platform !== "all") {
    items = items.filter((i) => i.platform === filters.platform);
  }
  if (filters?.status && filters.status !== "all") {
    items = items.filter((i) => i.status === filters.status);
  }
  items.sort((a, b) => b.createdAt - a.createdAt);
  return items;
}

/* ----------------------------- Payouts ----------------------------- */

export async function addPayout(params: {
  userId: string;
  username: string;
  fullName: string;
  amount: number;
  note: string;
  createdBy: string;
}): Promise<void> {
  await db().collection("payouts").add({
    userId: params.userId,
    username: params.username,
    fullName: params.fullName,
    amount: params.amount,
    note: params.note,
    createdAt: Date.now(),
    createdBy: params.createdBy,
  });
}

export async function listPayouts(): Promise<Payout[]> {
  const snap = await db().collection("payouts").get();
  const items = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Payout, "id">),
  }));
  items.sort((a, b) => b.createdAt - a.createdAt);
  return items;
}

export async function deletePayout(id: string): Promise<void> {
  await db().collection("payouts").doc(id).delete();
}

/** Total already paid to one member. */
export async function getMemberPaid(uid: string): Promise<number> {
  const snap = await db().collection("payouts").where("userId", "==", uid).get();
  return snap.docs.reduce((s, d) => s + ((d.data() as Payout).amount ?? 0), 0);
}

/** A member's own payout history (payments received). */
export async function listPayoutsForUser(uid: string): Promise<Payout[]> {
  const snap = await db().collection("payouts").where("userId", "==", uid).get();
  const items = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Payout, "id">),
  }));
  items.sort((a, b) => b.createdAt - a.createdAt);
  return items;
}

/** Other members' live links (for the Engage section) — excludes rejected and own. */
export async function listEngageLinks(excludeUserId: string): Promise<LinkItem[]> {
  const snap = await db().collection("links").get();
  const items = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<LinkItem, "id">) }))
    .filter((l) => l.userId !== excludeUserId && l.status !== "rejected");
  items.sort((a, b) => b.createdAt - a.createdAt);
  return items;
}

/* ----------------------------- Stats ----------------------------- */

export interface Stats {
  approvedPosts: number;
  approvedComments: number;
  pending: number;
  rejected: number;
  earnings: number;
}

export function computeStats(links: LinkItem[]): Stats {
  const s: Stats = {
    approvedPosts: 0,
    approvedComments: 0,
    pending: 0,
    rejected: 0,
    earnings: 0,
  };
  for (const l of links) {
    if (l.status === "pending") s.pending++;
    else if (l.status === "rejected") s.rejected++;
    else if (l.status === "approved") {
      if (l.type === "post") s.approvedPosts++;
      else s.approvedComments++;
      s.earnings += l.price;
    }
  }
  return s;
}
