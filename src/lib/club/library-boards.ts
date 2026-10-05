import {
  DEFAULT_OPPONENT_COLOR,
  DEFAULT_PITCH_COLOR,
  DEFAULT_PLAYER_COLOR,
  boardHasPattern,
  type BoardFrame,
  type BoardMark,
  type BoardPiece,
  type DrillBoard,
  type MarkKind,
  type SessionPhase,
} from "@/lib/club/board";

function player(id: string, x: number, y: number, label: string, team: "player" | "opponent" = "player"): BoardPiece {
  return { id, kind: "player", x, y, label, team };
}

function keeper(id: string, x: number, y: number): BoardPiece {
  return { id, kind: "keeper", x, y, label: "GK", team: "player" };
}

function cone(id: string, x: number, y: number): BoardPiece {
  return { id, kind: "cone", x, y, label: "" };
}

function line(id: string, x1: number, y1: number, x2: number, y2: number, kind: MarkKind): BoardMark {
  return { id, kind, points: [{ x: x1, y: y1 }, { x: x2, y: y2 }] };
}

function slide(id: string, pieces: BoardPiece[], marks: BoardMark[]): BoardFrame {
  return { id, pieces, marks };
}

function phaseFor(id: string): SessionPhase {
  if (id.endsWith("_wu")) return "Warm-up";
  if (id.endsWith("_tp")) return "Technical";
  if (id.endsWith("_sp") || id.endsWith("094")) return "Skill";
  if (id.endsWith("_ssg")) return "Small-sided game";
  return "Game";
}

function pairs(nudge: number): BoardFrame[] {
  const y = 26 + (nudge % 3) * 3;
  return [
    slide(
      "slide-1",
      [player("a", 24, y, "1"), player("b", 70, y, "2"), cone("c1", 18, y + 10), cone("c2", 78, y + 10)],
      [line("pass", 28, y, 64, y, "pass"), line("run", 70, y + 4, 78, y - 8, "run")],
    ),
    slide(
      "slide-2",
      [player("a", 46, y - 12, "1"), player("b", 58, y + 12, "2"), cone("c1", 18, y + 10), cone("c2", 78, y + 10)],
      [line("pass", 56, y + 8, 46, y - 8, "pass"), line("run", 46, y - 6, 30, y - 16, "run")],
    ),
  ];
}

function lineShape(nudge: number): BoardFrame[] {
  const x = 28 + (nudge % 2) * 4;
  return [
    slide(
      "slide-1",
      [player("a", x, 16, "1"), player("b", x, 32, "2"), player("c", x, 48, "3"), cone("c1", x + 16, 16), cone("c2", x + 16, 48)],
      [line("press", x + 6, 14, x + 6, 50, "press"), line("run", x + 4, 32, x + 14, 32, "run")],
    ),
    slide(
      "slide-2",
      [player("a", x + 22, 14, "1"), player("b", x + 22, 32, "2"), player("c", x + 22, 50, "3"), cone("c1", x + 16, 16), cone("c2", x + 16, 48)],
      [line("press", x + 28, 12, x + 28, 52, "press"), line("run", x + 22, 32, x + 36, 24, "run")],
    ),
  ];
}

function boxPass(): BoardFrame[] {
  return [
    slide(
      "slide-1",
      [player("a", 28, 18, "1"), player("b", 72, 18, "2"), player("c", 72, 46, "3"), player("d", 28, 46, "4"), cone("c1", 36, 32)],
      [line("pass", 32, 20, 66, 20, "pass"), line("run", 72, 22, 72, 40, "run")],
    ),
    slide(
      "slide-2",
      [player("a", 36, 24, "1"), player("b", 64, 24, "2"), player("c", 64, 42, "3"), player("d", 36, 42, "4"), cone("c1", 36, 32)],
      [line("pass", 64, 28, 64, 38, "pass"), line("run", 60, 42, 40, 42, "run")],
    ),
  ];
}

function pressAngle(): BoardFrame[] {
  return [
    slide(
      "slide-1",
      [player("a", 30, 32, "1"), player("b", 68, 20, "2", "opponent"), cone("c1", 22, 20), cone("c2", 22, 44)],
      [line("pass", 34, 30, 52, 28, "dribble"), line("press", 64, 22, 48, 30, "press")],
    ),
    slide(
      "slide-2",
      [player("a", 42, 34, "1"), player("b", 52, 28, "2", "opponent"), cone("c1", 22, 20), cone("c2", 22, 44)],
      [line("pass", 40, 36, 28, 40, "dribble"), line("press", 50, 26, 40, 34, "press")],
    ),
  ];
}

function attack(): BoardFrame[] {
  return [
    slide(
      "slide-1",
      [
        player("a", 22, 20, "1"),
        player("b", 22, 44, "2"),
        player("c", 38, 32, "3"),
        player("d", 62, 22, "4", "opponent"),
        player("e", 62, 44, "5", "opponent"),
        keeper("gk", 88, 32),
      ],
      [line("pass", 26, 22, 36, 30, "pass"), line("run", 38, 28, 54, 18, "run")],
    ),
    slide(
      "slide-2",
      [
        player("a", 48, 16, "1"),
        player("b", 40, 46, "2"),
        player("c", 58, 32, "3"),
        player("d", 72, 24, "4", "opponent"),
        player("e", 74, 42, "5", "opponent"),
        keeper("gk", 90, 32),
      ],
      [line("pass", 50, 18, 58, 30, "pass"), line("run", 58, 28, 78, 28, "run")],
    ),
  ];
}

function rondo(): BoardFrame[] {
  return [
    slide(
      "slide-1",
      [
        player("a", 28, 16, "1"),
        player("b", 72, 16, "2"),
        player("c", 72, 48, "3"),
        player("d", 28, 48, "4"),
        player("e", 44, 28, "5", "opponent"),
        player("f", 56, 36, "6", "opponent"),
      ],
      [line("pass", 32, 18, 66, 18, "pass"), line("press", 46, 30, 58, 22, "press")],
    ),
    slide(
      "slide-2",
      [
        player("a", 30, 18, "1"),
        player("b", 70, 22, "2"),
        player("c", 68, 46, "3"),
        player("d", 32, 46, "4"),
        player("e", 52, 20, "5", "opponent"),
        player("f", 58, 30, "6", "opponent"),
      ],
      [line("pass", 68, 24, 66, 42, "pass"), line("press", 54, 22, 66, 28, "press")],
    ),
  ];
}

function smallSided(): BoardFrame[] {
  return [
    slide(
      "slide-1",
      [
        player("a", 24, 18, "1"),
        player("b", 24, 34, "2"),
        player("c", 36, 46, "3"),
        player("d", 70, 18, "4", "opponent"),
        player("e", 78, 34, "5", "opponent"),
        player("f", 66, 48, "6", "opponent"),
        cone("c1", 50, 12),
        cone("c2", 50, 52),
      ],
      [line("pass", 28, 20, 46, 16, "pass"), line("run", 36, 42, 52, 36, "run")],
    ),
    slide(
      "slide-2",
      [
        player("a", 42, 16, "1"),
        player("b", 40, 32, "2"),
        player("c", 54, 44, "3"),
        player("d", 78, 22, "4", "opponent"),
        player("e", 84, 36, "5", "opponent"),
        player("f", 74, 50, "6", "opponent"),
        cone("c1", 50, 12),
        cone("c2", 50, 52),
      ],
      [line("pass", 44, 18, 58, 28, "pass"), line("run", 54, 40, 72, 30, "run")],
    ),
  ];
}

function block(): BoardFrame[] {
  return [
    slide(
      "slide-1",
      [
        player("a", 30, 16, "1"),
        player("b", 30, 32, "2"),
        player("c", 30, 48, "3"),
        player("d", 48, 24, "4"),
        player("e", 62, 18, "5", "opponent"),
        player("f", 66, 34, "6", "opponent"),
        player("g", 62, 50, "7", "opponent"),
      ],
      [line("pass", 34, 32, 46, 26, "pass"), line("run", 48, 20, 58, 16, "run")],
    ),
    slide(
      "slide-2",
      [
        player("a", 46, 14, "1"),
        player("b", 44, 32, "2"),
        player("c", 46, 50, "3"),
        player("d", 60, 28, "4"),
        player("e", 74, 20, "5", "opponent"),
        player("f", 78, 36, "6", "opponent"),
        player("g", 74, 50, "7", "opponent"),
      ],
      [line("pass", 48, 30, 62, 22, "pass"), line("run", 60, 24, 74, 18, "run")],
    ),
  ];
}

function framesFor(id: string, index: number): BoardFrame[] {
  if (id === "drill_uefa_oop_wu") return lineShape(index);
  if (id === "drill_uefa_oop_tp") return pressAngle();
  if (id === "drill_uefa_att_094") return rondo();
  if (id.endsWith("_wu")) return pairs(index);
  if (id.endsWith("_tp")) return boxPass();
  if (id.endsWith("_sp")) return attack();
  if (id.endsWith("_ssg")) return smallSided();
  return block();
}

const LIBRARY_IDS = [
  "drill_uefa_ip_wu",
  "drill_uefa_ip_tp",
  "drill_uefa_ip_sp",
  "drill_uefa_ip_pop",
  "drill_uefa_ip_ssg",
  "drill_uefa_ip_11",
  "drill_uefa_oop_wu",
  "drill_uefa_oop_tp",
  "drill_uefa_oop_sp",
  "drill_uefa_oop_pop",
  "drill_uefa_oop_ssg",
  "drill_uefa_oop_11",
  "drill_uefa_t2a_wu",
  "drill_uefa_t2a_tp",
  "drill_uefa_t2a_sp",
  "drill_uefa_t2a_pop",
  "drill_uefa_t2a_ssg",
  "drill_uefa_t2a_11",
  "drill_uefa_t2d_wu",
  "drill_uefa_t2d_tp",
  "drill_uefa_att_094",
  "drill_uefa_t2d_pop",
  "drill_uefa_t2d_ssg",
  "drill_uefa_t2d_11",
] as const;

export const libraryBoards: Record<string, DrillBoard> = Object.fromEntries(
  LIBRARY_IDS.map((id, index) => [
    id,
    {
      view: "full" as const,
      phase: phaseFor(id),
      speed: 1,
      playerColor: DEFAULT_PLAYER_COLOR,
      opponentColor: DEFAULT_OPPONENT_COLOR,
      pitchColor: DEFAULT_PITCH_COLOR,
      frames: framesFor(id, index),
    },
  ]),
);

/** Keep a coach's saved layout. Fill a library drill only when its board is missing or empty. */
export function mergeLibraryBoards(saved: Record<string, DrillBoard> | undefined) {
  const next = { ...(saved ?? {}) };
  for (const [id, board] of Object.entries(libraryBoards)) {
    if (!boardHasPattern(next[id])) next[id] = board;
  }
  return next;
}
