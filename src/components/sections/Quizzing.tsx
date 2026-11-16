import { site } from "@/content/site";
import { interest } from "@/lib/content";
import { Chapter, ChapterHead, Col, EditableText, Run } from "../primitives";
import { Quiz } from "./Quiz";

export function Quizzing() {
  const quizzing = interest("quizzing");
  return (
    <Chapter id="quizzing">
      <ChapterHead id="quizzing" />
      <Run className="pb-fig">
        <div className="grid10">
          <Col d={[3, 9]}>
            <p className="t-data fg2 rlist-head">{site.ui.quizzing.evidenceHeading}</p>
            <ul className="rlist t-small">
              {quizzing.evidence.map((e) => (
                <li key={e.text}>{e.text}</li>
              ))}
            </ul>
          </Col>
        </div>
      </Run>
      <Quiz />
      <Run className="pb-block">
        <div className="grid10">
          <Col d={[3, 8]} t={[1, 4]}>
            <EditableText value={quizzing.description} slot={site.ui.placeholder.slots.quizzing} />
          </Col>
        </div>
      </Run>
    </Chapter>
  );
}
