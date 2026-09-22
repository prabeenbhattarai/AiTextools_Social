import { getSessionUser } from "@/lib/auth/session";
import { listLinksByUser } from "@/lib/data";
import MyLinks from "../MyLinks";

export const dynamic = "force-dynamic";

export default async function MyLinksPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const links = await listLinksByUser(user.uid);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My links</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your submitted links and their status.
        </p>
      </div>
      <MyLinks links={links} />
    </div>
  );
}
