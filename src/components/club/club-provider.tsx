"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { createEmptyClub } from "@/lib/club/seed";
import { loadClubData, useClubStore } from "@/stores/club-store";
import { useClubLibrary } from "@/stores/club-library";

export function ClubProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hydrated = useClubStore((state) => state.hydrated);
  const ready = useClubLibrary((state) => state.ready);
  const activeId = useClubLibrary((state) => state.activeId);
  const refresh = useClubLibrary((state) => state.refresh);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!ready) return;
    if (!activeId) {
      useClubStore.persist.setOptions({ name: "bnfc-club-pending" });
      useClubStore.setState({ hydrated: true, ...createEmptyClub() });
      return;
    }
    const club = useClubLibrary.getState().clubs.find((item) => item.id === activeId);
    if (!club) return;
    void loadClubData(activeId, club.kind);
  }, [ready, activeId]);

  if (!ready || !hydrated) {
    return <p className="text-base font-semibold text-slate-800">Loading the club…</p>;
  }

  if (!activeId && pathname !== "/") {
    return (
      <p className="text-base font-semibold text-slate-800">
        Load a club on the home screen.{" "}
        <Link href="/" className="text-emerald-700 underline">
          Choose a club
        </Link>
      </p>
    );
  }

  return children;
}
