"use client";

import Link from "next/link";
import Image from "next/image";
import type { PointerEvent } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { Janela } from "../os/Janela";
import { ProjectCover } from "../projects/ProjectCover";

/**
 * ProximoProjeto — o bloco carvão que fecha o case e leva ao seguinte.
 *
 * O bloco INTEIRO é o link: em 390 o alvo é a largura da tela, e no desktop
 * não existe "a parte clicável" para o olho procurar. A capa do próximo
 * projeto espia por baixo da borda inferior dentro de uma janela; no hover ela
 * sobe e mostra mais de si, a seta anda e o quadrado da seta vira dourado — o
 * único dourado desta tela.
 *
 * A janela também segue o cursor, com mola e de pouco (no máximo ~24px): é o
 * que faz o bloco parecer um objeto na mesa e não um banner. Sem
 * `prefers-reduced-motion` o seguir some, e a subida no hover vira troca seca
 * (as transições CSS estão atrás de `motion-safe:`).
 *
 * Por que `next/link`: os cases moram no mesmo layout-raiz, então a navegação
 * entre eles é de cliente — sem recarregar fonte nem o resto do documento.
 */
export function ProximoProjeto({
  href,
  rotulo,
  aria,
  numero,
  nome,
  tagline,
  slug,
  titulo,
  capa,
}: {
  href: string;
  rotulo: string;
  aria: string;
  numero: string;
  nome: string;
  tagline: string;
  slug: string;
  titulo: string;
  capa?: string;
}) {
  const semMovimento = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 140, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 140, damping: 18, mass: 0.6 });

  function mover(e: PointerEvent<HTMLAnchorElement>) {
    if (semMovimento || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    // -0.5..0.5 do centro do bloco, vezes o alcance em px.
    x.set(((e.clientX - r.left) / r.width - 0.5) * 48);
    y.set(((e.clientY - r.top) / r.height - 0.5) * 24);
  }

  function soltar() {
    x.set(0);
    y.set(0);
  }

  return (
    <Link
      href={href}
      aria-label={`${aria} ${nome}`}
      onPointerMove={mover}
      onPointerLeave={soltar}
      className="mesa group relative block overflow-hidden border-b border-cream/15 text-cream focus-visible:outline-cream focus-visible:-outline-offset-8"
    >
      <div className="relative mx-auto max-w-[96rem] px-[var(--gutter)] pb-[clamp(10rem,24vw,13rem)] pt-[clamp(3.5rem,8vw,7rem)] md:pb-[clamp(5rem,10vw,9rem)]">
        <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-cream/25 pb-4 font-bitmap text-[11px] uppercase leading-none tracking-[0.08em]">
          <span>{rotulo}</span>
          <span className="text-cream-700">{numero}</span>
        </div>

        <div className="relative z-10 mt-[clamp(2rem,5vw,3.5rem)] md:max-w-[58%]">
          <p
            aria-hidden
            className="font-display text-[clamp(2.75rem,8vw,7.5rem)] uppercase leading-[0.88] tracking-[0.01em] [hyphens:auto] [overflow-wrap:break-word]"
          >
            {nome}
          </p>
          <p className="mt-5 line-clamp-2 max-w-[48ch] text-body text-cream-600">
            {tagline}
          </p>
          <span
            aria-hidden
            className="mt-8 inline-grid h-12 w-12 place-items-center border border-cream font-mono text-xl motion-safe:transition-[background-color,color,transform] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-3 group-hover:border-gold group-hover:bg-gold group-hover:text-carvao group-focus-visible:translate-x-3"
          >
            →
          </span>
        </div>
      </div>

      {/* A capa que espia. O wrapper externo cuida da subida (CSS, no hover);
          o interno, da mola que segue o cursor — os dois mexem em `transform`,
          então cada um precisa do seu elemento. */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-[var(--gutter)] w-[min(78vw,20rem)] translate-y-[58%] motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-[22%] md:w-[clamp(20rem,36vw,34rem)] md:translate-y-[52%] md:group-hover:translate-y-[12%]"
      >
        <motion.div style={{ x: sx, y: sy }}>
          <Janela titulo={titulo} sombra="breu" as="div">
            {capa ? (
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={capa}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 78vw, 34rem"
                  className="object-cover object-top"
                />
              </div>
            ) : (
              <ProjectCover
                slug={slug}
                name={nome}
                className="aspect-[16/10] w-full"
              />
            )}
          </Janela>
        </motion.div>
      </div>
    </Link>
  );
}
