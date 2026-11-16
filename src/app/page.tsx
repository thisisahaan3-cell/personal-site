import { site } from "@/content/site";
import { Header } from "@/components/Header";
import { LineDriver } from "@/components/motion/LineDriver";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { About } from "@/components/sections/About";
import { Academics } from "@/components/sections/Academics";
import { Competitions } from "@/components/sections/Competitions";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { Law } from "@/components/sections/Law";
import { Night } from "@/components/sections/Night";
import { Quizzing } from "@/components/sections/Quizzing";
import { Reading } from "@/components/sections/Reading";
import { Hero } from "@/components/sections/Hero";
import { Leadership } from "@/components/sections/Leadership";
import { Mun } from "@/components/sections/Mun";
import { Timeline } from "@/components/sections/Timeline";

export default function Home() {
  return (
    <MotionProvider>
      <a href="#main" className="skip-link">
        {site.ui.skipLink}
      </a>
      <Header />
      <div className="page">
        <main id="main" tabIndex={-1}>
          <Hero />
          <About />
          <Academics />
          <Timeline />
          <Mun />
          <Leadership />
          <Competitions />
          <Night />
          <Law />
          <Quizzing />
          <Reading />
          <Contact />
        </main>
        <Footer />
      </div>
      <LineDriver />
    </MotionProvider>
  );
}
