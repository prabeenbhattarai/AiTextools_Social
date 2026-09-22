import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import SignOutButton from "@/components/SignOutButton";
import type { UserProfile } from "@/lib/types";
import AdminUserRow from "./AdminUserRow";

export const dynamic = "force-dynamic";

async function getUsersByStatus(status: UserProfile["status"]) {
  const snap = await getAdminDb()
    .collection("users")
    .where("status", "==", status)
    .get();
  const users = snap.docs.map((d) => d.data() as UserProfile);
  // Sort newest first (avoids needing a composite Firestore index).
  users.sort((a, b) => b.createdAt - a.createdAt);
  return users;
}

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!user.isAdmin) redirect("/post-login");

  const [pendingUsers, approvedUsers] = await Promise.all([
    getUsersByStatus("pending"),
    getUsersByStatus("approved"),
  ]);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="font-semibold text-slate-900">Admin console</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <section>
          <h1 className="text-lg font-semibold text-slate-900">
            Pending applications{" "}
            <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-sm text-amber-800">
              {pendingUsers.length}
            </span>
          </h1>

          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {pendingUsers.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">
                No pending applications right now.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">Applicant</th>
                    <th className="px-4 py-2 font-medium">Age</th>
                    <th className="px-4 py-2 font-medium">Doing</th>
                    <th className="px-4 py-2 font-medium">Skills / quals</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((u) => (
                    <AdminUserRow key={u.uid} user={u} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900">
            Approved members{" "}
            <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-sm text-emerald-800">
              {approvedUsers.length}
            </span>
          </h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {approvedUsers.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">No approved members yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {approvedUsers.map((u) => (
                  <li
                    key={u.uid}
                    className="flex items-center justify-between px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-slate-900">
                      {u.fullName}
                    </span>
                    <span className="text-slate-500">{u.email}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
