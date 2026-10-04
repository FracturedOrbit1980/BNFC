"use client";

import type { PlayerMatchState } from "@/stores/match-store";

export const FORMATIONS = [
  "2-2",
  "1-2-1",
  "2-1-1",
  "2-3-1",
  "3-2-1",
  "3-1-2",
  "3-3-2",
  "3-2-3",
  "2-3-3",
  "4-4-2",
  "4-3-3",
  "3-5-2",
] as const;

export type FormationName = (typeof FORMATIONS)[number];

export const FORMATION_GROUPS: {
  id: string;
  label: string;
  formations: FormationName[];
}[] = [
  { id: "u6-u7", label: "U6 and U7 · 5-a-side", formations: ["2-2", "1-2-1", "2-1-1"] },
  { id: "u8-u9", label: "U8 and U9 · 7-a-side", formations: ["2-3-1", "3-2-1", "3-1-2"] },
  { id: "u10-u11", label: "U10 and U11 · 9-a-side", formations: ["3-3-2", "3-2-3", "2-3-3"] },
  { id: "eleven", label: "11-a-side", formations: ["4-4-2", "4-3-3", "3-5-2"] },
];

const KEEPER = { x: 10, y: 32 };

function outfieldLine(count: number, x: number) {
  const lanes: Record<number, number[]> = {
    1: [32],
    2: [20, 44],
    3: [12, 32, 52],
  };
  return lanes[count].map((y) => ({ x, y }));
}

function smallSided(lines: number[]) {
  const xs = lines.length === 2 ? [38, 72] : [30, 52, 74];
  return [KEEPER, ...lines.flatMap((count, index) => outfieldLine(count, xs[index]))];
}

const SLOTS: Record<FormationName, { x: number; y: number }[]> = {
  "2-2": smallSided([2, 2]),
  "1-2-1": smallSided([1, 2, 1]),
  "2-1-1": smallSided([2, 1, 1]),
  "2-3-1": smallSided([2, 3, 1]),
  "3-2-1": smallSided([3, 2, 1]),
  "3-1-2": smallSided([3, 1, 2]),
  "3-3-2": smallSided([3, 3, 2]),
  "3-2-3": smallSided([3, 2, 3]),
  "2-3-3": smallSided([2, 3, 3]),
  "4-4-2": [
    { x: 10, y: 32 },
    { x: 26, y: 10 },
    { x: 26, y: 24 },
    { x: 26, y: 40 },
    { x: 26, y: 54 },
    { x: 50, y: 10 },
    { x: 50, y: 24 },
    { x: 50, y: 40 },
    { x: 50, y: 54 },
    { x: 78, y: 24 },
    { x: 78, y: 40 },
  ],
  "4-3-3": [
    { x: 10, y: 32 },
    { x: 26, y: 10 },
    { x: 26, y: 24 },
    { x: 26, y: 40 },
    { x: 26, y: 54 },
    { x: 50, y: 16 },
    { x: 50, y: 32 },
    { x: 50, y: 48 },
    { x: 80, y: 12 },
    { x: 80, y: 32 },
    { x: 80, y: 52 },
  ],
  "3-5-2": [
    { x: 10, y: 32 },
    { x: 26, y: 16 },
    { x: 26, y: 32 },
    { x: 26, y: 48 },
    { x: 52, y: 8 },
    { x: 52, y: 20 },
    { x: 52, y: 32 },
    { x: 52, y: 44 },
    { x: 52, y: 56 },
    { x: 80, y: 24 },
    { x: 80, y: 40 },
  ],
};

export function placeOnPitch(players: PlayerMatchState[], formation: FormationName) {
  const slots = SLOTS[formation] ?? [];
  const onPitch = players.filter((player) => player.isOnPitch);
  const keeper = onPitch.find((player) => player.position.trim().toUpperCase() === "GK");
  const rest = onPitch
    .filter((player) => player.playerId !== keeper?.playerId)
    .sort((a, b) => a.squadNumber - b.squadNumber);
  const ordered = keeper ? [keeper, ...rest] : rest;
  return ordered.slice(0, slots.length).flatMap((player, index) => {
    const slot = slots[index];
    return slot ? [{ player, ...slot }] : [];
  });
}

export function FormationPitch({
  formation,
  players,
  emptyMessage,
}: {
  formation: FormationName;
  players: PlayerMatchState[];
  emptyMessage: string | null;
}) {
  const placed = placeOnPitch(players, formation);

  return (
    <div className="flex min-w-0 flex-col">
      <svg
        viewBox="0 0 100 64"
        className="match-pitch-svg h-auto w-full max-w-full rounded-lg bg-emerald-700"
        role="img"
        aria-label={`${formation} formation`}
        data-formation={formation}
        data-placed={placed.length}
      >
        <g fill="none" stroke="#fff6f5" strokeWidth="0.6">
          <rect x="1" y="1" width="98" height="62" />
          <line x1="50" y1="1" x2="50" y2="63" />
          <circle cx="50" cy="32" r="8" />
          <rect x="1" y="16" width="14" height="32" />
          <rect x="85" y="16" width="14" height="32" />
          <rect x="1" y="24" width="5" height="16" />
          <rect x="94" y="24" width="5" height="16" />
        </g>
        {placed.map(({ player, x, y }) => (
          <g key={player.playerId} data-player-id={player.playerId} data-x={x} data-y={y} transform={`translate(${x} ${y})`}>
            <circle r="2.4" fill={player.position.trim().toUpperCase() === "GK" ? "#f59e0b" : "#0f172a"} stroke="#ffffff" strokeWidth="0.4" />
            <text y="0.8" textAnchor="middle" fontSize="2" fontWeight="700" fill="#ffffff">
              {player.squadNumber}
            </text>
          </g>
        ))}
      </svg>
      {emptyMessage ? <p className="mt-2 text-sm font-semibold text-slate-800">{emptyMessage}</p> : null}
    </div>
  );
}
