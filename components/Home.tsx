import { NavBar } from "@/components/nav/NavBar";
import { Hero } from "@/components/hero/Hero";
import { CutWordmark } from "@/components/ui/CutWordmark";
import { FeaturedShowcase } from "@/components/projects/FeaturedShowcase";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { AcademicTimeline } from "@/components/academic/AcademicTimeline";
import { StackMarquee } from "@/components/stack/StackMarquee";
import { About } from "@/components/about/About";
import { Footer } from "@/components/Footer";
import type { Lang } from "@/lib/i18n";
import { dict } from "@/lib/dict";

/**
 * Home — a página inicial das DUAS línguas, escrita uma vez.
 *
 * POR QUE ELA SAIU DE app/page.tsx. Com route group por idioma existem duas
 * rotas de home (app/(pt)/page.tsx para "/" e app/(en)/en/page.tsx para
 * "/en"), e as duas montam exatamente os mesmos nove blocos na mesma ordem.
 * Se a ordem morasse nas rotas, ela existiria em dois arquivos — e a partitura
 * de cor abaixo é justamente o tipo de regra que quebra sem ninguém notar:
 * quem acrescentar uma seção nova vai editar a rota que estava aberta, e o
 * outro idioma sai com dois campos escuros encostados. Aqui a ordem é uma só e
 * a língua é um parâmetro.
 *
 * ESTE COMPONENTE É DE SERVIDOR, e continua sendo depois de bilíngue: `lang`
 * chega como prop da rota e desce como prop. Nenhum bloco precisou virar
 * `"use client"` por causa do idioma — que é a razão inteira de o idioma ser
 * rota e não estado (ver o cabeçalho de lib/i18n.ts).
 *
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
 *
 * O `id="top"` é a âncora do "voltar ao topo" do rodapé e NÃO muda de língua:
 * ele é endereço, não texto (ver a nota dos `href` em lib/dict.pt.ts).
 */
export function Home({ lang }: { lang: Lang }) {
  const d = dict[lang];
  return (
    <div id="top">
      <NavBar lang={lang} d={d.nav} />
      <main>
        <Hero lang={lang} d={d.hero} />
        <CutWordmark />
        <FeaturedShowcase lang={lang} />
        <ProjectGrid lang={lang} />
        <AcademicTimeline lang={lang} />
        <StackMarquee lang={lang} />
        <About lang={lang} />
      </main>
      <Footer lang={lang} />
    </div>
  );
}
