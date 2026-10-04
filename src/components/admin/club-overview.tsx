"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamPicker } from "@/components/coach/team-picker";
import { ageLabel, ensureYouthAges } from "@/lib/club/age";
import { useClubStore } from "@/stores/club-store";

export function ClubOverview() {
  const ageGroups = ensureYouthAges(useClubStore((state) => state.ageGroups));
  const players = useClubStore((state) => state.players);
  const drills = useClubStore((state) => state.drills);
  const resetClub = useClubStore((state) => state.resetClub);
  const teamCount = ageGroups.reduce((sum, group) => sum + group.teams.length, 0);

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
      <div className="mt-6">
        <TeamPicker />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {ageGroups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle data-age-group={ageLabel(group.name)}>{ageLabel(group.name)}</CardTitle>
            </CardHeader>
            <CardContent>
              {group.teams.length === 0 ? (
                <p className="text-sm font-medium text-slate-600">Choose a division to open a team.</p>
              ) : (
                <ul className="space-y-2">
                  {group.teams.map((team) => (
                    <li key={team.id} className="rounded-lg bg-slate-100 px-3 py-2 text-base font-semibold text-slate-950">
                      {team.division ?? team.name}
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
      <Button type="button" variant="outline" size="lg" className="mt-4 h-11" onClick={() => resetClub()}>
        Restore official library
      </Button>
    </div>
  );
}
