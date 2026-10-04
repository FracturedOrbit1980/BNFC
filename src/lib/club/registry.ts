import { CLUB_NAME } from "@/lib/club/catalog";
import { isClubTheme, type ClubThemeId } from "@/lib/club/themes";

export const BNFC_CLUB_ID = "bnfc";
const REGISTRY_KEY = "bnfc-clubs";
const LEGACY_DATA_KEY = "bnfc-club-v3";

export interface ClubProfile {
  id: string;
  name: string;
  logo: string;
  theme: ClubThemeId;
  kind: "bnfc" | "custom";
}

export interface ClubRegistry {
  clubs: ClubProfile[];
  activeId: string | null;
}

export function clubDataKey(id: string) {
  return `bnfc-club-${id}`;
}

function bnfcProfile(): ClubProfile {
  return { id: BNFC_CLUB_ID, name: CLUB_NAME, logo: "", theme: "red", kind: "bnfc" };
}

export function readRegistry(): ClubRegistry {
  if (typeof window === "undefined") return { clubs: [bnfcProfile()], activeId: null };
  const raw = localStorage.getItem(REGISTRY_KEY);
  if (!raw) {
    const registry: ClubRegistry = { clubs: [bnfcProfile()], activeId: null };
    const legacy = localStorage.getItem(LEGACY_DATA_KEY);
    if (legacy && !localStorage.getItem(clubDataKey(BNFC_CLUB_ID))) {
      localStorage.setItem(clubDataKey(BNFC_CLUB_ID), legacy);
    }
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
    return registry;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<ClubRegistry>;
    const clubs = Array.isArray(parsed.clubs) ? parsed.clubs.map(normalizeProfile).filter((club) => club.name) : [];
    if (!clubs.some((club) => club.id === BNFC_CLUB_ID)) clubs.unshift(bnfcProfile());
    const activeId = clubs.some((club) => club.id === parsed.activeId) ? parsed.activeId ?? null : null;
    return { clubs, activeId };
  } catch {
    return { clubs: [bnfcProfile()], activeId: null };
  }
}

export function writeRegistry(registry: ClubRegistry) {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
}

function normalizeProfile(value: Partial<ClubProfile>): ClubProfile {
  const theme = value.theme && isClubTheme(value.theme) ? value.theme : "red";
  return {
    id: value.id || `club-${Date.now()}`,
    name: (value.name ?? "").trim(),
    logo: value.logo ?? "",
    theme,
    kind: value.kind === "bnfc" ? "bnfc" : "custom",
  };
}
