"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import type { Dict } from "@/lib/dict";
import { CV_PDF, SITE_URL } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

/**
 * TerminalLine — a barra que assina "terminal" na primeira dobra.
 *
 * Retangulo creme chapado sobre o carvao, canto vivo, sem sombra e sem blur: le
 * como um campo de comando impresso na prancha, nao como um widget.
 *
 * O comando e REAL e verificavel — o arquivo existe em `public/` e o prebuild
 * `scripts/check-assets.ts` derruba o build se ele sumir. Nenhum `npx` de
 * pacote nao publicado, nenhum `curl | bash` de instalador que nao existe: a
 * unica coisa que um portfolio nao pode fazer e blefar um comando.
 *
 * E E POR ISSO QUE O COMANDO TEM IDIOMA. Sao dois PDFs versionados
 * (leonardo-souza-cv.pdf e leonardo-souza-cv-en.pdf, os dois cobrados pelo
 * mesmo prebuild), e um `curl` que baixa o curriculo em portugues numa pagina
 * em ingles e exatamente o blefe que o paragrafo acima proibe: o visitante cola
 * no terminal, recebe um arquivo que nao sabe ler e a linha deixa de ser
 * verificavel. Por isso a URL e montada de `SITE_URL` + `CV_PDF[lang]`
 * (lib/i18n.ts) — o dominio e o caminho de cada PDF moram num lugar so, e
 * trocar o dominio aqui a mao seria criar o segundo.
 *
 * E POR ISSO O COMANDO QUEBRA LINHA EM VEZ DE ROLAR. MEDIDO: com
 * `white-space: pre` o <code> tinha 452px de caixa para 578px de texto em 1440
 * (126px escondidos) e 272px para os mesmos 578 em 390 — menos de metade
 * visivel —, com a barra de rolagem deliberadamente suprimida. O resultado lia
 * como texto CORTADO, nao como regiao rolavel: terminava em "…vercel.app/leona"
 * colado no filete. Um comando so e verificavel se for legivel inteiro, entao
 * ele passa a se comportar como num terminal de verdade, que reflui em vez de
 * rolar na horizontal. `break-all` porque o que quebra e uma URL: cortar no
 * meio do caminho e o comportamento nativo do emulador de terminal, e o texto
 * que o botao copia continua vindo da constante, nunca do DOM. O comando em
 * ingles e tres caracteres mais longo (o "-en" do arquivo) e reflui igual — a
 * caixa tem `min-h`, nao altura fixa.
 */
function comandoDe(lang: Lang): string {
  return `curl -sO ${SITE_URL}${CV_PDF[lang]}`;
}

export function TerminalLine({
  lang,
  d,
  className,
}: {
  lang: Lang;
  d: Dict["hero"]["terminal"];
  className?: string;
}) {
  const comando = comandoDe(lang);
  const [copiado, setCopiado] = useState(false);
  const codigo = useRef<HTMLElement>(null);

  // Volta ao rotulo de repouso (`copiar`: COPIAR em pt, COPY em en) sozinho. O
  // timer e limpo no cleanup — clicar de novo antes de 1.6s reinicia a contagem
  // em vez de deixar um setTimeout orfao de pe.
  useEffect(() => {
    if (!copiado) return;
    const t = setTimeout(() => setCopiado(false), 1600);
    return () => clearTimeout(t);
  }, [copiado]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(comando);
      setCopiado(true);
    } catch {
      // Fallback para contexto sem clipboard (http, permissao negada, Safari
      // antigo): seleciona o comando inteiro para o visitante fechar no
      // Cmd+C. Sem trocar para `copiado` aqui, porque nada foi copiado ainda —
      // o rotulo so mente se prometer o que nao aconteceu.
      const node = codigo.current;
      const selecao = window.getSelection();
      if (!node || !selecao) return;
      const range = document.createRange();
      range.selectNodeContents(node);
      selecao.removeAllRanges();
      selecao.addRange(range);
    }
  }

  return (
    // `min-h-[2.75rem]`: 44px de alvo de toque E altura reservada, entao a
    // troca da fonte de maquina de escrever no swap nao empurra nada.
    <div
      className={clsx(
        "flex min-h-[2.75rem] w-full max-w-[46rem] items-stretch border border-cream/40 bg-cream text-carvao",
        className,
      )}
    >
      {/* "CV" nas duas linguas: o rotulo nomeia o ENDERECO que o comando baixa
          (/cv, leonardo-souza-cv*.pdf), nao o documento — por isso ele nao
          vira "RESUME" no ingles, mesmo com o CTA do hero virando "Resume ↓".
          Ele mora no dicionario assim mesmo, porque a decisao de nao traduzir e
          editorial e pertence ao arquivo de texto, nao a um literal escondido
          aqui dentro. */}
      <span className="hidden shrink-0 items-center border-r border-dashed border-carvao/30 px-3 font-mono text-tag uppercase text-ink-700 sm:flex">
        {d.rotulo}
      </span>

      {/* `pre-wrap` e nao `pre`: preserva os espacos do comando (e o que separa
          a flag `-sO` da URL) e ainda assim deixa a linha refluir. Duas linhas
          no desktop, tres em 390px — a caixa tem `min-h`, nao altura fixa. */}
      <code
        ref={codigo}
        className="min-w-0 flex-1 whitespace-pre-wrap break-all px-3 py-2.5 font-mono text-cmd text-carvao"
      >
        {comando}
      </code>

      {/* A REGRA SISTEMATICA do anel (About.tsx, Footer.tsx, NavBar.tsx,
          ProjectGrid.tsx) vale aqui numa geometria invertida — e por isso o
          remedio NAO e `focus-visible:outline-cream`. Este botao encosta nas
          bordas da caixa creme, que por sua vez esta sobre o carvao do hero:
          com offset +2px o anel e desenhado FORA da caixa em tres lados e
          DENTRO dela no quarto, ou seja, atravessa dois fundos. Nenhuma cor
          chapada resolve os quatro. MEDIDO (diff de pixel focado/nao focado,
          tab real nº 6): `currentColor` carvao dava topo/base/direita 1.00:1;
          trocar por creme conserta esses tres e mata a esquerda, tambem 1.00:1.

          Entao o conserto tem duas metades. (1) INVERTER o campo no foco, que
          ja e o idioma de feedback do site — e aqui `currentColor` vira creme
          sozinho, sem precisar de `outline-cream`, porque esta inversao anda no
          sentido contrario a dos outros quatro (parte do claro, nao do escuro).
          (2) Puxar o anel para DENTRO, o que restaura a premissa do anel global
          em globals.css: `currentColor` so e AA por construcao quando o anel cai
          sobre o fundo contra o qual aquela cor foi medida.
          MEDIDO depois: 15.66:1 nos quatro lados em 1440 e 390, e tambem em
          hover+foco — estado em que a inversao sozinha ainda reprovava, porque
          o preenchimento ja vinha invertido pelo hover e so restava o anel. */}
      <button
        type="button"
        onClick={copiar}
        className="min-h-[2.75rem] shrink-0 border-l border-dashed border-carvao/30 px-3 font-mono text-tag uppercase text-carvao motion-safe:transition-colors motion-safe:duration-150 hover:bg-carvao hover:text-cream focus-visible:bg-carvao focus-visible:text-cream focus-visible:[outline-offset:-2px]"
      >
        {/* Unico feedback animado da secao — e e troca de TEXTO, nao de layout:
            nada desliza, nada pulsa. `aria-live` para o leitor de tela receber
            a confirmacao que o vidente recebe, na lingua da pagina (COPIAR /
            COPIADO em pt, COPY / COPIED em en). */}
        <span aria-live="polite">{copiado ? d.copiado : d.copiar}</span>
      </button>
    </div>
  );
}
