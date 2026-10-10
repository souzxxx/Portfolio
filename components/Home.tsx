import { Boot } from "@/components/os/Boot";
import { MenuBar } from "@/components/os/MenuBar";
import { Desktop } from "@/components/os/Desktop";
import { CutWordmark } from "@/components/ui/CutWordmark";
import { FeaturedShowcase } from "@/components/projects/FeaturedShowcase";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { AcademicTimeline } from "@/components/academic/AcademicTimeline";
import { StackMarquee } from "@/components/stack/StackMarquee";
import { About } from "@/components/about/About";
import { Footer } from "@/components/Footer";
import type { Lang } from "@/lib/i18n";
import { dict } from "@/lib/dict";
import { getProjects } from "@/lib/projects";
import { hrefHome, outro } from "@/lib/i18n";

/**
 * Home — a página inicial das DUAS línguas, escrita uma vez (as rotas "/" e
 * "/en" só passam `lang`).
 *
 * A PARTITURA — o souzxxx OS abre e o site editorial desliza por cima dele:
 *
 *   MESA     MenuBar (fixa, papel) + Desktop (carvão pontilhado, sticky)
 *   PAPEL    CutWordmark — a cortina que sobe sobre a mesa
 *   …        vitrine de projetos, formação, stack e contato
 *
 * O Boot (CSS puro) cobre a primeira visita da sessão e se recolhe sozinho.
 * Tudo depois da mesa vive em `relative z-10` com fundo próprio: é o que faz
 * as seções passarem POR CIMA da mesa presa, em vez de por trás dela.
 *
 * Este componente é de servidor: `lang` desce como prop, e os componentes de
 * cliente (MenuBar, Desktop) recebem só a fatia do dicionário que pintam.
 */
/** A ordem curada dos destaques — a mesma do menu da barra e do `ls` do terminal. */
const DESTAQUES = [
  "tecna-site",
  "financehub",
  "quintoandar-precificacao",
  "portal-tecna",
  "wraeclast",
  "commerce-nda",
  "sentinel",
];

export function Home({ lang }: { lang: Lang }) {
  const d = dict[lang];
  const todos = getProjects(lang);
  const destaques = DESTAQUES.flatMap((slug) => {
    const p = todos.find((x) => x.slug === slug);
    return p ? [{ slug: p.slug, name: p.name, apelido: slug.split("-")[0] }] : [];
  });

  return (
    <div id="top">
      <Boot d={d.os.boot} />
      <MenuBar
        lang={lang}
        nav={d.nav}
        os={d.os.menu}
        projetos={destaques}
        outroIdioma={hrefHome(outro(lang))}
      />
      <main>
        {/* A mesa fica presa no topo (sticky, só em tela larga e alta) enquanto
            o wordmark de papel sobe por cima dela, como uma cortina. O wrapper
            limita o sticky: passado o wordmark, a mesa vai embora com o scroll
            em vez de continuar renderizando atrás do site inteiro. */}
        <div className="relative">
          <Desktop lang={lang} hero={d.hero} os={d.os} projetos={destaques} />
          <div className="relative z-10">
            <CutWordmark />
          </div>
        </div>
        <div className="relative z-10">
          <FeaturedShowcase lang={lang} />
          <ProjectGrid lang={lang} />
          <AcademicTimeline lang={lang} />
          <StackMarquee lang={lang} />
          <About lang={lang} />
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
