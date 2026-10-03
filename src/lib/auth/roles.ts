export const USER_ROLES = ["SUPER_ADMIN", "HEAD_COACH", "PLAYER"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const CLUB_ROLE_COOKIE = "bnfc-role";

export const ROLE_HOME: Record<UserRole, string> = {
  SUPER_ADMIN: "/admin",
  HEAD_COACH: "/coach",
  PLAYER: "/player",
};

export const ROLE_LABEL: Record<UserRole, string> = {
  SUPER_ADMIN: "Club admin",
  HEAD_COACH: "Head coach",
  PLAYER: "Player",
};

export const PROTECTED_ROUTES: { prefix: string; role: UserRole }[] = [
  { prefix: "/admin", role: "SUPER_ADMIN" },
  { prefix: "/coach", role: "HEAD_COACH" },
  { prefix: "/player", role: "PLAYER" },
];

export function isUserRole(value: string | undefined | null): value is UserRole {
  return value === "SUPER_ADMIN" || value === "HEAD_COACH" || value === "PLAYER";
}

export function requiredRoleForPath(pathname: string): UserRole | null {
  const match = PROTECTED_ROUTES.find(
    (route) => pathname === route.prefix || pathname.startsWith(`${route.prefix}/`),
  );
  return match?.role ?? null;
}
