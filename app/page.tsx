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
 *   CARVAO  NavBar + Hero        (um unico campo continuo)
 *   PAPEL   CutWordmark
 *   PAPEL   FeaturedShowcase
 *   CARVAO  ProjectGrid (indice)
 *   PAPEL   AcademicTimeline
 *   PAPEL   StackMarquee (tabela)
 *   CARVAO  About + Footer       (um unico campo continuo)
 *
 * A REGRA DA PARTITURA: nenhum par de escuros pode encostar. So existe UM
 * escuro no sistema (carvao #1C1A17) — o "breu" #141414 saiu porque dava
 * 1.06:1 contra ele, ou seja, duas secoes escuras vizinhas nao leriam como duas
 * secoes, leriam como uma so com uma emenda no meio. Papel encostando em papel
 * e diferente: ali a virada e feita pelo filete tracejado que abre cada
 * <SectionHeader>, e o par existe de proposito para o site nao virar zebra.
 *
 * Foi por essa regra que a FORMACAO trocou de campo. Ela era o segundo bloco
 * azul da pagina; sem o azul, mante-la escura colaria carvao (indice) em
 * carvao (formacao). Em papel a partitura fecha alternada, com os tres blocos
 * de carvao ancorando a abertura, o meio e o fechamento.
 *
 * NavBar e Hero sao IRMAOS e ambos pintam `bg-carvao`, sem gap e sem margem
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
