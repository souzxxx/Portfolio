import { Fragment } from "react";
import clsx from "clsx";
import { Bloco } from "../ui/Bloco";
import { Botao } from "../ui/Botao";
import { Meta } from "../ui/Meta";
import { Reveal } from "../ui/Reveal";
import { SerifDisplay } from "../ui/SerifDisplay";
import { dict, type Dict } from "@/lib/dict";
import { CV_PDF, type Lang } from "@/lib/i18n";

/**
 * About — o bloco de CONTATO, o ultimo campo CARVAO do site.
 *
 * E aqui que vive o UNICO acento cromatico do portfolio inteiro (o CTA de
 * curriculo, em dourado), e e aqui por razao medida, nao por gosto: gold
 * #D4A017 sobre cream #F5F3EE da 2.14:1 (reprova ate o minimo 3:1 de
 * componente da 1.4.11), enquanto sobre carvao #1C1A17 da 7.31:1 nos dois
 * sentidos. O dourado so existe porque existe um fundo carvao para segura-lo —
 * ele nunca toca papel, em lugar nenhum do site.
 *
 * Sem server-side state e sem hook nenhum: componente de servidor. O unico
 * pedaco de cliente que entra e o <Reveal>, que ja e "use client" por conta
 * propria — o resto vai como HTML, e o bundle da home nao cresce. O idioma
 * entra por PROP (`lang`), nunca por estado: e exatamente o que impede este
 * arquivo de virar `"use client"` so para trocar cinco rotulos.
 *
 * O QUE E BILINGUE E O QUE NAO E, nesta secao. O ROTULO da linha de contato
 * traduz ("E-mail" / "Email") e vem de `dict[lang].sobre.contatos`; o VALOR
 * (o endereco de e-mail, o usuario do GitHub, a URL do LinkedIn) e o MESMO nos
 * dois idiomas e por isso continua cravado aqui embaixo. Duplicar um endereco
 * no dicionario criaria um lugar onde as duas linguas podem discordar sobre
 * para onde o link aponta — e um link que diverge em silencio e o pior tipo de
 * bug de traducao, porque a pagina continua bonita.
 *
 * O feedback de interacao das linhas de contato e UM so: a linha inteira
 * inverte creme<->carvao. Sem icone, sem seta que desliza, sem sombra.
 */

type Contato = {
  /**
   * A chave do rotulo no dicionario. E `keyof` de proposito: acrescentar uma
   * linha de contato aqui sem acrescentar o rotulo nos DOIS idiomas vira erro
   * de compilacao, e nao uma linha com o rotulo em branco na tela.
   */
  chave: keyof Dict["sobre"]["contatos"];
  valor: string;
  href: string;
  externo?: boolean;
};

const CONTATOS: Contato[] = [
  {
    chave: "email",
    valor: "leonardosouzasilva9@gmail.com",
    href: "mailto:leonardosouzasilva9@gmail.com",
  },
  {
    chave: "github",
    valor: "github.com/souzxxx",
    href: "https://github.com/souzxxx",
    externo: true,
  },
  {
    chave: "linkedin",
    valor: "linkedin.com/in/leonardo-souzx",
    href: "https://www.linkedin.com/in/leonardo-souzx",
    externo: true,
  },
];

// Enfase dentro da prosa: peso + sublinhado fino de 1px em creme a 45%. Sobre
// carvao a unica cor disponivel para enfase seria o dourado, que e exclusivo do
// CTA — entao a enfase aqui e desenhada, nao colorida.
const enfase =
  "font-medium underline decoration-cream/45 decoration-[1px] underline-offset-4";

export function About({ lang }: { lang: Lang }) {
  const d = dict[lang];

  return (
    <Bloco ground="carvao" id="about">
      <div className="mx-auto max-w-[72rem]">
        <Reveal>
          <Meta items={d.sobre.selo} className="text-cream-700" />
        </Reveal>

        <Reveal delay={0.05}>
          <SerifDisplay
            as="h2"
            className="mt-6 text-balance text-d2 text-cream"
          >
            {d.sobre.titulo}
          </SerifDisplay>
        </Reveal>

        <Reveal delay={0.1}>
          {/* O paragrafo chega como LISTA DE TRECHOS, nao como string com HTML
              embutido: a enfase nao cai no mesmo lugar nas duas linguas (em
              ingles "measure than assume" e um sintagma so onde o portugues
              separa "medir" de "a supor"), e uma string com <span> dentro
              exigiria `dangerouslySetInnerHTML` — ou seja, abriria injecao de
              marcacao num arquivo de texto so para sublinhar tres palavras.
              Aqui o React monta os <span> e a marcacao fica sob controle deste
              componente.

              O trecho sem enfase sai em <Fragment> e nao em <span>: ele nao
              precisa de caixa nenhuma, e um <span> a mais por trecho seria
              cinco nos de DOM por paragrafo sem nada pendurado neles. A
              pontuacao e os espacos viajam DENTRO dos trechos do dicionario,
              entao concatenar a lista devolve o paragrafo inteiro sem que o
              componente precise inventar separador. */}
          <p className="medida mt-10 font-sans text-lead text-cream">
            {d.sobre.prosa.map((trecho, i) =>
              typeof trecho === "string" ? (
                <Fragment key={i}>{trecho}</Fragment>
              ) : (
                <span key={i} className={enfase}>
                  {trecho.em}
                </span>
              ),
            )}
          </p>
        </Reveal>

        <Reveal delay={0.16}>
          {/* O tracejado mora na <li>, nao na <a>: assim a linha invertida nao
              come a propria borda de cima quando o fundo vira creme. */}
          <ul className="mt-14 border-b border-dashed border-cream/25">
            {CONTATOS.map((c) => (
              <li
                key={c.chave}
                className="border-t border-dashed border-cream/25"
              >
                <a
                  href={c.href}
                  target={c.externo ? "_blank" : undefined}
                  rel={c.externo ? "noreferrer" : undefined}
                  className={clsx(
                    "group grid grid-cols-[minmax(0,1fr)_1.5rem] items-baseline gap-x-3 gap-y-1 py-4",
                    "md:grid-cols-[6.5rem_minmax(0,1fr)_1.5rem] md:gap-y-0",
                    "hover:bg-cream hover:text-carvao focus-visible:bg-cream focus-visible:text-carvao",
                    // O anel global e `currentColor`; com a linha invertida a
                    // cor de texto vira carvao e o anel — desenhado 2px FORA da
                    // caixa, ja sobre o bloco carvao — ficaria carvao sobre
                    // carvao. Forcar creme devolve 15.66:1 ao anel sem tocar a
                    // inversao, que continua sendo o feedback principal.
                    "focus-visible:outline-cream",
                    "md:-mx-4 md:px-4",
                    "motion-safe:transition-colors motion-safe:duration-150",
                  )}
                >
                  <span className="font-mono text-tag uppercase text-cream-700 group-hover:text-ink-700 group-focus-visible:text-ink-700 md:col-start-1 md:row-start-1">
                    {d.sobre.contatos[c.chave]}
                  </span>
                  <span
                    aria-hidden
                    className="justify-self-end font-mono text-tag md:col-start-3 md:row-start-1"
                  >
                    ↗
                  </span>
                  <span className="col-span-2 break-all font-mono text-body md:col-span-1 md:col-start-2 md:row-start-1">
                    {c.valor}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.22}>
          {/* `grid` no mobile faz o <a> do Botao esticar para 100% da largura
              (item de grade estica por padrao); `md:block` devolve a caixa ao
              tamanho do conteudo. O `className` do Botao chega no <span> do
              rotulo, entao a largura precisa vir daqui.

              O variante arbitrario `[&>a:focus-visible]` tambem so pode vir
              daqui, e conserta um furo REAL de acessibilidade medido no
              navegador: o anel de foco global e `outline: 2px solid
              currentColor`, e no CTA dourado `currentColor` e #1C1A17 — a
              MESMA cor do bloco onde o anel e desenhado (offset 2px, ou seja,
              fora do dourado). Resultado medido: anel carvao sobre carvao,
              1:1, invisivel no teclado, justo no unico CTA principal do site.
              Creme devolve 15.66:1. A regra global usa `:where()`, entao
              especificidade 0 — esta utility ganha sem `!important`.

              O `href` vem de `CV_PDF[lang]`: sao DOIS PDFs versionados em
              public/, um por idioma, e o prebuild (scripts/check-assets.ts)
              exige os dois — um CTA de curriculo que baixa 404 e pior que CTA
              nenhum. Cravar o caminho aqui faria /en baixar o curriculo em
              portugues, que e o erro silencioso classico deste tipo de botao:
              o clique funciona, o download acontece, e o arquivo esta na
              lingua errada. */}
          <div className="mt-12 grid [&>a:focus-visible]:outline-cream md:block">
            <Botao
              href={CV_PDF[lang]}
              download
              variant="gold"
              className="w-full justify-center md:w-auto"
            >
              {d.sobre.cta}
            </Botao>
          </div>
        </Reveal>
      </div>
    </Bloco>
  );
}
