import { credits } from "@/content/credits";
import { site } from "@/content/site";

const ui = site.ui.credits;

/**
 * The credit line at the very bottom of every page except Home (whose one screen carries a
 * discreet "Credits" link to the Contact page's footer). The list is `src/content/credits.ts`.
 */
export function Credits() {
  return (
    <footer className="credits" id="credits" aria-labelledby="credits-title">
      <h2 id="credits-title" className="credits__title">
        {ui.heading}
      </h2>
      <p className="credits__line">
        {ui.intro}{" "}
        {credits.map((c, i) => (
          <span key={c.url}>
            <a href={c.url} target="_blank" rel="noopener noreferrer">
              {c.title}
            </a>{" "}
            {ui.by} {c.author} ({c.licence}){i < credits.length - 1 ? "; " : "."}
          </span>
        ))}{" "}
        {ui.cc0}
      </p>
    </footer>
  );
}
