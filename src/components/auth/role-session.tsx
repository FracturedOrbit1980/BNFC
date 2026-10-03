"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";

import { ROLE_HOME, isUserRole, type UserRole } from "@/lib/auth/roles";

const STORAGE_KEY = "bnfc-role";

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readRole(): UserRole | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  return isUserRole(stored) ? stored : null;
}

interface RoleContextValue {
  role: UserRole | null;
  signIn: (role: UserRole) => void;
  signOut: () => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const role = useSyncExternalStore(subscribe, readRole, () => null);

  function signIn(next: UserRole) {
    localStorage.setItem(STORAGE_KEY, next);
    emit();
    router.push(ROLE_HOME[next]);
  }

  function signOut() {
    localStorage.removeItem(STORAGE_KEY);
    emit();
    router.push("/");
  }

  return <RoleContext.Provider value={{ role, signIn, signOut }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const value = useContext(RoleContext);
  if (!value) {
    throw new Error("useRole must be used inside RoleProvider");
  }
  return value;
}

export function RoleGate({ allow, children }: { allow: UserRole; children: ReactNode }) {
  const { role } = useRole();
  const router = useRouter();

  useEffect(() => {
    const current = readRole();
    if (current !== allow) router.replace("/");
  }, [allow, router]);

  if (role !== allow) {
    return <p className="font-semibold text-slate-800">Opening your area…</p>;
  }

  return children;
}
