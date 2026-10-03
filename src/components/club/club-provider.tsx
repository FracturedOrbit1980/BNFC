"use client";

import { useEffect, type ReactNode } from "react";

import { useClubStore } from "@/stores/club-store";

export function ClubProvider({ children }: { children: ReactNode }) {
  const hydrated = useClubStore((state) => state.hydrated);

  useEffect(() => {
    void Promise.resolve(useClubStore.persist.rehydrate()).then(() => {
      useClubStore.setState({ hydrated: true });
    });
  }, []);

  if (!hydrated) {
    return <p className="text-base font-semibold text-slate-800">Loading Benoni Northerns FC…</p>;
  }

  return children;
}
