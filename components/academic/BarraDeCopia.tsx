"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useLayoutEffect, useState } from "react";
import { PADROES } from "../fim/padroes";

const useEfeitoDePintura =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * BarraDeCopia — a barra do diálogo "Copiando…" do Finder, em 1-bit.
 *
 * Cada semestre é 1/total da barra. Os concluídos são carvão cheio; o semestre
 * em curso é a trama xadrez (meio-tom: está sendo copiado agora); os da fila
 * ficam em papel. Os entalhes de baixo marcam a fronteira de cada semestre,
 * para "5 de 8" ser contável no olho, e não só lido no rótulo.
 *
 * O MESMO CONTRATO DO <Reveal>: o HTML do servidor já sai com a barra cheia
 * até onde deve (sem JS, a barra está certa). Só depois da hidratação ela
 * recua a zero e enche quando entra na tela; com movimento reduzido, nada
 * anda.
 */
export function BarraDeCopia({
  concluidos,
  atual,
  total,
}: {
  concluidos: number;
  atual: boolean;
  total: number;
}) {
  const reduz = useReducedMotion();
  const [pintado, setPintado] = useState(false);
  useEfeitoDePintura(() => setPintado(true), []);

  const passo = 100 / total;
  const cheio = concluidos * passo;
  const emCurso = atual ? passo : 0;

  return (
    <div>
      <div className="relative h-[26px] overflow-hidden border border-carvao bg-cream">
        <motion.div
          key={pintado ? "cliente" : "servidor"}
          initial={pintado && !reduz ? { scaleX: 0 } : false}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-y-0 left-0 flex origin-left"
          style={{ width: `${cheio + emCurso}%` }}
        >
          <span className="h-full" style={{ ...PADROES.cheio, width: `${(cheio / (cheio + emCurso)) * 100}%` }} />
          {atual ? (
            <span
              className="h-full flex-1 border-l border-carvao"
              style={PADROES.xadrez}
            />
          ) : null}
        </motion.div>
      </div>

      {/* Entalhes: um por fronteira de semestre, pendurados embaixo da barra. */}
      <div aria-hidden className="relative h-[6px]">
        {Array.from({ length: total - 1 }, (_, i) => (
          <span
            key={i}
            className="absolute top-0 h-[6px] w-px bg-carvao"
            style={{ left: `${(i + 1) * passo}%` }}
          />
        ))}
      </div>
    </div>
  );
}
