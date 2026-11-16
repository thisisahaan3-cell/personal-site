"use client";

import { site } from "@/content/site";
import { useMotion } from "../motion/MotionProvider";

const f = site.ui.footer;

export function Footer() {
  const { scrollToId } = useMotion();
  return (
    <footer className="site-footer">
      <div className="footer-row t-small">
        <p>
          {f.left}, {f.buildYear}
        </p>
        <p>{f.centre}</p>
        <p>
          <a
            href="#top"
            className="ilink"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("top");
              document.getElementById("name")?.focus({ preventScroll: true });
            }}
          >
            {f.backToTop}
          </a>
        </p>
      </div>
      <p className="t-data fg2" style={{ marginTop: 16 }}>
        {f.typeLine}
      </p>
    </footer>
  );
}
