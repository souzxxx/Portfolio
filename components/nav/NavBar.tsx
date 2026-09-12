"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { DashedRule } from "../ui/DashedRule";
import type { Dict } from "@/lib/dict";
import { HTML_LANG, LANGS, LANG_LABEL, hrefHome, outro } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

/**
 * NavBar — TRES pecas, e nada mais.
 *
 * 1) CABECALHO EM FLUXO que pinta o PROPRIO campo carvao. `app/page.tsx`
 *    renderiza <NavBar /> como irmao imediatamente acima de <Hero />, e o Hero
 *    tambem pinta `bg-carvao`: os dois leem como um campo continuo, sem costura,
 *    e nenhum dos dois precisa saber a altura do outro. Por isso o carvao mora
 *    aqui dentro (`block-carvao`) e nao num wrapper da pagina.
 *
 * 2) BARRA STICKY DE 44px que so aparece DEPOIS do hero. Solida (`bg-carvao`,
 *    o MESMO escuro do cabecalho — nao existe um segundo escuro no site), sem
 *    `backdrop-filter`: filtro de fundo em elemento `position: fixed` e a causa
 *    do jank de scroll no iOS Safari que a auditoria reportou. Altura FIXA em
 *    qualquer viewport e transicao so de `transform` — zero layout shift quando
 *    ela entra.
 *
 * 3) SELETOR DE IDIOMA — DOIS <a> DE VERDADE, NUNCA UM BOTAO COM ESTADO.
 *
 *    Idioma neste site e ROTA, nao estado de cliente: "/" serve o portugues e
 *    "/en" serve o ingles (o contrato inteiro esta em lib/i18n.ts). O seletor
 *    e a consequencia direta dessa decisao — dois links, `href` + `hrefLang`,
 *    sem `onClick`, sem `useState`: trocar de idioma e NAVEGAR.
 *
 *    POR QUE NAO UM BOTAO COM `useState`. O custo nao e o botao, e o que o
 *    estado arrasta atras dele. Um idioma guardado no cliente obrigaria TODO
 *    componente que pinta texto a virar `"use client"` — ou seja, a home
 *    inteira: <Chapa>, as 14 miniaturas do <ProjectGrid> e os cinco
 *    <SectionHeader>. Este portfolio gastou uma wave inteira TIRANDO
 *    JavaScript da pagina; devolve-lo para trocar um rotulo seria pagar o
 *    preco mais caro do site pela feature mais barata. Em rota o seletor custa
 *    zero byte de JS e zero hidratacao, e ainda ganha tres coisas que estado
 *    nenhum da: URL compartilhavel, `hreflang` que o crawler entende, e o
 *    `<html lang>` certo ja no HTML que sai do servidor — que e o que o leitor
 *    de tela pronuncia, e nao o que o React resolve depois.
 *
 *    (Este arquivo JA e `"use client"`, por causa do listener de scroll da
 *    barra sticky — entao o estado ate caberia aqui dentro. Nao e o ponto: ele
 *    teria de SUBIR ate a pagina para alcancar o resto do texto, e e a pagina
 *    que nao pode virar cliente.)
 *
 * Nenhum icone, nenhuma pilula, nenhum blur, nenhum gradiente: a hierarquia vem
 * de caixa alta + tracking + um filete tracejado, como numa folha de rosto.
 */

/**
 * O vestuario comum dos tres links de idioma (PT e EN no cabecalho, o link
 * unico do OUTRO idioma na barra sticky). Mora fora do componente porque a
 * regra que ele carrega e sistematica e nao pode divergir entre as duas barras:
 *
 * - A INVERSAO (`bg-cream text-carvao`, 15.66:1) e o vocabulario de
 *   "selecionado" que o site ja usa no hover do wordmark. O idioma ativo vive
 *   invertido; o inativo INVERTE no hover e no foco — ou seja, o hover mostra
 *   exatamente como a coisa vai ficar depois de clicada, que e a unica coisa
 *   que um seletor de idioma precisa prometer.
 * - `focus-visible:outline-cream` NAO e decoracao: o anel global e
 *   `2px solid currentColor` (globals.css) e aqui o `currentColor` no foco e
 *   carvao — o anel sairia carvao sobre carvao, 1:1, invisivel. Todo elemento
 *   que inverte o fundo no foco precisa fixar o anel na cor do BLOCO.
 * - O `-mx-2` do link e o `px-2` da tinta fazem a caixa creme nascer 8px alem
 *   do glifo sem deslocar o alinhamento do gutter, igual ao `-mx-1 px-1` do
 *   wordmark. Os dois moram em elementos diferentes de proposito: ver a nota de
 *   `tintaIdioma`.
 * - O `aria-label` de cada link COMECA pela sigla que esta desenhada nele
 *   ("PT — ...", "EN — ..."). Ver a nota do `rotuloIdioma` logo abaixo: nao e
 *   redundancia, e o que faz comando de voz funcionar.
 */
const linkIdioma =
  "-mx-2 font-mono text-tag uppercase focus-visible:outline-cream";

/**
 * A TINTA do seletor mora num <span> DENTRO do link, e nao no proprio <a>.
 *
 * A razao e medida. Com a caixa creme pintada no <a>, ela herdava o padding que
 * existe para o DEDO — e o alvo de toque e alto (44px) sem ser largo (33px,
 * pelo tamanho de uma sigla de duas letras). O resultado renderizado era um
 * retangulo de 33.2 x 44.3: mais ALTO que largo, dentro de um cabecalho onde
 * tudo o mais e uma linha de texto de 17px. Na tela isso nao lia como "rotulo
 * selecionado", lia como uma aba solta encostada na borda direita — a unica
 * forma vertical de uma peca inteiramente horizontal.
 *
 * Separando os dois, cada um fica com o tamanho certo do seu proprio problema:
 *   · o <a> continua com 44px de altura de toque, e agora transparente;
 *   · o <span> pinta 33.2 x 22.3 (14.3px de linha + 4px em cima e embaixo), que e
 *     a mesma proporcao horizontal do resto do cabecalho e a mesma leitura da
 *     inversao do wordmark ao lado.
 * Nenhum pixel de area clicavel foi perdido: o que mudou foi so onde a cor cai.
 *
 * Em elemento inline o padding vertical nao mexe na altura da LINHA, mas conta
 * para o hit-test e para o fundo — e e por isso que os dois papeis cabem em
 * dois elementos empilhados sem o cabecalho crescer um pixel.
 *
 * CONSEQUENCIA QUE CUSTOU UMA MEDIDA: pela mesma regra, o padding do <span> NAO
 * levanta a caixa do <a> que o contem. Chegar aos 44px de toque com 11px de
 * padding no link, contando com os 4px da tinta, da 36.3 — medido. O link
 * precisa dos 15px inteiros por conta propria, e a tinta e um segundo desenho
 * por cima, nao uma parcela da soma.
 */
const tintaIdioma =
  "px-2 py-1 motion-safe:transition-colors motion-safe:duration-150";

/**
 * ALVO DE TOQUE do cabecalho, no eixo VERTICAL: 15px de padding em cima e
 * embaixo, nao 12px. A linha do `text-tag` mede 14px (11px x 1.3), entao
 * (44 - 14) / 2 = 15 e o numero que fecha os 44px de ALTURA de toque no
 * celular — onde este seletor e visivel mesmo com o indice de links recolhido.
 * O `-my-[15px]` devolve os mesmos 15px em margem negativa: o alvo cresce, a
 * altura da linha do cabecalho nao muda um pixel, e o alinhamento por baseline
 * continua valendo porque padding e margem se cancelam antes de o flex medir a
 * distancia do topo ate a baseline.
 *
 * A LARGURA NAO CHEGA A 44, E ISSO E DELIBERADO. Medido em 390px: o alvo sai
 * 33.2 x 44. A sigla em `text-tag` da ~17px de glifo e o `px-2` da tinta
 * acrescenta 16px — faltam 10.8px para o quadrado de 44. Comprar esses 10.8px
 * custaria `px-[13.5px]`, e ai a caixa creme invadiria o separador "·" ao lado,
 * que so tem `px-3` (12px) de folga de cada lado: o retangulo invertido
 * encostaria no ponto, que e justamente o que faz "PT · EN" ler como UM par e
 * nao como dois botoes. Alargar os dois exigiria abrir tambem o separador, ou
 * seja, redesenhar o ritmo horizontal do cabecalho para ganhar 10px de dedo.
 *
 * O que fica no lugar: os 33.2px tem 14.6px de espaco livre ate a caixa do
 * vizinho (o "·" e inerte, nao e alvo), entao a mira errada nao dispara a acao
 * errada — ela nao dispara nada. Isso passa o 2.5.8 (24px + espacamento) e
 * fica abaixo do 2.5.5 (44px), que e AAA. Se o teto de 44 no eixo horizontal
 * virar requisito, o lugar da mudanca e o `px-3` do separador, nao este `py`.
 */
const alvoCabecalho = "-my-[15px] py-[15px]";

/**
 * O NOME ACESSIVEL DE UM LINK DE IDIOMA COMECA PELA SIGLA DESENHADA NELE.
 *
 * O dicionario descreve o DESTINO em prosa ("Ver em inglês", "View in
 * Portuguese", "Português (idioma atual)"), que e o que um leitor de tela
 * precisa: "EN" sozinho nao diz para onde o link leva. Mas usar so a prosa como
 * `aria-label` quebra o 2.5.3 (Label in Name, nivel A), e a quebra foi contada,
 * nao suposta — em cinco dos seis links do site o rotulo VISTO nao aparece
 * dentro do nome LIDO:
 *
 *   "PT" x "Português (idioma atual)"   — nao contem "pt"
 *   "EN" x "Ver em inglês"              — nao contem "en"
 *   "PT" x "View in Portuguese"         — nao contem "pt"
 *   "EN" x "English (current language)" — contem, por acidente de "English"
 *
 * Quem paga essa conta e o usuario de comando de voz: ele fala o que LE na
 * tela ("clique em PT") e o navegador procura esse texto no nome acessivel.
 * Sem casar, o controle simplesmente nao existe para ele — e num seletor de
 * idioma isso tranca a pessoa na lingua em que ela caiu.
 *
 * A correcao e prefixar, nao substituir: "PT — Português (idioma atual)". O
 * nome continua dizendo o destino, e agora contem o rotulo visivel. Nao mexe no
 * dicionario de proposito — o dado la e a prosa, e a regra de composicao e
 * deste componente. O travessao vira pausa na fala, nao palavra.
 */
function rotuloIdioma(sigla: string, prosa: string): string {
  return `${sigla} — ${prosa}`;
}

/**
 * Na barra sticky o alvo e o MESMO do cabecalho — 44px cheios, numa barra que
 * tem exatamente 44px de altura. Isso so e possivel porque a tinta saiu do <a>:
 * o que encosta no filete de baixo agora e uma area transparente, enquanto a
 * caixa creme mede 22.3px e fica com ~11px de carvao de folga em cima e
 * embaixo. Era essa folga que o `-my-3 py-3` (38px) de antes comprava
 * sacrificando 6px de dedo; com os dois papeis separados, nao ha mais o que
 * sacrificar.
 */
const alvoSticky = "-my-[15px] py-[15px]";

export function NavBar({ lang, d }: { lang: Lang; d: Dict["nav"] }) {
  const links = d.links;
  // O OUTRO idioma — o unico que cabe na barra sticky do celular.
  const alvoIdioma = outro(lang);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // 0.85 da altura da janela: a barra so entra quando o hero ja saiu de cena,
    // nunca no meio da primeira dobra.
    const onScroll = () =>
      setScrolled(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="block-carvao w-full">
        {/* `gap-4 md:gap-10`: os links entre si sao separados por 24px (o
            `px-3` de cada lado do "·"), entao o vao entre o bloco de links e o
            seletor de idioma precisa ser MAIOR que isso para o par "PT · EN"
            ler como uma terceira coisa e nao como um quinto link. 40px e o
            piso; `justify-between` abre mais quando a linha sobra. */}
        <nav
          aria-label={d.principal}
          className="mx-auto flex max-w-[96rem] flex-wrap items-baseline justify-between gap-4 px-[var(--gutter)] pb-5 pt-6 md:gap-10"
        >
          {/* O feedback e a INVERSAO, nunca um fade de opacidade: e a mesma
              lingua dos links do rodape e das linhas de contato. Sobre carvao,
              creme com texto carvao da 15.66:1. O `-mx-1/px-1` faz a caixa creme
              nascer 4px alem do glifo sem deslocar o alinhamento do gutter. */}
          <a
            href="#top"
            className="-mx-1 px-1 font-mono text-selo uppercase text-cream motion-safe:transition-colors motion-safe:duration-150 hover:bg-cream hover:text-carvao"
          >
            souzxxx
          </a>

          {/* Desktop: os 4 links numa linha, unidos pelo separador do site. */}
          <ul className="hidden items-baseline md:flex">
            {links.map((l, i) => (
              <li key={l.href} className="flex items-baseline">
                {i > 0 ? (
                  <span
                    aria-hidden
                    className="px-3 font-mono text-tag text-cream-600"
                  >
                    ·
                  </span>
                ) : null}
                <a
                  href={l.href}
                  className="font-sans text-meta uppercase text-cream-600 motion-safe:transition-colors motion-safe:duration-150 hover:text-cream"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          {/* PT · EN. Fica na ponta direita nas DUAS larguras: no celular o
              <ul> dos links acima esta recolhido (`hidden md:flex`) e a linha
              do topo vira "souzxxx ......... PT · EN", com o indice 2x2 de
              links logo abaixo, intocado.

              A sigla sozinha nao diz para onde o link leva, entao cada um
              carrega `aria-label` na lingua da pagina ATUAL (que e a que o
              leitor de tela esta pronunciando) e o grupo carrega o nome
              "Idioma"/"Language". O nome passa por `rotuloIdioma()` para
              COMECAR pela sigla que esta na tela — ver a nota daquela funcao:
              sem isso, comando de voz nao alcanca este seletor. */}
          <ul aria-label={d.idioma} className="flex items-baseline">
            {LANGS.map((l, i) => {
              const ativo = l === lang;
              return (
                <li key={l} className="flex items-baseline">
                  {i > 0 ? (
                    <span
                      aria-hidden
                      className="px-3 font-mono text-tag text-cream-600"
                    >
                      ·
                    </span>
                  ) : null}
                  <a
                    href={hrefHome(l)}
                    hrefLang={HTML_LANG[l]}
                    aria-current={ativo ? "true" : undefined}
                    aria-label={rotuloIdioma(
                      LANG_LABEL[l],
                      ativo ? d.idiomaAtual : d.trocarIdioma,
                    )}
                    className={clsx(linkIdioma, alvoCabecalho, "group")}
                  >
                    <span
                      className={clsx(
                        tintaIdioma,
                        ativo
                          ? "bg-cream text-carvao"
                          : "text-cream-600 group-hover:bg-cream group-hover:text-carvao group-focus-visible:bg-cream group-focus-visible:text-carvao",
                      )}
                    >
                      {LANG_LABEL[l]}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* O filete que abre a publicacao. Recolhe no mobile porque la o proprio
            indice 2x2 abre com o mesmo tracejado — duas linhas a 1px de
            distancia leriam como erro de render, nao como sistema. */}
        <div className="mx-auto hidden max-w-[96rem] px-[var(--gutter)] md:block">
          <DashedRule className="border-cream" />
        </div>

        {/* MOBILE 390: os 4 links nao cabem em uma linha. Viram uma ficha de
            indice 2x2 — sem hamburguer, sem JS, sem estado — com 44px de alvo
            de toque por celula. */}
        <div className="mx-auto max-w-[96rem] px-[var(--gutter)] md:hidden">
          <ul className="grid grid-cols-2 border-t border-dashed border-cream/30">
            {links.map((l, i) => (
              <li
                key={l.href}
                className={clsx(
                  "border-b border-dashed border-cream/30",
                  i % 2 === 1 && "border-l border-dashed border-cream/30",
                )}
              >
                <a
                  href={l.href}
                  className={clsx(
                    "flex min-h-[44px] items-center gap-2 py-3 pr-3 font-sans text-meta uppercase text-cream",
                    i % 2 === 1 && "pl-4",
                  )}
                >
                  <span
                    aria-hidden
                    className="font-mono text-tag text-cream-600"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* Barra sticky. `invisible` (e nao so `-translate-y-full`) tira o
          elemento da ordem de tabulacao enquanto ela esta recolhida. */}
      <div
        className={clsx(
          "fixed inset-x-0 top-0 z-50 h-11 border-b border-cream/25 bg-carvao text-cream",
          "motion-safe:transition-transform motion-safe:duration-200",
          scrolled ? "translate-y-0" : "invisible -translate-y-full",
        )}
      >
        <nav
          aria-label={d.atalhos}
          className="mx-auto flex h-11 max-w-[96rem] items-center justify-between gap-4 px-[var(--gutter)]"
        >
          {/* `-my-3 py-3` leva o alvo de toque a 38px sem esticar a barra, que
              tem altura FIXA de 44px. Mesma inversao do cabecalho: creme com
              texto carvao, 15.66:1. */}
          <a
            href="#top"
            className="-mx-1 -my-3 px-1 py-3 font-mono text-tag uppercase text-cream motion-safe:transition-colors motion-safe:duration-150 hover:bg-cream hover:text-carvao focus-visible:bg-cream focus-visible:text-carvao focus-visible:outline-cream"
          >
            souzxxx
          </a>

          <div className="flex items-center gap-4">
            {/* Aqui NAO cabe o par inteiro: numa barra de 44px no celular,
                "PT · EN" competiria com o "Contato ↗" pelo mesmo espaco. Entao
                a barra mostra so o OUTRO idioma — um unico link, que e tambem
                a unica acao possivel (quem ja esta em pt nao clica em "PT").
                Entra ANTES dos links e do contato porque e o controle que muda
                a pagina INTEIRA; os outros so rolam dentro dela. */}
            <a
              href={hrefHome(alvoIdioma)}
              hrefLang={HTML_LANG[alvoIdioma]}
              // Mesma regra do cabecalho: o nome acessivel comeca pela sigla
              // desenhada, ou este link some para quem navega por voz.
              aria-label={rotuloIdioma(LANG_LABEL[alvoIdioma], d.trocarIdioma)}
              className={clsx(linkIdioma, alvoSticky, "group")}
            >
              <span
                className={clsx(
                  tintaIdioma,
                  "text-cream-600 group-hover:bg-cream group-hover:text-carvao group-focus-visible:bg-cream group-focus-visible:text-carvao",
                )}
              >
                {LANG_LABEL[alvoIdioma]}
              </span>
            </a>

            <ul className="hidden items-baseline md:flex">
              {links.map((l, i) => (
                <li key={l.href} className="flex items-baseline">
                  {i > 0 ? (
                    <span
                      aria-hidden
                      className="px-3 font-mono text-tag text-cream-700"
                    >
                      ·
                    </span>
                  ) : null}
                  <a
                    href={l.href}
                    className="-my-3 py-3 font-sans text-meta uppercase text-cream-600 motion-safe:transition-colors motion-safe:duration-150 hover:text-cream"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Mobile: o unico atalho que cabe numa barra de 44px. */}
            <a
              href="#about"
              className="-my-3 py-3 font-sans text-meta uppercase text-cream md:hidden"
            >
              {d.contatoCurto}
            </a>

            <a
              href="#top"
              aria-label={d.voltarAoTopo}
              className="-my-3 py-3 font-mono text-tag text-cream-600 motion-safe:transition-colors motion-safe:duration-150 hover:text-cream"
            >
              ↑
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
