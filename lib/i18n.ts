/**
 * i18n — o contrato de idioma do site. DUAS línguas, e nada de biblioteca.
 *
 * A decisão de arquitetura, em uma frase: **cada idioma é uma ROTA, não um
 * estado de cliente**.
 *
 *   pt → "/"      (raiz, canônica, a que já estava publicada)
 *   en → "/en"
 *
 * POR QUE ROTA E NÃO UM BOTÃO COM useState. Um seletor de idioma em estado de
 * cliente obrigaria TODO componente que pinta texto a virar `"use client"` —
 * ou seja, a home inteira, incluindo <Chapa>, <ProjectGrid> (14 miniaturas) e
 * os cinco <SectionHeader>. Este portfólio gastou uma wave inteira tirando
 * JavaScript da página; devolvê-lo para trocar um rótulo seria pagar o preço
 * mais caro do site pela feature mais barata. Em rota, o seletor é um <a>: zero
 * byte de JS, zero estado, zero hidratação — e o idioma ganha URL, o que
 * significa link compartilhável, `hreflang` de verdade e `<html lang>` correto
 * no HTML do servidor (que é o que o leitor de tela e o crawler leem, não o
 * que o React resolve depois).
 *
 * COMO O `<html lang>` TROCA. O App Router só deixa a raiz da árvore renderizar
 * <html>, então cada idioma tem o SEU layout-raiz, separados por route group:
 * app/(pt)/layout.tsx serve "/" com lang="pt-BR" e app/(en)/layout.tsx serve
 * "/en" com lang="en". Route group não entra na URL, então "/" continua "/".
 * O efeito colateral é desejável: trocar de idioma faz navegação de documento
 * inteiro, e não client-side nav — o documento novo já nasce com o `lang` certo.
 *
 * CONTEÚDO. Nada de arquivo espelho por idioma (lib/projects.pt.ts +
 * lib/projects.en.ts): duas listas paralelas divergem no primeiro projeto novo,
 * e o campo que divergir em silêncio é sempre o que não é texto — um `cover`,
 * um `slug`, um link. Aqui o dado tem UMA estrutura só e apenas os campos de
 * PROSA são bilíngues, pelo tipo `I18n<T>` abaixo. `pick()` achata a estrutura
 * no idioma pedido antes de ela chegar ao componente, então nenhum componente
 * de conteúdo precisa saber que existe um segundo idioma.
 */

export type Lang = "pt" | "en";

/** As duas línguas, na ordem em que aparecem no seletor do cabeçalho. */
export const LANGS: readonly Lang[] = ["pt", "en"] as const;

/**
 * Um valor que existe nos dois idiomas. Use SÓ em prosa.
 *
 * Nome próprio não entra aqui: "FinanceHub", "Insper", "pgvector", "Spring
 * Boot" e o nome de cada tecnologia são os mesmos nos dois idiomas, e
 * duplicá-los criaria um lugar onde os dois arquivos podem discordar sobre
 * como a coisa se chama.
 */
export type I18n<T = string> = { pt: T; en: T };

/** Achata um `I18n<T>` no idioma pedido. */
export function pick<T>(valor: I18n<T>, lang: Lang): T {
  return valor[lang];
}

/**
 * Prosa com ênfase. O parágrafo do hero e o do <About> têm trechos
 * sublinhados no meio da frase, e a ênfase NÃO cai no mesmo lugar nas duas
 * línguas — em inglês "vector search with pgvector" é um sintagma só onde o
 * português precisa de "busca vetorial com pgvector" mais a oração que a
 * explica. Guardar o parágrafo como string com HTML embutido obrigaria
 * `dangerouslySetInnerHTML`; guardar como lista de trechos deixa o React
 * montar os <span> e mantém a marcação sob o controle do componente.
 *
 *   "texto normal"      → trecho sem ênfase
 *   { em: "texto" }     → trecho com a ênfase do bloco (peso + sublinhado 1px)
 */
export type Trecho = string | { em: string };

/** O OUTRO idioma — o que o seletor do cabeçalho oferece. */
export function outro(lang: Lang): Lang {
  return lang === "pt" ? "en" : "pt";
}

/** Home de cada idioma. É o href do seletor e a âncora do "voltar ao topo". */
export function hrefHome(lang: Lang): string {
  return lang === "pt" ? "/" : "/en";
}

/**
 * Prefixo de rota do idioma — "" para o português (que mora na raiz) e "/en"
 * para o inglês. Use para montar rota interna: `${prefixo(lang)}/cv`.
 */
export function prefixo(lang: Lang): string {
  return lang === "pt" ? "" : "/en";
}

/**
 * O PDF do currículo de cada idioma. São dois arquivos versionados em public/,
 * gerados por `npm run cv` a partir das rotas /cv e /en/cv — e os dois são
 * obrigatórios no prebuild (scripts/check-assets.ts), porque um CTA de
 * currículo que baixa 404 é pior que CTA nenhum.
 */
export const CV_PDF: Record<Lang, string> = {
  pt: "/leonardo-souza-cv.pdf",
  en: "/leonardo-souza-cv-en.pdf",
};

/** `lang`/`hreflang` do documento, no formato que HTML e Google esperam. */
export const HTML_LANG: Record<Lang, string> = {
  pt: "pt-BR",
  en: "en",
};

/** `og:locale`. */
export const OG_LOCALE: Record<Lang, string> = {
  pt: "pt_BR",
  en: "en_US",
};

/** Rótulo do seletor de idioma. Sempre as duas siglas, nunca bandeira. */
export const LANG_LABEL: Record<Lang, string> = {
  pt: "PT",
  en: "EN",
};

export const SITE_URL = "https://portfolio-souzxxxs-projects.vercel.app";
