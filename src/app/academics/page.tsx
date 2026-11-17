import type { Metadata } from "next";
import { ColdOpen } from "@/components/ColdOpen";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Courses } from "@/components/academics/Courses";
import { Quiz } from "@/components/academics/Quiz";
import { Results } from "@/components/academics/Results";
import { School } from "@/components/academics/School";
import { Tape } from "@/components/academics/Tape";
import { Topper } from "@/components/academics/Topper";
import { Stage3D } from "@/components/three/Stage3D";
import { site } from "@/content/site";
import { resolveMedia } from "@/lib/media.server";
import { PAGES } from "@/lib/pages";

export const metadata: Metadata = { title: site.ui.pages.academics };

/** Cold open, the tape (99.4%), the desk (school topper, Grade 7 to 11), the results in the client's order, courses, the quiz, the school record. */
export default function Page() {
  const sky = resolveMedia("m5");
  return (
    <Stage3D>
      <SmoothScroll />
      <ColdOpen page={PAGES.academics} />
      <Tape video={sky.video} poster={sky.poster} />
      <Topper />
      <Results />
      <Courses />
      <section className="quizbox" aria-label={site.ui.academics.quizHeading}>
        <Quiz />
      </section>
      <School />
    </Stage3D>
  );
}
