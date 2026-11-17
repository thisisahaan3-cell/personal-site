import { site, type Role } from "@/content/site";
import { tileFor } from "@/lib/content";

export type WorkEntry = Role & {
  id: string;
  kind: "internship" | "role";
  /** Short name for the index and the file tab: the organisation for internships, the role for the rest. */
  label: string;
  /** Logo tile, or null (never on Rasmanjari or the Lotus Young Leaders Summit). */
  tile: string | null;
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

/** Every entry of the Leadership & Work Experience page, in `site.work` order: internships first. */
export const ENTRIES: WorkEntry[] = [
  ...site.work.internships.map((r) => ({ ...r, kind: "internship" as const })),
  ...site.work.leadership.map((r) => ({ ...r, kind: "role" as const })),
].map((r) => ({
  ...r,
  id: slug(r.organisation),
  label: r.kind === "internship" ? r.organisation : r.title.split(" — ")[0],   tile: tileFor(tileFor(r.org, r.title), r.organisation),
}));
