import { site, type StatId } from "@/content/site";

export type Ground = "navy" | "petrol" | "umber";
export type PageId = "home" | "finance" | "modelUn" | "academics" | "leadership" | "contact";

export type PageDef = {
  id: PageId;
  href: string;
  ground: Ground;
  /** The one real figure shown beside the page name (board, home row, cold open). */
  stat: StatId | null;
  /** Footage slot key in `site.media` (cold open). */
  media: MediaKey | null;
};

export type MediaKey = keyof typeof site.media;

export const PAGES: Record<PageId, PageDef> = {
  home: { id: "home", href: "/", ground: "navy", stat: null, media: "m1" },
  finance: { id: "finance", href: "/finance", ground: "navy", stat: "nfo", media: "m2" },
  modelUn: { id: "modelUn", href: "/model-un", ground: "petrol", stat: "delegateAwards", media: "m3" },
  academics: { id: "academics", href: "/academics", ground: "umber", stat: "gradeX", media: "m5" },
  leadership: { id: "leadership", href: "/leadership", ground: "umber", stat: null, media: "m8" },
  contact: { id: "contact", href: "/contact", ground: "navy", stat: "books", media: "m9" },
};

/** The five destinations, in board order. */
export const DESTINATIONS: PageDef[] = [
  PAGES.finance,
  PAGES.modelUn,
  PAGES.academics,
  PAGES.leadership,
  PAGES.contact,
];

export function pageForPath(pathname: string | null): PageDef {
  const p = (pathname ?? "/").replace(/\/+$/, "") || "/";
  return Object.values(PAGES).find((d) => d.href === p) ?? PAGES.home;
}

export function pageName(id: PageId) {
  return id === "home" ? site.identity.name : site.ui.pages[id];
}

export function statFor(id: StatId | null) {
  if (!id) return null;
  return site.stats.find((s) => s.id === id) ?? null;
}

/** Ground colours, mirrored from globals.css for canvas and transition columns. */
export const GROUND_HEX: Record<Ground, string> = {
  navy: "#0A101C",
  petrol: "#081619",
  umber: "#12100E",
};
