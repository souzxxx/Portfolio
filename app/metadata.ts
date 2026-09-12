import type { Metadata, Viewport } from "next";

import { dict } from "@/lib/dict";
import {
  HTML_LANG,
  LANGS,
  OG_LOCALE,
  SITE_URL,
  hrefHome,
  prefixo,
  type Lang,
} from "@/lib/i18n";

/**
 * metadata — o <head> das duas línguas, montado de um molde só.
 *
 * O QUE MUDOU COM O ROUTE GROUP. Antes havia um layout-raiz e um `metadata`
 * literal dentro dele. Agora há DOIS layouts-raiz, e o `metadata` de cada um
 * precisa ser diferente em cinco campos (title, description, og:locale,
 * canonical e o `jobTitle` do JSON-LD) e IDÊNTICO em todo o resto. Copiar o
 * objeto para os dois arquivos deixaria o resto livre para divergir em
 * silêncio — e o campo que diverge em silêncio no `metadata` é sempre o que
 * ninguém vê na tela: um `twitter:card` que virou `summary` só no inglês, um
 * `metadataBase` esquecido que faz a og:image sair com URL relativa. Por isso
 * o molde é uma função e a língua é o único parâmetro.
 *
 * HREFLANG SÓ FUNCIONA SE FOR RECÍPROCO. O Google descarta o par quando a
 * outra página não aponta de volta — e "de volta" inclui apontar para SI
 * MESMA. Então `alternates.languages` lista as DUAS línguas nas DUAS páginas,
 * e não só a outra; `canonical` é o que distingue quem é quem. A tabela
 * `LINGUAS` abaixo é derivada de HTML_LANG e hrefHome de propósito: é o mesmo
 * par de valores que o <html lang> e o seletor do cabeçalho usam, e uma
 * terceira cópia escrita à mão aqui seria a que sairia errada quando a raiz
 * mudar de lugar.
 */
const LINGUAS: Record<string, string> = Object.fromEntries(
  LANGS.map((l) => [HTML_LANG[l], hrefHome(l)]),
);

/** O <head> da home de cada idioma. */
export function metadataDaHome(lang: Lang): Metadata {
  const m = dict[lang].meta;

  return {
    title: m.title,
    description: m.description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: hrefHome(lang),
      languages: LINGUAS,
    },
    openGraph: {
      title: m.title,
      description: m.shortDescription,
      type: "website",
      locale: OG_LOCALE[lang],
      siteName: "Leonardo Souza",
      url: hrefHome(lang),
    },
    twitter: {
      card: "summary_large_image",
      title: m.title,
      description: m.shortDescription,
    },
    authors: [{ name: "Leonardo Souza", url: "https://github.com/souzxxx" }],
    creator: "Leonardo Souza",
  };
}

/**
 * O <head> da rota de currículo de cada idioma (/cv e /en/cv).
 *
 * `noindex, nofollow` continua sendo a decisão: a página existe para o
 * Chromium de scripts/build-cv.ts imprimir em PDF, e um currículo indexado
 * concorreria com a home na busca pelo próprio nome do dono do site. Por ser
 * `noindex`, ela não declara `canonical` nem `hreflang` — o par recíproco de
 * uma página que não entra no índice não tem consumidor.
 */
export function metadataDoCv(lang: Lang): Metadata {
  const m = dict[lang].meta;

  return {
    title: m.cvTitle,
    description: m.cvDescription,
    robots: { index: false, follow: false },
  };
}

export const VIEWPORT: Viewport = {
  // Carvao de assinatura: e a primeira diferenca que aparece no celular, na
  // barra do navegador do Android, antes mesmo do primeiro scroll. E o MESMO
  // valor do `bg-carvao` do hero, entao a barra do sistema e o topo da pagina
  // leem como um campo continuo em vez de dois retangulos escuros diferentes.
  themeColor: "#1C1A17",
  width: "device-width",
  initialScale: 1,
};

/**
 * O JSON-LD de Person, nas duas línguas.
 *
 * Ele vai nos DOIS documentos porque o schema descreve a PÁGINA em que está, e
 * um crawler que só viu "/en" não leu o bloco de "/". Só o `jobTitle` muda de
 * língua: nome, endereço, `sameAs` e `knowsAbout` são nome próprio e não se
 * traduzem. O `url` aponta para a home DAQUELA língua, pelo mesmo motivo do
 * canonical.
 *
 * `knowsAbout` ganhou "Node.js" e ele entra logo depois de TypeScript, e não
 * no fim da lista: a ordem aqui é lida como ordem de relevância por quem
 * renderiza o cartão de conhecimento, e o runtime que sustenta metade dos
 * projetos não pode aparecer atrás de Redis.
 */
export function personJsonLd(lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Leonardo Souza",
    jobTitle: dict[lang].meta.jobTitle,
    url: `${SITE_URL}${prefixo(lang)}`,
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Insper",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "São Paulo",
      addressCountry: "BR",
    },
    knowsAbout: [
      "TypeScript",
      "Node.js",
      "Python",
      "Java",
      "Next.js",
      "React",
      "LLM",
      "pgvector",
      "FastAPI",
      "Spring Boot",
      "PostgreSQL",
      "Redis",
    ],
    sameAs: [
      "https://github.com/souzxxx",
      "https://www.linkedin.com/in/leonardo-souzx",
    ],
  };
}
