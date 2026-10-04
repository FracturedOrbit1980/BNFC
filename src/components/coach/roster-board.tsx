"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useCoachTeam } from "@/components/coach/team-picker";
import type { ClubPlayer } from "@/lib/club/seed";
import { addDays, formatDay, mondayOf, sessionToday, weekDates } from "@/lib/club/week";
import { useClubStore } from "@/stores/club-store";

export function RosterBoard() {
  const players = useClubStore((state) => state.players);
  const evaluations = useClubStore((state) => state.evaluations);
  const addEvaluation = useClubStore((state) => state.addEvaluation);
  const setHomework = useClubStore((state) => state.setHomework);
  const { team } = useCoachTeam();
  const squad = players
    .filter((player) => player.teamId === team?.id)
    .sort((a, b) => a.squadNumber - b.squadNumber);
  const [selectedId, setSelectedId] = useState(squad[0]?.id ?? "");
  const selected = squad.find((player) => player.id === selectedId) ?? squad[0];
  const [scores, setScores] = useState({ technical: 6, tactical: 6, physical: 6, mental: 6 });
  const [notes, setNotes] = useState("");
  const [homework, setHomeworkText] = useState(selected?.homework ?? "");
  const [saved, setSaved] = useState("");
  const [editName, setEditName] = useState(selected?.name ?? "");
  const [editNumber, setEditNumber] = useState(selected?.squadNumber ?? 1);
  const [editPosition, setEditPosition] = useState(selected?.position ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const updatePlayer = useClubStore((state) => state.updatePlayer);
  const deletePlayer = useClubStore((state) => state.deletePlayer);
  const [weekStart, setWeekStart] = useState(() => mondayOf(sessionToday()));
  const dates = weekDates(weekStart);
  const loadedId = useRef(selected?.id ?? "");
  if ((selected?.id ?? "") !== loadedId.current) {
    loadedId.current = selected?.id ?? "";
    setEditName(selected?.name ?? "");
    setEditNumber(selected?.squadNumber ?? 1);
    setEditPosition(selected?.position ?? "");
    setHomeworkText(selected?.homework ?? "");
    setConfirmDelete(false);
  }

  function selectPlayer(playerId: string) {
    const player = squad.find((item) => item.id === playerId);
    setSelectedId(playerId);
    setHomeworkText(player?.homework ?? "");
    setEditName(player?.name ?? "");
    setEditNumber(player?.squadNumber ?? 1);
    setEditPosition(player?.position ?? "");
    setConfirmDelete(false);
    setSaved("");
  }

  if (!selected) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg bg-white px-4 py-3 font-semibold text-slate-800 ring-1 ring-slate-300">
          {team ? `${team.name} has no players yet.` : "Choose a team on the coach home page before adding players."}
        </p>
        {team ? <GameDay teamId={team.id} teamName={team.name} gameDay={team.gameDay} /> : null}
        {team ? <ExportSquad teamName={team.name} players={[]} /> : null}
        {team ? <AddSquadPlayer teamId={team.id} /> : null}
      </div>
    );
  }

  const latest = evaluations.find((item) => item.playerId === selected.id);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      {team ? <div className="lg:col-span-2"><GameDay teamId={team.id} teamName={team.name} gameDay={team.gameDay} /></div> : null}
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold uppercase tracking-wide text-slate-700">
            Training week {formatDay(weekStart)}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="lg" variant="outline" className="h-11" onClick={() => setWeekStart(addDays(weekStart, -7))}>
              Previous week
            </Button>
            <Button type="button" size="lg" variant="outline" className="h-11" onClick={() => setWeekStart(addDays(weekStart, 7))}>
              Next week
            </Button>
          </div>
        </div>
      <ul className="min-w-0 space-y-3">
        {squad.map((player) => {
          const active = player.id === selected.id;
          return (
            <li key={player.id} className="min-w-0 rounded-xl bg-white ring-1 ring-slate-300">
              <button
                type="button"
                onClick={() => selectPlayer(player.id)}
                className={`flex w-full items-center gap-3 rounded-t-xl px-4 py-3 text-left ${
                  active ? "bg-emerald-600 text-white" : "text-slate-950"
                }`}
              >
                <span className="w-8 text-lg font-black tabular-nums">{player.squadNumber}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{player.name}</span>
                  <span className={`text-sm ${active ? "text-emerald-100" : "text-slate-600"}`}>{player.position}</span>
                </span>
              </button>
              <TrainingWeek playerId={player.id} dates={dates} />
              <WeeklyReport key={`${player.id}:${weekStart}`} playerId={player.id} playerName={player.name} teamId={player.teamId} weekStart={weekStart} />
            </li>
          );
        })}
      </ul>
      </div>
      <div className="space-y-4">
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
        <form
          className="space-y-3 rounded-xl bg-white p-4 ring-1 ring-slate-300"
          onSubmit={(event) => {
            event.preventDefault();
            if (!editName.trim()) return;
            updatePlayer(selected.id, {
              name: editName.trim(),
              squadNumber: Math.min(99, Math.max(1, editNumber || 1)),
              position: editPosition.trim() || selected.position,
            });
            setSaved(`Updated ${editName.trim()}.`);
            setConfirmDelete(false);
          }}
        >
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Edit player</h3>
          <label className="block text-sm font-semibold text-slate-800">
            Name
            <input
              value={editName}
              data-field="edit-name"
              onChange={(event) => setEditName(event.target.value)}
              className="mt-1 block h-11 w-full rounded-md border border-slate-300 px-3 text-base"
              required
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Squad number
            <input
              type="number"
              min={1}
              max={99}
              value={editNumber}
              data-field="edit-number"
              onChange={(event) => setEditNumber(Number(event.target.value))}
              className="mt-1 block h-11 w-full rounded-md border border-slate-300 px-3 text-base"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Position
            <input
              value={editPosition}
              data-field="edit-position"
              onChange={(event) => setEditPosition(event.target.value)}
              className="mt-1 block h-11 w-full rounded-md border border-slate-300 px-3 text-base"
            />
          </label>
          <Button type="submit" size="lg" className="h-11 w-full">
            Save changes
          </Button>
        </form>
        {confirmDelete ? (
          <div className="mt-3 rounded-lg bg-slate-100 p-3">
            <p className="text-sm font-semibold text-slate-900">Remove {selected.name} from {team?.name ?? "this team"}?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                type="button"
                size="lg"
                className="h-11 bg-slate-950 text-white hover:bg-slate-800"
                onClick={() => {
                  const remaining = squad.filter((player) => player.id !== selected.id);
                  deletePlayer(selected.id);
                  setSelectedId(remaining[0]?.id ?? "");
                  setHomeworkText(remaining[0]?.homework ?? "");
                  setEditName(remaining[0]?.name ?? "");
                  setEditNumber(remaining[0]?.squadNumber ?? 1);
                  setEditPosition(remaining[0]?.position ?? "");
                  setConfirmDelete(false);
                  setSaved("");
                }}
              >
                Confirm delete
              </Button>
              <Button type="button" size="lg" variant="outline" className="h-11" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button type="button" size="lg" variant="outline" className="mt-3 h-11 w-full" onClick={() => setConfirmDelete(true)}>
            Delete player
          </Button>
        )}
      </div>
      <div className="lg:col-span-2 space-y-4">
        {team ? <ExportSquad teamName={team.name} players={squad} /> : null}
        {team ? <AddSquadPlayer teamId={team.id} /> : null}
      </div>
    </div>
  );
}

function GameDay({ teamId, teamName, gameDay }: { teamId: string; teamName: string; gameDay?: string }) {
  const setTeamGameDay = useClubStore((state) => state.setTeamGameDay);
  return (
    <form
      className="rounded-xl bg-white p-4 ring-1 ring-slate-300"
      onSubmit={(event) => event.preventDefault()}
    >
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Game day</h2>
      <label className="mt-2 block text-sm font-semibold text-slate-800">
        Match day for {teamName}
        <input
          type="date"
          data-field="game-day"
          value={gameDay ?? ""}
          onChange={(event) => setTeamGameDay(teamId, event.target.value)}
          className="mt-1 block h-11 w-full max-w-xs rounded-md border border-slate-300 px-3 text-base"
        />
      </label>
      <p className="mt-2 text-sm font-semibold text-slate-800">
        {gameDay ? `Match day ${formatDay(gameDay)}.` : "No match day set yet."}
      </p>
    </form>
  );
}

function TrainingWeek({ playerId, dates }: { playerId: string; dates: string[] }) {
  const trainingMarks = useClubStore((state) => state.trainingMarks);
  const setTrainingAttendance = useClubStore((state) => state.setTrainingAttendance);
  return (
    <div className="space-y-2 border-t border-slate-200 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Training</p>
      <ul className="space-y-2">
        {dates.map((date) => {
          const mark = trainingMarks.find((item) => item.playerId === playerId && item.date === date);
          return (
            <li key={date} className="flex flex-wrap items-center justify-between gap-2" data-training-date={date} data-player-id={playerId}>
              <span className="text-sm font-semibold text-slate-900">{formatDay(date)}</span>
              <span className="flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-pressed={mark?.present === true}
                  onClick={() => setTrainingAttendance(playerId, date, true)}
                  className={`min-h-11 rounded-md px-3 text-sm font-bold ${
                    mark?.present === true ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-950"
                  }`}
                >
                  Present
                </button>
                <button
                  type="button"
                  aria-pressed={mark?.present === false}
                  onClick={() => setTrainingAttendance(playerId, date, false)}
                  className={`min-h-11 rounded-md px-3 text-sm font-bold ${
                    mark?.present === false ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-950"
                  }`}
                >
                  Not present
                </button>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function WeeklyReport({
  playerId,
  playerName,
  teamId,
  weekStart,
}: {
  playerId: string;
  playerName: string;
  teamId: string;
  weekStart: string;
}) {
  const trainingMarks = useClubStore((state) => state.trainingMarks);
  const weeklyReports = useClubStore((state) => state.weeklyReports);
  const saveWeeklyReport = useClubStore((state) => state.saveWeeklyReport);
  const saved = weeklyReports.find((report) => report.playerId === playerId && report.weekStart === weekStart);
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState(saved?.gameFeedback ?? "");
  const [notice, setNotice] = useState("");
  const dates = weekDates(weekStart);

  return (
    <div className="border-t border-slate-200 px-4 py-3">
      <Button
        type="button"
        size="lg"
        variant="outline"
        className="h-11"
        onClick={() => {
          setFeedback(saved?.gameFeedback ?? "");
          setOpen(true);
        }}
      >
        Weekly report
      </Button>
      {open ? (
        <div className="mt-3 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
            Week of {formatDay(weekStart)}
          </h3>
          <ul className="space-y-1 text-sm font-semibold text-slate-800">
            {dates.map((date) => {
              const mark = trainingMarks.find((item) => item.playerId === playerId && item.date === date);
              const status = mark ? (mark.present ? "Present" : "Not present") : "Not marked";
              return (
                <li key={date}>
                  {formatDay(date)}: {status}
                </li>
              );
            })}
          </ul>
          <label className="block text-sm font-semibold text-slate-800">
            Game feedback for {playerName}
            <textarea
              value={feedback}
              data-field="game-feedback"
              onChange={(event) => setFeedback(event.target.value)}
              className="mt-1 h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
            />
          </label>
          <Button
            type="button"
            size="lg"
            className="h-11"
            onClick={() => {
              if (!feedback.trim()) {
                setNotice("Write the game feedback before saving.");
                return;
              }
              saveWeeklyReport(playerId, teamId, weekStart, feedback);
              setNotice("Weekly report saved.");
            }}
          >
            Save weekly report
          </Button>
          {notice ? <p className="text-sm font-semibold text-slate-800">{notice}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function ExportSquad({ teamName, players }: { teamName: string; players: ClubPlayer[] }) {
  function download() {
    const rows = [
      ["name", "squad number", "position"],
      ...players.map((player) => [player.name, String(player.squadNumber), player.position]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    const file = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${teamName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "team"}-players.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-slate-300">
      <p className="text-sm font-semibold text-slate-800">
        {players.length === 0 ? `${teamName} has nobody to export yet.` : `${players.length} players in ${teamName}.`}
      </p>
      <Button type="button" size="lg" variant="outline" className="h-11" onClick={download}>
        Export players
      </Button>
    </div>
  );
}

function csvCell(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

function AddSquadPlayer({ teamId }: { teamId: string }) {
  const addPlayer = useClubStore((state) => state.addPlayer);
  const [name, setName] = useState("");
  const [number, setNumber] = useState(1);
  const [position, setPosition] = useState("CM");

  return (
    <form
      className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-300"
      onSubmit={(event) => {
        event.preventDefault();
        if (!name.trim()) return;
        addPlayer({
          name: name.trim(),
          squadNumber: number,
          position,
          teamId,
        });
        setName("");
      }}
    >
      <label className="text-sm font-semibold text-slate-800">
        Add player
        <input value={name} data-field="add-name" onChange={(event) => setName(event.target.value)} className="mt-1 block h-11 rounded-md border border-slate-300 px-3 text-base" required />
      </label>
      <label className="text-sm font-semibold text-slate-800">
        Number
        <input type="number" min={1} max={99} data-field="add-number" value={number} onChange={(event) => setNumber(Number(event.target.value))} className="mt-1 block h-11 w-24 rounded-md border border-slate-300 px-3 text-base" />
      </label>
      <label className="text-sm font-semibold text-slate-800">
        Position
        <input value={position} data-field="add-position" onChange={(event) => setPosition(event.target.value)} className="mt-1 block h-11 w-24 rounded-md border border-slate-300 px-3 text-base" />
      </label>
      <Button type="submit" size="lg" className="h-11">
        Add to squad
      </Button>
    </form>
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
