"use client";

import { useEffect, useId, useState } from "react";

import { frameBetween, MarkShape, PieceShape, PitchLines } from "@/components/drills/drill-board";
import { boardColors, PITCH_WINDOW, type DrillBoard } from "@/lib/club/board";

export function DrillMotionPreview({
  board,
  size = "sm",
}: {
  board: DrillBoard;
  size?: "sm" | "md";
}) {
  const markerId = `preview-${useId().replace(/:/g, "")}`;
  const frames = board.frames.length > 0 ? board.frames : [{ id: "empty", pieces: [], marks: [] }];
  const moving = frames.length > 1;
  const [playhead, setPlayhead] = useState(0);

  useEffect(() => {
    if (!moving) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;
      setPlayhead((current) => {
        const next = current + (delta * board.speed) / 1.4;
        return next >= frames.length ? next % frames.length : next;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [board.speed, frames.length, moving]);

  const shown = moving ? frameBetween(frames, playhead) : frames[Math.min(playhead, frames.length - 1)] ?? frames[0];
  const windowBox = PITCH_WINDOW[board.view];
  const box = size === "sm" ? "h-16 w-24" : "h-28 w-44";

  return (
    <svg
      viewBox={`${windowBox.x} ${windowBox.y} ${windowBox.width} ${windowBox.height}`}
      data-preview="drill"
      data-playing={moving ? "true" : "false"}
      data-frame-count={frames.length}
      role="img"
      aria-hidden="true"
      className={`pointer-events-none shrink-0 rounded-lg bg-emerald-700 ${box}`}
    >
      <defs>
        <marker id={markerId} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <path d="M0 0 L5 2.5 L0 5 Z" fill="#f8fafc" />
        </marker>
      </defs>
      <PitchLines view={board.view} />
      {shown.marks.map((mark) => (
        <g key={mark.id} data-mark-kind={mark.kind}>
          <MarkShape mark={mark} markerId={markerId} />
        </g>
      ))}
      {shown.pieces.map((piece) => (
        <g key={piece.id} data-piece-id={piece.id} transform={`translate(${piece.x} ${piece.y})`}>
          <PieceShape
            piece={{ ...piece, x: 0, y: 0 }}
            colors={boardColors(board)}
            selected={false}
            onPointerDown={() => undefined}
          />
        </g>
      ))}
    </svg>
  );
}
