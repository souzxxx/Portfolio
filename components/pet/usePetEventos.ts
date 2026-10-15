"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import type { EstadoPet } from "./estado";
import {
  PISCADA_MS,
  SONO_MS,
  SURPRESA_MS,
  Z_PASSO_MS,
  intervaloPiscada,
  transicao,
  type EventoPet,
} from "./maquina";

/**
 * Os sentidos do pet: tudo o que vem do DOM e do relógio, escrito no `estado`.
 *
 * Nada aqui chama setState. Cada handler muda o objeto `estado` e chama
 * `estado.invalidar()` — o quadro novo é problema da PetCena. A expressão
 * também é espelhada em `data-expressao` no wrapper: custa uma escrita de
 * atributo e é o que deixa o teste de navegador saber se ele dormiu.
 */
export const ALVOS_HOVER = "a, button, [data-zoom], [data-previa]";

/** px/s que já contam como rolagem "cheia" (inclinação máxima). */
const VEL_MAX = 3000;
/** Sem evento de scroll por este tempo, a rolagem acabou. */
const FIM_ROLAGEM_MS = 140;

/**
 * Limita a [-1, 1]. NaN vira 0 (janela de largura 0 dá 0/0 em `direcao`) e
 * o `+ 0` troca -0 por 0, para nenhum leitor ver um zero com sinal.
 */
const limitar = (v: number) => (Number.isNaN(v) ? 0 : Math.min(1, Math.max(-1, v)) + 0);

type JanelaDeTeste = Window & { __sxPetSonoMs?: number };

export function usePetEventos(
  estado: EstadoPet,
  raiz: RefObject<HTMLElement>,
  ativo: boolean,
): (ev: EventoPet) => void {
  const despacharRef = useRef<(ev: EventoPet) => void>(() => {});

  useEffect(() => {
    if (!ativo) return;
    const sonoMs = (window as JanelaDeTeste).__sxPetSonoMs ?? SONO_MS;

    let tSono: ReturnType<typeof setTimeout> | undefined;
    let tPiscada: ReturnType<typeof setTimeout> | undefined;
    let tFimPiscada: ReturnType<typeof setTimeout> | undefined;
    let tSurpresa: ReturnType<typeof setTimeout> | undefined;
    let tRolagem: ReturnType<typeof setTimeout> | undefined;
    let iZ: ReturnType<typeof setInterval> | undefined;

    const centro = () => {
      const r = raiz.current?.getBoundingClientRect();
      return r
        ? { x: r.left + r.width / 2, y: r.top + r.height / 2 }
        : { x: window.innerWidth, y: window.innerHeight };
    };
    const direcao = (x: number, y: number) => {
      const c = centro();
      return {
        x: limitar((x - c.x) / (window.innerWidth / 2)),
        y: limitar((y - c.y) / (window.innerHeight / 2)),
      };
    };
    const espelhar = () => {
      if (raiz.current) raiz.current.dataset.expressao = estado.expressao;
    };

    const despachar = (ev: EventoPet) => {
      const antes = estado.expressao;
      const depois = transicao(antes, ev);
      if (depois === antes) return;
      estado.expressao = depois;
      if (antes === "dormindo") clearInterval(iZ);
      if (depois === "surpreso") {
        clearTimeout(tSurpresa);
        tSurpresa = setTimeout(() => despachar({ tipo: "fimSurpresa" }), SURPRESA_MS);
      }
      if (depois === "piscando") {
        clearTimeout(tFimPiscada);
        tFimPiscada = setTimeout(() => despachar({ tipo: "fimPiscar" }), PISCADA_MS);
      }
      if (depois === "dormindo") {
        estado.zFase = 0;
        clearInterval(iZ);
        iZ = setInterval(() => {
          estado.zFase += 1;
          estado.invalidar();
        }, Z_PASSO_MS);
      }
      espelhar();
      estado.invalidar();
    };
    despacharRef.current = despachar;

    const armarSono = () => {
      clearTimeout(tSono);
      tSono = setTimeout(() => despachar({ tipo: "inatividade" }), sonoMs);
    };
    const armarPiscada = () => {
      clearTimeout(tPiscada);
      tPiscada = setTimeout(() => {
        despachar({ tipo: "piscar" });
        armarPiscada();
      }, intervaloPiscada(Math.random()));
    };
    const atividade = () => {
      despachar({ tipo: "atividade" });
      armarSono();
    };

    const onMove = (e: PointerEvent) => {
      const d = direcao(e.clientX, e.clientY);
      estado.olhar.x = d.x;
      estado.olhar.y = d.y;
      atividade();
      estado.invalidar();
    };

    let ultimoY = window.scrollY;
    let ultimoT = performance.now();
    const onScroll = () => {
      const t = performance.now();
      const dt = Math.max(t - ultimoT, 1);
      const v = ((window.scrollY - ultimoY) / dt) * 1000;
      ultimoY = window.scrollY;
      ultimoT = t;
      estado.rolagem = limitar(v / VEL_MAX);
      clearTimeout(tRolagem);
      tRolagem = setTimeout(() => {
        estado.rolagem = 0;
        estado.invalidar();
      }, FIM_ROLAGEM_MS);
      atividade();
      estado.invalidar();
    };

    const alvoDe = (t: EventTarget | null) => {
      const el = (t as Element | null)?.closest?.(ALVOS_HOVER) ?? null;
      return el && !raiz.current?.contains(el) ? el : null;
    };
    const onOver = (e: PointerEvent) => {
      const alvo = alvoDe(e.target);
      if (!alvo) return;
      const r = alvo.getBoundingClientRect();
      estado.alvoHover = direcao(r.left + r.width / 2, r.top + r.height / 2);
      despachar({ tipo: "hover", ativo: true });
      estado.invalidar();
    };
    const onOut = (e: PointerEvent) => {
      const alvo = alvoDe(e.target);
      if (!alvo) return;
      if (alvoDe(e.relatedTarget) === alvo) return;
      estado.alvoHover = null;
      despachar({ tipo: "hover", ativo: false });
      estado.invalidar();
    };

    const pararTimers = () => {
      clearTimeout(tSono);
      clearTimeout(tPiscada);
      clearTimeout(tFimPiscada);
      clearTimeout(tSurpresa);
      clearTimeout(tRolagem);
      clearInterval(iZ);
    };
    const onVisibilidade = () => {
      if (document.hidden) {
        pararTimers();
        estado.rolagem = 0;
        estado.invalidar();
      } else {
        // Os timers que encerravam piscada/surpresa morreram com a aba
        // escondida; sem isto ele ficaria de olho fechado até dormir.
        despachar({ tipo: "fimPiscar" });
        despachar({ tipo: "fimSurpresa" });
        atividade();
        armarPiscada();
      }
    };

    // Uma montagem anterior (ou o `ativo` desligado) pode ter deixado uma
    // expressão cujo timer já não existe. Começa sempre do zero.
    estado.expressao = "normal";
    estado.rolagem = 0;
    estado.alvoHover = null;
    espelhar();
    estado.invalidar();
    armarSono();
    armarPiscada();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", atividade);
    window.addEventListener("pointerdown", atividade);
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    document.addEventListener("visibilitychange", onVisibilidade);

    return () => {
      pararTimers();
      despacharRef.current = () => {};
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", atividade);
      window.removeEventListener("pointerdown", atividade);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("visibilitychange", onVisibilidade);
    };
  }, [estado, raiz, ativo]);

  return useCallback((ev: EventoPet) => despacharRef.current(ev), []);
}
