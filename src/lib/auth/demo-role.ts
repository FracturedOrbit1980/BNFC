import { cookies } from "next/headers";

import { DEMO_ROLE_COOKIE, isUserRole, type UserRole } from "@/lib/auth/roles";

export async function getDemoRole(): Promise<UserRole | null> {
  const jar = await cookies();
  const value = jar.get(DEMO_ROLE_COOKIE)?.value;
  return isUserRole(value) ? value : null;
}
