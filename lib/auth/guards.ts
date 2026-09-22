import type { SessionUser } from "@/lib/auth/session";

/**
 * Single source of truth for "where should this user be right now?".
 * Used after login and by each page guard to keep redirects consistent.
 */
export function routeForUser(user: SessionUser | null): string {
  if (!user) return "/login";
  // Admins go straight to the console; they don't need the applicant profile.
  if (user.isAdmin) return "/admin";
  if (!user.profile) return "/onboarding/profile";
  if (user.profile.status === "rejected") return "/rejected";
  if (user.profile.status === "approved") return "/dashboard";
  return "/pending";
}
