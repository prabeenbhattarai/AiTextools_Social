import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { routeForUser } from "@/lib/auth/guards";

// Server-side router: reads the freshly created session and sends the user
// to the correct place (profile form / pending / dashboard / admin).
export default async function PostLoginPage() {
  const user = await getSessionUser();
  redirect(routeForUser(user));
}
