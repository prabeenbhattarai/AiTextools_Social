import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import SignOutButton from "@/components/SignOutButton";

export default async function PendingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.isAdmin) redirect("/admin");
  if (!user.profile) redirect("/onboarding/profile");
  if (user.profile.status === "approved") redirect("/dashboard");
  if (user.profile.status === "rejected") redirect("/rejected");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl">
          ⏳
        </div>
        <h1 className="text-xl font-semibold text-slate-900">
          Application under review
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Thanks, {user.profile.fullName}. An admin is reviewing your
          application. You&apos;ll get an email at{" "}
          <strong>{user.email}</strong> once you&apos;re approved.
        </p>
        <div className="mt-6">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
