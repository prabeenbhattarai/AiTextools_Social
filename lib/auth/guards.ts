import type { AppUser } from "@/lib/types";

/** Where a user belongs based on role. */
export function routeForUser(user: AppUser | null): string {
  if (!user) return "/login";
  return user.role === "superadmin" ? "/admin" : "/dashboard";
}
