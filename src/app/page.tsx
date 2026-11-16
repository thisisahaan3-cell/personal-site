import { site } from "@/content/site";
import { Header } from "@/components/Header";
import { LineDriver } from "@/components/motion/LineDriver";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { About } from "@/components/sections/About";
import { Academics } from "@/components/sections/Academics";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";

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
        </main>
        <Footer />
      </div>
      <LineDriver />
    </MotionProvider>
  );
}
