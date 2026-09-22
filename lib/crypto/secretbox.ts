import "server-only";
import crypto from "crypto";

// Reversible encryption for stored member passwords so the admin can view them.
// Key derived from SESSION_SECRET; ciphertext stored as "iv:tag:data" hex.
function key(): Buffer {
  const s = process.env.SESSION_SECRET ?? "dev-insecure-secret-change-me";
  return crypto.scryptSync(s, "credential-encryption-v1", 32);
}

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("hex"), tag.toString("hex"), enc.toString("hex")].join(":");
}

export function decryptSecret(blob: string | undefined | null): string | null {
  if (!blob) return null;
  try {
    const [ivh, tagh, ench] = blob.split(":");
    if (!ivh || !tagh || !ench) return null;
    const decipher = crypto.createDecipheriv("aes-256-gcm", key(), Buffer.from(ivh, "hex"));
    decipher.setAuthTag(Buffer.from(tagh, "hex"));
    return Buffer.concat([
      decipher.update(Buffer.from(ench, "hex")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
}
