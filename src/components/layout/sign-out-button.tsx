"use client";

import { useRole } from "@/components/auth/role-session";

export function SignOutButton() {
  const { signOut } = useRole();

  return (
    <button
      type="button"
      onClick={() => signOut()}
      className="h-9 rounded-md bg-slate-800 px-3 text-sm font-semibold text-white hover:bg-slate-700"
    >
      Sign out
    </button>
  );
}
