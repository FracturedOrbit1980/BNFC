import { ageNumber } from "@/lib/club/age";

export const SQUAD_TEAM_ID = "tm-u12-2015";

export interface RosterRow {
  name: string;
  squadNumber: number;
  dateOfBirth?: string;
}

/** Born in 2015, so they are the U12 squad for the 2026 season. */
export const U12_SQUAD: RosterRow[] = [
  { name: "HUDSON ANTHONY MINNIE", dateOfBirth: "2015-05-22", squadNumber: 4 },
  { name: "LUNGELO MNQOBI MLUNGWANE", dateOfBirth: "2015-06-02", squadNumber: 12 },
  { name: "KAYDEN METZER", dateOfBirth: "2015-03-08", squadNumber: 41 },
  { name: "FABIO DE ABREU", dateOfBirth: "2015-05-28", squadNumber: 17 },
  { name: "JOSHUA JORDAN HELENA", dateOfBirth: "2015-10-08", squadNumber: 8 },
  { name: "DIEGO FERDINAND MASSYN", dateOfBirth: "2015-07-02", squadNumber: 9 },
  { name: "MPHO QUINTON MALATJI", dateOfBirth: "2015-04-28", squadNumber: 11 },
  { name: "RILEY MACKINLAY", dateOfBirth: "2015-06-16", squadNumber: 33 },
  { name: "CARTER SEVIRON DORMEHL", dateOfBirth: "2015-02-25", squadNumber: 1 },
  { name: "NOAH LEE EL SAMRANI", dateOfBirth: "2015-01-28", squadNumber: 7 },
  { name: "ETHAN DELPORT", dateOfBirth: "2015-06-12", squadNumber: 10 },
  { name: "MASUNGULO TLAKA", dateOfBirth: "2015-06-05", squadNumber: 5 },
];

export function playerId(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `p-${slug || "player"}`;
}

export function formatDateOfBirth(iso?: string) {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

export function attachSquadTeam<T extends { name: string; teams: { id: string; name: string }[] }>(groups: T[]): T[] {
  return groups.map((group) => {
    if (ageNumber(group.name) !== 12) return group;
    if (group.teams.some((team) => team.id === SQUAD_TEAM_ID)) return group;
    return { ...group, teams: [{ id: SQUAD_TEAM_ID, name: "Squad" }, ...group.teams] };
  });
}

export function parseRoster(text: string): { rows: RosterRow[]; errors: string[] } {
  const rows: RosterRow[] = [];
  const errors: string[] = [];
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  lines.forEach((line, index) => {
    if (!line.trim()) return;
    const cells = splitRow(line);
    if (isHeader(cells)) return;
    const parsed = interpretRow(cells);
    if ("error" in parsed) errors.push(`Line ${index + 1}: ${parsed.error}`);
    else rows.push(parsed);
  });
  return { rows, errors };
}

function splitRow(line: string) {
  if (line.includes("\t")) return line.split("\t").map((cell) => cell.trim()).filter((cell, index, all) => cell.length > 0 || index < all.length - 1);
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (quoted) {
      if (char === '"') {
        if (line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else quoted = false;
      } else current += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      cells.push(current.trim());
      current = "";
    } else current += char;
  }
  cells.push(current.trim());
  if (cells.filter(Boolean).length > 1) return cells.map((cell) => cell.trim());
  return [line.trim()];
}

function isHeader(cells: string[]) {
  const first = cells[0]?.trim().toLowerCase() ?? "";
  return first === "name" || first === "player" || first === "player name";
}

function interpretRow(cells: string[]): RosterRow | { error: string } {
  const filled = cells.map((cell) => cell.trim()).filter(Boolean);
  if (filled.length === 1) {
    const dated = filled[0].match(/^(.+?)\s+(\d{1,2}\/\d{1,2}\/\d{4})\s+(\d{1,2})$/);
    if (dated) return rowFrom(dated[1], dated[3], dated[2]);
    const numbered = filled[0].match(/^(.+?)\s+(\d{1,2})$/);
    if (numbered) return rowFrom(numbered[1], numbered[2]);
    return { error: "Add the player name and shirt number." };
  }
  const [name, second, third] = filled;
  if (!name) return { error: "Add the player name." };
  if (isDate(second) && third && isShirt(third)) return rowFrom(name, third, second);
  if (isShirt(second) && third && isDate(third)) return rowFrom(name, second, third);
  if (isShirt(second)) return rowFrom(name, second);
  if (isDate(second) && third && isShirt(third)) return rowFrom(name, third, second);
  return { error: "Use the player name, date of birth, and shirt number." };
}

function rowFrom(name: string, shirt: string, date?: string): RosterRow | { error: string } {
  const squadNumber = Number(shirt);
  if (!isShirt(shirt)) return { error: "Shirt number must be from 1 to 99." };
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (!trimmed) return { error: "Add the player name." };
  if (!date) return { name: trimmed, squadNumber };
  const dateOfBirth = toIsoDate(date);
  if (!dateOfBirth) return { error: "Date of birth must be DD/MM/YYYY." };
  return { name: trimmed, squadNumber, dateOfBirth };
}

function isShirt(value: string) {
  return /^\d{1,2}$/.test(value.trim()) && Number(value) >= 1 && Number(value) <= 99;
}

function isDate(value: string) {
  return /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value.trim());
}

function toIsoDate(value: string) {
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return "";
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1990 || year > 2100) return "";
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
