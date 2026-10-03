"use client";

import { useTransition } from "react";

import { signOut } from "@/app/actions";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => void signOut())}
      className="h-9 rounded-md bg-slate-800 px-3 text-sm font-semibold text-white hover:bg-slate-700"
    >
      Sign out
    </button>
  );
}
