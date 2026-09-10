"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * Reveal — entrada suave por scroll. API INALTERADA nesta wave.
 *
 * API (contrato, nao mude):
 *   <Reveal delay?={number} y?={number} className?={string}>{children}</Reveal>
 *
 * So os defaults mudaram, para caber na nova identidade: `y` de 24 para 10 e a
 * duracao de 0.7s para 0.45s. Layout estatico e confiante nao desliza — o
 * movimento existe so para tirar o corte seco do primeiro paint, nao para
 * anunciar cada bloco. `prefers-reduced-motion` continua devolvendo o conteudo
 * sem motion nenhum, e o fallback de 2s continua sendo a rede de seguranca
 * para screenshot headless.
 *
 * ── O HTML DO SERVIDOR SAI VISIVEL ────────────────────────────────────────
 * MEDIDO no HTML servido: com `initial={{opacity:0,y}}` fixo, o framer
 * SERIALIZA `style="opacity:0;transform:translateY(10px)"` em cada wrapper — 21
 * deles nesta home. Com JS desligado (ou bloqueado por extensao, ou num crawler
 * que nao executa script) a pagina rendia so a NavBar, o selo e o <h1>: todo o
 * resto era um campo azul vazio. O fallback de 2s nao cobre esse caso, porque
 * ele TAMBEM depende de JS. O alcance do componente cresceu muito nesta wave —
 * ele embrulha todo SectionHeader, os paragrafos do About e cada semestre da
 * linha do tempo —, entao o custo do cenario sem JS passou de "algumas secoes"
 * para "o site inteiro".
 *
 * A correcao e renderizar VISIVEL no servidor e so entao assumir o controle no
 * cliente. Duas pecas fazem isso funcionar:
 *
 *   1. `initial={false}` enquanto `pintado` e falso. `false` desliga a
 *      serializacao do estado inicial: nao sai style nenhum no HTML.
 *   2. `key` amarrada a `pintado`. `initial` e lido UMA vez, na montagem do
 *      motion component — mudar a prop depois nao faz efeito nenhum. Trocar a
 *      key remonta o motion component ja com `initial={{opacity:0,y}}`, que e o
 *      que devolve a animacao ao cliente.
 *
 * E `useLayoutEffect` (nao `useEffect`) para que a troca seja processada ANTES
 * do primeiro paint: com `useEffect` o visitante veria o conteudo aparecer,
 * sumir e reaparecer em fade. No servidor React avisaria que layout effect nao
 * roda no SSR, entao a escolha do hook e feita por ambiente.
 */
const useEfeitoDePintura =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function Reveal({
  children,
  delay = 0,
  y = 10,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [pintado, setPintado] = useState(false);
  const [forceShow, setForceShow] = useState(false);

  useEfeitoDePintura(() => {
    setPintado(true);
  }, []);

  // Fallback: if IntersectionObserver never fires (e.g. JS issues, headless screenshot),
  // reveal content after 2s no matter what so nothing stays hidden.
  useEffect(() => {
    const t = setTimeout(() => setForceShow(true), 2000);
    return () => clearTimeout(t);
  }, []);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      key={pintado ? "cliente" : "servidor"}
      initial={pintado ? { opacity: 0, y } : false}
      whileInView={{ opacity: 1, y: 0 }}
      animate={forceShow ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
