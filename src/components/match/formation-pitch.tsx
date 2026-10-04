"use client";

import type { PlayerMatchState } from "@/stores/match-store";

export const FORMATIONS = ["4-4-2", "4-3-3", "3-5-2"] as const;

export type FormationName = (typeof FORMATIONS)[number];

const SLOTS: Record<FormationName, { x: number; y: number }[]> = {
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
  const onPitch = players.filter((player) => player.isOnPitch);
  const keeper = onPitch.find((player) => player.position.trim().toUpperCase() === "GK");
  const rest = onPitch
    .filter((player) => player.playerId !== keeper?.playerId)
    .sort((a, b) => a.squadNumber - b.squadNumber);
  const ordered = keeper ? [keeper, ...rest] : rest;
  return ordered.slice(0, SLOTS[formation].length).map((player, index) => ({
    player,
    ...SLOTS[formation][index],
  }));
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
    <div className="flex min-h-0 min-w-0 flex-col [@media(orientation:landscape)_and_(max-height:520px)]:h-full">
      <svg
        viewBox="0 0 100 64"
        className="h-auto w-full max-w-full rounded-lg bg-emerald-700 [@media(orientation:landscape)_and_(max-height:520px)]:h-full [@media(orientation:landscape)_and_(max-height:520px)]:max-h-full [@media(orientation:landscape)_and_(max-height:520px)]:w-auto"
        role="img"
        aria-label={`${formation} formation`}
        data-formation={formation}
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
