import {
  ageGroups,
  demoDrills,
  demoMatchPlayers,
  sampleAttendance,
  samplePlayer,
  type DemoAgeGroup,
  type DemoDrill,
} from "@/lib/demo/data";

export const COACH_TEAM_ID = "tm-u13-premier";
export const DEMO_PLAYER_ID = "p-08";

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

export interface ClubDrill extends DemoDrill {
  durationSeconds: number;
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
  ageGroups: DemoAgeGroup[];
  coaches: ClubCoach[];
  players: ClubPlayer[];
  drills: ClubDrill[];
  evaluations: EvaluationRecord[];
  attendance: AttendanceRecord[];
  sessions: SessionPlan[];
  matches: SavedMatch[];
}

export function createSeed(): ClubData {
  const premier = demoMatchPlayers.map((player) => ({
    id: player.playerId,
    name: player.name,
    squadNumber: player.squadNumber,
    position: player.position,
    teamId: COACH_TEAM_ID,
    homework: player.playerId === DEMO_PLAYER_ID ? samplePlayer.notes : "",
  }));

  return {
    ageGroups: ageGroups.map((group) => ({
      ...group,
      teams: group.teams.map((team) => ({ ...team })),
    })),
    coaches: [
      { id: "c-u11", name: "Lerato Maseko", teamId: "tm-u11-academy" },
      { id: "c-u13p", name: "Naledi Khumalo", teamId: "tm-u13-premier" },
      { id: "c-u13a", name: "Johan Venter", teamId: "tm-u13-academy" },
      { id: "c-u15", name: "Fatima Essop", teamId: "tm-u15-premier" },
      { id: "c-u17", name: "David Nkosi", teamId: "tm-u17-dev" },
    ],
    players: [
      ...premier,
      { id: "p-a1", name: "Karabo Mahlangu", squadNumber: 7, position: "CM", teamId: "tm-u13-academy", homework: "" },
      { id: "p-a2", name: "Jayden Petersen", squadNumber: 9, position: "ST", teamId: "tm-u13-academy", homework: "" },
      { id: "p-a3", name: "Ayaan Patel", squadNumber: 4, position: "CB", teamId: "tm-u13-academy", homework: "" },
    ],
    drills: demoDrills.map((drill) => ({
      ...drill,
      coachingPoints: [...drill.coachingPoints],
      durationSeconds: drill.defaultDurationSeconds,
    })),
    evaluations: [
      {
        id: "ev-seed",
        playerId: DEMO_PLAYER_ID,
        date: "2026-09-20",
        technical: samplePlayer.scores.technical,
        tactical: samplePlayer.scores.tactical,
        physical: samplePlayer.scores.physical,
        mental: samplePlayer.scores.mental,
        notes: "Receives on the half-turn and finds the next pass.",
      },
    ],
    attendance: sampleAttendance.map((item) => ({
      id: item.id,
      playerId: DEMO_PLAYER_ID,
      when: item.when,
      detail: item.detail,
      status: item.status === "Present" ? "Present" : "Absent",
    })),
    sessions: [
      {
        id: "ses-seed",
        teamId: COACH_TEAM_ID,
        title: "Tuesday technical",
        drillIds: ["dr-1", "dr-2"],
        savedOn: "17 Sep",
      },
    ],
    matches: [],
  };
}
