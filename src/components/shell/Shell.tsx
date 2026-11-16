"use client";

import { usePathname } from "next/navigation";
import { site } from "@/content/site";
import { pageForPath } from "@/lib/pages";
import { Board } from "./Board";
import { TransitionProvider } from "./Transition";

/** Page wrapper: sets the ground family for the current route and holds the board and the transition. */
export function Shell({ children }: { children: React.ReactNode }) {
  const page = pageForPath(usePathname());
  return (
    <TransitionProvider>
      <div className="site" data-ground={page.ground} data-page={page.id}>
        <a className="skip" href="#main">
          {site.ui.skipLink}
        </a>
        <Board />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
      </div>
    </TransitionProvider>
  );
}
