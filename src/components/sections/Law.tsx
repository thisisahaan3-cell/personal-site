import { site } from "@/content/site";
import { interest } from "@/lib/content";
import { Chapter, ChapterHead, Run } from "../primitives";

const ui = site.ui;

/** Figure 6: the page becomes a document and the meridian its margin rule (§3.8). */
export function Law() {
  const law = interest("law");
  const evidence = law.evidence[0]?.text;
  const desc = law.description;
  return (
    <Chapter id="law" className="law">
      <div className="stone-ground" aria-hidden="true" />
      <ChapterHead id="law" />
      <Run className="pb-block">
        <div className="doc" data-figure="">
          <div className="doc-rules" data-fade="" aria-hidden="true" />
          <header className="doc-head">
            <h3 className="t-doc">{ui.law.documentTitle}</h3>
            <p className="t-data fg2">{ui.law.documentSubtitle}</p>
          </header>
          <ol className="doc-paras">
            {evidence && (
              <li>
                <span className="doc-num t-data fg2" aria-hidden="true">
                  1
                </span>
                <p className="t-doc doc-text">{evidence}</p>
                <p className="doc-side t-data fg2">{ui.law.sideNote}</p>
              </li>
            )}
            <li>
              <span className="doc-num t-data fg2" aria-hidden="true">
                {evidence ? 2 : 1}
              </span>
              {desc.placeholder ? (
                <div className="doc-text">
                  <p className="t-data fg2 doc-ph">{ui.placeholder.label}</p>
                  <div className="doc-blank" aria-hidden="true" />
                </div>
              ) : (
                <p className="t-doc doc-text">{desc.text}</p>
              )}
            </li>
          </ol>
        </div>
      </Run>
    </Chapter>
  );
}
