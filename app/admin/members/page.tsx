import { getGlobalPricing, listMembers } from "@/lib/data";
import CreateMemberForm from "../CreateMemberForm";
import MemberRow from "../MemberRow";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  const [members, global] = await Promise.all([listMembers(), getGlobalPricing()]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Members</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create accounts and share the username &amp; password with your team.
          Use <span className="font-medium">Rate</span> to give a member a custom
          price.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <CreateMemberForm />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {members.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No members yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {members.map((m) => (
              <MemberRow key={m.uid} member={m} global={global} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
