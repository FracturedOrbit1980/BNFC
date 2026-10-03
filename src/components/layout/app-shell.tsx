"use client";

import {
  ClipboardList,
  LayoutDashboard,
  Library,
  Timer,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useRole } from "@/components/auth/role-session";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { ROLE_HOME, ROLE_LABEL, type UserRole } from "@/lib/auth/roles";
import { CLUB_NAME } from "@/lib/club/catalog";

const NAV: Record<UserRole, { href: string; label: string; icon: typeof Users }[]> = {
  SUPER_ADMIN: [
    { href: "/admin", label: "Club", icon: LayoutDashboard },
    { href: "/admin/people", label: "People", icon: Users },
    { href: "/admin/drills", label: "Drills", icon: Library },
  ],
  HEAD_COACH: [
    { href: "/coach", label: "Home", icon: LayoutDashboard },
    { href: "/coach/roster", label: "Roster", icon: Users },
    { href: "/coach/drills", label: "Drills", icon: ClipboardList },
    { href: "/coach/match", label: "Match", icon: Timer },
  ],
  PLAYER: [{ href: "/player", label: "My game", icon: Users }],
};

function stripSlash(path: string) {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

function isActive(pathname: string, href: string) {
  const current = stripSlash(pathname);
  const target = stripSlash(href);
  if (href === ROLE_HOME.SUPER_ADMIN || href === ROLE_HOME.HEAD_COACH || href === ROLE_HOME.PLAYER) {
    return current === target;
  }
  return current === target || current.startsWith(`${target}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { role } = useRole();
  const items = role ? NAV[role] : [];

  return (
    <div className="min-h-full bg-slate-100 text-slate-950">
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 px-4 text-white md:hidden">
        <Link href={role ? ROLE_HOME[role] : "/"} className="flex items-center gap-2 font-bold">
          <ClubMark />
          <span>BNFC</span>
        </Link>
        {role ? <SignOutButton /> : null}
      </header>

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-slate-950 text-white md:flex">
        <Link href={role ? ROLE_HOME[role] : "/"} className="flex items-center gap-3 px-5 py-5">
          <ClubMark />
          <span>
            <span className="block text-sm font-bold leading-tight">{CLUB_NAME}</span>
            <span className="text-xs font-medium text-emerald-300">Club platform</span>
          </span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold ${
                  active ? "bg-emerald-500 text-slate-950" : "text-slate-100 hover:bg-slate-800"
                }`}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-3 border-t border-slate-800 p-4">
          {role ? <p className="text-sm font-semibold text-slate-200">{ROLE_LABEL[role]}</p> : null}
          {role ? <SignOutButton /> : null}
        </div>
      </aside>

      <main className="px-4 pb-24 pt-20 md:pb-10 md:pl-72 md:pr-8 md:pt-8">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>

      {items.length > 0 ? (
        <nav className="fixed inset-x-0 bottom-0 z-30 grid border-t border-slate-800 bg-slate-950 text-white md:hidden" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-bold ${
                  active ? "text-emerald-400" : "text-slate-200"
                }`}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}

function ClubMark() {
  return (
    <span className="flex size-9 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-slate-950">
      BN
    </span>
  );
}
