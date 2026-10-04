export const CLUB_NAME = "Benoni Northerns FC";

export const OBJECTIVE_CATEGORIES = ["Technical", "Tactical", "Physical", "Set Piece"] as const;

export type ObjectiveCategory = (typeof OBJECTIVE_CATEGORIES)[number];

export const DRILL_LEVELS = ["Beginner", "Intermediate", "Professional"] as const;

export type DrillLevel = (typeof DRILL_LEVELS)[number];

export const SETUP_DIAGRAMS = ["square", "channel", "rondo", "overlap", "press", "gates", "lanes", "corner"] as const;

export type SetupDiagram = (typeof SETUP_DIAGRAMS)[number];

export interface ClubTeam {
  id: string;
  name: string;
  gameDay?: string;
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
