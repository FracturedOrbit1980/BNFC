import { create } from "zustand";

import { demoMatchPlayers } from "@/lib/demo/data";

export interface PlayerMatchState {
  playerId: string;
  name: string;
  squadNumber: number;
  position: string;
  isOnPitch: boolean;
  minutesPlayed: number;
}

interface MatchStore {
  matchTimeSeconds: number;
  isClockRunning: boolean;
  players: PlayerMatchState[];
  startMatchClock: () => void;
  pauseMatchClock: () => void;
  substitutePlayer: (playerOffId: string, playerOnId: string) => void;
  tickSecond: () => void;
  resetMatch: () => void;
}

function freshRoster(): PlayerMatchState[] {
  return demoMatchPlayers.map((player) => ({ ...player }));
}

export const useMatchStore = create<MatchStore>((set, get) => ({
  matchTimeSeconds: 0,
  isClockRunning: false,
  players: freshRoster(),
  startMatchClock: () => set({ isClockRunning: true }),
  pauseMatchClock: () => set({ isClockRunning: false }),
  substitutePlayer: (playerOffId, playerOnId) => {
    if (!playerOffId || !playerOnId || playerOffId === playerOnId) return;
    const { players } = get();
    const off = players.find((player) => player.playerId === playerOffId);
    const on = players.find((player) => player.playerId === playerOnId);
    if (!off?.isOnPitch || !on || on.isOnPitch) return;
    set((state) => ({
      players: state.players.map((player) => {
        if (player.playerId === playerOffId) return { ...player, isOnPitch: false };
        if (player.playerId === playerOnId) return { ...player, isOnPitch: true };
        return player;
      }),
    }));
  },
  tickSecond: () =>
    set((state) => ({
      matchTimeSeconds: state.matchTimeSeconds + 1,
      players: state.players.map((player) =>
        player.isOnPitch ? { ...player, minutesPlayed: player.minutesPlayed + 1 / 60 } : player,
      ),
    })),
  resetMatch: () =>
    set({
      matchTimeSeconds: 0,
      isClockRunning: false,
      players: freshRoster(),
    }),
}));
