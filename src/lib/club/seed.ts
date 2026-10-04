import { ensureYouthAges } from "@/lib/club/age";
import type { ClubAgeGroup, DrillTemplate, SetupDiagram } from "@/lib/club/catalog";
import type { DrillBoard } from "@/lib/club/board";
import { clubLibrary } from "@/lib/club/library";
import { placeOnU12Prem, playerId, SQUAD_TEAM_ID, U12_SQUAD } from "@/lib/club/roster";

export interface ClubPlayer {
  id: string;
  name: string;
  squadNumber: number;
  position: string;
  positions?: string[];
  teamId: string;
  homework: string;
}

export interface ClubCoach {
  id: string;
  name: string;
  teamId: string;
}

export interface ClubDrill extends DrillTemplate {
  durationSeconds: number;
  diagram: SetupDiagram;
}

export interface EvaluationRecord {
  id: string;
  playerId: string;
  date: string;
  technical: number;
  tactical: number;
  physical: number;
  mental: number;
  notes: string;
}

export interface AttendanceRecord {
  id: string;
  playerId: string;
  when: string;
  detail: string;
  status: "Present" | "Absent";
}

export interface TrainingMark {
  playerId: string;
  date: string;
  present: boolean;
}

export type TrainingStatus = "Present" | "Not present" | "Not marked";

export interface WeeklyReport {
  id: string;
  playerId: string;
  teamId: string;
  weekStart: string;
  gameDay: string;
  attendance: { date: string; status: TrainingStatus }[];
  gameFeedback: string;
}

export interface SessionPlan {
  id: string;
  teamId: string;
  title: string;
  drillIds: string[];
  savedOn: string;
}

export interface SavedMatch {
  id: string;
  teamId: string;
  opponent: string;
  playedOn: string;
  minutes: { playerId: string; minutesPlayed: number }[];
}

export interface ClubData {
  clubKind: "bnfc" | "custom";
  ageGroups: ClubAgeGroup[];
  coaches: ClubCoach[];
  players: ClubPlayer[];
  drills: ClubDrill[];
  evaluations: EvaluationRecord[];
  attendance: AttendanceRecord[];
  trainingMarks: TrainingMark[];
  weeklyReports: WeeklyReport[];
  sessions: SessionPlan[];
  matches: SavedMatch[];
  coachTeamId: string | null;
  boards: Record<string, DrillBoard>;
}

export function createSeed(): ClubData {
  const placed = placeOnU12Prem(
    ensureYouthAges([]),
    U12_SQUAD.map((player) => ({
      id: playerId(player.name),
      name: player.name,
      squadNumber: player.squadNumber,
      position: "Central midfielder",
      positions: [] as string[],
      teamId: SQUAD_TEAM_ID,
      homework: "",
    })),
  );
  return {
    clubKind: "bnfc",
    ageGroups: placed.ageGroups,
    coaches: [],
    players: placed.players,
    drills: clubLibrary.map((drill) => ({
      ...drill,
      coachingPoints: [...drill.coachingPoints],
      durationSeconds: drill.defaultDurationSeconds,
    })),
    evaluations: [],
    attendance: [],
    trainingMarks: [],
    weeklyReports: [],
    sessions: [],
    matches: [],
    coachTeamId: placed.teamId,
    boards: {},
  };
}

export function createEmptyClub(): ClubData {
  return {
    clubKind: "custom",
    ageGroups: ensureYouthAges([]),
    coaches: [],
    players: [],
    drills: clubLibrary.map((drill) => ({
      ...drill,
      coachingPoints: [...drill.coachingPoints],
      durationSeconds: drill.defaultDurationSeconds,
    })),
    evaluations: [],
    attendance: [],
    trainingMarks: [],
    weeklyReports: [],
    sessions: [],
    matches: [],
    coachTeamId: null,
    boards: {},
  };
}
