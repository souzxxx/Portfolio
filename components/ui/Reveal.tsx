"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

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
 */
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
  const [forceShow, setForceShow] = useState(false);

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
      initial={{ opacity: 0, y }}
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
