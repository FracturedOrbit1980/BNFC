"use client";

import { useEffect, useRef, useState, type DragEvent as ReactDragEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

import { eventPoint, frameBetween, MarkShape, PieceShape, PitchLines } from "@/components/drills/drill-board";
import {
  MARK_KINDS,
  PIECE_KINDS,
  PITCH_VIEWS,
  PITCH_WINDOW,
  clampPoint,
  emptyDrillBoard,
  type BoardFrame,
  type BoardMark,
  type BoardPiece,
  type DrillBoard,
  type MarkKind,
  type PieceKind,
  type PitchPoint,
  type PitchView,
} from "@/lib/club/board";
import { useClubStore } from "@/stores/club-store";

const SPEEDS = [0.5, 1, 2];

const VIEW_LABEL: Record<PitchView, string> = {
  full: "Full",
  half: "Half",
  box: "Penalty box",
  thirds: "Thirds",
  channel: "Channel",
};

const PIECE_NAME: Record<PieceKind, string> = {
  player: "Outfield",
  keeper: "Goalkeeper",
  cone: "Cone",
  mannequin: "Mannequin",
  goal: "Goal",
  pole: "Pole",
};

const MARK_NAME: Record<MarkKind, string> = {
  pass: "Pass",
  run: "Run",
  dribble: "Dribble",
  press: "Pressing zone",
  marker: "Marker",
};

export function DrillEditor() {
  const drills = useClubStore((state) => state.drills);
  const saveEditorDrill = useClubStore((state) => state.saveEditorDrill);
  const savedDrills = drills.filter((drill) => !drill.isClubOfficial);
  const [drillId, setDrillId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState(6);
  const [seconds, setSeconds] = useState(0);
  const [setup, setSetup] = useState("");
  const [points, setPoints] = useState("");
  const [notice, setNotice] = useState("");
  const [board, setBoard] = useState<DrillBoard>(() => emptyDrillBoard());
  const [frameIndex, setFrameIndex] = useState(0);
  const [tool, setTool] = useState<MarkKind | "move">("move");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PitchPoint[] | null>(null);
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragId = useRef<string | null>(null);
  const idRef = useRef(1);

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

  function updateFrame(pieces: BoardPiece[], marks: BoardMark[]) {
    setBoard((current) => ({
      ...current,
      frames: current.frames.map((item, index) => (index === safeIndex ? { ...item, pieces, marks } : item)),
    }));
    setPlaying(false);
  }

  function placeKind(kind: PieceKind, point?: PitchPoint) {
    const count = shown.pieces.filter((piece) => piece.kind === kind).length + 1;
    const piece: BoardPiece = {
      id: nextId("piece"),
      kind,
      x: point?.x ?? windowBox.x + windowBox.width / 2,
      y: point?.y ?? windowBox.y + windowBox.height / 2,
      label: kind === "player" || kind === "keeper" ? String(count) : "",
    };
    const clamped = clampPoint(piece);
    updateFrame([...shown.pieces, { ...piece, ...clamped }], shown.marks);
    setSelectedId(piece.id);
    setTool("move");
  }

  function recordFrame() {
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
      updateFrame(shown.pieces, [...shown.marks, { id: nextId("mark"), kind: "marker", points: [point] }]);
      return;
    }
    setDraft([point]);
  }

  function onPointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    const point = eventPoint(svgRef.current, event);
    if (!point) return;
    if (dragId.current) {
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
    updateFrame(shown.pieces, [...shown.marks, mark]);
    setDraft(null);
  }

  function onDrop(event: ReactDragEvent<SVGSVGElement>) {
    event.preventDefault();
    const kind = event.dataTransfer.getData("text/piece");
    if (!PIECE_KINDS.includes(kind as PieceKind)) return;
    const point = clientPoint(svgRef.current, event.clientX, event.clientY);
    if (!point) return;
    placeKind(kind as PieceKind, point);
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
    setBoard(stored);
    setFrameIndex(0);
    setPlayhead(0);
    setPlaying(false);
    setSelectedId(null);
    setNotice("");
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
      { title: name, durationSeconds, pitchSetup: setup.trim(), coachingPoints },
      board,
    );
    setDrillId(id);
    setNotice("Saved. The layout and animation stay with this drill.");
  }

  return (
    <div className="editor-stage min-w-0 max-w-full" data-frame-count={frameCount} data-playing={playing ? "true" : "false"}>
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
            <g key={piece.id} data-piece-id={piece.id} data-piece-kind={piece.kind}>
              <PieceShape
                piece={piece}
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

      <div className="editor-panel mt-3 min-w-0 space-y-3 [@media(orientation:landscape)_and_(max-height:520px)]:mt-0">
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
          <ControlRow label="Pitch view">
            {PITCH_VIEWS.map((view) => (
              <Chip key={view} active={board.view === view} onClick={() => setBoard({ ...board, view })}>
                {VIEW_LABEL[view]}
              </Chip>
            ))}
          </ControlRow>
          <ControlRow label="Pieces">
            {PIECE_KINDS.map((kind) => (
              <Chip
                key={kind}
                active={false}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/piece", kind);
                  event.dataTransfer.effectAllowed = "copy";
                }}
                onClick={() => placeKind(kind)}
              >
                {PIECE_NAME[kind]}
              </Chip>
            ))}
            <Chip
              active={false}
              onClick={() => {
                if (!selectedId) return;
                updateFrame(
                  shown.pieces.filter((piece) => piece.id !== selectedId),
                  shown.marks,
                );
                setSelectedId(null);
              }}
            >
              Remove
            </Chip>
          </ControlRow>
          <p className="mt-2 text-xs font-medium text-slate-600">Drag a piece on the pitch, or drop a new one from the list.</p>
        </section>

        <section className="rounded-xl bg-white p-3 ring-1 ring-slate-300" aria-label="Animator toolkit">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">Animator toolkit</h2>
          <ControlRow label="Draw">
            <Chip active={tool === "move"} onClick={() => setTool("move")}>
              Move
            </Chip>
            {MARK_KINDS.map((kind) => (
              <Chip key={kind} active={tool === kind} onClick={() => setTool(kind)}>
                {MARK_NAME[kind]}
              </Chip>
            ))}
          </ControlRow>
          <ControlRow label="Frames">
            <Chip active={false} onClick={recordFrame}>
              Record frame
            </Chip>
            <Chip
              active={playing}
              onClick={() => {
                if (frameCount < 2) return;
                setPlaying((current) => !current);
              }}
            >
              {playing ? "Pause" : "Play"}
            </Chip>
            {SPEEDS.map((speed) => (
              <Chip key={speed} active={board.speed === speed} onClick={() => setBoard({ ...board, speed })}>
                {speed}x
              </Chip>
            ))}
          </ControlRow>
          <label className="mt-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
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
              className="mt-1 block w-full"
            />
          </label>
        </section>

        <button
          type="button"
          onClick={save}
          className="h-11 w-full rounded-md bg-emerald-600 text-base font-bold text-white"
        >
          Save drill
        </button>
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
                  className={`h-8 max-w-full truncate rounded-md px-2 text-xs font-bold ${
                    drill.id === drillId ? "bg-emerald-600 text-white" : "bg-white text-slate-950 ring-1 ring-slate-300"
                  }`}
                >
                  {drill.title}
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

function ControlRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-2 min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-600">{label}</p>
      <div className="mt-1 flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  draggable,
  onDragStart,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  draggable?: boolean;
  onDragStart?: (event: ReactDragEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      className={`h-8 rounded-md px-2 text-xs font-bold ${
        active ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-950"
      }`}
    >
      {children}
    </button>
  );
}
