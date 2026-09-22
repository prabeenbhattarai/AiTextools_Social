import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import Shell, { type NavEntry } from "@/components/Shell";

export const dynamic = "force-dynamic";

const nav: NavEntry[] = [
  { type: "link", href: "/dashboard", label: "Overview", icon: "overview" },
  { type: "link", href: "/dashboard/submit", label: "Submit link", icon: "submit" },
  { type: "link", href: "/dashboard/links", label: "My links", icon: "links" },
  { type: "link", href: "/dashboard/accounts", label: "My accounts", icon: "accounts" },
  { type: "link", href: "/dashboard/payment", label: "Payment", icon: "payment" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "superadmin") redirect("/admin");

  return (
    <Shell brand="Link Tracker" username={user.username} nav={nav}>
      {children}
    </Shell>
  );
}
