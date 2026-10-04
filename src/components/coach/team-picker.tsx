"use client";

import { useState } from "react";

import { ageLabel, ensureYouthAges } from "@/lib/club/age";
import { DIVISIONS, isDivision } from "@/lib/club/catalog";
import { useClubStore } from "@/stores/club-store";

export function useCoachTeam() {
  const ageGroups = ensureYouthAges(useClubStore((state) => state.ageGroups));
  const coachTeamId = useClubStore((state) => state.coachTeamId);
  const setCoachTeam = useClubStore((state) => state.setCoachTeam);
  const teams = ageGroups.flatMap((group) =>
    group.teams.map((team) => ({ ...team, ageGroup: ageLabel(group.name), ageGroupId: group.id })),
  );
  const team = teams.find((item) => item.id === coachTeamId) ?? null;
  return { ageGroups, teams, team, setCoachTeam };
}

export function TeamPicker() {
  const ageGroups = ensureYouthAges(useClubStore((state) => state.ageGroups));
  const coachTeamId = useClubStore((state) => state.coachTeamId);
  const openDivisionTeam = useClubStore((state) => state.openDivisionTeam);
  const [ageId, setAgeId] = useState("");
  const selected =
    ageGroups.find((group) => group.id === ageId) ??
    ageGroups.find((group) => group.teams.some((team) => team.id === coachTeamId)) ??
    ageGroups[0];
  const openTeam = selected?.teams.find((team) => team.id === coachTeamId);
  const divisionValue = openTeam?.division ?? "";

  return (
    <div className="mb-4 rounded-xl bg-white p-4 ring-1 ring-slate-300">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm font-semibold text-slate-800">
          Under
          <select
            value={selected?.id ?? ""}
            data-field="age-group"
            onChange={(event) => setAgeId(event.target.value)}
            className="mt-1 block h-11 min-w-28 rounded-md border border-slate-300 bg-white px-2 text-base"
          >
            {ageGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {ageLabel(group.name)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-800">
          Division
          <select
            value={divisionValue}
            data-field="division"
            onChange={(event) => {
              if (!selected || !isDivision(event.target.value)) return;
              openDivisionTeam(selected.id, event.target.value);
            }}
            className="mt-1 block h-11 min-w-28 rounded-md border border-slate-300 bg-white px-2 text-base"
          >
            {divisionValue === "" ? (
              <option value="" hidden>
                Division
              </option>
            ) : null}
            {DIVISIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p data-age-order className="mt-3 text-sm font-semibold text-slate-700">
        {ageGroups.map((group) => ageLabel(group.name)).join("  ")}
      </p>
      {openTeam ? (
        <p data-open-team={openTeam.id} className="mt-1 text-sm font-semibold text-slate-950">
          Open team: {ageLabel(selected?.name ?? "")} · {openTeam.division}
        </p>
      ) : (
        <p className="mt-1 text-sm font-medium text-slate-600">Choose a division to open the team.</p>
      )}
    </div>
  );
}
