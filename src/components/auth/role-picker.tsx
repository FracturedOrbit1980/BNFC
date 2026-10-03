"use client";

import { useTransition } from "react";

import { setDemoRole } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_LABEL, type UserRole } from "@/lib/auth/roles";

const ROLES: { role: UserRole; detail: string }[] = [
  {
    role: "SUPER_ADMIN",
    detail: "Age groups, teams, club drills, and sample analytics.",
  },
  {
    role: "HEAD_COACH",
    detail: "Roster, drill stopwatch, and the live substitution clock.",
  },
  {
    role: "PLAYER",
    detail: "Profile, development radar, and an attendance placeholder.",
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
              onClick={() => startTransition(() => void setDemoRole(item.role))}
            >
              Continue as {ROLE_LABEL[item.role].toLowerCase()}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
