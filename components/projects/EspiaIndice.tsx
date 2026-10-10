"use client";

import Image from "next/image";
import clsx from "clsx";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Janela } from "../os/Janela";
import { ProjectCover } from "./ProjectCover";

export interface Previa {
  slug: string;
  name: string;
  cover?: string;
  language?: string;
}

// Tamanho da espiada: 320px de captura 16:10 + 22px da barra da janela.
const W = 320;
const H = 22 + 200;
// Distância entre o cursor e a janela; e o respiro mínimo das bordas da tela.
const AFASTAR = 36;
const MARGEM = 12;

const MQ_PONTEIRO = "(hover: hover) and (pointer: fine)";

/**
 * EspiaIndice — a captura que flutua junto do cursor no índice de projetos.
 *
 * O <ol> chega PRONTO do servidor como `children`; este componente só escuta
 * por delegação (`data-previa` em cada <li>) e desenha uma camada fixa por
 * cima. Assim as dezesseis linhas continuam sendo HTML de servidor e o
 * JavaScript da seção é só este arquivo.
 *
 * DUAS MOLAS, DUAS PERSONALIDADES. A etiqueta "ABRIR →" acompanha o cursor
 * quase colada (mola dura); a janela com a captura vem atrás, mais solta. A
 * diferença de atraso é o que dá peso à janela sem nenhum efeito extra.
 *
 * SÓ COM MOUSE DE VERDADE. Em `(hover: none)` a camada nem monta: o toque vê a
 * miniatura dentro da própria linha (ProjectGrid). Com teclado, o foco visível
 * posiciona a mesma janela parada ao lado da linha, sem a etiqueta.
 *
 * As imagens só começam a baixar no primeiro hover (`montado`): ninguém que
 * passe direto pelo índice paga por dezesseis capturas que não viu. Depois
 * disso todas ficam empilhadas na janela e a troca entre linhas é instantânea.
 *
 * Movimento reduzido: sem mola e sem escala — a janela aparece no lugar.
 */
export function EspiaIndice({
  previas,
  rotulo,
  className,
  children,
}: {
  previas: Previa[];
  rotulo: string;
  className?: string;
  children: ReactNode;
}) {
  const reduzir = useReducedMotion();
  const [habilitado, setHabilitado] = useState(false);
  const [montado, setMontado] = useState(false);
  const [ativo, setAtivo] = useState<number | null>(null);
  const [teclado, setTeclado] = useState(false);
  const ultimo = useRef<{ x: number; y: number } | null>(null);

  // Alvo da janela e posição do cursor.
  const jx = useMotionValue(0);
  const jy = useMotionValue(0);
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);
  const molaJanela = { stiffness: 170, damping: 22, mass: 0.7 };
  const molaEtiqueta = { stiffness: 700, damping: 45, mass: 0.4 };
  const sjx = useSpring(jx, molaJanela);
  const sjy = useSpring(jy, molaJanela);
  const scx = useSpring(cx, molaEtiqueta);
  const scy = useSpring(cy, molaEtiqueta);

  useEffect(() => {
    const mq = window.matchMedia(MQ_PONTEIRO);
    const ler = () => setHabilitado(mq.matches);
    ler();
    mq.addEventListener("change", ler);
    return () => mq.removeEventListener("change", ler);
  }, []);

  // Quando a janela reaparece depois de sumir, ela tem que NASCER no lugar —
  // sem isto a mola a traria voando da última posição (ou do canto da tela).
  const visivelAntes = useRef(false);
  const posicionar = useCallback(
    (x: number, y: number, pular: boolean) => {
      jx.set(x);
      jy.set(y);
      if (pular) {
        sjx.jump(x);
        sjy.jump(y);
      }
    },
    [jx, jy, sjx, sjy],
  );

  const indiceEm = (alvo: EventTarget | null) => {
    const li =
      alvo instanceof Element
        ? alvo.closest<HTMLElement>("[data-previa]")
        : null;
    const n = li ? Number(li.dataset.previa) : NaN;
    return Number.isFinite(n) ? n : null;
  };

  const seguir = useCallback(
    (x: number, y: number, indice: number | null) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // À direita do cursor; perto da borda direita, vira para a esquerda.
      const alvoX = x + AFASTAR + W + MARGEM > vw ? x - AFASTAR - W : x + AFASTAR;
      const alvoY = Math.min(Math.max(y - H / 2, MARGEM), vh - H - MARGEM);
      const vaiAparecer = indice !== null;
      posicionar(alvoX, alvoY, vaiAparecer && !visivelAntes.current);
      cx.set(x + 16);
      cy.set(y + 18);
      if (vaiAparecer && !visivelAntes.current) {
        scx.jump(x + 16);
        scy.jump(y + 18);
      }
      visivelAntes.current = vaiAparecer;
      setAtivo(indice);
    },
    [posicionar, cx, cy, scx, scy],
  );

  const aoMover = (e: PointerEvent<HTMLDivElement>) => {
    if (!habilitado || e.pointerType !== "mouse") return;
    if (!montado) setMontado(true);
    setTeclado(false);
    ultimo.current = { x: e.clientX, y: e.clientY };
    seguir(e.clientX, e.clientY, indiceEm(e.target));
  };

  const aoSair = () => {
    ultimo.current = null;
    if (!teclado) {
      visivelAntes.current = false;
      setAtivo(null);
    }
  };

  // Rolar com o mouse parado troca a linha embaixo do cursor sem disparar
  // pointermove; aqui a espiada reconsulta quem está sob o ponteiro.
  useEffect(() => {
    if (!habilitado || ativo === null || teclado) return;
    const aoRolar = () => {
      const u = ultimo.current;
      if (!u) return;
      seguir(u.x, u.y, indiceEm(document.elementFromPoint(u.x, u.y)));
    };
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, [habilitado, ativo, teclado, seguir]);

  const aoFocar = (e: FocusEvent<HTMLDivElement>) => {
    if (!habilitado) return;
    const alvo = e.target as HTMLElement;
    if (!alvo.matches(":focus-visible")) return;
    const indice = indiceEm(alvo);
    if (indice === null) return;
    if (!montado) setMontado(true);
    const r = alvo.getBoundingClientRect();
    // Parada à direita da linha, centrada na altura dela.
    const x = Math.min(r.right - W, window.innerWidth - W - MARGEM);
    const y = Math.min(
      Math.max(r.top + r.height / 2 - H / 2, MARGEM),
      window.innerHeight - H - MARGEM,
    );
    posicionar(x, y, !visivelAntes.current);
    visivelAntes.current = true;
    setTeclado(true);
    setAtivo(indice);
  };

  const aoDesfocar = (e: FocusEvent<HTMLDivElement>) => {
    if (indiceEm(e.relatedTarget) !== null) return;
    if (teclado) {
      visivelAntes.current = false;
      setTeclado(false);
      setAtivo(null);
    }
  };

  const visivel = habilitado && ativo !== null;
  const atual = ativo !== null ? previas[ativo] : null;

  return (
    <div
      className={className}
      onPointerMove={aoMover}
      onPointerLeave={aoSair}
      onFocus={aoFocar}
      onBlur={aoDesfocar}
    >
      {children}

      {montado && habilitado ? (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none fixed left-0 top-0 z-40"
            style={{
              x: reduzir ? jx : sjx,
              y: reduzir ? jy : sjy,
              width: W,
              willChange: "transform",
            }}
          >
            <motion.div
              initial={false}
              animate={
                visivel
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: reduzir ? 1 : 0.88 }
              }
              transition={{ duration: reduzir ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="origin-left"
            >
              <Janela
                as="div"
                titulo={atual ? `${atual.slug}${atual.cover ? ".png" : ".pict"}` : ""}
                sombra="breu"
                className="outline outline-1 outline-cream/30"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-carvao">
                  {previas.map((p, i) => (
                    <div
                      key={p.slug}
                      className={clsx(
                        "absolute inset-0",
                        i === ativo ? "opacity-100" : "opacity-0",
                      )}
                    >
                      {p.cover ? (
                        <Image
                          src={p.cover}
                          alt=""
                          fill
                          sizes={`${W}px`}
                          className="object-cover object-top"
                        />
                      ) : (
                        <ProjectCover
                          slug={p.slug}
                          name={p.name}
                          language={p.language}
                          className="h-full w-full"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </Janela>
            </motion.div>
          </motion.div>

          {/* A etiqueta do cursor — some no modo teclado, onde não há cursor. */}
          <motion.div
            aria-hidden
            className="pointer-events-none fixed left-0 top-0 z-40"
            style={{ x: reduzir ? cx : scx, y: reduzir ? cy : scy }}
          >
            <motion.span
              initial={false}
              animate={{ opacity: visivel && !teclado ? 1 : 0 }}
              transition={{ duration: 0.15 }}
              className="block whitespace-nowrap border border-carvao bg-cream px-2 py-1.5 font-bitmap text-[10px] uppercase leading-none tracking-[0.06em] text-carvao shadow-[3px_3px_0_0_#0F0E0C]"
            >
              {rotulo}
            </motion.span>
          </motion.div>
        </>
      ) : null}
    </div>
  );
}
