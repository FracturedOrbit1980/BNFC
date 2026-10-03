export const PITCH_VIEWS = ["full", "half", "box", "thirds", "channel"] as const;

export type PitchView = (typeof PITCH_VIEWS)[number];

export const PITCH_VIEW_LABEL: Record<PitchView, string> = {
  full: "Full",
  half: "Half",
  box: "Box",
  thirds: "Thirds",
  channel: "Channel",
};

export const SESSION_PHASES = ["Warm-up", "Technical", "Skill", "Small-sided game", "Game"] as const;

export type SessionPhase = (typeof SESSION_PHASES)[number];

export const PIECE_KINDS = ["player", "keeper", "cone", "mannequin", "goal", "pole"] as const;

export type PieceKind = (typeof PIECE_KINDS)[number];

export const PIECE_LABEL: Record<PieceKind, string> = {
  player: "Player",
  keeper: "Keeper",
  cone: "Cone",
  mannequin: "Mannequin",
  goal: "Goal",
  pole: "Pole",
};

export const MARK_KINDS = ["pass", "run", "dribble", "press", "marker"] as const;

export type MarkKind = (typeof MARK_KINDS)[number];

export const MARK_LABEL: Record<MarkKind, string> = {
  pass: "Pass",
  run: "Run",
  dribble: "Dribble",
  press: "Press",
  marker: "Marker",
};

export interface PitchPoint {
  x: number;
  y: number;
}

export interface BoardPiece {
  id: string;
  kind: PieceKind;
  x: number;
  y: number;
  label: string;
}

export interface BoardMark {
  id: string;
  kind: MarkKind;
  points: PitchPoint[];
}

export interface BoardFrame {
  id: string;
  pieces: BoardPiece[];
  marks: BoardMark[];
}

export interface DrillBoard {
  view: PitchView;
  phase: SessionPhase;
  speed: number;
  frames: BoardFrame[];
}

export interface PitchWindow {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const PITCH_WINDOW: Record<PitchView, PitchWindow> = {
  full: { x: 0, y: 0, width: 100, height: 64 },
  half: { x: 50, y: 0, width: 50, height: 64 },
  box: { x: 80, y: 12, width: 20, height: 40 },
  thirds: { x: 0, y: 0, width: 100, height: 64 },
  channel: { x: 38, y: 0, width: 24, height: 64 },
};

export function emptyDrillBoard(): DrillBoard {
  return {
    view: "full",
    phase: "Technical",
    speed: 1,
    frames: [{ id: "frame-1", pieces: [], marks: [] }],
  };
}

export function clampPoint(point: PitchPoint): PitchPoint {
  return {
    x: Math.min(100, Math.max(0, point.x)),
    y: Math.min(64, Math.max(0, point.y)),
  };
}
