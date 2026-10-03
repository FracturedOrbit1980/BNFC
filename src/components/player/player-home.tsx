"use client";

import { useState } from "react";

import { PlayerRadar } from "@/components/dashboard/player-radar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClubStore } from "@/stores/club-store";

export function PlayerHome() {
  const players = useClubStore((state) => state.players);
  const ageGroups = useClubStore((state) => state.ageGroups);
  const evaluations = useClubStore((state) => state.evaluations);
  const attendance = useClubStore((state) => state.attendance);
  const [playerId, setPlayerId] = useState("");
  const player = players.find((item) => item.id === playerId);
  const team = ageGroups
    .flatMap((group) => group.teams.map((item) => ({ ...item, ageGroup: group.name })))
    .find((item) => item.id === player?.teamId);
  const latest = evaluations.find((item) => item.playerId === player?.id);
  const mine = attendance.filter((item) => item.playerId === player?.id);

  if (players.length === 0) {
    return (
      <p className="rounded-lg bg-white px-4 py-3 font-semibold text-slate-800 ring-1 ring-slate-300">
        No players are on the club record yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <label className="block text-sm font-semibold text-slate-800">
        Your name
        <select
          value={playerId}
          onChange={(event) => setPlayerId(event.target.value)}
          className="mt-1 block h-11 w-full max-w-sm rounded-md border border-slate-300 bg-white px-3 text-base"
        >
          <option value="">Select your name</option>
          {players
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((item) => (
              <option key={item.id} value={item.id}>
                {item.squadNumber} {item.name}
              </option>
            ))}
        </select>
      </label>
      {!player ? (
        <p className="font-semibold text-slate-700">Choose your name to open your profile.</p>
      ) : (
        <>
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
          {latest ? (
            <PlayerRadar
              playerName={player.name}
              scores={latest}
              caption={`Scores from ${latest.date}. Scale is 1 to 10.`}
            />
          ) : (
            <p className="rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-800 ring-1 ring-slate-300">
              No scores yet.
            </p>
          )}
          {latest?.notes ? (
            <p className="rounded-lg bg-white px-4 py-3 text-sm font-medium text-slate-800 ring-1 ring-slate-300">
              Coach note: {latest.notes}
            </p>
          ) : null}
          <Card>
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {mine.length === 0 ? (
                <p className="text-sm font-medium text-slate-600">No attendance yet.</p>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </>
      )}
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
