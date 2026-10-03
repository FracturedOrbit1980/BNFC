export const CLUB_NAME = "Benoni Northerns FC";

export const OBJECTIVE_CATEGORIES = ["Technical", "Tactical", "Physical", "Set Piece"] as const;

export type ObjectiveCategory = (typeof OBJECTIVE_CATEGORIES)[number];

export const SETUP_DIAGRAMS = ["square", "channel", "rondo", "overlap", "press", "gates", "lanes", "corner"] as const;

export type SetupDiagram = (typeof SETUP_DIAGRAMS)[number];

export interface ClubTeam {
  id: string;
  name: string;
}

export interface ClubAgeGroup {
  id: string;
  name: string;
  displayOrder: number;
  teams: ClubTeam[];
}

export const ageGroups: ClubAgeGroup[] = [
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

export interface DrillTemplate {
  id: string;
  title: string;
  isClubOfficial: boolean;
  targetAgeGroup: string;
  objectiveCategory: ObjectiveCategory;
  diagram: SetupDiagram;
  pitchSetup: string;
  instructions: string;
  coachingPoints: string[];
  defaultDurationSeconds: number;
}
