"use client";

import { useTransition } from "react";

import { setClubRole } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_LABEL, type UserRole } from "@/lib/auth/roles";

const ROLES: { role: UserRole; detail: string }[] = [
  {
    role: "SUPER_ADMIN",
    detail: "Age groups, teams, people, and the full drill library.",
  },
  {
    role: "HEAD_COACH",
    detail: "Session plans, the squad you add, and the live match clock.",
  },
  {
    role: "PLAYER",
    detail: "Your profile, homework, and attendance once you are on a squad.",
  },
];

export function RolePicker() {
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {ROLES.map((item) => (
        <Card key={item.role}>
          <CardHeader>
            <CardTitle>{ROLE_LABEL[item.role]}</CardTitle>
            <CardDescription className="text-slate-700">{item.detail}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              size="lg"
              className="h-11 w-full text-base"
              disabled={pending}
              onClick={() => startTransition(() => void setClubRole(item.role))}
            >
              Open {ROLE_LABEL[item.role].toLowerCase()}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
