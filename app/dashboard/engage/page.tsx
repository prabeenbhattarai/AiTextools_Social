import { getSessionUser } from "@/lib/auth/session";
import { listEngageLinks } from "@/lib/data";
import { PlatformBadge, StatusBadge, formatDate } from "@/components/ui";
import EngageFilters from "./EngageFilters";
import type { LinkType, Platform } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EngagePage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; type?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) return null;

  const sp = await searchParams;
  const platform = (sp.platform ?? "all") as Platform | "all";
  const type = (sp.type ?? "all") as LinkType | "all";

  const all = await listEngageLinks(user.uid);
  const links = all.filter(
    (l) =>
      (platform === "all" || l.platform === platform) &&
      (type === "all" || l.type === type),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Engage</h1>
          <p className="mt-1 text-sm text-slate-500">
            Support your teammates — open their posts &amp; comments and engage
            genuinely. (Your own links aren&apos;t shown here.)
          </p>
        </div>
        <EngageFilters />
      </div>

      {links.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Nothing to engage with right now.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {links.map((l) => (
            <a
              key={l.id}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex items-center gap-2">
                <PlatformBadge platform={l.platform} />
                <span className="text-xs capitalize text-slate-500">{l.type}</span>
                <StatusBadge status={l.status} />
              </div>
              <div className="mt-2 truncate text-sm text-slate-800 group-hover:text-slate-950">
                {l.url}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>by @{l.username}</span>
                <span>{formatDate(l.createdAt)}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
