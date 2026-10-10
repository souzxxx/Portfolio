import type { MetadataRoute } from "next";

import { HTML_LANG, LANGS, SITE_URL, hrefProjeto, prefixo } from "@/lib/i18n";
import { projects } from "@/lib/projects";

/**
 * sitemap — as DUAS homes e as páginas de case, cada uma declarando as duas
 * línguas.
 *
 * POR QUE AS DUAS ENTRADAS REPETEM A MESMA TABELA DE `alternates`. O protocolo
 * de sitemap quer o conjunto completo de versões em CADA <url>: quem lê a
 * entrada de "/en" precisa descobrir dali que existe "/", sem ter que casar as
 * duas entradas por conta própria. É a mesma reciprocidade do `hreflang` do
 * <head> (ver app/metadata.ts) — inclusive apontando para si mesma.
 *
 * /cv e /en/cv NÃO entram: são `noindex` (são a fonte dos dois PDFs,
 * não páginas de leitura), e listar no sitemap uma URL que o próprio <head>
 * manda não indexar é mandar dois sinais contrários para o mesmo crawler.
 *
 * A URL é montada com `prefixo()`, e não com `hrefHome()`, por um detalhe de
 * formato: `hrefHome("pt")` é "/", o que daria "https://…/" com barra no fim —
 * um endereço DIFERENTE do canonical que o <head> publica ("https://…"), e
 * sitemap que discorda do canonical é sinal contraditório. `prefixo("pt")` é
 * "", então as duas linhas saem exatamente como o canonical.
 *
 * As URLs são absolutas porque o sitemap é servido cru, sem passar pelo
 * `metadataBase` que resolve as relativas do `metadata` dos layouts.
 */
const LINGUAS: Record<string, string> = Object.fromEntries(
  LANGS.map((lang) => [HTML_LANG[lang], `${SITE_URL}${prefixo(lang)}`]),
);

export default function sitemap(): MetadataRoute.Sitemap {
  // Uma única leitura do relógio para as duas linhas: com `new Date()` dentro
  // do map, as duas homes sairiam com `lastmod` de milissegundos diferentes.
  const lastModified = new Date();

  const homes = LANGS.map((lang) => ({
    url: `${SITE_URL}${prefixo(lang)}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 1,
    alternates: { languages: LINGUAS },
  }));

  // As páginas de case: cada projeto nas duas línguas, e cada entrada com a
  // tabela completa das duas versões — a mesma reciprocidade das homes.
  const casos = projects.flatMap((p) => {
    const linguas = Object.fromEntries(
      LANGS.map((l) => [HTML_LANG[l], `${SITE_URL}${hrefProjeto(l, p.slug)}`]),
    );
    return LANGS.map((lang) => ({
      url: `${SITE_URL}${hrefProjeto(lang, p.slug)}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: p.category === "featured" ? 0.8 : 0.5,
      alternates: { languages: linguas },
    }));
  });

  return [...homes, ...casos];
}
