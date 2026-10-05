export const CLUB_NAME = "Sportfica";

export const OBJECTIVE_CATEGORIES = ["Technical", "Tactical", "Physical", "Set Piece"] as const;

export type ObjectiveCategory = (typeof OBJECTIVE_CATEGORIES)[number];

export const DRILL_LEVELS = ["Beginner", "Intermediate", "Professional"] as const;

export type DrillLevel = (typeof DRILL_LEVELS)[number];

export const SETUP_DIAGRAMS = ["square", "channel", "rondo", "overlap", "press", "gates", "lanes", "corner"] as const;

export type SetupDiagram = (typeof SETUP_DIAGRAMS)[number];

export const DIVISIONS = ["Prem", "Div 1", "Div 2", "Div 3", "Div 4"] as const;

export type Division = (typeof DIVISIONS)[number];

const PREVIOUS_DIVISION: Record<string, Division> = {
  Perm: "Prem",
  Div1: "Div 1",
};

export function isDivision(value: string): value is Division {
  return (DIVISIONS as readonly string[]).includes(value);
}

export function canonicalDivision(value: string | undefined | null): Division | undefined {
  if (!value) return undefined;
  if (isDivision(value)) return value;
  return PREVIOUS_DIVISION[value];
}

export function canonicalTeamName(name: string) {
  return PREVIOUS_DIVISION[name] ?? name;
}

export interface ClubTeam {
  id: string;
  name: string;
  gameDay?: string;
  division?: Division;
}

export interface ClubAgeGroup {
  id: string;
  name: string;
  displayOrder: number;
  teams: ClubTeam[];
}

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
  level: DrillLevel;
  videoUrl?: string;
  videoName?: string;
}
