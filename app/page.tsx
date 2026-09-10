import { NavBar } from "@/components/nav/NavBar";
import { Hero } from "@/components/hero/Hero";
import { CutWordmark } from "@/components/ui/CutWordmark";
import { FeaturedShowcase } from "@/components/projects/FeaturedShowcase";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { AcademicTimeline } from "@/components/academic/AcademicTimeline";
import { StackMarquee } from "@/components/stack/StackMarquee";
import { About } from "@/components/about/About";
import { Footer } from "@/components/Footer";

/**
 * RITMO DE BLOCOS — a partitura de cor da home, fixada aqui e em nenhum outro
 * lugar. Cada componente pinta o proprio campo; esta pagina so define a ordem:
 *
 *   AZUL   NavBar + Hero        (um unico campo continuo)
 *   PAPEL  CutWordmark
 *   PAPEL  FeaturedShowcase
 *   BREU   ProjectGrid (indice)
 *   AZUL   AcademicTimeline
 *   PAPEL  StackMarquee (tabela)
 *   BREU   About + Footer       (um unico campo continuo)
 *
 * Azul → papel → papel → breu → azul → papel → breu → breu: o azul volta uma
 * vez no meio para amarrar a peca, e os dois pares de mesma cor (papel/papel e
 * breu/breu) encostam de proposito, para o site nao virar zebra.
 *
 * NavBar e Hero sao IRMAOS e ambos pintam `bg-blue`, sem gap e sem margem
 * entre eles — leem como um campo unico, e isso desacopla os itens que
 * reescrevem a nav e o hero: nenhum dos dois precisa saber a altura do outro.
 *
 * Sem `relative isolate` no wrapper: nao ha mais nenhuma camada `-z-10` (nem
 * gradiente, nem grade, nem orbe) a isolar.
 */
export default function HomePage() {
  return (
    <div id="top">
      <NavBar />
      <main>
        <Hero />
        <CutWordmark />
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
