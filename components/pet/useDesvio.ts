"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { calcularDesvio, type Desvio, type Retangulo } from "./desvio";

/**
 * Mede o que está embaixo do pet e devolve o desvio (ver desvio.ts).
 *
 * MEDIÇÃO: uma grade 3×3 de pontos no retângulo do BOTÃO (88×104, a única
 * parte que rouba clique), na posição candidata. Em cada ponto vale o
 * primeiro elemento que não é o pet — o que receberia o clique se ele não
 * estivesse ali. Não basta "qualquer elemento no ponto": com a mesa sticky, a
 * Lixeira continua no DOM embaixo da seção que rola por cima dela, e o pet
 * fugiria de um ícone que ninguém vê.
 *
 * QUANDO: scroll e resize (um cálculo por quadro, no máximo), uma vez ~300 ms
 * depois de montar, no `pointerup` (fim de arrastar janela, fechar o
 * Terminal) e a cada segundo. O segundo cobre o que muda a mesa sem evento
 * nenhum: a cortina do Boot saindo e as janelas entrando por animação. São
 * no máximo ~60 `elementsFromPoint` por segundo parado; nada perto do custo
 * do quadro do pet.
 *
 * Só chama setState quando o desvio arredondado muda.
 */
export const INTERATIVOS =
  'a, button, [data-zoom], [data-previa], input, select, textarea, [role="button"]';

/** Teto do desvio: 45% da altura da janela. */
const TETO = 0.45;
/** Posições da grade dentro do botão, em fração da largura/altura. */
const GRADE = [0.08, 0.5, 0.92];
const PRIMEIRA_MEDIDA_MS = 300;
const VIGIA_MS = 1000;

const PARADO: Desvio = { x: 0, y: 0 };

/**
 * O retângulo do botão no REPOUSO, lido do layout e não do
 * getBoundingClientRect: este inclui o `translate` do desvio (no meio da
 * transição, inclusive) e a escala da entrada `.pet-entra`. O wrapper é
 * fixo por `right`/`bottom` e o botão fica centrado nele (Pet.tsx).
 */
function repouso(raiz: HTMLElement): Retangulo | null {
  const botao = raiz.querySelector("button");
  if (!botao) return null;
  const cs = getComputedStyle(raiz);
  const doc = document.documentElement;
  const cx = doc.clientWidth - parseFloat(cs.right) - raiz.offsetWidth / 2;
  const cy = doc.clientHeight - parseFloat(cs.bottom) - raiz.offsetHeight / 2;
  const meiaL = botao.offsetWidth / 2;
  const meiaA = botao.offsetHeight / 2;
  if (![cx, cy, meiaL, meiaA].every(Number.isFinite)) return null;
  return { left: cx - meiaL, top: cy - meiaA, right: cx + meiaL, bottom: cy + meiaA };
}

export function useDesvio(raiz: RefObject<HTMLElement>, ativo: boolean): Desvio {
  const [desvio, setDesvio] = useState<Desvio>(PARADO);
  const ultimo = useRef<Desvio>(PARADO);

  useEffect(() => {
    const aplicar = (d: Desvio) => {
      if (d.x === ultimo.current.x && d.y === ultimo.current.y) return;
      ultimo.current = d;
      setDesvio(d);
    };
    // Desligado (rota sem pet, cena ainda carregando): volta ao canto, para
    // a próxima entrada não nascer deslocada por uma página que já saiu.
    if (!ativo) {
      aplicar(PARADO);
      return;
    }

    const amostrar = (el: HTMLElement) => (c: Retangulo) => {
      const achados = new Set<Element>();
      for (const fx of GRADE) {
        for (const fy of GRADE) {
          const x = c.left + (c.right - c.left) * fx;
          const y = c.top + (c.bottom - c.top) * fy;
          const topo = document.elementsFromPoint(x, y).find((e) => !el.contains(e));
          const alvo = topo?.closest(INTERATIVOS);
          if (alvo) achados.add(alvo);
        }
      }
      return Array.from(achados, (a) => a.getBoundingClientRect());
    };

    let quadro = 0;
    const medir = () => {
      quadro = 0;
      const el = raiz.current;
      if (!el || document.hidden) return;
      const r = repouso(el);
      if (!r) return;
      const d = calcularDesvio(r, amostrar(el), Math.round(window.innerHeight * TETO));
      aplicar({ x: Math.round(d.x), y: Math.round(d.y) });
    };
    const agendar = () => {
      if (!quadro) quadro = requestAnimationFrame(medir);
    };

    const primeira = setTimeout(agendar, PRIMEIRA_MEDIDA_MS);
    const vigia = setInterval(agendar, VIGIA_MS);
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    window.addEventListener("pointerup", agendar);
    return () => {
      clearTimeout(primeira);
      clearInterval(vigia);
      cancelAnimationFrame(quadro);
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
      window.removeEventListener("pointerup", agendar);
    };
  }, [raiz, ativo]);

  return desvio;
}
