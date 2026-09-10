"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

/**
 * TerminalLine — a barra que assina "terminal" na primeira dobra.
 *
 * Retangulo creme chapado sobre o azul, canto vivo, sem sombra e sem blur: le
 * como um campo de comando impresso na prancha, nao como um widget.
 *
 * O comando e REAL e verificavel — o arquivo existe em `public/` e o prebuild
 * `scripts/check-assets.ts` derruba o build se ele sumir. Nenhum `npx` de
 * pacote nao publicado, nenhum `curl | bash` de instalador que nao existe: a
 * unica coisa que um portfolio nao pode fazer e blefar um comando.
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
 * que o botao copia continua vindo da constante, nunca do DOM.
 */
const COMANDO =
  "curl -sO https://portfolio-souzxxxs-projects.vercel.app/leonardo-souza-cv.pdf";

export function TerminalLine({ className }: { className?: string }) {
  const [copiado, setCopiado] = useState(false);
  const codigo = useRef<HTMLElement>(null);

  // Volta a "COPIAR" sozinho. O timer e limpo no cleanup — clicar de novo antes
  // de 1.6s reinicia a contagem em vez de deixar um setTimeout orfao de pe.
  useEffect(() => {
    if (!copiado) return;
    const t = setTimeout(() => setCopiado(false), 1600);
    return () => clearTimeout(t);
  }, [copiado]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(COMANDO);
      setCopiado(true);
    } catch {
      // Fallback para contexto sem clipboard (http, permissao negada, Safari
      // antigo): seleciona o comando inteiro para o visitante fechar no
      // Cmd+C. Sem feedback de "COPIADO" aqui, porque nada foi copiado ainda —
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
        "flex min-h-[2.75rem] w-full max-w-[46rem] items-stretch border border-cream/40 bg-cream text-ink",
        className,
      )}
    >
      <span className="hidden shrink-0 items-center border-r border-dashed border-ink/30 px-3 font-mono text-tag uppercase text-ink-700 sm:flex">
        CV
      </span>

      {/* `pre-wrap` e nao `pre`: preserva os espacos do comando (e o que separa
          a flag `-sO` da URL) e ainda assim deixa a linha refluir. Duas linhas
          no desktop, tres em 390px — a caixa tem `min-h`, nao altura fixa. */}
      <code
        ref={codigo}
        className="min-w-0 flex-1 whitespace-pre-wrap break-all px-3 py-2.5 font-mono text-cmd text-ink"
      >
        {COMANDO}
      </code>

      <button
        type="button"
        onClick={copiar}
        className="min-h-[2.75rem] shrink-0 border-l border-dashed border-ink/30 px-3 font-mono text-tag uppercase text-blue motion-safe:transition-colors motion-safe:duration-150 hover:bg-blue hover:text-cream"
      >
        {/* Unico feedback animado da secao — e e troca de TEXTO, nao de layout:
            nada desliza, nada pulsa. `aria-live` para o leitor de tela receber
            a confirmacao que o vidente recebe. */}
        <span aria-live="polite">{copiado ? "COPIADO" : "COPIAR"}</span>
      </button>
    </div>
  );
}
