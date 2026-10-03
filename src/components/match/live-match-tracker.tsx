"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { demoMatch } from "@/lib/demo/data";
import { useClubStore } from "@/stores/club-store";
import { useMatchStore, type PlayerMatchState } from "@/stores/match-store";

function formatClock(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function LiveMatchTracker() {
  const matchTimeSeconds = useMatchStore((state) => state.matchTimeSeconds);
  const isClockRunning = useMatchStore((state) => state.isClockRunning);
  const players = useMatchStore((state) => state.players);
  const startMatchClock = useMatchStore((state) => state.startMatchClock);
  const pauseMatchClock = useMatchStore((state) => state.pauseMatchClock);
  const substitutePlayer = useMatchStore((state) => state.substitutePlayer);
  const tickSecond = useMatchStore((state) => state.tickSecond);
  const resetMatch = useMatchStore((state) => state.resetMatch);
  const saveMatch = useClubStore((state) => state.saveMatch);
  const [selectedOff, setSelectedOff] = useState<string | null>(null);
  const [selectedOn, setSelectedOn] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isClockRunning) return;
    const interval = setInterval(() => tickSecond(), 1000);
    return () => clearInterval(interval);
  }, [isClockRunning, tickSecond]);

  const onPitch = players.filter((player) => player.isOnPitch);
  const bench = players.filter((player) => !player.isOnPitch);

  function choosePitch(playerId: string) {
    if (selectedOn) {
      substitutePlayer(playerId, selectedOn);
      setSelectedOn(null);
      setSelectedOff(null);
      return;
    }
    setSelectedOff((current) => (current === playerId ? null : playerId));
  }

  function chooseBench(playerId: string) {
    if (selectedOff) {
      substitutePlayer(selectedOff, playerId);
      setSelectedOff(null);
      setSelectedOn(null);
      return;
    }
    setSelectedOn((current) => (current === playerId ? null : playerId));
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-slate-900 p-4 text-white shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
              {demoMatch.teamName}
            </p>
            <h2 className="text-xl font-bold">vs {demoMatch.opponent}</h2>
          </div>
          <p className="rounded-full bg-emerald-500 px-3 py-1 text-sm font-bold text-slate-950">
            {demoMatch.status}
          </p>
        </div>
        <p className="my-4 text-center font-mono text-6xl tracking-wider text-emerald-400">
          {formatClock(matchTimeSeconds)}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            type="button"
            size="lg"
            className="h-14 min-w-36 bg-emerald-500 text-base text-slate-950 hover:bg-emerald-400"
            onClick={() => (isClockRunning ? pauseMatchClock() : startMatchClock())}
          >
            {isClockRunning ? <Pause className="size-5" /> : <Play className="size-5" />}
            {isClockRunning ? "Pause" : "Start"}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="secondary"
            className="h-14 min-w-36 bg-slate-700 text-base text-white hover:bg-slate-600"
            onClick={() => {
              resetMatch();
              setSelectedOff(null);
              setSelectedOn(null);
            }}
          >
            <RotateCcw className="size-5" />
            Reset
          </Button>
          <Button
            type="button"
            size="lg"
            variant="secondary"
            className="h-14 min-w-36 bg-white text-base text-slate-950 hover:bg-slate-200"
            onClick={() => {
              saveMatch(
                demoMatch.opponent,
                players.map((player) => ({
                  playerId: player.playerId,
                  minutesPlayed: player.minutesPlayed,
                })),
              );
              setSaved(true);
            }}
          >
            Save minutes
          </Button>
        </div>
        <p className="mt-3 text-center text-sm font-medium text-slate-300">
          {saved ? "Minutes saved. Players with time on the pitch are marked present." : null}{" "}
          Tap a player on the pitch, then a bench player, to substitute. Minutes accrue only while the clock runs.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <PlayerColumn
          title={`On pitch (${onPitch.length})`}
          players={onPitch}
          selectedId={selectedOff}
          onSelect={choosePitch}
        />
        <PlayerColumn
          title={`Bench (${bench.length})`}
          players={bench}
          selectedId={selectedOn}
          onSelect={chooseBench}
        />
      </div>
    </div>
  );
}

function PlayerColumn({
  title,
  players,
  selectedId,
  onSelect,
}: {
  title: string;
  players: PlayerMatchState[];
  selectedId: string | null;
  onSelect: (playerId: string) => void;
}) {
  return (
    <section className="rounded-xl bg-white p-3 ring-1 ring-slate-300">
      <h3 className="px-1 text-sm font-bold uppercase tracking-wide text-slate-700">{title}</h3>
      <ul className="mt-2 space-y-2">
        {players.map((player) => {
          const selected = player.playerId === selectedId;
          return (
            <li key={player.playerId}>
              <button
                type="button"
                onClick={() => onSelect(player.playerId)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left ${
                  selected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-950 hover:bg-slate-200"
                }`}
              >
                <span className="w-8 text-lg font-bold tabular-nums">{player.squadNumber}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-semibold">{player.name}</span>
                  <span className={`block text-sm font-medium ${selected ? "text-emerald-100" : "text-slate-600"}`}>
                    {player.position}
                  </span>
                </span>
                <span className="text-right text-sm font-bold tabular-nums">
                  {player.minutesPlayed.toFixed(1)}
                  <span className="ml-1 font-semibold">min</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
