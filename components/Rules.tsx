import { money } from "@/components/ui";
import type { PricingTable } from "@/lib/types";

export default function Rules({
  rates,
  custom,
}: {
  rates: PricingTable;
  custom?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Posting rules &amp; payout</h2>
            <p className="mt-0.5 text-sm text-slate-300">
              Follow these to get your links approved and paid.
            </p>
          </div>
          {custom && (
            <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-200 ring-1 ring-indigo-400/30">
              Custom rate
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
        <PlatformCard
          name="Reddit"
          accent="text-orange-600"
          bar="bg-orange-500"
          rules={[
            "Post to a subreddit that allows the topic — read its rules first.",
            "Write genuine, on-topic content — no spam or copy-paste.",
            "Comments must add value, not just “nice” or emojis.",
            "Post from your registered account; paste the direct permalink.",
            "It must stay live — removed items get rejected.",
          ]}
          post={rates.reddit.post}
          comment={rates.reddit.comment}
        />
        <PlatformCard
          name="LinkedIn"
          accent="text-sky-600"
          bar="bg-sky-500"
          rules={[
            "Post from your registered profile with a professional tone.",
            "Keep content relevant and non-spammy.",
            "Comments should be thoughtful and on-topic.",
            "Link to the specific post/comment, not your feed.",
            "Keep it public so the admin can verify it.",
          ]}
          post={rates.linkedin.post}
          comment={rates.linkedin.comment}
        />
      </div>

      <div className="flex items-start gap-3 border-t border-slate-100 px-6 py-4 text-sm text-slate-600">
        <span className="mt-0.5 text-slate-400">ⓘ</span>
        <p>
          <strong className="text-slate-800">Same-account check:</strong> set your
          handle for each platform in <em>My accounts</em>. Links that don&apos;t
          match your registered account are flagged to the admin as a{" "}
          <em>different account</em>.
        </p>
      </div>
    </section>
  );
}

function PlatformCard({
  name,
  accent,
  bar,
  rules,
  post,
  comment,
}: {
  name: string;
  accent: string;
  bar: string;
  rules: string[];
  post: number;
  comment: number;
}) {
  return (
    <div className="bg-white p-6">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${bar}`} />
        <h3 className={`font-semibold ${accent}`}>{name}</h3>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        {rules.map((r, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
            <span>{r}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-2">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
          Post {money(post)}
        </span>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
          Comment {money(comment)}
        </span>
      </div>
    </div>
  );
}
