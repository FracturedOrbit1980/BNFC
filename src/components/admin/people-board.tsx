"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClubStore } from "@/stores/club-store";

export function PeopleBoard() {
  const ageGroups = useClubStore((state) => state.ageGroups);
  const coaches = useClubStore((state) => state.coaches);
  const players = useClubStore((state) => state.players);

  return (
    <div className="space-y-4">
      {ageGroups.map((group) => (
        <section key={group.id}>
          <h2 className="mb-2 text-lg font-bold text-slate-950">{group.name}</h2>
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
                            <span className="text-slate-600">{player.position}</span>
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
