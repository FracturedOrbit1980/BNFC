"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ageLabel, ageNumber, sortByAge } from "@/lib/club/age";
import { useClubStore } from "@/stores/club-store";

export function ClubOverview() {
  const ageGroups = sortByAge(useClubStore((state) => state.ageGroups));
  const players = useClubStore((state) => state.players);
  const drills = useClubStore((state) => state.drills);
  const addAgeGroup = useClubStore((state) => state.addAgeGroup);
  const addTeam = useClubStore((state) => state.addTeam);
  const resetClub = useClubStore((state) => state.resetClub);
  const [groupName, setGroupName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [groupId, setGroupId] = useState("");

  const teamCount = ageGroups.reduce((sum, group) => sum + group.teams.length, 0);
  const selectedGroup = ageGroups.find((group) => group.id === groupId)?.id ?? ageGroups[0]?.id ?? "";

  const stats = [
    { label: "Age groups", value: String(ageGroups.length) },
    { label: "Teams", value: String(teamCount) },
    { label: "Players", value: String(players.length) },
    { label: "Official drills", value: String(drills.filter((drill) => drill.isClubOfficial).length) },
  ];

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-600">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-slate-950">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {ageGroups.length === 0 ? (
        <p className="mt-6 rounded-lg bg-white px-4 py-3 font-semibold text-slate-800 ring-1 ring-slate-300">
          No age groups yet. Create one, then add the teams inside it.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {ageGroups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <CardTitle data-age-group={ageLabel(group.name)}>{ageLabel(group.name)}</CardTitle>
              </CardHeader>
              <CardContent>
                {group.teams.length === 0 ? (
                  <p className="text-sm font-medium text-slate-600">No teams in this age group yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {group.teams.map((team) => (
                      <li key={team.id} className="rounded-lg bg-slate-100 px-3 py-2 text-base font-semibold text-slate-950">
                        {team.name}
                        <span className="ml-2 text-sm font-medium text-slate-600">
                          {players.filter((player) => player.teamId === team.id).length} players
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <form
        className="mt-6 flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-300"
        onSubmit={(event) => {
          event.preventDefault();
          const age = Number(groupName);
          if (!Number.isInteger(age) || age < 1) return;
          addAgeGroup(age);
          setGroupName("");
        }}
      >
        <label className="text-sm font-semibold text-slate-800">
          Under
          <input
            value={groupName}
            data-field="age-number"
            inputMode="numeric"
            onChange={(event) => setGroupName(event.target.value.replace(/\D/g, "").slice(0, 2))}
            placeholder="11"
            className="mt-1 block h-11 w-24 rounded-md border border-slate-300 px-3 text-base"
            required
          />
        </label>
        <Button type="submit" size="lg" className="h-11">
          Add age group
        </Button>
      </form>
      <form
        className="mt-3 flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-300"
        onSubmit={(event) => {
          event.preventDefault();
          const name = teamName.trim();
          if (!name || !selectedGroup) return;
          addTeam(selectedGroup, name);
          setTeamName("");
        }}
      >
        <label className="text-sm font-semibold text-slate-800">
          Under
          <select
            value={selectedGroup}
            data-field="age-group"
            onChange={(event) => setGroupId(event.target.value)}
            disabled={ageGroups.length === 0}
            className="mt-1 block h-11 rounded-md border border-slate-300 bg-white px-2 text-base disabled:bg-slate-100"
          >
            {ageGroups.length === 0 ? <option value="">Create an age group first</option> : null}
            {ageGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {ageNumber(group.name) ?? ageLabel(group.name)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-800">
          New team
          <input
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
            placeholder="Premier"
            disabled={ageGroups.length === 0}
            className="mt-1 block h-11 rounded-md border border-slate-300 px-3 text-base disabled:bg-slate-100"
          />
        </label>
        <Button type="submit" size="lg" className="h-11" disabled={ageGroups.length === 0}>
          Add team
        </Button>
        <Button type="button" variant="outline" size="lg" className="h-11" onClick={() => resetClub()}>
          Restore official library
        </Button>
      </form>
    </div>
  );
}
