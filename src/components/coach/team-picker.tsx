"use client";

import { ageLabel, sortByAge } from "@/lib/club/age";
import { useClubStore } from "@/stores/club-store";

export function useCoachTeam() {
  const ageGroups = sortByAge(useClubStore((state) => state.ageGroups));
  const coachTeamId = useClubStore((state) => state.coachTeamId);
  const setCoachTeam = useClubStore((state) => state.setCoachTeam);
  const teams = ageGroups.flatMap((group) =>
    group.teams.map((team) => ({ ...team, ageGroup: ageLabel(group.name) })),
  );
  const team = teams.find((item) => item.id === coachTeamId) ?? null;
  return { teams, team, setCoachTeam };
}

export function TeamPicker() {
  const { teams, team, setCoachTeam } = useCoachTeam();

  if (teams.length === 0) {
    return (
      <p className="mb-4 rounded-lg bg-white px-4 py-3 font-semibold text-slate-800 ring-1 ring-slate-300">
        No teams yet. Create an age group and a team in Club admin first.
      </p>
    );
  }

  return (
    <label className="mb-4 block text-sm font-semibold text-slate-800">
      Team
      <select
        value={team?.id ?? ""}
        onChange={(event) => setCoachTeam(event.target.value)}
        className="mt-1 block h-11 w-full max-w-sm rounded-md border border-slate-300 bg-white px-3 text-base"
      >
        <option value="">Choose a team</option>
        {teams.map((item) => (
          <option key={item.id} value={item.id}>
            {item.ageGroup} · {item.name}
          </option>
        ))}
      </select>
    </label>
  );
}
