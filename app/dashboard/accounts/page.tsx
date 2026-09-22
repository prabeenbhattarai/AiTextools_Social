import { getSessionUser } from "@/lib/auth/session";
import ProfilesForm from "../ProfilesForm";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My accounts</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your social accounts used to verify the links you submit.
        </p>
      </div>
      <ProfilesForm profiles={user.profiles} />
    </div>
  );
}
