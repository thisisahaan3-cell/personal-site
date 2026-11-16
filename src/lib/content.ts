import { organisations, site, type StatId } from "@/content/site";

/** Fill {tokens} in an interface string from site.ui. */
export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
}

export function chapter(id: string) {
  const ch = site.ui.chapters.find((c) => c.id === id);
  if (!ch) throw new Error(`Unknown chapter ${id}`);
  return ch;
}

export function stat(id: StatId) {
  const s = site.stats.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown stat ${id}`);
  return s;
}

export function interest(id: string) {
  const i = site.interests.find((x) => x.id === id);
  if (!i) throw new Error(`Unknown interest ${id}`);
  return i;
}

/** "Date not stated" and "Year not stated" are never printed. */
export function shown(value?: string | number | null) {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /not stated/i.test(s) ? "" : s;
}

/** Rows that do not name their organisation, so they never carry its tile (review 1, item 5). */
const NO_TILE = [/^Rasmanjari\b/, /^Lotus Young Leaders Summit\b/];

/**
 * Which rows of one table show a logo tile: an organisation's tile appears once, on the first
 * row that names it. Returns the org key to show per row, or null. The cell itself stays, so the
 * trailing column keeps its width.
 */
/** The tile for a single entry outside a table (the timeline): none for an unconfirmed organiser. */
export function tileFor(org: string | null | undefined, text: string) {
  return org && !NO_TILE.some((re) => re.test(text)) ? org : null;
}

export function tilesFor<T>(rows: readonly T[], org: (r: T) => string | null | undefined, text: (r: T) => string) {
  const seen = new Set<string>();
  return rows.map((r) => {
    const key = org(r);
    if (!key || seen.has(key) || NO_TILE.some((re) => re.test(text(r)))) return null;
    seen.add(key);
    return key;
  });
}

/** Native pixel sizes of the logo files, so tiles never upscale (§2.8: at most native ÷ 2). */
const NATIVE: Record<string, [number, number, boolean?]> = {
  "/logos/cbse.png": [173, 200],
  "/logos/iit-delhi-white.png": [200, 200],
  "/logos/iit-madras.png": [272, 60],
  "/logos/lotus-valley.jpg": [571, 219],
  "/logos/sof.jpg": [118, 66],
  "/logos/srcc.png": [622, 121],
  "/logos/wharton.svg": [863.9, 217.4, true],
};

export type Logo = { src: string; width: number; height: number; onDark: boolean; name: string };

export function logoFor(key?: string | null): Logo | null {
  if (!key) return null;
  const org = organisations[key];
  if (!org?.logo) return null;
  const native = NATIVE[org.logo];
  if (!native) return null;
  const [w, h, vector] = native;
  const maxW = vector ? 120 : Math.min(120, w / 2);
  const maxH = vector ? 32 : Math.min(32, h / 2);
  const s = Math.min(maxW / w, maxH / h);
  return {
    src: org.logo,
    width: Math.round(w * s),
    height: Math.round(h * s),
    onDark: !!org.logoOnDark,
    name: org.name,
  };
}

/** Split a string so any character Instrument Serif lacks is set in Geist (§1.2 numeral rule). */
export const SERIF_MISSING = /([→])/;
