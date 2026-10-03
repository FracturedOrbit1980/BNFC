import { create } from "zustand";
import { persist } from "zustand/middleware";

import { OBJECTIVE_CATEGORIES, type ObjectiveCategory, type SetupDiagram } from "@/lib/club/catalog";
import {
  COACH_TEAM_ID,
  createSeed,
  type AttendanceRecord,
  type ClubData,
  type ClubDrill,
  type EvaluationRecord,
  type SavedMatch,
  type SessionPlan,
} from "@/lib/club/seed";

export interface NewDrillInput {
  title: string;
  objectiveCategory: ObjectiveCategory;
  targetAgeGroup: string;
  durationSeconds: number;
  diagram: SetupDiagram;
  pitchSetup: string;
  instructions: string;
  coachingPoints: string[];
  isClubOfficial: boolean;
}

export interface NewPlayerInput {
  name: string;
  squadNumber: number;
  position: string;
  teamId: string;
}

export interface NewEvaluationInput {
  playerId: string;
  technical: number;
  tactical: number;
  physical: number;
  mental: number;
  notes: string;
}

interface ClubState extends ClubData {
  hydrated: boolean;
  setDrillDuration: (drillId: string, seconds: number) => void;
  addDrill: (input: NewDrillInput) => void;
  setDrillOfficial: (drillId: string, official: boolean) => void;
  addTeam: (ageGroupId: string, name: string) => void;
  addPlayer: (input: NewPlayerInput) => void;
  addCoach: (teamId: string, name: string) => void;
  addEvaluation: (input: NewEvaluationInput) => void;
  setHomework: (playerId: string, homework: string) => void;
  saveSession: (title: string, drillIds: string[]) => void;
  saveMatch: (opponent: string, minutes: { playerId: string; minutesPlayed: number }[]) => void;
  resetClub: () => void;
}

function todayLabel() {
  return new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export const useClubStore = create<ClubState>()(
  persist(
    (set) => ({
      hydrated: false,
      ...createSeed(),
      setDrillDuration: (drillId, seconds) =>
        set((state) => ({
          drills: state.drills.map((drill) =>
            drill.id === drillId ? { ...drill, durationSeconds: seconds } : drill,
          ),
        })),
      addDrill: (input) =>
        set((state) => ({
          drills: [
            {
              id: `dr-${Date.now()}`,
              title: input.title,
              isClubOfficial: input.isClubOfficial,
              targetAgeGroup: input.targetAgeGroup,
              objectiveCategory: input.objectiveCategory,
              diagram: input.diagram,
              pitchSetup: input.pitchSetup,
              instructions: input.instructions,
              coachingPoints: input.coachingPoints,
              defaultDurationSeconds: input.durationSeconds,
              durationSeconds: input.durationSeconds,
            },
            ...state.drills,
          ],
        })),
      setDrillOfficial: (drillId, official) =>
        set((state) => ({
          drills: state.drills.map((drill) =>
            drill.id === drillId ? { ...drill, isClubOfficial: official } : drill,
          ),
        })),
      addPlayer: (input) =>
        set((state) => ({
          players: [
            ...state.players,
            {
              id: `p-${Date.now()}`,
              name: input.name,
              squadNumber: input.squadNumber,
              position: input.position,
              teamId: input.teamId,
              homework: "",
            },
          ],
        })),
      addCoach: (teamId, name) =>
        set((state) => ({
          coaches: [
            ...state.coaches.filter((coach) => coach.teamId !== teamId),
            { id: `c-${Date.now()}`, name, teamId },
          ],
        })),
      addTeam: (ageGroupId, name) =>
        set((state) => ({
          ageGroups: state.ageGroups.map((group) =>
            group.id === ageGroupId
              ? {
                  ...group,
                  teams: [...group.teams, { id: `tm-${Date.now()}`, name }],
                }
              : group,
          ),
        })),
      addEvaluation: (input) =>
        set((state) => ({
          evaluations: [
            {
              id: `ev-${Date.now()}`,
              date: todayIso(),
              ...input,
            },
            ...state.evaluations,
          ],
        })),
      setHomework: (playerId, homework) =>
        set((state) => ({
          players: state.players.map((player) =>
            player.id === playerId ? { ...player, homework } : player,
          ),
        })),
      saveSession: (title, drillIds) =>
        set((state) => ({
          sessions: [
            {
              id: `ses-${Date.now()}`,
              teamId: COACH_TEAM_ID,
              title,
              drillIds,
              savedOn: todayLabel(),
            },
            ...state.sessions,
          ],
        })),
      saveMatch: (opponent, minutes) =>
        set((state) => {
          const playedOn = todayLabel();
          const match: SavedMatch = {
            id: `match-${Date.now()}`,
            teamId: COACH_TEAM_ID,
            opponent,
            playedOn,
            minutes,
          };
          const attendance: AttendanceRecord[] = minutes.map((row) => ({
            id: `att-${match.id}-${row.playerId}`,
            playerId: row.playerId,
            when: playedOn,
            detail: `vs ${opponent}`,
            status: row.minutesPlayed > 0 ? "Present" : "Absent",
          }));
          return {
            matches: [match, ...state.matches],
            attendance: [...attendance, ...state.attendance],
          };
        }),
      resetClub: () => set({ hydrated: true, ...createSeed() }),
    }),
    {
      name: "bnfc-club-v2",
      skipHydration: true,
      partialize: (state) => ({
        ageGroups: state.ageGroups,
        coaches: state.coaches,
        players: state.players,
        drills: state.drills,
        evaluations: state.evaluations,
        attendance: state.attendance,
        sessions: state.sessions,
        matches: state.matches,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<ClubData>;
        const drills = (saved.drills ?? current.drills).map((drill) => ({
          ...drill,
          durationSeconds: drill.durationSeconds ?? drill.defaultDurationSeconds,
          coachingPoints: drill.coachingPoints ?? [],
          diagram: drill.diagram ?? "square",
        }));
        return {
          ...current,
          ...saved,
          drills,
          hydrated: false,
        };
      },
    },
  ),
);

export function isObjectiveCategory(value: string): value is ObjectiveCategory {
  return (OBJECTIVE_CATEGORIES as readonly string[]).includes(value);
}

export type { ClubDrill, EvaluationRecord, SessionPlan };
