"use client";

import {
  ArrowRight,
  Circle,
  Columns3,
  Cone,
  Flag,
  Footprints,
  Goal,
  LandPlot,
  MapPin,
  MessageSquareText,
  Move,
  PanelTop,
  Pause,
  PersonStanding,
  Play,
  RectangleVertical,
  Route,
  Save,
  Shield,
  Square,
  SquareDashed,
  Redo2,
  Trash,
  Undo2,
  User,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type DragEvent as ReactDragEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

import { eventPoint, frameBetween, MarkShape, PieceShape, PitchLines } from "@/components/drills/drill-board";
import { DrillVideo } from "@/components/drills/drill-video";
import { DRILL_LEVELS, type DrillLevel } from "@/lib/club/catalog";
import { isDrillLevel } from "@/stores/club-store";
import {
  MARK_KINDS,
  PIECE_KINDS,
  PITCH_VIEWS,
  PITCH_WINDOW,
  clampPoint,
  boardColors,
  emptyDrillBoard,
  type BoardFrame,
  type BoardMark,
  type BoardPiece,
  type DrillBoard,
  type PieceTeam,
  type MarkKind,
  type PieceKind,
  type PitchPoint,
  type PitchView,
} from "@/lib/club/board";
import { useClubStore } from "@/stores/club-store";

const SPEEDS = [0.5, 1, 2];

const VIEW_LABEL: Record<PitchView, string> = {
  full: "Full pitch",
  half: "Half pitch",
  box: "Penalty box",
  thirds: "Thirds",
  channel: "Channel",
};

const VIEW_ICON: Record<PitchView, LucideIcon> = {
  full: LandPlot,
  half: PanelTop,
  box: Square,
  thirds: Columns3,
  channel: RectangleVertical,
};

const VIEW_HINT: Record<PitchView, string> = {
  full: "Shows the whole pitch.",
  half: "Shows one half of the pitch.",
  box: "Zooms to the penalty box.",
  thirds: "Splits the pitch into thirds.",
  channel: "Shows a wide channel.",
};

const PIECE_NAME: Record<PieceKind, string> = {
  player: "Outfield",
  keeper: "Goalkeeper",
  cone: "Cone",
  mannequin: "Mannequin",
  goal: "Goal",
  pole: "Pole",
};

const PIECE_ICON: Record<PieceKind, LucideIcon> = {
  player: User,
  keeper: Shield,
  cone: Cone,
  mannequin: PersonStanding,
  goal: Goal,
  pole: Flag,
};

const PIECE_HINT: Record<PieceKind, string> = {
  player: "Adds your player as a mannequin.",
  keeper: "Adds a goalkeeper.",
  cone: "Adds a cone.",
  mannequin: "Adds a mannequin.",
  goal: "Adds a small goal.",
  pole: "Adds a pole.",
};

const MARK_ICON: Record<MarkKind, LucideIcon> = {
  pass: ArrowRight,
  run: Footprints,
  dribble: Route,
  press: SquareDashed,
  marker: MapPin,
};

const MARK_HINT: Record<MarkKind, string> = {
  pass: "Draws a pass.",
  run: "Draws a run.",
  dribble: "Draws a dribble.",
  press: "Draws a pressing zone.",
  marker: "Drops a marker.",
};

const MARK_NAME: Record<MarkKind, string> = {
  pass: "Pass",
  run: "Run",
  dribble: "Dribble",
  press: "Pressing zone",
  marker: "Marker",
};

export function DrillEditor() {
  return (
    <Suspense fallback={<p className="text-sm font-semibold text-slate-700">Loading the drill editor…</p>}>
      <DrillEditorGate />
    </Suspense>
  );
}

function DrillEditorGate() {
  const requestedId = useSearchParams().get("drill");
  return <DrillEditorForm key={requestedId ?? "new"} requestedId={requestedId} />;
}

function readRequestedDrill(requestedId: string | null) {
  if (!requestedId) return null;
  const state = useClubStore.getState();
  const drill = state.drills.find((item) => item.id === requestedId);
  if (!drill) return null;
  return { drill, board: state.boards[requestedId] ?? emptyDrillBoard() };
}

function DrillEditorForm({ requestedId }: { requestedId: string | null }) {
  const drills = useClubStore((state) => state.drills);
  const saveEditorDrill = useClubStore((state) => state.saveEditorDrill);
  const setDrillVideo = useClubStore((state) => state.setDrillVideo);
  const savedDrills = drills.filter((drill) => !drill.isClubOfficial);
  const [initial] = useState(() => readRequestedDrill(requestedId));
  const [drillId, setDrillId] = useState<string | null>(initial?.drill.id ?? null);
  const [title, setTitle] = useState(initial?.drill.title ?? "");
  const [minutes, setMinutes] = useState(initial ? Math.floor(initial.drill.durationSeconds / 60) : 6);
  const [seconds, setSeconds] = useState(initial ? initial.drill.durationSeconds % 60 : 0);
  const [setup, setSetup] = useState(initial?.drill.pitchSetup ?? "");
  const [points, setPoints] = useState(initial ? initial.drill.coachingPoints.join("\n") : "");
  const [level, setLevel] = useState<DrillLevel>(initial?.drill.level ?? "Beginner");
  const [videoUrl, setVideoUrl] = useState(initial?.drill.videoUrl ?? "");
  const [videoName, setVideoName] = useState(initial?.drill.videoName ?? "");
  const [notice, setNotice] = useState("");
  const [descriptions, setDescriptions] = useState(true);
  const [hint, setHint] = useState("");
  const [board, setBoard] = useState<DrillBoard>(() => initial?.board ?? emptyDrillBoard());
  const [frameIndex, setFrameIndex] = useState(0);
  const [tool, setTool] = useState<MarkKind | "move">("move");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PitchPoint[] | null>(null);
  const [playing, setPlaying] = useState((initial?.board.frames.length ?? 0) > 1);
  const [playhead, setPlayhead] = useState(0);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragId = useRef<string | null>(null);
  const dragRecorded = useRef(false);
  const colorRecorded = useRef(false);
  const colorTimer = useRef<number | null>(null);
  const past = useRef<DrillBoard[]>([]);
  const future = useRef<DrillBoard[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const idRef = useRef(1);
  const colors = boardColors(board);

  const frameCount = board.frames.length;
  const safeIndex = Math.min(frameIndex, Math.max(0, frameCount - 1));
  const shown = playing ? frameBetween(board.frames, playhead) : (board.frames[safeIndex] ?? board.frames[0]);
  const windowBox = PITCH_WINDOW[board.view];

  useEffect(() => {
    if (!playing || frameCount < 2) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;
      setPlayhead((current) => {
        const next = current + (delta * board.speed) / 1.4;
        return next >= frameCount ? next % frameCount : next;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, frameCount, board.speed]);

  function nextId(prefix: string) {
    idRef.current += 1;
    return `${prefix}-e${idRef.current}`;
  }

  function syncHistory() {
    setCanUndo(past.current.length > 0);
    setCanRedo(future.current.length > 0);
  }

  function remember() {
    past.current.push(structuredClone(board));
    if (past.current.length > 40) past.current.shift();
    future.current = [];
    colorRecorded.current = false;
    syncHistory();
  }

  function undo() {
    const previous = past.current.pop();
    if (!previous) return;
    future.current.push(structuredClone(board));
    setBoard(previous);
    setPlaying(false);
    syncHistory();
  }

  function redo() {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(structuredClone(board));
    setBoard(next);
    setPlaying(false);
    syncHistory();
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z") return;
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) return;
      }
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function updateFrame(pieces: BoardPiece[], marks: BoardMark[], record = false) {
    if (record) remember();
    setBoard((current) => ({
      ...current,
      frames: current.frames.map((item, index) => (index === safeIndex ? { ...item, pieces, marks } : item)),
    }));
    setPlaying(false);
  }

  function placeKind(kind: PieceKind, point?: PitchPoint, team: PieceTeam = "player") {
    const side: PieceTeam = kind === "player" ? team : "player";
    const count =
      shown.pieces.filter((piece) => piece.kind === kind && (piece.team ?? "player") === (kind === "player" ? side : "player")).length + 1;
    const piece: BoardPiece = {
      id: nextId("piece"),
      kind,
      team: kind === "player" ? side : undefined,
      x: point?.x ?? windowBox.x + windowBox.width / 2,
      y: point?.y ?? windowBox.y + windowBox.height / 2,
      label: kind === "player" || kind === "keeper" ? String(count) : "",
    };
    const clamped = clampPoint(piece);
    updateFrame([...shown.pieces, { ...piece, ...clamped }], shown.marks, true);
    setSelectedId(piece.id);
    setTool("move");
  }

  function paintColor(field: "playerColor" | "opponentColor", value: string) {
    if (!colorRecorded.current) {
      past.current.push(structuredClone(board));
      if (past.current.length > 40) past.current.shift();
      future.current = [];
      colorRecorded.current = true;
      syncHistory();
    }
    setBoard((current) => ({ ...current, [field]: value }));
    if (colorTimer.current) window.clearTimeout(colorTimer.current);
    colorTimer.current = window.setTimeout(() => {
      colorRecorded.current = false;
    }, 400);
  }

  function recordFrame() {
    remember();
    const snapshot: BoardFrame = {
      id: nextId("frame"),
      pieces: shown.pieces.map((piece) => ({ ...piece })),
      marks: shown.marks.map((mark) => ({ ...mark, points: mark.points.map((point) => ({ ...point })) })),
    };
    const frames = [...board.frames, snapshot];
    setBoard({ ...board, frames });
    setFrameIndex(frames.length - 1);
    setPlayhead(frames.length - 1);
    setPlaying(false);
  }

  function onPointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    if (playing || tool === "move") return;
    const point = eventPoint(svgRef.current, event);
    if (!point) return;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* capture is optional when the pointer is already released */
    }
    if (tool === "marker") {
      updateFrame(shown.pieces, [...shown.marks, { id: nextId("mark"), kind: "marker", points: [point] }], true);
      return;
    }
    setDraft([point]);
  }

  function onPointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    const point = eventPoint(svgRef.current, event);
    if (!point) return;
    if (dragId.current) {
      if (!dragRecorded.current) {
        remember();
        dragRecorded.current = true;
      }
      updateFrame(
        shown.pieces.map((piece) => (piece.id === dragId.current ? { ...piece, ...point } : piece)),
        shown.marks,
      );
      return;
    }
    if (!draft) return;
    setDraft([draft[0], point]);
  }

  function onPointerUp() {
    dragId.current = null;
    dragRecorded.current = false;
    if (!draft || draft.length < 2 || tool === "move" || tool === "marker") {
      setDraft(null);
      return;
    }
    const [start, end] = draft;
    const mark: BoardMark = {
      id: nextId("mark"),
      kind: tool,
      points:
        tool === "press"
          ? [start, { x: end.x, y: start.y }, end, { x: start.x, y: end.y }]
          : [start, end],
    };
    updateFrame(shown.pieces, [...shown.marks, mark], true);
    setDraft(null);
  }

  function onDrop(event: ReactDragEvent<SVGSVGElement>) {
    event.preventDefault();
    const kind = event.dataTransfer.getData("text/piece");
    if (!PIECE_KINDS.includes(kind as PieceKind)) return;
    const point = clientPoint(svgRef.current, event.clientX, event.clientY);
    if (!point) return;
    const team = event.dataTransfer.getData("text/team") === "opponent" ? "opponent" : "player";
    placeKind(kind as PieceKind, point, team);
  }

  function openSaved(id: string) {
    const drill = drills.find((item) => item.id === id && !item.isClubOfficial);
    if (!drill) return;
    const stored = useClubStore.getState().boards[id] ?? emptyDrillBoard();
    setDrillId(id);
    setTitle(drill.title);
    setMinutes(Math.floor(drill.durationSeconds / 60));
    setSeconds(drill.durationSeconds % 60);
    setSetup(drill.pitchSetup);
    setPoints(drill.coachingPoints.join("\n"));
    setLevel(drill.level);
    setVideoUrl(drill.videoUrl ?? "");
    setVideoName(drill.videoName ?? "");
    setBoard(stored);
    setFrameIndex(0);
    setPlayhead(0);
    setPlaying(stored.frames.length > 1);
    setSelectedId(null);
    setNotice("");
    past.current = [];
    future.current = [];
    syncHistory();
  }

  function save() {
    const name = title.trim();
    if (!name) {
      setNotice("Name the drill before saving.");
      return;
    }
    const durationSeconds = Math.min(30 * 60, Math.max(15, minutes * 60 + seconds));
    const coachingPoints = points
      .split("\n")
      .map((point) => point.trim())
      .filter(Boolean);
    const id = saveEditorDrill(
      drillId,
      {
        title: name,
        durationSeconds,
        pitchSetup: setup.trim(),
        coachingPoints,
        level,
        videoUrl,
        videoName,
      },
      board,
    );
    setDrillId(id);
    setNotice("Saved. The layout and animation stay with this drill.");
  }

  function showHint(text: string) {
    if (!descriptions) return;
    setHint(text);
  }

  function removeSelected() {
    if (!selectedId) return;
    updateFrame(
      shown.pieces.filter((piece) => piece.id !== selectedId),
      shown.marks,
      true,
    );
    setSelectedId(null);
  }

  return (
    <div className="editor-stage min-w-0 max-w-full" data-frame-count={frameCount} data-playing={playing ? "true" : "false"}>
      <div className="editor-workspace min-w-0">
      <div
        className="editor-toolbar"
        data-editor-toolbar
        data-descriptions={descriptions ? "on" : "off"}
        aria-label="Pitch tools"
      >
        <div className="flex flex-col gap-1" role="group" aria-label="History">
          <ToolButton
            label="Undo"
            description="Puts the pitch back one step."
            descriptions={descriptions}
            onShow={showHint}
            disabled={!canUndo}
            onClick={undo}
          >
            <Undo2 className="size-4" aria-hidden />
          </ToolButton>
          <ToolButton
            label="Redo"
            description="Brings back the step you undid."
            descriptions={descriptions}
            onShow={showHint}
            disabled={!canRedo}
            onClick={redo}
          >
            <Redo2 className="size-4" aria-hidden />
          </ToolButton>
        </div>
        <div className="mx-auto h-px w-6 bg-slate-300" role="separator" />
        <div className="flex flex-col gap-1" role="group" aria-label="Pitch view">
          {PITCH_VIEWS.map((view) => {
            const Icon = VIEW_ICON[view];
            return (
              <ToolButton
                key={view}
                label={VIEW_LABEL[view]}
                description={VIEW_HINT[view]}
                active={board.view === view}
                descriptions={descriptions}
                onShow={showHint}
                onClick={() => {
                  if (board.view === view) return;
                  remember();
                  setBoard({ ...board, view });
                }}
              >
                <Icon className="size-4" aria-hidden />
              </ToolButton>
            );
          })}
        </div>
        <div className="mx-auto h-px w-6 bg-slate-300" role="separator" />
        <div className="flex flex-col gap-1" role="group" aria-label="Pieces">
          {PIECE_KINDS.map((kind) => {
            const Icon = PIECE_ICON[kind];
            return (
              <ToolButton
                key={kind}
                label={PIECE_NAME[kind]}
                description={PIECE_HINT[kind]}
                descriptions={descriptions}
                onShow={showHint}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/piece", kind);
                  event.dataTransfer.setData("text/team", "player");
                  event.dataTransfer.effectAllowed = "copy";
                }}
                onClick={() => placeKind(kind)}
              >
                <Icon className="size-4" aria-hidden />
              </ToolButton>
            );
          })}
          <ToolButton
            label="Opponent"
            description="Adds an opponent mannequin."
            descriptions={descriptions}
            onShow={showHint}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData("text/piece", "player");
              event.dataTransfer.setData("text/team", "opponent");
              event.dataTransfer.effectAllowed = "copy";
            }}
            onClick={() => placeKind("player", undefined, "opponent")}
          >
            <UserRound className="size-4" aria-hidden />
          </ToolButton>
        </div>
        <div className="mx-auto h-px w-6 bg-slate-300" role="separator" />
        <div className="flex flex-col gap-1" role="group" aria-label="Draw">
          <ToolButton
            label="Move"
            description="Drags pieces around the pitch."
            active={tool === "move"}
            descriptions={descriptions}
            onShow={showHint}
            onClick={() => setTool("move")}
          >
            <Move className="size-4" aria-hidden />
          </ToolButton>
          {MARK_KINDS.map((kind) => {
            const Icon = MARK_ICON[kind];
            return (
              <ToolButton
                key={kind}
                label={MARK_NAME[kind]}
                description={MARK_HINT[kind]}
                active={tool === kind}
                descriptions={descriptions}
                onShow={showHint}
                onClick={() => setTool(kind)}
              >
                <Icon className="size-4" aria-hidden />
              </ToolButton>
            );
          })}
        </div>
        <div className="mx-auto h-px w-6 bg-slate-300" role="separator" />
        <div className="flex flex-col gap-1" role="group" aria-label="Frames">
          <ToolButton
            label="Record frame"
            description="Stores this layout as the next step."
            descriptions={descriptions}
            onShow={showHint}
            onClick={recordFrame}
          >
            <Circle className="size-4" aria-hidden />
          </ToolButton>
          <ToolButton
            label={playing ? "Pause" : "Play frames"}
            description="Plays the frames you recorded."
            active={playing}
            descriptions={descriptions}
            onShow={showHint}
            onClick={() => {
              if (frameCount < 2) return;
              setPlaying((current) => !current);
            }}
          >
            {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
          </ToolButton>
          {SPEEDS.map((speed) => (
            <ToolButton
              key={speed}
              label={`${speed} times`}
              description={speed === 1 ? "Plays at normal speed." : speed < 1 ? "Plays at half speed." : "Plays at double speed."}
              active={board.speed === speed}
              descriptions={descriptions}
              onShow={showHint}
              onClick={() => {
                if (board.speed === speed) return;
                remember();
                setBoard({ ...board, speed });
              }}
            >
              <span className="text-xs font-bold">{speed === 0.5 ? "½" : `${speed}×`}</span>
            </ToolButton>
          ))}
        </div>
        <div className="mx-auto h-px w-6 bg-slate-300" role="separator" />
        <ToolButton
          label="Remove piece"
          description="Takes the selected piece off this frame."
          descriptions={descriptions}
          onShow={showHint}
          onClick={removeSelected}
        >
          <Trash className="size-4" aria-hidden />
        </ToolButton>
        <ToolButton
          label="Save drill"
          description="Keeps the layout, frames, level, and video."
          active
          descriptions={descriptions}
          onShow={showHint}
          onClick={save}
        >
          <Save className="size-4" aria-hidden />
        </ToolButton>
      </div>
      <div className="editor-pitch min-w-0">
        <svg
          ref={svgRef}
          data-pitch="editor"
          viewBox={`${windowBox.x} ${windowBox.y} ${windowBox.width} ${windowBox.height}`}
          className="editor-pitch-svg h-auto w-full max-w-full touch-none rounded-lg bg-emerald-700"
          role="img"
          aria-label="Drill editor pitch"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
        >
          <defs>
            <marker id="editor-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
              <path d="M0 0 L5 2.5 L0 5 Z" fill="#f8fafc" />
            </marker>
          </defs>
          <PitchLines view={board.view} />
          {shown.marks.map((mark) => (
            <g key={mark.id} data-mark-kind={mark.kind}>
              <MarkShape mark={mark} markerId="editor-arrow" />
            </g>
          ))}
          {draft && draft.length === 2 && tool !== "move" ? (
            <MarkShape
              markerId="editor-arrow"
              mark={{
                id: "draft",
                kind: tool,
                points:
                  tool === "press"
                    ? [draft[0], { x: draft[1].x, y: draft[0].y }, draft[1], { x: draft[0].x, y: draft[1].y }]
                    : draft,
              }}
            />
          ) : null}
          {shown.pieces.map((piece) => (
            <g key={piece.id} data-piece-id={piece.id} data-piece-kind={piece.kind} data-piece-team={piece.team ?? "player"}>
              <PieceShape
                piece={piece}
                colors={colors}
                selected={piece.id === selectedId}
                onPointerDown={(event) => {
                  if (playing || tool !== "move") return;
                  event.stopPropagation();
                  try {
                    svgRef.current?.setPointerCapture(event.pointerId);
                  } catch {
                    /* ignore */
                  }
                  dragId.current = piece.id;
                  setSelectedId(piece.id);
                }}
              />
            </g>
          ))}
        </svg>
      </div>
      <div className="editor-descriptions">
        {descriptions ? (
          <p className="min-w-0 flex-1 text-sm font-medium text-slate-800" data-description-line>
            {hint || "Point at an icon to read it."}
          </p>
        ) : (
          <p className="min-w-0 flex-1 text-sm font-medium text-slate-500">Descriptions are off.</p>
        )}
        <label className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-slate-950">
          Player
          <input
            type="color"
            aria-label="Player colour"
            data-field="player-color"
            value={colors.player}
            onChange={(event) => paintColor("playerColor", event.target.value)}
            className="size-11 cursor-pointer rounded-md border border-slate-300 bg-transparent p-0.5"
          />
        </label>
        <label className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-slate-950">
          Opponent
          <input
            type="color"
            aria-label="Opponent colour"
            data-field="opponent-color"
            value={colors.opponent}
            onChange={(event) => paintColor("opponentColor", event.target.value)}
            className="size-11 cursor-pointer rounded-md border border-slate-300 bg-transparent p-0.5"
          />
        </label>
        <button
          type="button"
          data-field="descriptions"
          aria-pressed={descriptions}
          onClick={() => {
            setDescriptions((current) => !current);
            setHint("");
          }}
          className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-bold ${
            descriptions ? "bg-emerald-600 text-white" : "bg-white text-slate-950 ring-1 ring-slate-300"
          }`}
        >
          <MessageSquareText className="size-4" aria-hidden />
          Descriptions {descriptions ? "on" : "off"}
        </button>
      </div>
      </div>

      <div className="editor-panel mt-3 min-w-0 space-y-3">
        <section className="rounded-xl bg-white p-3 ring-1 ring-slate-300" aria-label="Drill editor">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">Drill editor</h2>
          <label className="mt-2 block text-sm font-semibold text-slate-800">
            Name
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              data-field="name"
              className="mt-1 block h-10 w-full rounded-md border border-slate-300 px-3 text-base"
            />
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="text-sm font-semibold text-slate-800">
              Minutes
              <input
                type="number"
                min={0}
                max={30}
                value={minutes}
                onChange={(event) => setMinutes(Number(event.target.value))}
                data-field="minutes"
                className="mt-1 block h-10 w-full rounded-md border border-slate-300 px-3 text-base"
              />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Seconds
              <input
                type="number"
                min={0}
                max={59}
                value={seconds}
                onChange={(event) => setSeconds(Number(event.target.value))}
                data-field="seconds"
                className="mt-1 block h-10 w-full rounded-md border border-slate-300 px-3 text-base"
              />
            </label>
          </div>
          <label className="mt-2 block text-sm font-semibold text-slate-800">
            Setup notes
            <textarea
              value={setup}
              onChange={(event) => setSetup(event.target.value)}
              data-field="setup"
              rows={2}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-base"
            />
          </label>
          <label className="mt-2 block text-sm font-semibold text-slate-800">
            Coaching points
            <textarea
              value={points}
              onChange={(event) => setPoints(event.target.value)}
              data-field="points"
              rows={2}
              placeholder="One point on each line"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-base"
            />
          </label>
          <label className="mt-2 block text-sm font-semibold text-slate-800">
            Level
            <select
              value={level}
              data-field="level"
              onChange={(event) => {
                if (isDrillLevel(event.target.value)) setLevel(event.target.value);
              }}
              className="mt-1 block h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base"
            >
              {DRILL_LEVELS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <div className="mt-3">
            <DrillVideo
              videoUrl={videoUrl}
              onAttach={(url, name) => {
                setVideoUrl(url);
                setVideoName(name);
                if (drillId) setDrillVideo(drillId, url, name);
              }}
            />
          </div>
          <p className="mt-2 text-xs font-medium text-slate-600">Drag a piece on the pitch, or tap an icon to drop one in the middle.</p>
          <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-slate-600">
            Scrub · frame {Math.min(frameCount, Math.floor(playing ? playhead : safeIndex) + 1)} / {frameCount}
            <input
              type="range"
              aria-label="Scrub frames"
              min={0}
              max={Math.max(0, frameCount - 1)}
              step={playing ? 0.01 : 1}
              value={playing ? playhead : safeIndex}
              onChange={(event) => {
                const value = Number(event.target.value);
                setPlaying(false);
                setPlayhead(value);
                setFrameIndex(Math.round(value));
              }}
              className="mt-2 block h-11 w-full accent-[#9a4a4f]"
            />
          </label>
        </section>
        {notice ? <p className="text-sm font-semibold text-slate-800">{notice}</p> : null}
        {savedDrills.length > 0 ? (
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Saved drills</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {savedDrills.map((drill) => (
                <button
                  key={drill.id}
                  type="button"
                  onClick={() => openSaved(drill.id)}
                  className={`min-h-11 max-w-full rounded-xl px-3 py-2 text-left ${
                    drill.id === drillId ? "bg-emerald-600 text-white" : "bg-white text-slate-950 ring-1 ring-slate-300"
                  }`}
                >
                  <span className="block truncate text-sm font-bold">{drill.title}</span>
                  <span className={`mt-0.5 block text-xs font-medium ${drill.id === drillId ? "text-emerald-50" : "text-slate-600"}`}>
                    {drill.level} · open this layout in the editor
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function clientPoint(svg: SVGSVGElement | null, clientX: number, clientY: number): PitchPoint | null {
  if (!svg) return null;
  const matrix = svg.getScreenCTM();
  if (!matrix) return null;
  const raw = svg.createSVGPoint();
  raw.x = clientX;
  raw.y = clientY;
  return clampPoint(raw.matrixTransform(matrix.inverse()));
}

function ToolButton({
  label,
  description,
  active = false,
  descriptions,
  onShow,
  onClick,
  children,
  draggable,
  onDragStart,
  disabled = false,
}: {
  label: string;
  description: string;
  active?: boolean;
  descriptions: boolean;
  onShow: (text: string) => void;
  onClick: () => void;
  children: ReactNode;
  draggable?: boolean;
  onDragStart?: (event: ReactDragEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={onDragStart}
      disabled={disabled}
      aria-label={label}
      title={descriptions ? description : undefined}
      data-tool={label}
      onPointerEnter={() => onShow(description)}
      onFocus={() => onShow(description)}
      onClick={() => {
        if (disabled) return;
        onShow(description);
        onClick();
      }}
      className={`editor-tool flex size-11 shrink-0 items-center justify-center rounded-lg disabled:opacity-40 ${
        active ? "bg-emerald-600 text-white" : "bg-white text-slate-950 ring-1 ring-slate-300"
      }`}
    >
      {children}
      {descriptions ? <span className="editor-tool-tip">{description}</span> : null}
    </button>
  );
}
