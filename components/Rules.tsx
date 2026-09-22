import { money } from "@/components/ui";
import { PRICING } from "@/lib/config";

export default function Rules() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Posting rules &amp; payout
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Read these before submitting. Links that break the rules will be
        rejected.
      </p>

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="font-medium text-orange-700">Reddit</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Post to a subreddit that allows the topic — read its rules first.</li>
            <li>Write genuine, on-topic content. No spam or repeated copy-paste.</li>
            <li>Comments must add value, not just &ldquo;nice&rdquo; or emojis.</li>
            <li>Paste the direct permalink to your post/comment.</li>
            <li>The post/comment must stay live — removed items get rejected.</li>
          </ul>
          <p className="mt-2 text-sm font-medium text-slate-700">
            Payout: post {money(PRICING.reddit.post)} · comment{" "}
            {money(PRICING.reddit.comment)}
          </p>
        </div>

        <div>
          <h3 className="font-medium text-sky-700">LinkedIn</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Post from your real profile with a professional tone.</li>
            <li>Content should be relevant and non-spammy.</li>
            <li>Comments should be thoughtful and on-topic.</li>
            <li>Copy the link to the specific post/comment (not your feed).</li>
            <li>Keep it public so the admin can verify it.</li>
          </ul>
          <p className="mt-2 text-sm font-medium text-slate-700">
            Payout: post {money(PRICING.linkedin.post)} · comment{" "}
            {money(PRICING.linkedin.comment)}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
        <strong className="text-slate-800">How approval works:</strong> submit
        your link, it starts as <em>pending</em>, the admin checks it, then marks
        it <em>approved</em> (you get paid) or <em>rejected</em>. You can edit or
        delete a link only while it is still pending.
      </div>
    </section>
  );
}
