"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClubStore } from "@/stores/club-store";

export function ClubOverview() {
  const ageGroups = useClubStore((state) => state.ageGroups);
  const players = useClubStore((state) => state.players);
  const drills = useClubStore((state) => state.drills);
  const evaluations = useClubStore((state) => state.evaluations);
  const matches = useClubStore((state) => state.matches);
  const addTeam = useClubStore((state) => state.addTeam);
  const resetClub = useClubStore((state) => state.resetClub);
  const [teamName, setTeamName] = useState("");
  const [groupId, setGroupId] = useState(ageGroups[0]?.id ?? "");

  const teamCount = ageGroups.reduce((sum, group) => sum + group.teams.length, 0);
  const played = matches.flatMap((match) => match.minutes);
  const averageMinutes =
    played.length === 0
      ? "—"
      : (played.reduce((sum, row) => sum + row.minutesPlayed, 0) / played.length).toFixed(1);

  const stats = [
    { label: "Age groups", value: String(ageGroups.length) },
    { label: "Teams", value: String(teamCount) },
    { label: "Players", value: String(players.length) },
    { label: "Official drills", value: String(drills.filter((drill) => drill.isClubOfficial).length) },
    { label: "Evaluations", value: String(evaluations.length) },
    { label: "Avg minutes", value: averageMinutes },
  ];

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {ageGroups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        ))}
      </div>
      <form
        className="mt-6 flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-300"
        onSubmit={(event) => {
          event.preventDefault();
          const name = teamName.trim();
          if (!name || !groupId) return;
          addTeam(groupId, name);
          setTeamName("");
        }}
      >
        <label className="text-sm font-semibold text-slate-800">
          Age group
          <select
            value={groupId}
            onChange={(event) => setGroupId(event.target.value)}
            className="mt-1 block h-11 rounded-md border border-slate-300 bg-white px-2 text-base"
          >
            {ageGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-800">
          New team
          <input
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
            placeholder="U15 Academy"
            className="mt-1 block h-11 rounded-md border border-slate-300 px-3 text-base"
          />
        </label>
        <Button type="submit" size="lg" className="h-11">
          Add team
        </Button>
        <Button type="button" variant="outline" size="lg" className="h-11" onClick={() => resetClub()}>
          Reset demo data
        </Button>
      </form>
    </div>
  );
}
