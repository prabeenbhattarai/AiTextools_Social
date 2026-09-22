import { logoutAction } from "@/app/actions/auth";

export default function SignOutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="text-sm text-slate-600 hover:text-slate-900"
      >
        Sign out
      </button>
    </form>
  );
}
