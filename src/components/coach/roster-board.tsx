"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { COACH_TEAM_ID } from "@/lib/club/seed";
import { useClubStore } from "@/stores/club-store";

export function RosterBoard() {
  const players = useClubStore((state) => state.players);
  const evaluations = useClubStore((state) => state.evaluations);
  const addEvaluation = useClubStore((state) => state.addEvaluation);
  const setHomework = useClubStore((state) => state.setHomework);
  const squad = players
    .filter((player) => player.teamId === COACH_TEAM_ID)
    .sort((a, b) => a.squadNumber - b.squadNumber);
  const [selectedId, setSelectedId] = useState(squad[0]?.id ?? "");
  const selected = squad.find((player) => player.id === selectedId) ?? squad[0];
  const [scores, setScores] = useState({ technical: 6, tactical: 6, physical: 6, mental: 6 });
  const [notes, setNotes] = useState("");
  const [homework, setHomeworkText] = useState(selected?.homework ?? "");
  const [saved, setSaved] = useState("");

  if (!selected) return null;

  const latest = evaluations.find((item) => item.playerId === selected.id);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <ul className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-300">
        {squad.map((player) => {
          const active = player.id === selected.id;
          return (
            <li key={player.id}>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(player.id);
                  setHomeworkText(player.homework);
                  setSaved("");
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left ${
                  active ? "bg-emerald-600 text-white" : "border-b border-slate-200 text-slate-950"
                }`}
              >
                <span className="w-8 text-lg font-black tabular-nums">{player.squadNumber}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{player.name}</span>
                  <span className={`text-sm ${active ? "text-emerald-100" : "text-slate-600"}`}>{player.position}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <form
        className="rounded-xl bg-white p-4 ring-1 ring-slate-300"
        onSubmit={(event) => {
          event.preventDefault();
          addEvaluation({ playerId: selected.id, ...scores, notes });
          setHomework(selected.id, homework);
          setSaved(`Saved scores for ${selected.name}.`);
        }}
      >
        <h2 className="text-lg font-bold text-slate-950">{selected.name}</h2>
        <p className="text-sm font-medium text-slate-600">
          {latest ? `Last rating ${latest.date}` : "No rating yet"}
        </p>
        <div className="mt-4 space-y-3">
          <ScoreRow label="Technical" value={scores.technical} onChange={(value) => setScores({ ...scores, technical: value })} />
          <ScoreRow label="Tactical" value={scores.tactical} onChange={(value) => setScores({ ...scores, tactical: value })} />
          <ScoreRow label="Physical" value={scores.physical} onChange={(value) => setScores({ ...scores, physical: value })} />
          <ScoreRow label="Mental" value={scores.mental} onChange={(value) => setScores({ ...scores, mental: value })} />
        </div>
        <label className="mt-4 block text-sm font-semibold text-slate-800">
          Rating note
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 h-16 w-full rounded-md border border-slate-300 px-3 py-2 text-base" />
        </label>
        <label className="mt-3 block text-sm font-semibold text-slate-800">
          Homework for the player
          <textarea
            value={homework}
            onChange={(event) => setHomeworkText(event.target.value)}
            className="mt-1 h-16 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
          />
        </label>
        <Button type="submit" size="lg" className="mt-4 h-11 w-full">
          Save rating
        </Button>
        {saved ? <p className="mt-2 text-sm font-semibold text-emerald-800">{saved}</p> : null}
      </form>
    </div>
  );
}

function ScoreRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-600">{label}</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {Array.from({ length: 10 }, (_, index) => index + 1).map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={`h-9 w-9 rounded-md text-sm font-bold ${
              score === value ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-950"
            }`}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  );
}
