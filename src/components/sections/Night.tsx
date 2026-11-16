import { site } from "@/content/site";
import { interest } from "@/lib/content";
import { Chapter, ChapterHead, Col, EditableText, Run } from "../primitives";
import { CircuitFigure, RouteFigure } from "./NightFigures";

const slots = site.ui.placeholder.slots;

/** One night ground holds Aviation and Motorsport (§3.7, §5.2). */
export function Night() {
  const aviation = interest("aviation");
  const motorsport = interest("motorsport");
  return (
    <div className="night">
      <div className="night-ground" aria-hidden="true" />
      <Run className="night-top" />
      <Chapter id="aviation" className="clip-x night-first">
        <ChapterHead id="aviation" />
        <RouteFigure />
        <Run className="pt-fig pb-block">
          <div className="grid10">
            <Col d={[3, 8]} t={[1, 4]}>
              <p className="t-data fg2 rlist-head">{site.ui.aviation.evidenceHeading}</p>
              <ul className="rlist t-small">
                {aviation.evidence.map((e) => (
                  <li key={e.text}>{e.text}</li>
                ))}
              </ul>
              <div style={{ marginTop: 32 }}>
                <EditableText value={aviation.description} slot={slots.aviation} />
              </div>
            </Col>
          </div>
        </Run>
      </Chapter>
      <Chapter id="motorsport" className="clip-x">
        <ChapterHead id="motorsport" />
        <CircuitFigure />
        <Run className="pt-fig night-last">
          <div className="grid10">
            <Col d={[3, 8]} t={[1, 4]}>
              {motorsport.statedLine && (
                <p className="t-small fg2" style={{ marginBottom: 24 }}>
                  {motorsport.statedLine}
                </p>
              )}
              <EditableText value={motorsport.description} slot={slots.motorsport} />
            </Col>
          </div>
        </Run>
      </Chapter>
    </div>
  );
}
