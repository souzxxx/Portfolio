"use client";

import { useEffect, useRef, useState } from "react";

/**
 * CopiarEmail — o e-mail como linha de contato, com o botão de copiar ao lado.
 *
 * São DOIS alvos, de propósito: o endereço continua sendo um `mailto:` (quem
 * tem cliente de e-mail configurado clica e escreve), e o botão copia para
 * quem não tem — o caso comum de recrutador em webmail, onde `mailto:` abre um
 * app que ninguém usa.
 *
 * O feedback é a própria etiqueta virando "COPIADO" em bitmap por 1.6s, com
 * `aria-live` para o leitor de tela ouvir a mesma coisa. Sem clipboard
 * (http, permissão negada), seleciona o endereço para o Cmd+C manual e NÃO
 * diz "copiado" — o rótulo só promete o que aconteceu (mesma regra do
 * TerminalLine do hero).
 */
export function CopiarEmail({
  email,
  rotulo,
  copiar,
  copiado,
  copiarAria,
}: {
  email: string;
  rotulo: string;
  copiar: string;
  copiado: string;
  copiarAria: string;
}) {
  const [ok, setOk] = useState(false);
  const endereco = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ok) return;
    const t = setTimeout(() => setOk(false), 1600);
    return () => clearTimeout(t);
  }, [ok]);

  async function copiarAgora() {
    try {
      await navigator.clipboard.writeText(email);
      setOk(true);
    } catch {
      const node = endereco.current;
      const sel = window.getSelection();
      if (!node || !sel) return;
      const r = document.createRange();
      r.selectNodeContents(node);
      sel.removeAllRanges();
      sel.addRange(r);
    }
  }

  return (
    <div className="flex flex-col border-t border-dashed border-cream/25 md:flex-row md:items-stretch">
      <a
        href={`mailto:${email}`}
        className="group grid min-w-0 flex-1 grid-cols-1 items-baseline gap-y-1 py-4 hover:bg-cream hover:text-carvao focus-visible:bg-cream focus-visible:text-carvao focus-visible:outline-cream md:-ml-4 md:grid-cols-[6.5rem_minmax(0,1fr)] md:gap-x-3 md:pl-4 motion-safe:transition-colors motion-safe:duration-150"
      >
        <span className="font-mono text-tag uppercase text-cream-700 group-hover:text-ink-700 group-focus-visible:text-ink-700">
          {rotulo}
        </span>
        <span ref={endereco} className="break-all font-mono text-[15px] md:text-body">
          {email}
        </span>
      </a>
      <button
        type="button"
        onClick={copiarAgora}
        aria-label={copiarAria}
        className="mb-4 min-h-[44px] w-[6.5rem] shrink-0 self-start border md:my-2 md:mb-2 md:ml-3 md:self-center border-cream/50 px-3 font-bitmap text-[10px] uppercase leading-none tracking-[0.08em] text-cream hover:bg-cream hover:text-carvao focus-visible:outline-cream motion-safe:transition-colors motion-safe:duration-150"
      >
        <span aria-live="polite">{ok ? copiado : copiar}</span>
      </button>
    </div>
  );
}
