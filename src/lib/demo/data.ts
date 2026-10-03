import type { PlayerMatchState } from "@/stores/match-store";

export const CLUB_NAME = "Benoni Northerns FC";

export const OBJECTIVE_CATEGORIES = ["Technical", "Tactical", "Physical", "Set Piece"] as const;

export type ObjectiveCategory = (typeof OBJECTIVE_CATEGORIES)[number];

export interface DemoTeam {
  id: string;
  name: string;
}

export interface DemoAgeGroup {
  id: string;
  name: string;
  displayOrder: number;
  teams: DemoTeam[];
}

export const ageGroups: DemoAgeGroup[] = [
  {
    id: "ag-u11",
    name: "Under 11",
    displayOrder: 1,
    teams: [{ id: "tm-u11-academy", name: "U11 Academy" }],
  },
  {
    id: "ag-u13",
    name: "Under 13",
    displayOrder: 2,
    teams: [
      { id: "tm-u13-premier", name: "U13 Premier" },
      { id: "tm-u13-academy", name: "U13 Academy" },
    ],
  },
  {
    id: "ag-u15",
    name: "Under 15",
    displayOrder: 3,
    teams: [{ id: "tm-u15-premier", name: "U15 Premier" }],
  },
  {
    id: "ag-u17",
    name: "Under 17",
    displayOrder: 4,
    teams: [{ id: "tm-u17-dev", name: "U17 Development" }],
  },
];

export const demoMatchPlayers: PlayerMatchState[] = [
  { playerId: "p-01", name: "Thabo Mokoena", squadNumber: 1, position: "GK", isOnPitch: true, minutesPlayed: 0 },
  { playerId: "p-02", name: "Liam Botha", squadNumber: 2, position: "RB", isOnPitch: true, minutesPlayed: 0 },
  { playerId: "p-03", name: "Sipho Ndlovu", squadNumber: 4, position: "CB", isOnPitch: true, minutesPlayed: 0 },
  { playerId: "p-04", name: "Johan Pretorius", squadNumber: 5, position: "CB", isOnPitch: true, minutesPlayed: 0 },
  { playerId: "p-05", name: "Keegan Pillay", squadNumber: 3, position: "LB", isOnPitch: true, minutesPlayed: 0 },
  { playerId: "p-06", name: "Musa Khumalo", squadNumber: 6, position: "DM", isOnPitch: true, minutesPlayed: 0 },
  { playerId: "p-07", name: "Ethan van Wyk", squadNumber: 8, position: "CM", isOnPitch: true, minutesPlayed: 0 },
  { playerId: "p-08", name: "Amahle Dlamini", squadNumber: 10, position: "AM", isOnPitch: true, minutesPlayed: 0 },
  { playerId: "p-09", name: "Ryan Jacobs", squadNumber: 7, position: "RW", isOnPitch: true, minutesPlayed: 0 },
  { playerId: "p-10", name: "Lebo Molefe", squadNumber: 11, position: "LW", isOnPitch: true, minutesPlayed: 0 },
  { playerId: "p-11", name: "Connor Smith", squadNumber: 9, position: "ST", isOnPitch: true, minutesPlayed: 0 },
  { playerId: "p-12", name: "Noah Adams", squadNumber: 12, position: "GK", isOnPitch: false, minutesPlayed: 0 },
  { playerId: "p-13", name: "Pieter du Toit", squadNumber: 14, position: "CM", isOnPitch: false, minutesPlayed: 0 },
  { playerId: "p-14", name: "Sibusiso Zulu", squadNumber: 15, position: "ST", isOnPitch: false, minutesPlayed: 0 },
  { playerId: "p-15", name: "Daniel Naidoo", squadNumber: 16, position: "RB", isOnPitch: false, minutesPlayed: 0 },
];

export const demoMatch = {
  opponent: "Kempton Park FC",
  teamName: "U13 Premier",
  status: "LIVE" as const,
};

export const samplePlayer = {
  name: "Amahle Dlamini",
  squadNumber: 10,
  position: "AM",
  teamName: "U13 Premier",
  ageGroup: "Under 13",
  notes: "Keep receiving on the half-turn and scan before the ball arrives.",
  scores: {
    technical: 7,
    tactical: 6,
    physical: 8,
    mental: 7,
  },
};

export const sampleAttendance = [
  { id: "att-1", when: "Sat 27 Sep", detail: "vs Kempton Park", status: "Present" },
  { id: "att-2", when: "Sat 20 Sep", detail: "vs Brakpan United", status: "Present" },
  { id: "att-3", when: "Wed 17 Sep", detail: "Training", status: "Absent" },
];

export interface DemoDrill {
  id: string;
  title: string;
  isClubOfficial: boolean;
  targetAgeGroup: string;
  objectiveCategory: ObjectiveCategory;
  pitchSetup: string;
  instructions: string;
  coachingPoints: string[];
  defaultDurationSeconds: number;
}

export const demoDrills: DemoDrill[] = [
  {
    id: "dr-1",
    title: "First-touch square",
    isClubOfficial: true,
    targetAgeGroup: "Under 13",
    objectiveCategory: "Technical",
    pitchSetup: "10m square, one ball, four cones.",
    instructions: "Play two-touch around the square. The receiver checks off their cone, opens their body, and passes to the next corner.",
    coachingPoints: ["First touch out of pressure", "Head up before the pass", "Weight of pass into feet"],
    defaultDurationSeconds: 300,
  },
  {
    id: "dr-2",
    title: "1v1 to goal",
    isClubOfficial: true,
    targetAgeGroup: "Under 13",
    objectiveCategory: "Technical",
    pitchSetup: "Channel from the halfway line to one goal. Balls at the start cone.",
    instructions: "Attacker receives facing forward and tries to score. Defender delays, then tackles when the touch is heavy.",
    coachingPoints: ["Attack the front foot", "Finish early", "Defender stays side-on"],
    defaultDurationSeconds: 300,
  },
  {
    id: "dr-3",
    title: "4v2 rondo",
    isClubOfficial: true,
    targetAgeGroup: "Under 15",
    objectiveCategory: "Tactical",
    pitchSetup: "12m square. Four outside, two inside.",
    instructions: "Outside players keep the ball. Two touches max. A defender who wins it swaps with the passer.",
    coachingPoints: ["Body shape to play forward", "Split the two defenders", "Immediate press after loss"],
    defaultDurationSeconds: 360,
  },
  {
    id: "dr-4",
    title: "Overlap and cross",
    isClubOfficial: false,
    targetAgeGroup: "Under 15",
    objectiveCategory: "Tactical",
    pitchSetup: "Half pitch, full-size goals, wide cones for the overlap lane.",
    instructions: "Wide player drives inside. The fullback overlaps and delivers. Near and far runners attack the cross.",
    coachingPoints: ["Timing of the overlap", "Cross type before the byline", "Attack the near space first"],
    defaultDurationSeconds: 480,
  },
  {
    id: "dr-5",
    title: "Pressing triggers",
    isClubOfficial: true,
    targetAgeGroup: "Under 17",
    objectiveCategory: "Tactical",
    pitchSetup: "Half pitch with a goalkeeper and a back four against six.",
    instructions: "The press starts on a backwards pass or a poor first touch. Jump together, then recover the shape if the ball goes wide.",
    coachingPoints: ["One trigger, everyone jumps", "Cover the pass inside", "Recover in a line"],
    defaultDurationSeconds: 420,
  },
  {
    id: "dr-6",
    title: "Sprint and recover",
    isClubOfficial: false,
    targetAgeGroup: "Under 13",
    objectiveCategory: "Physical",
    pitchSetup: "Two gates 20m apart.",
    instructions: "Sprint through the far gate, jog back, and repeat. Rest equals the work interval.",
    coachingPoints: ["First three steps", "Stay tall on the jog", "Quality over extra reps"],
    defaultDurationSeconds: 180,
  },
  {
    id: "dr-7",
    title: "Repeated sprint lanes",
    isClubOfficial: true,
    targetAgeGroup: "Under 17",
    objectiveCategory: "Physical",
    pitchSetup: "Four 30m lanes. One player per lane.",
    instructions: "Sprint the lane, walk back, and go again on the whistle. Eight reps.",
    coachingPoints: ["Full effort each rep", "Walk the recovery", "Stop if form breaks down"],
    defaultDurationSeconds: 240,
  },
  {
    id: "dr-8",
    title: "Corner delivery",
    isClubOfficial: true,
    targetAgeGroup: "Under 15",
    objectiveCategory: "Set Piece",
    pitchSetup: "One corner arc, six attackers, four defenders, goalkeeper.",
    instructions: "Call the delivery, then attack near-post, penalty spot, and back-post zones. Restart quickly.",
    coachingPoints: ["Delivery to a zone, not a player", "Attack the ball", "Second-ball shape"],
    defaultDurationSeconds: 300,
  },
];

export const sampleAnalytics = [
  { label: "Age groups", value: String(ageGroups.length) },
  { label: "Teams", value: String(ageGroups.reduce((sum, group) => sum + group.teams.length, 0)) },
  { label: "Squad size (sample)", value: String(demoMatchPlayers.length) },
  { label: "Official drills", value: String(demoDrills.filter((drill) => drill.isClubOfficial).length) },
];
