"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PositionFields } from "@/components/club/position-fields";
import { ageLabel, sortByAge } from "@/lib/club/age";
import { formatPosition, type PositionChoice, type StandardPosition } from "@/lib/club/positions";
import { useClubStore } from "@/stores/club-store";

export function PeopleBoard() {
  const ageGroups = sortByAge(useClubStore((state) => state.ageGroups));
  const coaches = useClubStore((state) => state.coaches);
  const players = useClubStore((state) => state.players);
  const addPlayer = useClubStore((state) => state.addPlayer);
  const addCoach = useClubStore((state) => state.addCoach);
  const teams = ageGroups.flatMap((group) => group.teams.map((team) => ({ ...team, ageGroup: ageLabel(group.name) })));
  const [playerName, setPlayerName] = useState("");
  const [squadNumber, setSquadNumber] = useState(1);
  const [role, setRole] = useState<PositionChoice>("Central midfielder");
  const [roles, setRoles] = useState<StandardPosition[]>([]);
  const [playerTeam, setPlayerTeam] = useState(teams[0]?.id ?? "");
  const [coachName, setCoachName] = useState("");
  const [coachTeam, setCoachTeam] = useState(teams[0]?.id ?? "");

  return (
    <div className="space-y-4">
      {teams.length === 0 ? (
        <p className="rounded-lg bg-white px-4 py-3 font-semibold text-slate-800 ring-1 ring-slate-300">
          Choose a division on the Club page before adding coaches or players.
        </p>
      ) : (
      <>
      <form
        className="grid gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-300 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!playerName.trim() || !playerTeam) return;
          addPlayer({
            name: playerName.trim(),
            squadNumber,
            position: role,
            positions: roles,
            teamId: playerTeam,
          });
          setPlayerName("");
        }}
      >
        <h2 className="text-lg font-bold text-slate-950 sm:col-span-2">Add a player</h2>
        <label className="text-sm font-semibold text-slate-800">
          Name
          <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-base" required />
        </label>
        <label className="text-sm font-semibold text-slate-800">
          Team
          <select value={playerTeam} onChange={(event) => setPlayerTeam(event.target.value)} className="mt-1 h-11 w-full rounded-md border border-slate-300 px-2 text-base">
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.ageGroup} · {team.division ?? team.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-800">
          Number
          <input type="number" min={1} max={99} value={squadNumber} onChange={(event) => setSquadNumber(Number(event.target.value))} className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-base" />
        </label>
        <div className="sm:col-span-2">
          <PositionFields
            role={role}
            roles={roles}
            onRole={(next) => {
              setRole(next);
              if (next !== "All-rounder") setRoles([]);
            }}
            onToggle={(item) => setRoles((current) => (current.includes(item) ? current.filter((role) => role !== item) : [...current, item]))}
            field="admin-position"
          />
        </div>
        <Button type="submit" size="lg" className="h-11 sm:col-span-2 sm:w-fit">
          Save player
        </Button>
      </form>
      <form
        className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-300"
        onSubmit={(event) => {
          event.preventDefault();
          if (!coachName.trim() || !coachTeam) return;
          addCoach(coachTeam, coachName.trim());
          setCoachName("");
        }}
      >
        <label className="text-sm font-semibold text-slate-800">
          Coach
          <input value={coachName} onChange={(event) => setCoachName(event.target.value)} className="mt-1 block h-11 rounded-md border border-slate-300 px-3 text-base" required />
        </label>
        <label className="text-sm font-semibold text-slate-800">
          Team
          <select value={coachTeam} onChange={(event) => setCoachTeam(event.target.value)} className="mt-1 block h-11 rounded-md border border-slate-300 bg-white px-2 text-base">
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.ageGroup} · {team.division ?? team.name}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" size="lg" className="h-11">
          Assign coach
        </Button>
      </form>
      </>
      )}
      {ageGroups.map((group) => (
        <section key={group.id}>
          <h2 className="mb-2 text-lg font-bold text-slate-950">{ageLabel(group.name)}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {group.teams.map((team) => {
              const coach = coaches.find((item) => item.teamId === team.id);
              const squad = players
                .filter((player) => player.teamId === team.id)
                .sort((a, b) => a.squadNumber - b.squadNumber);
              return (
                <Card key={team.id}>
                  <CardHeader>
                    <CardTitle>{team.name}</CardTitle>
                    <p className="text-sm font-medium text-slate-700">
                      Coach: {coach?.name ?? "Unassigned"}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {squad.length === 0 ? (
                      <p className="text-sm font-medium text-slate-600">No players in this squad yet.</p>
                    ) : (
                      <ul className="space-y-1">
                        {squad.map((player) => (
                          <li key={player.id} className="flex justify-between gap-3 text-sm font-semibold text-slate-950">
                            <span>
                              {player.squadNumber} {player.name}
                            </span>
                            <span className="text-slate-600">{formatPosition(player)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
