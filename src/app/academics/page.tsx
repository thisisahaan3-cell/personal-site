import type { Metadata } from "next";
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

export const metadata: Metadata = { title: site.ui.pages.academics };

/** The desk (school topper, Grade 7 to 11), the tape (99.4%), the results in the client's order, courses, the quiz, the school record. */
export default function Page() {
  const sky = resolveMedia("m5");
  return (
    <Stage3D>
      <SmoothScroll />
      <h1 className="sr-only">{site.ui.pages.academics}</h1>
      <Topper />
      <Tape video={sky.video} poster={sky.poster} />
      <Results />
      <Courses />
      <section className="quizbox" aria-label={site.ui.academics.quizHeading}>
        <Quiz />
      </section>
      <School />
    </Stage3D>
  );
}
