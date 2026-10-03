import { NextResponse, type NextRequest } from "next/server";

import {
  CLUB_ROLE_COOKIE,
  ROLE_HOME,
  isUserRole,
  requiredRoleForPath,
} from "@/lib/auth/roles";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Role gate for /admin, /coach, and /player.
 * Next.js 16 runs this skeleton as proxy.ts (the renamed middleware convention).
 * Access uses the bnfc-role cookie until Supabase profiles supply the role.
 */
export async function proxy(request: NextRequest) {
  const required = requiredRoleForPath(request.nextUrl.pathname);
  if (!required) {
    return updateSession(request, NextResponse.next());
  }

  const roleValue = request.cookies.get(CLUB_ROLE_COOKIE)?.value;
  const role = isUserRole(roleValue) ? roleValue : null;

  if (role !== required) {
    const redirectUrl = request.nextUrl.clone();
    if (role) {
      redirectUrl.pathname = ROLE_HOME[role];
      redirectUrl.search = "";
    } else {
      redirectUrl.pathname = "/";
      redirectUrl.searchParams.set("notice", "signin");
    }
    return NextResponse.redirect(redirectUrl);
  }

  return updateSession(request, NextResponse.next());
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/coach", "/coach/:path*", "/player", "/player/:path*"],
};
