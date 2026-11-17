import { site } from "@/content/site";

/** The four results on the bronze, in reading order. Every word comes from site.ts. */
export type Result = {
  id: "nfo" | "srcc" | "fellowship" | "shisfest";
  figure: string;
  line: string;
  sub?: string;
  /** The panel: title, year and the lines exactly as written. */
  title: string;
  year?: string;
  lines: string[];
  note?: string;
};

const steps = site.ui.finance.steps;

function competition(prefix: string) {
  const c = site.competitions.find((x) => x.name.startsWith(prefix));
  if (!c) throw new Error(`Missing competition ${prefix}`);
  return c;
}

const nfo = competition("National Finance Olympiad");
const srcc = competition("SRCC Finance Olympiad");
const shis = competition("SHISFEST");
const fellow = site.experience.find((e) => e.org === "srcc");
if (!fellow) throw new Error("Missing SRCC fellowship");

export const RESULTS: Result[] = [
  {
    id: "nfo",
    figure: steps.nfo.headline,
    line: steps.nfo.headlineLabel,
    sub: steps.nfo.secondary,
    title: nfo.name,
    year: nfo.year,
    lines: nfo.results,
  },
  {
    id: "srcc",
    figure: steps.srcc.figure,
    line: `${steps.srcc.outOf}, ${srcc.name} ${srcc.year}`,
    title: srcc.name,
    year: srcc.year,
    lines: srcc.results,
  },
  {
    id: "fellowship",
    figure: steps.fellowship.figure,
    line: fellow.title,
    title: fellow.title,
    lines: [fellow.points[0]],
    note: fellow.organisation,
  },
  {
    id: "shisfest",
    figure: steps.shisfest.figure,
    line: `${shis.name} ${shis.year}`,
    title: shis.name,
    year: shis.year,
    lines: shis.results,
  },
];
