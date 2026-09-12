import type { Trecho } from "./i18n";

/**
 * Dict — a FORMA do texto do site, sem nenhum texto dentro.
 *
 * Este arquivo é só o tipo. Os valores moram em lib/dict.pt.ts e lib/dict.en.ts
 * e são montados no fim DESTE arquivo, em `export const dict`. A separação
 * existe por uma razão de
 * manutenção: com `const pt: Dict` e `const en: Dict`, o compilador é quem
 * garante que as duas línguas têm exatamente as mesmas chaves — esquecer de
 * traduzir um rótulo vira erro de build, e não um "Baixar currículo" sobrando
 * no meio da página em inglês.
 *
 * O QUE NÃO ENTRA AQUI: nome próprio. "Insper", "FinanceHub", "pgvector",
 * "Spring Boot", "Leonardo Souza" e o nome de cada tecnologia são idênticos nos
 * dois idiomas, e duplicá-los criaria um lugar onde os dois arquivos podem
 * discordar sobre como a coisa se chama. Pelo mesmo motivo, o número da seção
 * viaja DENTRO do `eyebrow` ("#02 · TRABALHO SELECIONADO" / "#02 · SELECTED
 * WORK"): a numeração é a mesma, mas quebrá-la em dois campos só para
 * reconstruí-la no componente não economiza nada e abre espaço para as duas
 * línguas saírem com números diferentes.
 *
 * As setas (↗ ↓) fazem parte do rótulo e viajam com ele — são o vocabulário de
 * CTA do site (ver components/ui/Botao.tsx), não ícone de biblioteca.
 */

export interface NavLink {
  /** Âncora na própria página — igual nos dois idiomas. */
  href: string;
  label: string;
}

export interface Dict {
  /** <title>, <meta>, Open Graph e o JSON-LD de Person. */
  meta: {
    title: string;
    /** A descrição longa do <meta name="description">. */
    description: string;
    /** A curta, usada em Open Graph e Twitter card. */
    shortDescription: string;
    /** `jobTitle` do JSON-LD. */
    jobTitle: string;
    /** Título da rota /cv (documento de impressão). */
    cvTitle: string;
    cvDescription: string;
    /**
     * As três strings da ARTE do Open Graph (app/opengraph-image.tsx) — o
     * quadro que o LinkedIn, o WhatsApp e o Slack mostram antes de alguém
     * abrir o site.
     *
     * Elas não reaproveitam `shortDescription`: a arte é composta em três
     * faixas de larguras diferentes, e satori não quebra linha como o
     * navegador. Uma frase longa demais em `ogStack` estoura a caixa em
     * silêncio — não há erro, o texto só sai cortado no preview que o
     * recrutador vê. Por isso são campos próprios, curtos por contrato.
     */
    ogSelo: string;
    ogStack: string;
    /** `alt` da imagem de Open Graph. */
    ogAlt: string;
  };

  nav: {
    /** aria-label da <nav> do cabeçalho. */
    principal: string;
    /** aria-label da <nav> da barra sticky. */
    atalhos: string;
    links: NavLink[];
    /** O único atalho que cabe na barra sticky do celular. */
    contatoCurto: string;
    voltarAoTopo: string;
    /** aria-label do grupo do seletor de idioma. */
    idioma: string;
    /** aria-label do link que leva ao OUTRO idioma. */
    trocarIdioma: string;
    /** aria-label do link do idioma que já está ativo. */
    idiomaAtual: string;
  };

  hero: {
    /** Selo de capa: 3 itens de metadado. */
    selo: string[];
    /** As duas linhas do <h1>. Quebra decidida, nunca herdada do wrap. */
    nome: [string, string];
    /** Subtítulo em caixa alta com tracking de 0.32em. */
    subtitulo: string;
    /** Linha de formação: 4 itens de metadado. */
    formacao: string[];
    /** O parágrafo de abertura, com ênfase por trecho. */
    prosa: Trecho[];
    cta: {
      projetos: string;
      github: string;
      linkedin: string;
      email: string;
      curriculo: string;
    };
    /** Os quatro rótulos sob os números. */
    stats: {
      partidas: string;
      testes: string;
      modulos: string;
      servicos: string;
    };
    terminal: {
      /** Rótulo da coluna esquerda da barra de comando. */
      rotulo: string;
      copiar: string;
      copiado: string;
    };
  };

  secoes: {
    destaques: Secao;
    indice: Secao;
    academico: Secao;
    stack: Secao;
  };

  /** Rótulos que aparecem dentro de um card de projeto em destaque. */
  card: {
    build: string;
    ano: string;
    repoPrivado: string;
    repositorioPrivado: string;
    decisao: string;
    stack: string;
    verNoAr: string;
    codigo: string;
    arquitetura: string;
    /** Sufixo do alt de uma capa sem legenda: "Nome — captura de tela". */
    capturaDeTela: string;
  };

  /** A lupa: o diálogo que amplia a chapa de um projeto. */
  lupa: {
    /** Afordância na legenda da chapa, em caixa alta. */
    ampliar: string;
    /** aria-label do botão que abre: "Ampliar: {legenda}". */
    ampliarAria: string;
    /** aria-label do <dialog>. */
    titulo: string;
    fechar: string;
    anterior: string;
    proxima: string;
    /** Separador do contador: "02 / 04" usa "/", mas em aria vira "02 de 04". */
    de: string;
  };

  /** NO AR · ENTREGUE · EM CURSO. */
  status: {
    deployed: string;
    shipped: string;
    wip: string;
    /** Prefixo do rótulo no índice mobile: "STATUS:". */
    prefixo: string;
  };

  /** Títulos de coluna da tabela de tecnologias. */
  categorias: {
    language: string;
    frontend: string;
    backend: string;
    ml: string;
    infra: string;
  };

  sobre: {
    selo: string[];
    titulo: string;
    prosa: Trecho[];
    contatos: {
      email: string;
      github: string;
      linkedin: string;
    };
    cta: string;
  };

  rodape: {
    /** Rótulo do link de e-mail (GitHub e LinkedIn vão pelo próprio endereço). */
    email: string;
    /** A linha técnica da direita. */
    tecnica: string[];
  };
}

export interface Secao {
  eyebrow: string;
  title: string;
  description: string;
}

/**
 * O dicionário montado. Este é o ÚNICO import que os componentes fazem:
 *
 *   import { dict } from "@/lib/dict";
 *   const d = dict[lang];
 *
 * O import de valor aqui embaixo e o `import type` lá em cima formam um ciclo
 * apenas APARENTE: `import type` é apagado na compilação, então em tempo de
 * execução a aresta existe só num sentido (dict.ts → dict.pt.ts). Não há ciclo
 * de módulo para o bundler resolver.
 *
 * O tipo `Record<Lang, Dict>` é o guard de tradução do projeto: com `pt` e `en`
 * anotados como `Dict`, esquecer uma chave em um dos idiomas vira erro de
 * compilação, e não um rótulo em português sobrando no meio da página inglesa.
 */
import { pt } from "./dict.pt";
import { en } from "./dict.en";
import type { Lang } from "./i18n";

export const dict: Record<Lang, Dict> = { pt, en };

/**
 * AS FATIAS QUE ATRAVESSAM A FRONTEIRA SERVIDOR→CLIENTE.
 *
 * Um componente de CLIENTE nunca deve `import { dict }`. O import puxa o módulo
 * inteiro para o grafo do cliente, e o módulo contém as DUAS línguas: medido no
 * build, isso somava um chunk de 33 kB no caminho crítico de "/" e de "/en", do
 * qual metade é texto que aquela página nunca vai pintar. É o mesmo defeito que
 * fez a Geist Mono sair do `<head>` (71 kB de preload para não desenhar um
 * glifo) — só que em vez de uma fonte, é o site inteiro escrito duas vezes.
 *
 * A regra, então: quem é de cliente RECEBE a fatia de que precisa, já resolvida
 * no idioma da rota, como prop. O que cruza a rede passa a ser o pedaço de
 * texto que a tela de fato usa, em uma língua só, dentro do payload do RSC —
 * e não um módulo com as duas.
 *
 * `DictCard` é a fatia do <FeaturedCard>: ele mesmo (`card`), o diálogo que ele
 * abre (`lupa`) e o selo de estado que ele renderiza (`status`).
 */
export type DictCard = Pick<Dict, "card" | "lupa" | "status">;
