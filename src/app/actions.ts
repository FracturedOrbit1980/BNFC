"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { CLUB_ROLE_COOKIE, ROLE_HOME, isUserRole, type UserRole } from "@/lib/auth/roles";

export async function setClubRole(role: UserRole) {
  if (!isUserRole(role)) {
    redirect("/");
  }

  const jar = await cookies();
  jar.set(CLUB_ROLE_COOKIE, role, {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
  });
  redirect(ROLE_HOME[role]);
}

export async function signOut() {
  const jar = await cookies();
  jar.delete(CLUB_ROLE_COOKIE);
  redirect("/");
}
