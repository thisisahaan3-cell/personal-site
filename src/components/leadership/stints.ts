import { site, type TimelineCategory, type TimelineEvent } from "@/content/site";

/**
 * Data for "Stints": every dated entry of `site.timeline`, on lanes, at the precision stated.
 * Year-only entries span their whole year (drawn with soft ends); entries whose months are stated
 * (`experience` periods such as "March – April 2026") span those months with square ends.
 */

export type LaneId = "school" | "courses" | "mun" | "competitions" | "leadership" | "work";
export const LANES: LaneId[] = ["school", "courses", "mun", "competitions", "leadership", "work"];

const LANE_OF: Record<TimelineCategory, LaneId> = {
  school: "school",
  academic: "school",
  course: "courses",
  mun: "mun",
  parliament: "mun",
  finance: "competitions",
  quiz: "competitions",
  pitch: "competitions",
  leadership: "leadership",
  internship: "work",
};

export const AXIS_FROM = 2013;
/** The end of 2026: the last stated year. */
export const AXIS_TO = 2027;
export const YEARS = Array.from({ length: AXIS_TO - AXIS_FROM }, (_, i) => AXIS_FROM + i);

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export type Entry = {
  id: string;
  ev: TimelineEvent;
  lane: LaneId;
  from: number;
  to: number;
  /** Year precision: soft ends. */
  soft: boolean;
  /** Runs to the present (the school stint). */
  present: boolean;
  rings: number[];
  /** The date exactly as stated. */
  when: string;
  row: number;
  /** Position on the axis the playhead snaps to; entries sharing a year share it out. */
  anchor: number;
  index: number;
};

/** "March – April 2026" -> [2026 + 2/12, 2026 + 4/12]. */
function monthSpan(period: string): [number, number] | null {
  const m = period.match(/^([A-Z][a-z]+)\s+–\s+([A-Z][a-z]+)\s+(\d{4})$/);
  if (!m) return null;
  const a = MONTHS.indexOf(m[1]);
  const b = MONTHS.indexOf(m[2]);
  if (a < 0 || b < 0) return null;
  const y = Number(m[3]);
  return [y + a / 12, y + (b + 1) / 12];
}

function build(): Entry[] {
  const raw = site.timeline.map((ev, i) => {
    const lane = LANE_OF[ev.category];
    let from = ev.year;
    let to = ev.year + 1;
    let soft = true;
    let present = false;
    let rings: number[] = [];
    let when = ev.yearLabel ?? String(ev.year);
    if (ev.category === "school") {
      // Joined in 2013 and still there: "2013 – Present".
      to = AXIS_TO;
      present = true;
      when = site.education.period;
    } else if (ev.span) {
      from = ev.span.from;
      to = ev.span.to + 1;
      if (ev.span.style === "rings") rings = Array.from({ length: ev.span.to - ev.span.from + 1 }, (_, k) => ev.span!.from + k + 0.5);
    }
    if (ev.category === "internship") {
      const job = site.experience.find((e) => ev.title.includes(e.organisation));
      const ms = job ? monthSpan(job.period) : null;
      if (job && ms) {
        [from, to] = ms;
        soft = false;
        when = job.period;
      }
    }
    return { id: `e${i}`, ev, lane, from, to, soft, present, rings, when, row: 0, anchor: from, index: 0, order: i };
  });

  // Pack each lane into rows.
  for (const lane of LANES) {
    const ends: number[] = [];
    raw
      .filter((e) => e.lane === lane)
      .sort((a, b) => a.from - b.from || a.order - b.order)
      .forEach((e) => {
        let r = ends.findIndex((end) => end <= e.from + 1e-6);
        if (r < 0) r = ends.length;
        ends[r] = e.to;
        e.row = r;
      });
  }

  // Chronological order; entries starting in the same year share that year out for the playhead.
  const sorted = raw.sort((a, b) => a.from - b.from || LANES.indexOf(a.lane) - LANES.indexOf(b.lane) || a.order - b.order);
  const byYear = new Map<number, typeof sorted>();
  sorted.forEach((e) => {
    const y = Math.floor(e.from);
    byYear.set(y, [...(byYear.get(y) ?? []), e]);
  });
  byYear.forEach((list, y) => list.forEach((e, k) => (e.anchor = y + (k + 0.5) / list.length)));
  return sorted.map((e, i) => ({ ...e, index: i }));
}

export const ENTRIES = build();

export const ROWS: Record<LaneId, number> = LANES.reduce(
  (acc, l) => ({ ...acc, [l]: Math.max(1, ...ENTRIES.filter((e) => e.lane === l).map((e) => e.row + 1)) }),
  {} as Record<LaneId, number>,
);

/** Entries the resume does not date: listed under the chart, never placed on it. */
export const UNDATED = [
  ...site.experience.filter((e) => /not stated/i.test(e.period)).map((e) => ({ title: e.title, detail: e.organisation })),
  ...site.leadership.filter((e) => /not stated/i.test(e.period)).map((e) => ({ title: e.title, detail: e.organisation })),
  ...site.competitions
    .filter((c) => /not stated/i.test(c.year))
    .map((c) => ({ title: c.name, detail: c.results.join(" ") })),
];
export const ONGOING = site.competitions.filter((c) => c.ongoing).map((c) => ({ title: c.name, detail: c.results.join(" ") }));
