import type { Metadata } from "next";

import {
  HTML_LANG,
  LANGS,
  OG_LOCALE,
  hrefProjeto,
  type Lang,
} from "@/lib/i18n";
import { getProjects, projects } from "@/lib/projects";

/**
 * O <head> de uma página de case, nas duas línguas — o mesmo molde de
 * app/metadata.ts, só que por projeto.
 *
 * `alternates.languages` lista AS DUAS versões nas duas páginas (o hreflang só
 * vale recíproco, inclusive apontando para si mesma) e `canonical` diz quem é
 * quem. As URLs são relativas: o `metadataBase` vem do layout-raiz de cada
 * idioma. A og:image não é declarada aqui — sem `images`, a página herda a arte
 * do opengraph-image do grupo, que já é a do site.
 */
export function metadataDoCaso(lang: Lang, slug: string): Metadata {
  const p = getProjects(lang).find((x) => x.slug === slug);
  if (!p) return {};

  const title = `${p.name} — Leonardo Souza`;
  const url = hrefProjeto(lang, slug);

  return {
    title,
    description: p.tagline,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        LANGS.map((l) => [HTML_LANG[l], hrefProjeto(l, slug)]),
      ),
    },
    openGraph: {
      title,
      description: p.tagline,
      type: "article",
      locale: OG_LOCALE[lang],
      siteName: "Leonardo Souza",
      url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: p.tagline,
    },
  };
}

/** Todos os slugs — destaques e índice. É o generateStaticParams das duas rotas. */
export function slugsDosCasos(): { slug: string }[] {
  return projects.map((p) => ({ slug: p.slug }));
}
