"use client";

import { PlayerRadar } from "@/components/dashboard/player-radar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEMO_PLAYER_ID } from "@/lib/club/seed";
import { useClubStore } from "@/stores/club-store";

export function PlayerHome() {
  const players = useClubStore((state) => state.players);
  const ageGroups = useClubStore((state) => state.ageGroups);
  const evaluations = useClubStore((state) => state.evaluations);
  const attendance = useClubStore((state) => state.attendance);
  const player = players.find((item) => item.id === DEMO_PLAYER_ID);
  const team = ageGroups.flatMap((group) => group.teams.map((item) => ({ ...item, ageGroup: group.name }))).find((item) => item.id === player?.teamId);
  const history = evaluations.filter((item) => item.playerId === DEMO_PLAYER_ID);
  const latest = history[0];
  const mine = attendance.filter((item) => item.playerId === DEMO_PLAYER_ID);

  if (!player || !latest) {
    return <p className="font-semibold text-slate-800">Player profile is not available.</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{player.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4">
          <Fact label="Squad" value={String(player.squadNumber)} />
          <Fact label="Position" value={player.position} />
          <Fact label="Team" value={team?.name ?? "Squad"} />
          <Fact label="Age group" value={team?.ageGroup ?? "Youth"} />
          <p className="rounded-lg bg-slate-100 px-3 py-3 text-sm font-medium text-slate-800 sm:col-span-4">
            Homework: {player.homework || "Nothing assigned."}
          </p>
        </CardContent>
      </Card>
      <PlayerRadar
        playerName={player.name}
        scores={latest}
        caption={`Scores from ${latest.date}. Scale is 1 to 10.`}
      />
      {latest.notes ? (
        <p className="rounded-lg bg-white px-4 py-3 text-sm font-medium text-slate-800 ring-1 ring-slate-300">
          Coach note: {latest.notes}
        </p>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {mine.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-100 px-3 py-3">
                <span>
                  <span className="block font-semibold text-slate-950">{item.detail}</span>
                  <span className="text-sm text-slate-600">{item.when}</span>
                </span>
                <Badge variant={item.status === "Present" ? "default" : "outline"}>{item.status}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-600">{label}</p>
      <p className="text-lg font-bold text-slate-950">{value}</p>
    </div>
  );
}
