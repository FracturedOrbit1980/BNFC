"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DEMO_ROLE_COOKIE, ROLE_HOME, isUserRole, type UserRole } from "@/lib/auth/roles";

export async function setDemoRole(role: UserRole) {
  if (!isUserRole(role)) {
    redirect("/");
  }

  const jar = await cookies();
  jar.set(DEMO_ROLE_COOKIE, role, {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
  });
  redirect(ROLE_HOME[role]);
}
