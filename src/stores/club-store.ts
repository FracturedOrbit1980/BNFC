import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ageNumber, ensureYouthAges, sortByAge } from "@/lib/club/age";
import { normalizePositions } from "@/lib/club/positions";
import { canonicalDivision, canonicalTeamName, DRILL_LEVELS, OBJECTIVE_CATEGORIES, type Division, type DrillLevel, type ObjectiveCategory, type SetupDiagram } from "@/lib/club/catalog";
import type { DrillBoard } from "@/lib/club/board";
import { placeOnU12Prem, playerId, SQUAD_TEAM_ID, type RosterRow } from "@/lib/club/roster";
import { weekDates } from "@/lib/club/week";
import {
  createSeed,
  type AttendanceRecord,
  type ClubData,
  type ClubDrill,
  type EvaluationRecord,
  type SavedMatch,
  type SessionPlan,
  type TrainingStatus,
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
  level: DrillLevel;
}

export interface NewPlayerInput {
  name: string;
  squadNumber: number;
  position: string;
  positions?: string[];
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
  setDrillVideo: (drillId: string, videoUrl: string, videoName: string) => void;
  addAgeGroup: (age: number) => void;
  addTeam: (ageGroupId: string, name: string, division: Division) => void;
  openDivisionTeam: (ageGroupId: string, division: Division) => string;
  setTeamDivision: (teamId: string, division: Division) => void;
  setCoachTeam: (teamId: string) => void;
  addPlayer: (input: NewPlayerInput) => void;
  importPlayers: (rows: RosterRow[]) => { added: number; updated: number };
  updatePlayer: (playerId: string, input: { name: string; squadNumber: number; position: string; positions?: string[] }) => void;
  deletePlayer: (playerId: string) => void;
  addCoach: (teamId: string, name: string) => void;
  addEvaluation: (input: NewEvaluationInput) => void;
  setHomework: (playerId: string, homework: string) => void;
  setTeamGameDay: (teamId: string, gameDay: string) => void;
  setTrainingAttendance: (playerId: string, date: string, present: boolean) => void;
  saveWeeklyReport: (playerId: string, teamId: string, weekStart: string, gameFeedback: string) => void;
  saveSession: (teamId: string, title: string, drillIds: string[]) => void;
  saveMatch: (teamId: string, opponent: string, minutes: { playerId: string; minutesPlayed: number }[]) => void;
  setDrillBoard: (drillId: string, board: DrillBoard) => void;
  saveEditorDrill: (
    drillId: string | null,
    input: {
      title: string;
      durationSeconds: number;
      pitchSetup: string;
      coachingPoints: string[];
      level: DrillLevel;
      videoUrl: string;
      videoName: string;
    },
    board: DrillBoard,
  ) => string;
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
    (set, get) => ({
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
              level: input.level,
              videoUrl: "",
              videoName: "",
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
      setDrillVideo: (drillId, videoUrl, videoName) =>
        set((state) => ({
          drills: state.drills.map((drill) =>
            drill.id === drillId ? { ...drill, videoUrl, videoName } : drill,
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
              ...normalizePositions(input.position, input.positions),
              teamId: input.teamId,
              homework: "",
            },
          ],
        })),
      importPlayers: (rows) => {
        const state = get();
        const placed = placeOnU12Prem(ensureYouthAges(state.ageGroups), state.players);
        const players = [...placed.players];
        let added = 0;
        let updated = 0;
        for (const row of rows) {
          const name = row.name.trim().replace(/\s+/g, " ");
          const index = players.findIndex((player) => player.name.trim().toLowerCase() === name.toLowerCase());
          if (index >= 0) {
            players[index] = {
              ...players[index],
              name,
              squadNumber: row.squadNumber,
              teamId: placed.teamId,
            };
            updated += 1;
          } else {
            const id = playerId(name);
            players.push({
              id: players.some((player) => player.id === id) ? `${id}-${placed.teamId}` : id,
              name,
              squadNumber: row.squadNumber,
              position: "Central midfielder",
              positions: [],
              teamId: placed.teamId,
              homework: "",
            });
            added += 1;
          }
        }
        set({ ageGroups: placed.ageGroups, players, coachTeamId: placed.teamId });
        return { added, updated };
      },
      updatePlayer: (playerId, input) =>
        set((state) => ({
          players: state.players.map((player) =>
            player.id === playerId
              ? {
                  ...player,
                  name: input.name,
                  squadNumber: input.squadNumber,
                  ...normalizePositions(input.position, input.positions),
                }
              : player,
          ),
        })),
      deletePlayer: (playerId) =>
        set((state) => ({
          players: state.players.filter((player) => player.id !== playerId),
          trainingMarks: state.trainingMarks.filter((mark) => mark.playerId !== playerId),
          weeklyReports: state.weeklyReports.filter((report) => report.playerId !== playerId),
        })),
      addCoach: (teamId, name) =>
        set((state) => ({
          coaches: [
            ...state.coaches.filter((coach) => coach.teamId !== teamId),
            { id: `c-${Date.now()}`, name, teamId },
          ],
        })),
      addAgeGroup: (age) =>
        set((state) => {
          const number = Math.round(age);
          if (!Number.isInteger(number) || number < 1 || number > 99) return state;
          if (state.ageGroups.some((group) => ageNumber(group.name) === number)) return state;
          return {
            ageGroups: sortByAge([
              ...state.ageGroups,
              {
                id: `ag-${Date.now()}`,
                name: `U${number}`,
                displayOrder: number,
                teams: [],
              },
            ]),
          };
        }),
      setCoachTeam: (teamId) => set({ coachTeamId: teamId }),
      openDivisionTeam: (ageGroupId, division) => {
        let opened = "";
        set((state) => {
          const ageGroups = ensureYouthAges(state.ageGroups);
          const group = ageGroups.find((item) => item.id === ageGroupId);
          if (!group) return { ageGroups };
          const existing = group.teams.find((team) => team.division === division);
          if (existing) {
            opened = existing.id;
            return { ageGroups, coachTeamId: existing.id };
          }
          const undivided = group.teams.filter((team) => !team.division);
          if (group.teams.length === 1 && undivided.length === 1) {
            opened = undivided[0].id;
            return {
              coachTeamId: opened,
              ageGroups: ageGroups.map((item) =>
                item.id === ageGroupId
                  ? {
                      ...item,
                      teams: item.teams.map((team) =>
                        team.id === opened ? { ...team, name: division, division } : team,
                      ),
                    }
                  : item,
              ),
            };
          }
          opened = `tm-${Date.now()}`;
          return {
            coachTeamId: opened,
            ageGroups: ageGroups.map((item) =>
              item.id === ageGroupId
                ? { ...item, teams: [...item.teams, { id: opened, name: division, division }] }
                : item,
            ),
          };
        });
        return opened;
      },
      addTeam: (ageGroupId, name, division) =>
        set((state) => ({
          ageGroups: state.ageGroups.map((group) =>
            group.id === ageGroupId
              ? {
                  ...group,
                  teams: [...group.teams, { id: `tm-${Date.now()}`, name, division }],
                }
              : group,
          ),
        })),
      setTeamDivision: (teamId, division) =>
        set((state) => ({
          ageGroups: state.ageGroups.map((group) => ({
            ...group,
            teams: group.teams.map((team) => (team.id === teamId ? { ...team, division } : team)),
          })),
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
      setTeamGameDay: (teamId, gameDay) =>
        set((state) => ({
          ageGroups: state.ageGroups.map((group) => ({
            ...group,
            teams: group.teams.map((team) => (team.id === teamId ? { ...team, gameDay } : team)),
          })),
        })),
      setTrainingAttendance: (playerId, date, present) =>
        set((state) => {
          const existing = state.trainingMarks.some((mark) => mark.playerId === playerId && mark.date === date);
          return {
            trainingMarks: existing
              ? state.trainingMarks.map((mark) =>
                  mark.playerId === playerId && mark.date === date ? { ...mark, present } : mark,
                )
              : [...state.trainingMarks, { playerId, date, present }],
          };
        }),
      saveWeeklyReport: (playerId, teamId, weekStart, gameFeedback) =>
        set((state) => {
          const attendance = weekDates(weekStart).map((date) => {
            const mark = state.trainingMarks.find((item) => item.playerId === playerId && item.date === date);
            const status: TrainingStatus = mark ? (mark.present ? "Present" : "Not present") : "Not marked";
            return { date, status };
          });
          const gameDay = state.ageGroups.flatMap((group) => group.teams).find((team) => team.id === teamId)?.gameDay ?? "";
          const next = {
            id: `wr-${playerId}-${weekStart}`,
            playerId,
            teamId,
            weekStart,
            gameDay,
            attendance,
            gameFeedback: gameFeedback.trim(),
          };
          const exists = state.weeklyReports.some((report) => report.id === next.id);
          return {
            weeklyReports: exists
              ? state.weeklyReports.map((report) => (report.id === next.id ? next : report))
              : [next, ...state.weeklyReports],
          };
        }),
      saveSession: (teamId, title, drillIds) =>
        set((state) => ({
          sessions: [
            {
              id: `ses-${Date.now()}`,
              teamId,
              title,
              drillIds,
              savedOn: todayLabel(),
            },
            ...state.sessions,
          ],
        })),
      saveMatch: (teamId, opponent, minutes) =>
        set((state) => {
          const playedOn = todayLabel();
          const match: SavedMatch = {
            id: `match-${Date.now()}`,
            teamId,
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
      setDrillBoard: (drillId, board) =>
        set((state) => ({
          boards: { ...state.boards, [drillId]: board },
        })),
      saveEditorDrill: (drillId, input, board) => {
        let savedId = "";
        set((state) => {
          const reusable =
            drillId !== null &&
            state.drills.some((drill) => drill.id === drillId && !drill.isClubOfficial);
          savedId = reusable && drillId ? drillId : `dr-e-${Date.now()}`;
          const existing = state.drills.find((drill) => drill.id === savedId);
          const next = {
            id: savedId,
            title: input.title,
            isClubOfficial: false,
            targetAgeGroup: existing?.targetAgeGroup ?? "All ages",
            objectiveCategory: existing?.objectiveCategory ?? "Technical",
            diagram: existing?.diagram ?? "square",
            pitchSetup: input.pitchSetup,
            instructions: existing?.instructions || input.pitchSetup || "Lay out on the pitch.",
            coachingPoints: input.coachingPoints,
            defaultDurationSeconds: existing?.defaultDurationSeconds ?? input.durationSeconds,
            durationSeconds: input.durationSeconds,
            level: input.level,
            videoUrl: input.videoUrl,
            videoName: input.videoName,
          };
          return {
            drills: existing
              ? state.drills.map((drill) => (drill.id === savedId ? next : drill))
              : [next, ...state.drills],
            boards: { ...state.boards, [savedId]: board },
          };
        });
        return savedId;
      },
      resetClub: () => set({ hydrated: true, ...createSeed() }),
    }),
    {
      name: "bnfc-club-v3",
      skipHydration: true,
      partialize: (state) => ({
        ageGroups: state.ageGroups,
        coaches: state.coaches,
        players: state.players,
        drills: state.drills,
        evaluations: state.evaluations,
        attendance: state.attendance,
        trainingMarks: state.trainingMarks,
        weeklyReports: state.weeklyReports,
        sessions: state.sessions,
        matches: state.matches,
        coachTeamId: state.coachTeamId,
        boards: state.boards,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<ClubData>;
        const savedPlayers = saved.players ?? [];
        const useSquad = savedPlayers.length === 0;
        const ageGroups = ensureYouthAges(saved.ageGroups ?? current.ageGroups).map((group) => ({
          ...group,
          teams: (group.teams ?? []).map((team) => ({
            ...team,
            name: canonicalTeamName(team.name ?? ""),
            division: canonicalDivision(team.division) ?? canonicalDivision(team.name),
          })),
        }));
        const players = (useSquad ? current.players : savedPlayers).map((player) => {
          const next = { ...player } as typeof player & { dateOfBirth?: string };
          delete next.dateOfBirth;
          return {
            ...next,
            ...normalizePositions(player.position, player.positions),
          };
        });
        const placed = placeOnU12Prem(ageGroups, players);
        const previousTeam = saved.coachTeamId ?? null;
        const previousGroup = placed.ageGroups.find((group) => group.teams.some((team) => team.id === previousTeam));
        const openPrem =
          !previousTeam ||
          previousTeam === SQUAD_TEAM_ID ||
          previousTeam === placed.teamId ||
          (previousGroup ? ageNumber(previousGroup.name) === 12 : true);
        const drills = (saved.drills ?? current.drills).map((drill) => ({
          ...drill,
          durationSeconds: drill.durationSeconds ?? drill.defaultDurationSeconds,
          coachingPoints: drill.coachingPoints ?? [],
          diagram: drill.diagram ?? "square",
          level: isDrillLevel(drill.level) ? drill.level : "Beginner",
          videoUrl: drill.videoUrl ?? "",
          videoName: drill.videoName ?? "",
        }));
        return {
          ...current,
          ...saved,
          ageGroups: placed.ageGroups,
          players: placed.players,
          drills,
          coachTeamId: openPrem ? placed.teamId : previousTeam,
          boards: saved.boards ?? {},
          trainingMarks: saved.trainingMarks ?? [],
          weeklyReports: saved.weeklyReports ?? [],
          hydrated: false,
        };
      },
    },
  ),
);

export function isObjectiveCategory(value: string): value is ObjectiveCategory {
  return (OBJECTIVE_CATEGORIES as readonly string[]).includes(value);
}

export function isDrillLevel(value: string | undefined): value is DrillLevel {
  return (DRILL_LEVELS as readonly string[]).includes(value ?? "");
}

export type { ClubDrill, EvaluationRecord, SessionPlan };
