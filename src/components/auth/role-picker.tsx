"use client";

import { useRole } from "@/components/auth/role-session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_LABEL, type UserRole } from "@/lib/auth/roles";

const ROLES: { role: UserRole; detail: string }[] = [
  {
    role: "SUPER_ADMIN",
    detail: "Open a team by age and division, then manage people and the drill library.",
  },
  {
    role: "HEAD_COACH",
    detail: "Choose an age and division, plan the session, and run the match clock.",
  },
  {
    role: "PLAYER",
    detail: "Your profile, homework, and attendance once you are on a squad.",
  },
];

export function RolePicker() {
  const { signIn } = useRole();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {ROLES.map((item) => (
        <Card key={item.role}>
          <CardHeader>
            <CardTitle>{ROLE_LABEL[item.role]}</CardTitle>
            <CardDescription className="text-slate-700">{item.detail}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" size="lg" className="h-11 w-full text-base" onClick={() => signIn(item.role)}>
              Open {ROLE_LABEL[item.role].toLowerCase()}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
