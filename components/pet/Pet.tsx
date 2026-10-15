"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { DictPet } from "@/lib/dict";
import { CanvasBoundary } from "../hero/CanvasBoundary";
import { criarEstado } from "./estado";
import { rotaDoPet, useSecaoAtual } from "./secao";
import { usePetEventos } from "./usePetEventos";

/**
 * Pet — o Mac que acompanha o visitante no canto da tela.
 *
 * Este arquivo cuida de QUANDO ele existe e da parte em DOM (botão e balão).
 * O desenho é a PetCena; os sentidos, o usePetEventos.
 *
 * GUARDAS, na ordem: tela com mouse e ≥ 1024 px; fora do currículo; navegador
 * ocioso (o chunk do three nunca disputa o primeiro paint); WebGL de pé (se o
 * contexto falhar, o CanvasBoundary avisa e o pet some INTEIRO — sem um botão
 * invisível sobrando no canto).
 *
 * A CAIXA tem 150×150 px para a inclinação caber, mas só o retângulo do Mac
 * (88×104) recebe clique: o wrapper é `pointer-events: none`, e um link do
 * rodapé que caia no canto da caixa continua clicável.
 *
 * O texto chega por prop numa língua só, vindo do layout (servidor). Ver a
 * regra de fatias no fim de lib/dict.ts.
 */
const PetCena = dynamic(() => import("./PetCena").then((m) => m.PetCena), {
  ssr: false,
  loading: () => null,
});

const MIDIA = "(hover: hover) and (pointer: fine) and (min-width: 1024px)";

type JanelaDeTeste = Window & { __sxPetSonoMs?: number; __sxPet?: unknown };

export function Pet({ textos }: { textos: DictPet }) {
  const pathname = usePathname() ?? "/";
  const reduzido = useReducedMotion() ?? false;
  const [cabe, setCabe] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [falhou, setFalhou] = useState(false);
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const estado = useRef(criarEstado()).current;

  estado.reduzido = reduzido;
  const mostrar = cabe && pronto && !falhou && rotaDoPet(pathname) !== "cv";
  const despachar = usePetEventos(estado, raiz, mostrar);
  const chave = useSecaoAtual(pathname);

  useEffect(() => {
    const q = window.matchMedia(MIDIA);
    const sync = () => setCabe(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!cabe) return;
    let idle: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => setPronto(true);
    if (typeof window.requestIdleCallback === "function") {
      idle = window.requestIdleCallback(start, { timeout: 1500 });
    } else {
      timer = setTimeout(start, 300);
    }
    return () => {
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [cabe]);

  useEffect(() => {
    const w = window as JanelaDeTeste;
    if (w.__sxPetSonoMs !== undefined) w.__sxPet = estado;
  }, [estado]);

  useEffect(() => {
    setAberto(false);
  }, [pathname]);

  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    const onDown = (e: PointerEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setAberto(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [aberto]);

  if (!mostrar) return null;

  const titulo = textos.titulos[chave];
  const dica = textos.dicas[chave];

  return (
    <div
      ref={raiz}
      data-pet=""
      data-expressao="normal"
      className="pet-entra pointer-events-none fixed bottom-6 right-6 z-[60] h-[150px] w-[150px]"
    >
      <p role="status" className="sr-only">
        {aberto ? `${titulo}. ${dica}` : ""}
      </p>

      {aberto ? (
        <div
          data-pet-balao=""
          aria-hidden
          className="pointer-events-auto absolute bottom-[calc(100%-16px)] right-3 w-[18rem] border border-carvao bg-cream p-4 text-carvao shadow-[4px_4px_0_0_#1C1A17]"
        >
          <p className="font-bitmap text-[10px] uppercase leading-none tracking-[0.08em]">
            {titulo}
          </p>
          <p className="mt-2 font-sans text-body">{dica}</p>
        </div>
      ) : null}

      <CanvasBoundary onFalha={() => setFalhou(true)}>
        <PetCena estado={estado} />
      </CanvasBoundary>

      <button
        type="button"
        aria-label={textos.ariaLabel}
        aria-expanded={aberto}
        onClick={() => {
          setAberto((a) => !a);
          estado.pulo += 1;
          despachar({ tipo: "atividade" });
          estado.invalidar();
        }}
        className="pointer-events-auto absolute left-1/2 top-1/2 h-[104px] w-[88px] -translate-x-1/2 -translate-y-1/2 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-carvao"
      />
    </div>
  );
}
