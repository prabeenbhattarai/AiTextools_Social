import "server-only";
import crypto from "crypto";

/**
 * Gate for sensitive credential actions (view/change member logins).
 * Checks the provided value against the MASTER_PASSWORD env, in constant time.
 */
export function checkMaster(input: string): boolean {
  const master = process.env.MASTER_PASSWORD;
  if (!master || !input) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(master);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
