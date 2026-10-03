import { ageGroups, type ClubAgeGroup, type DrillTemplate, type SetupDiagram } from "@/lib/club/catalog";
import { clubLibrary } from "@/lib/club/library";

export const COACH_TEAM_ID = "tm-u13-premier";

export interface ClubPlayer {
  id: string;
  name: string;
  squadNumber: number;
  position: string;
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
  ageGroups: ClubAgeGroup[];
  coaches: ClubCoach[];
  players: ClubPlayer[];
  drills: ClubDrill[];
  evaluations: EvaluationRecord[];
  attendance: AttendanceRecord[];
  sessions: SessionPlan[];
  matches: SavedMatch[];
}

export function createSeed(): ClubData {
  return {
    ageGroups: ageGroups.map((group) => ({
      ...group,
      teams: group.teams.map((team) => ({ ...team })),
    })),
    coaches: [],
    players: [],
    drills: clubLibrary.map((drill) => ({
      ...drill,
      coachingPoints: [...drill.coachingPoints],
      durationSeconds: drill.defaultDurationSeconds,
    })),
    evaluations: [],
    attendance: [],
    sessions: [],
    matches: [],
  };
}
