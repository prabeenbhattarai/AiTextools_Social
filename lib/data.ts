import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { hashPassword } from "@/lib/auth/password";
import { priceFor } from "@/lib/config";
import type {
  AppUser,
  LinkItem,
  LinkStatus,
  LinkType,
  Platform,
  Role,
  UserDoc,
} from "@/lib/types";

const db = () => getAdminDb();

/* ----------------------------- Users ----------------------------- */

function toAppUser(id: string, d: UserDoc): AppUser {
  return {
    uid: id,
    username: d.username,
    role: d.role,
    active: d.active,
    createdAt: d.createdAt,
    createdBy: d.createdBy ?? null,
  };
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
    passwordHash: hashPassword(params.password),
    role: params.role,
    active: true,
    createdAt: Date.now(),
    createdBy: params.createdBy,
  };
  await db().collection("users").add(doc);
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

/* ----------------------------- Links ----------------------------- */

export async function createLink(params: {
  userId: string;
  username: string;
  platform: Platform;
  type: LinkType;
  url: string;
  note: string;
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
    price: priceFor(params.platform, params.type),
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
  patch: { platform: Platform; type: LinkType; url: string; note: string },
): Promise<{ ok: boolean; error?: string }> {
  const link = await getLink(id);
  if (!link || link.userId !== userId) return { ok: false, error: "Not found." };
  if (link.status !== "pending") {
    return { ok: false, error: "Only pending links can be edited." };
  }
  await db()
    .collection("links")
    .doc(id)
    .update({
      ...patch,
      price: priceFor(patch.platform, patch.type),
      updatedAt: Date.now(),
    });
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
): Promise<void> {
  await db()
    .collection("links")
    .doc(id)
    .update({
      status: decision === "approve" ? "approved" : "rejected",
      reviewedBy: reviewer,
      reviewedAt: Date.now(),
      updatedAt: Date.now(),
    });
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
