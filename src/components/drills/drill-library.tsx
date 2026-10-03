"use client";

import { useState } from "react";

import { DrillBoard } from "@/components/drills/drill-board";
import { DrillSetupDiagram } from "@/components/drills/drill-setup-diagram";
import { DrillStopwatch } from "@/components/drills/drill-stopwatch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OBJECTIVE_CATEGORIES, type ObjectiveCategory } from "@/lib/club/catalog";
import { useClubStore } from "@/stores/club-store";

export function DrillLibrary({
  showStopwatch = true,
  manageMode = false,
}: {
  showStopwatch?: boolean;
  manageMode?: boolean;
}) {
  const drills = useClubStore((state) => state.drills);
  const setDrillDuration = useClubStore((state) => state.setDrillDuration);
  const setDrillOfficial = useClubStore((state) => state.setDrillOfficial);
  const [category, setCategory] = useState<ObjectiveCategory | "All">("All");
  const [selectedId, setSelectedId] = useState(drills[0]?.id ?? "");

  const visible = drills.filter(
    (drill) => category === "All" || drill.objectiveCategory === category,
  );
  const selected = visible.find((drill) => drill.id === selectedId) ?? visible[0];

  return (
    <div className="grid min-w-0 max-w-full gap-6 overflow-x-hidden lg:grid-cols-[minmax(0,1fr)_26rem]">
      <div className="order-2 min-w-0 lg:order-1">
        <div className="mb-4 flex flex-wrap gap-2">
          <FilterChip active={category === "All"} onClick={() => setCategory("All")}>
            All
          </FilterChip>
          {OBJECTIVE_CATEGORIES.map((item) => (
            <FilterChip key={item} active={category === item} onClick={() => setCategory(item)}>
              {item}
            </FilterChip>
          ))}
        </div>
        <p className="mb-4 text-sm font-semibold text-slate-700">{visible.length} drills in the club library</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((drill) => {
            const active = selected?.id === drill.id;
            return (
              <button
                key={drill.id}
                type="button"
                onClick={() => setSelectedId(drill.id)}
                className={`rounded-xl text-left ring-1 transition ${
                  active
                    ? "bg-emerald-50 ring-emerald-600"
                    : "bg-white ring-slate-300 hover:ring-slate-500"
                }`}
              >
                <Card className="border-0 bg-transparent shadow-none ring-0">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle>{drill.title}</CardTitle>
                      <Badge variant={drill.isClubOfficial ? "default" : "outline"}>
                        {drill.isClubOfficial ? "Official" : "Coach"}
                      </Badge>
                    </div>
                    <CardDescription className="text-slate-700">
                      {drill.objectiveCategory} · {drill.targetAgeGroup}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center gap-3 text-sm font-medium text-slate-800">
                    <DrillSetupDiagram diagram={drill.diagram} pitchSetup={drill.pitchSetup} size="sm" />
                    <span>
                      {formatBlock(drill.durationSeconds)} · {drill.pitchSetup}
                    </span>
                  </CardContent>
                </Card>
              </button>
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
              <DrillSetupDiagram diagram={selected.diagram} pitchSetup={selected.pitchSetup} />
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
      ) : null}
    </div>
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
