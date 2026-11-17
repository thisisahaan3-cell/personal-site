import { site, type StatId } from "@/content/site";

/**
 * The site map (design/v2.1-addendum.md §3) and each page's ground colour.
 * The page palettes themselves live in globals.css under [data-page="…"].
 */
export type PageId = "home" | "finance" | "modelUn" | "academics" | "leadership" | "interests" | "contact";

export type PageDef = {
  id: PageId;
  href: string;
  /** The one real figure shown in the cold open. */
  stat: StatId | null;
  /** Footage slot key in `site.media` (cold open). */
  media: MediaKey | null;
};

export type MediaKey = keyof typeof site.media;

export const PAGES: Record<PageId, PageDef> = {
  home: { id: "home", href: "/", stat: null, media: "m1" },
  finance: { id: "finance", href: "/finance", stat: "nfo", media: "m2" },
  // The page id stays "modelUn" (content refers to it); its name is "Law & Diplomacy".
  modelUn: { id: "modelUn", href: "/law-diplomacy", stat: null, media: "m3" },
  academics: { id: "academics", href: "/academics", stat: "gradeX", media: "m5" },
  leadership: { id: "leadership", href: "/leadership", stat: null, media: "m8" },
  interests: { id: "interests", href: "/interests", stat: "books", media: null },
  contact: { id: "contact", href: "/contact", stat: null, media: "m9" },
};

/** The six destinations, in board order. */
export const DESTINATIONS: PageDef[] = [
  PAGES.finance,
  PAGES.modelUn,
  PAGES.academics,
  PAGES.leadership,
  PAGES.interests,
  PAGES.contact,
];

export function pageForPath(pathname: string | null): PageDef {
  const p = (pathname ?? "/").replace(/[?#].*$/, "").replace(/\/+$/, "") || "/";
  return Object.values(PAGES).find((d) => d.href === p) ?? PAGES.home;
}

/** The page's full name (titles, the transition's split-flap line). */
export function pageName(id: PageId) {
  return id === "home" ? site.identity.name : site.ui.pages[id];
}

/** The name in the board strip and on the home row (shorter where the addendum says so). */
export function pageLabel(id: PageId) {
  return site.ui.pagesShort[id] ?? pageName(id);
}

export function statFor(id: StatId | null) {
  if (!id) return null;
  return site.stats.find((s) => s.id === id) ?? null;
}

/** The figure beside a destination (addendum §3): a real figure with its short note. */
export type DestFigure = { value: string; note: string; kind?: "email" };

export function destinationFigure(id: PageId): DestFigure | null {
  const ui = site.ui;
  const notes = ui.home.figureNotes;
  const fromStat = (sid: StatId) => {
    const s = statFor(sid);
    return s ? { value: s.value, note: notes[sid] ?? s.label } : null;
  };
  switch (id) {
    case "finance":
      return fromStat("nfo");
    case "modelUn":
      return { value: String(site.lawDiplomacy.executiveBoard.length), note: ui.destinations.executiveBoard };
    case "academics":
      return fromStat("gradeX");
    case "leadership":
      return { value: String(site.work.internships.length), note: ui.destinations.internships };
    case "interests":
      return fromStat("books");
    case "contact":
      return { value: site.identity.email, note: ui.destinations.email, kind: "email" };
    default:
      return null;
  }
}

/** Ground colours, mirrored from globals.css for canvases and the transition columns. */
export const GROUND_HEX: Record<PageId, string> = {
  home: "#000000",
  finance: "#03110C",
  modelUn: "#14080B",
  academics: "#0B0C1E",
  leadership: "#0F130D",
  interests: "#0D0D10",
  contact: "#070B16",
};
