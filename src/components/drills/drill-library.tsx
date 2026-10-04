"use client";

import Link from "next/link";
import { useState } from "react";

import { DrillBoard } from "@/components/drills/drill-board";
import { DrillMotionPreview } from "@/components/drills/drill-motion-preview";
import { DrillSetupDiagram } from "@/components/drills/drill-setup-diagram";
import { DrillStopwatch } from "@/components/drills/drill-stopwatch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DrillVideo } from "@/components/drills/drill-video";
import { emptyDrillBoard, type DrillBoard as DrillBoardState } from "@/lib/club/board";
import { DRILL_LEVELS, OBJECTIVE_CATEGORIES, type DrillLevel, type ObjectiveCategory } from "@/lib/club/catalog";
import type { ClubDrill } from "@/lib/club/seed";
import { useClubStore } from "@/stores/club-store";

export function DrillLibrary({
  showStopwatch = true,
  manageMode = false,
}: {
  showStopwatch?: boolean;
  manageMode?: boolean;
}) {
  const drills = useClubStore((state) => state.drills);
  const boards = useClubStore((state) => state.boards);
  const setDrillDuration = useClubStore((state) => state.setDrillDuration);
  const setDrillOfficial = useClubStore((state) => state.setDrillOfficial);
  const setDrillVideo = useClubStore((state) => state.setDrillVideo);
  const [category, setCategory] = useState<ObjectiveCategory | "All">("All");
  const [level, setLevel] = useState<DrillLevel | "All">("All");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(drills[0]?.id ?? "");
  const query = search.trim().toLowerCase();

  const visible = drills.filter((drill) => {
    const levelOk = level === "All" || drill.level === level;
    const categoryOk = category === "All" || drill.objectiveCategory === category;
    const text = `${drill.title} ${drill.level} ${drill.pitchSetup} ${drill.objectiveCategory}`.toLowerCase();
    return levelOk && categoryOk && (!query || text.includes(query));
  });
  const selected = visible.find((drill) => drill.id === selectedId) ?? visible[0];

  return (
    <div className="min-w-0 max-w-full">
      <div className="mb-4 space-y-3">
        <label className="block text-sm font-semibold text-slate-800">
          Search drills
          <input
            value={search}
            data-field="drill-search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name or level"
            className="mt-1 block h-11 w-full max-w-md rounded-md border border-slate-300 px-3 text-base"
          />
        </label>
        <div className="flex flex-wrap gap-2" aria-label="Level">
          <FilterChip active={level === "All"} onClick={() => setLevel("All")}>
            All levels
          </FilterChip>
          {DRILL_LEVELS.map((item) => (
            <FilterChip key={item} active={level === item} onClick={() => setLevel(item)}>
              {item}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={category === "All"} onClick={() => setCategory("All")}>
            All
          </FilterChip>
          {OBJECTIVE_CATEGORIES.map((item) => (
            <FilterChip key={item} active={category === item} onClick={() => setCategory(item)}>
              {item}
            </FilterChip>
          ))}
        </div>
        <p className="text-sm font-semibold text-slate-700">{visible.length} drills in the club library</p>
      </div>
    <div className="grid min-w-0 max-w-full gap-6 overflow-x-hidden lg:grid-cols-[minmax(0,1fr)_26rem]">
      <div className="order-2 min-w-0 lg:order-1">
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((drill) => {
            const active = selected?.id === drill.id;
            return (
              <div
                key={drill.id}
                data-drill-level={drill.level}
                className={`rounded-xl text-left ring-1 transition ${
                  active
                    ? "bg-emerald-50 ring-emerald-600"
                    : "bg-white ring-slate-300 hover:ring-slate-500"
                }`}
              >
                <button type="button" onClick={() => setSelectedId(drill.id)} className="w-full text-left">
                  <Card className="border-0 bg-transparent shadow-none ring-0">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle>{drill.title}</CardTitle>
                        <Badge variant={drill.isClubOfficial ? "default" : "outline"}>
                          {drill.isClubOfficial ? "Official" : "Coach"}
                        </Badge>
                      </div>
                      <CardDescription className="text-slate-700">
                        {drill.level} · {drill.objectiveCategory} · {drill.targetAgeGroup}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </button>
                <div className="flex items-center gap-3 px-4 pb-4 text-sm font-medium text-slate-800">
                  <DrillImage
                    drill={drill}
                    board={boards[drill.id]}
                    manageMode={manageMode}
                    size="sm"
                  />
                  <button type="button" onClick={() => setSelectedId(drill.id)} className="min-w-0 text-left">
                    {formatBlock(drill.durationSeconds)} · {drill.pitchSetup}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {selected ? (
        <div className="order-1 min-w-0 space-y-4 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle>{selected.title}</CardTitle>
              <CardDescription className="text-slate-700">{selected.instructions}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-start gap-3">
              <DrillImage
                drill={selected}
                board={boards[selected.id]}
                manageMode={manageMode}
                size="md"
              />
              <div>
                <p className="text-sm font-semibold text-slate-950">{selected.pitchSetup}</p>
                {manageMode ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 h-10"
                    onClick={() => setDrillOfficial(selected.id, !selected.isClubOfficial)}
                  >
                    {selected.isClubOfficial ? "Remove official flag" : "Mark as official"}
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
          <DrillVideo
            videoUrl={selected.videoUrl ?? ""}
            onAttach={(url, name) => setDrillVideo(selected.id, url, name)}
          />
          {manageMode ? null : (
            <DrillBoard
              drillId={selected.id}
              setup={selected.pitchSetup}
              durationSeconds={selected.durationSeconds}
            />
          )}
          {showStopwatch ? (
            <DrillStopwatch
              drillTitle={selected.title}
              targetSeconds={selected.durationSeconds}
              suggestedSeconds={selected.defaultDurationSeconds}
              onTargetSecondsChange={(seconds) => setDrillDuration(selected.id, seconds)}
            />
          ) : null}
          <Card>
            <CardHeader>
              <CardTitle>Coaching points</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-800">
                {selected.coachingPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      ) : (
        <p className="rounded-lg bg-white px-4 py-3 font-semibold text-slate-800 ring-1 ring-slate-300">
          No drills at this level.
        </p>
      )}
    </div>
    </div>
  );
}

function canOpenSavedDrill(drill: ClubDrill, board: DrillBoardState | undefined) {
  if (!drill.isClubOfficial) return true;
  if (!board) return false;
  return board.frames.length > 1 || board.frames.some((frame) => frame.pieces.length > 0 || frame.marks.length > 0);
}

function DrillImage({
  drill,
  board,
  manageMode,
  size,
}: {
  drill: ClubDrill;
  board: DrillBoardState | undefined;
  manageMode: boolean;
  size: "sm" | "md";
}) {
  const preview = <DrillMotionPreview board={board ?? emptyDrillBoard()} size={size} />;
  if (manageMode || !canOpenSavedDrill(drill, board)) {
    return <DrillSetupDiagram diagram={drill.diagram} pitchSetup={drill.pitchSetup} size={size} />;
  }
  return (
    <Link
      href={`/coach/editor/?drill=${encodeURIComponent(drill.id)}`}
      aria-label={`Open ${drill.title} in the editor`}
      data-open-drill={drill.id}
      className="inline-flex shrink-0 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
    >
      {preview}
    </Link>
  );
}

function formatBlock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (seconds === 0) return `${minutes} min`;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <Button
      type="button"
      size="lg"
      variant={active ? "default" : "outline"}
      onClick={onClick}
      className="h-11 px-4 text-base"
    >
      {children}
    </Button>
  );
}
