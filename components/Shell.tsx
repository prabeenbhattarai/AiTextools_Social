"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

export type NavEntry =
  | { type: "link"; href: string; label: string; icon?: string }
  | { type: "group"; label: string; icon?: string; items: { href: string; label: string }[] };

export default function Shell({
  brand,
  username,
  nav,
  children,
}: {
  brand: string;
  username: string;
  nav: NavEntry[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-4">
        <div className="text-base font-semibold text-white">{brand}</div>
        <div className="mt-0.5 text-xs text-slate-400">@{username}</div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((entry) =>
          entry.type === "link" ? (
            <NavLink
              key={entry.href}
              href={entry.href}
              label={entry.label}
              icon={entry.icon}
              active={isActive(pathname, entry.href)}
              onClick={() => setOpen(false)}
            />
          ) : (
            <NavGroupBlock
              key={entry.label}
              entry={entry}
              pathname={pathname}
              onNavigate={() => setOpen(false)}
            />
          ),
        )}
      </nav>
      <div className="border-t border-slate-700/60 p-3">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white"
          >
            <Icon name="logout" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <span className="font-semibold text-slate-900">{brand}</span>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-slate-300 p-1.5 text-slate-600"
          aria-label="Toggle menu"
        >
          <Icon name="menu" />
        </button>
      </header>

      <div className="md:flex">
        {/* Sidebar */}
        <aside
          className={`${
            open ? "block" : "hidden"
          } bg-slate-900 md:sticky md:top-0 md:block md:h-screen md:w-60 md:shrink-0`}
        >
          {sidebar}
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin" || href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function NavLink({
  href,
  label,
  icon,
  active,
  onClick,
  nested,
}: {
  href: string;
  label: string;
  icon?: string;
  active: boolean;
  onClick?: () => void;
  nested?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
        nested ? "pl-9" : ""
      } ${
        active
          ? "bg-slate-700 font-medium text-white"
          : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
      }`}
    >
      {!nested && <Icon name={icon} />}
      {label}
    </Link>
  );
}

function NavGroupBlock({
  entry,
  pathname,
  onNavigate,
}: {
  entry: { label: string; icon?: string; items: { href: string; label: string }[] };
  pathname: string;
  onNavigate: () => void;
}) {
  const childActive = entry.items.some((i) => isActive(pathname, i.href));
  const [expanded, setExpanded] = useState(childActive);
  return (
    <div>
      <button
        onClick={() => setExpanded((v) => !v)}
        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm ${
          childActive ? "text-white" : "text-slate-300 hover:text-white"
        }`}
      >
        <span className="flex items-center gap-2">
          <Icon name={entry.icon} />
          {entry.label}
        </span>
        <span className={`transition ${expanded ? "rotate-90" : ""}`}>›</span>
      </button>
      {expanded && (
        <div className="mt-1 space-y-1">
          {entry.items.map((i) => (
            <NavLink
              key={i.href}
              href={i.href}
              label={i.label}
              active={isActive(pathname, i.href)}
              onClick={onNavigate}
              nested
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Icon({ name }: { name?: string }) {
  const p = "h-4 w-4 shrink-0";
  switch (name) {
    case "overview":
      return <svg className={p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
    case "links":
      return <svg className={p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></svg>;
    case "members":
      return <svg className={p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /></svg>;
    case "settings":
      return <svg className={p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15H4.5a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 6 8.6l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 12 4.6V4.5a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 2.82 1.17l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9z" /></svg>;
    case "accounts":
      return <svg className={p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
    case "submit":
      return <svg className={p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
    case "payment":
      return <svg className={p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>;
    case "engage":
      return <svg className={p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-6 0v4" /><path d="M18 11a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v0a7 7 0 0 0 14 0z" /><path d="M12 15v4" /><path d="M8 21h8" /></svg>;
    case "payouts":
      return <svg className={p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M14.5 9.5a2.5 2.5 0 0 0-2.5-1.5c-1.4 0-2.5.8-2.5 2s1.1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2a2.5 2.5 0 0 1-2.5-1.5" /><line x1="12" y1="6.5" x2="12" y2="8" /><line x1="12" y1="16" x2="12" y2="17.5" /></svg>;
    case "logout":
      return <svg className={p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
    case "menu":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
    default:
      return <span className="h-4 w-4 shrink-0" />;
  }
}
