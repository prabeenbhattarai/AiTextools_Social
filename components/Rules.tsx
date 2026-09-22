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
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Posting rules &amp; payout
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Read these before submitting. Links that break the rules will be
        rejected.
        {custom && (
          <span className="ml-1 font-medium text-emerald-700">
            You&apos;re on a custom rate.
          </span>
        )}
      </p>

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="font-medium text-orange-700">Reddit</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Post to a subreddit that allows the topic — read its rules first.</li>
            <li>Write genuine, on-topic content. No spam or repeated copy-paste.</li>
            <li>Comments must add value, not just &ldquo;nice&rdquo; or emojis.</li>
            <li>Post from your registered account and paste the direct permalink.</li>
            <li>The post/comment must stay live — removed items get rejected.</li>
          </ul>
          <p className="mt-2 text-sm font-medium text-slate-700">
            Payout: post {money(rates.reddit.post)} · comment{" "}
            {money(rates.reddit.comment)}
          </p>
        </div>

        <div>
          <h3 className="font-medium text-sky-700">LinkedIn</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Post from your registered profile with a professional tone.</li>
            <li>Content should be relevant and non-spammy.</li>
            <li>Comments should be thoughtful and on-topic.</li>
            <li>Copy the link to the specific post/comment (not your feed).</li>
            <li>Keep it public so the admin can verify it.</li>
          </ul>
          <p className="mt-2 text-sm font-medium text-slate-700">
            Payout: post {money(rates.linkedin.post)} · comment{" "}
            {money(rates.linkedin.comment)}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
        <strong className="text-slate-800">Same-account check:</strong> set your
        account handle for each platform in <em>My accounts</em>. When a
        submitted link doesn&apos;t match your registered account, it is flagged
        to the admin as a <em>different account</em>. Submit from your own
        account to get paid.
      </div>
    </section>
  );
}
