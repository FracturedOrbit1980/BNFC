"use client";

import { useTransition } from "react";

import { setDemoRole } from "@/app/actions";
import { ROLE_LABEL, USER_ROLES, type UserRole } from "@/lib/auth/roles";

export function DemoRoleSwitcher({ role }: { role: UserRole | null }) {
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-200">
      <span className="rounded bg-amber-400 px-1.5 py-0.5 text-slate-950">Demo only</span>
      <select
        aria-label="Demo role switcher. Not production authentication."
        disabled={pending}
        value={role ?? ""}
        onChange={(event) => {
          const next = event.target.value as UserRole;
          startTransition(() => {
            void setDemoRole(next);
          });
        }}
        className="h-9 rounded-md bg-slate-800 px-2 text-sm font-semibold normal-case tracking-normal text-white"
      >
        <option value="" disabled>
          Choose role
        </option>
        {USER_ROLES.map((item) => (
          <option key={item} value={item}>
            {ROLE_LABEL[item]}
          </option>
        ))}
      </select>
    </label>
  );
}
