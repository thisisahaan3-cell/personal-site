import { site } from "@/content/site";
import { Chapter, ChapterHead, Col, EditableText, Run } from "../primitives";

const ui = site.ui;

export function About() {
  return (
    <Chapter id="about">
      <ChapterHead id="about" />
      <Run className="pb-block">
        <div className="grid10">
          <Col d={[3, 10]}>
            <p className="t-statement">{site.about.profile.text}</p>
            <p className="t-data fg2" style={{ marginTop: 16 }}>
              {ui.about.profileNote}
            </p>
          </Col>
        </div>
      </Run>
      <Run className="pb-block">
        <div className="grid10">
          <Col d={[3, 8]} t={[1, 4]}>
            <EditableText
              value={[site.hero.statement, ...site.about.biography]}
              slot={ui.placeholder.slots.biography}
            />
          </Col>
          <Col d={[10, 12]} t={[5, 6]}>
            <p className="t-data fg2 rlist-head">{ui.about.skillsHeading}</p>
            <ul className="rlist t-small">
              {site.skills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </Col>
        </div>
      </Run>
    </Chapter>
  );
}
