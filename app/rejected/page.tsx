import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import SignOutButton from "@/components/SignOutButton";

export default async function RejectedPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.isAdmin) redirect("/admin");
  if (!user.profile) redirect("/onboarding/profile");
  if (user.profile.status !== "rejected") redirect("/post-login");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl">
          ✕
        </div>
        <h1 className="text-xl font-semibold text-slate-900">
          Application not approved
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Unfortunately your application wasn&apos;t approved.
          {user.profile.rejectionReason
            ? ` Reason: ${user.profile.rejectionReason}`
            : ""}
        </p>
        <div className="mt-6">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
