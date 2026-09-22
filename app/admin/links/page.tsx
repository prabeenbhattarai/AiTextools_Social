import { listAllLinks } from "@/lib/data";
import Filters from "../Filters";
import AdminLinkRow from "../AdminLinkRow";
import type { LinkStatus, Platform } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminLinksPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; status?: string; account?: string }>;
}) {
  const sp = await searchParams;
  const platform = (sp.platform ?? "all") as Platform | "all";
  const status = (sp.status ?? "all") as LinkStatus | "all";
  const account = sp.account ?? "all";

  const all = await listAllLinks();
  const filtered = all.filter(
    (l) =>
      (platform === "all" || l.platform === platform) &&
      (status === "all" || l.status === status) &&
      (account === "all" || l.accountCheck === account),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Links</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filtered.length} link{filtered.length === 1 ? "" : "s"} shown.
          </p>
        </div>
        <Filters />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No links match these filters.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Member</th>
                <th className="px-4 py-2 font-medium">Platform</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Link</th>
                <th className="px-4 py-2 font-medium">Price</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((link) => (
                <AdminLinkRow key={link.id} link={link} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
