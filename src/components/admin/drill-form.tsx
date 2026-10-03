"use client";

import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { OBJECTIVE_CATEGORIES, SETUP_DIAGRAMS, type ObjectiveCategory, type SetupDiagram } from "@/lib/club/catalog";
import { isObjectiveCategory, useClubStore } from "@/stores/club-store";

export function DrillForm() {
  const ageGroups = useClubStore((state) => state.ageGroups);
  const addDrill = useClubStore((state) => state.addDrill);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ObjectiveCategory>("Technical");
  const [age, setAge] = useState(ageGroups[1]?.name ?? "Under 13");
  const [minutes, setMinutes] = useState(5);
  const [diagram, setDiagram] = useState<SetupDiagram>("square");
  const [pitchSetup, setPitchSetup] = useState("");
  const [instructions, setInstructions] = useState("");
  const [points, setPoints] = useState("");
  const [official, setOfficial] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="mb-6 grid gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-300"
      onSubmit={(event) => {
        event.preventDefault();
        if (!title.trim() || !pitchSetup.trim()) return;
        addDrill({
          title: title.trim(),
          objectiveCategory: category,
          targetAgeGroup: age,
          durationSeconds: Math.min(30, Math.max(1, minutes)) * 60,
          diagram,
          pitchSetup: pitchSetup.trim(),
          instructions: instructions.trim() || "Coach to add the detail on the field.",
          coachingPoints: points
            .split(",")
            .map((point) => point.trim())
            .filter(Boolean),
          isClubOfficial: official,
        });
        setTitle("");
        setDiagram("square");
        setPitchSetup("");
        setInstructions("");
        setPoints("");
        setSaved(true);
      }}
    >
      <h2 className="text-lg font-bold text-slate-950">Add a club drill</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title">
          <input value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} required />
        </Field>
        <Field label="Category">
          <select
            value={category}
            onChange={(event) => {
              if (isObjectiveCategory(event.target.value)) setCategory(event.target.value);
            }}
            className={inputClass}
          >
            {OBJECTIVE_CATEGORIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Age group">
          <select value={age} onChange={(event) => setAge(event.target.value)} className={inputClass}>
            {ageGroups.map((group) => (
              <option key={group.id}>{group.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Setup diagram">
          <select
            value={diagram}
            onChange={(event) => setDiagram(event.target.value as SetupDiagram)}
            className={inputClass}
          >
            {SETUP_DIAGRAMS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Minutes">
          <input
            type="number"
            min={1}
            max={30}
            value={minutes}
            onChange={(event) => setMinutes(Number(event.target.value))}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Pitch setup">
        <input value={pitchSetup} onChange={(event) => setPitchSetup(event.target.value)} className={inputClass} required />
      </Field>
      <Field label="Instructions">
        <textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} className={`${inputClass} h-20 py-2`} />
      </Field>
      <Field label="Coaching points, separated by commas">
        <input value={points} onChange={(event) => setPoints(event.target.value)} className={inputClass} />
      </Field>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <input type="checkbox" checked={official} onChange={(event) => setOfficial(event.target.checked)} />
        Official club drill
      </label>
      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" className="h-11">
          Save drill
        </Button>
        {saved ? <p className="text-sm font-semibold text-emerald-800">Saved in this browser.</p> : null}
      </div>
    </form>
  );
}

const inputClass = "mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-base text-slate-950";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-slate-800">
      {label}
      {children}
    </label>
  );
}
