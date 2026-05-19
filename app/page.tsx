import { NavBar } from "@/components/nav/NavBar";
import { Hero } from "@/components/hero/Hero";
import { FeaturedShowcase } from "@/components/projects/FeaturedShowcase";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { AcademicTimeline } from "@/components/academic/AcademicTimeline";
import { StackMarquee } from "@/components/stack/StackMarquee";
import { About } from "@/components/about/About";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <div id="top" className="relative isolate">
      <NavBar />
      <main>
        <Hero />
        <FeaturedShowcase />
        <ProjectGrid />
        <AcademicTimeline />
        <StackMarquee />
        <About />
      </main>
      <Footer />
    </div>
  );
}
