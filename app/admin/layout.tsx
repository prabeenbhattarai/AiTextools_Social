import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import Shell, { type NavEntry } from "@/components/Shell";

export const dynamic = "force-dynamic";

const nav: NavEntry[] = [
  { type: "link", href: "/admin", label: "Overview", icon: "overview" },
  { type: "link", href: "/admin/links", label: "Links", icon: "links" },
  { type: "link", href: "/admin/members", label: "Members", icon: "members" },
  { type: "link", href: "/admin/payouts", label: "Payouts", icon: "payouts" },
  {
    type: "group",
    label: "Settings",
    icon: "settings",
    items: [{ href: "/admin/settings/rates", label: "Pay rates" }],
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "superadmin") redirect("/dashboard");

  return (
    <Shell brand="Link Tracker" username={user.username} nav={nav}>
      {children}
    </Shell>
  );
}
