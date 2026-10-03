import { cookies } from "next/headers";

import { CLUB_ROLE_COOKIE, isUserRole, type UserRole } from "@/lib/auth/roles";

export async function getClubRole(): Promise<UserRole | null> {
  const jar = await cookies();
  const value = jar.get(CLUB_ROLE_COOKIE)?.value;
  return isUserRole(value) ? value : null;
}
