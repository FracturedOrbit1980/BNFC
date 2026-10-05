"use client";

import { useRole } from "@/components/auth/role-session";

export function SignOutButton() {
  const { signOut } = useRole();

  return (
    <button
      type="button"
      onClick={() => signOut()}
      className="min-h-11 rounded-lg bg-white/10 px-3 text-sm font-bold text-white ring-1 ring-white/20"
    >
      Sign out
    </button>
  );
}
