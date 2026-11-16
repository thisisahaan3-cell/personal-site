import { site, type StatId } from "@/content/site";

export type Ground = "navy" | "petrol" | "umber";
export type PageId = "home" | "finance" | "modelUn" | "academics" | "leadership" | "contact";

export type PageDef = {
  id: PageId;
  href: string;
  ground: Ground;
  /** The one real figure shown beside the page name (board, home row, cold open). */
  stat: StatId | null;
  /** Footage slot key in `MEDIA` (cold open). */
  media: MediaKey | null;
};

// TODO: switch to `site.media` once the content researcher's media map lands in site.ts.
export const MEDIA = {
  "m1-home": { video: "/media/m1-home.mp4", poster: "/media/m1-home.jpg" },
  "m2-finance": { video: "/media/m2-finance.mp4", poster: "/media/m2-finance.jpg" },
  "m3-model-un": { video: "/media/m3-model-un.mp4", poster: "/media/m3-model-un.jpg" },
  "m5-clouds": { video: "/media/m5-clouds.mp4", poster: "/media/m5-clouds.jpg" },
  "m8-canopy": { video: "/media/m8-canopy.mp4", poster: "/media/m8-canopy.jpg" },
  "m9-library": { video: null, poster: "/media/m9-library.webp" },
} as const satisfies Record<string, { video: string | null; poster: string }>;
export type MediaKey = keyof typeof MEDIA;

export const PAGES: Record<PageId, PageDef> = {
  home: { id: "home", href: "/", ground: "navy", stat: null, media: "m1-home" },
  finance: { id: "finance", href: "/finance", ground: "navy", stat: "nfo", media: "m2-finance" },
  modelUn: { id: "modelUn", href: "/model-un", ground: "petrol", stat: "delegateAwards", media: "m3-model-un" },
  academics: { id: "academics", href: "/academics", ground: "umber", stat: "gradeX", media: "m5-clouds" },
  leadership: { id: "leadership", href: "/leadership", ground: "umber", stat: null, media: "m8-canopy" },
  contact: { id: "contact", href: "/contact", ground: "navy", stat: "books", media: "m9-library" },
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
