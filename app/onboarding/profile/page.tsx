import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import SignOutButton from "@/components/SignOutButton";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.isAdmin) redirect("/admin");
  // Already applied — no need to fill the form again.
  if (user.profile) {
    redirect(user.profile.status === "approved" ? "/dashboard" : "/pending");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-slate-500">{user.email}</span>
          <SignOutButton />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Complete your profile
          </h1>
          <p className="mt-1 mb-6 text-sm text-slate-500">
            An admin will review your application and email you once you&apos;re
            approved.
          </p>
          <ProfileForm />
        </div>
      </div>
    </main>
  );
}
