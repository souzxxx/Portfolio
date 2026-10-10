"use client";

import {
  Children,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Pilha — o arquivo de pastas: cada destaque é um `<li>` sticky com `top`
 * crescente, então a pasta seguinte desliza por cima da anterior e a aba de
 * quem ficou embaixo continua à vista, como num arquivo de aço.
 *
 * O EMPILHAMENTO É CSS PURO. `position: sticky` + `top` por item fazem todo o
 * trabalho, com ou sem JavaScript. Este componente só acrescenta o detalhe de
 * profundidade: enquanto a pasta de cima avança, a de baixo encolhe 4% e
 * "apaga" — os filetes da aba somem e uma trama 1-bit cobre o corpo, que é
 * exatamente como o Macintosh desenhava a janela de trás.
 *
 * POR QUE NÃO `useScroll({ target })` DO FRAMER. Ele mede o alvo pela cadeia
 * de offsetTop, e o offsetTop de um elemento sticky ACOMPANHA a rolagem
 * enquanto ele está preso — o progresso congelaria justamente no trecho em que
 * precisa andar. Aqui o progresso da pasta `i` sai da posição REAL da pasta
 * `i + 1` (getBoundingClientRect, que respeita o sticky): 0 quando ela entra
 * pela borda de baixo da tela, 1 quando ela encaixa no próprio `top`.
 *
 * O resultado não vira estado do React: é escrito como a custom property
 * `--coberto` direto no `<li>`, e o card (que é de SERVIDOR) lê a variável no
 * CSS. Zero re-render por quadro, e o markup do card continua saindo inteiro
 * no HTML.
 *
 * Só liga onde a pilha existe (a mesma media query das classes sticky) e nunca
 * com `prefers-reduced-motion`.
 */
export const PILHA_MQ = "(min-width: 1024px) and (min-height: 700px)";

export function Pilha({
  children,
  rotulo,
}: {
  children: ReactNode;
  rotulo: string;
}) {
  const itens = Children.toArray(children);
  const n = itens.length;
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  const reduzir = useReducedMotion();

  useEffect(() => {
    if (reduzir) return;
    const mq = window.matchMedia(PILHA_MQ);
    let raf = 0;
    // O `top` de cada pasta é um calc() em rem; o valor em px só muda com
    // resize, então é medido ali e não a cada quadro.
    let presos: number[] = [];

    const limpar = () => {
      for (const li of refs.current) li?.style.removeProperty("--coberto");
    };

    const quadro = () => {
      raf = 0;
      const lis = refs.current;
      const vh = window.innerHeight;
      // Lê tudo antes de escrever qualquer coisa: intercalar leitura e
      // escrita forçaria um layout por pasta.
      const topos = lis.map((li) => li?.getBoundingClientRect().top ?? 0);
      for (let i = 0; i < n - 1; i++) {
        const curso = vh - presos[i + 1];
        const p = curso > 0 ? (vh - topos[i + 1]) / curso : 0;
        // Só a segunda metade do curso conta: enquanto a pasta de cima ainda
        // está na metade de baixo da tela, a de baixo continua sendo lida e
        // não pode parecer "apagada".
        const q = (p - 0.5) / 0.5;
        lis[i]?.style.setProperty(
          "--coberto",
          Math.min(1, Math.max(0, q)).toFixed(3),
        );
      }
    };

    const agendar = () => {
      if (!raf) raf = requestAnimationFrame(quadro);
    };

    const medir = () => {
      presos = refs.current.map((li) =>
        li ? parseFloat(getComputedStyle(li).top) || 0 : 0,
      );
    };

    const ligar = () => {
      if (mq.matches) {
        medir();
        agendar();
        window.addEventListener("scroll", agendar, { passive: true });
        window.addEventListener("resize", aoRedimensionar);
      } else {
        desligar();
      }
    };
    const aoRedimensionar = () => {
      medir();
      agendar();
    };
    const desligar = () => {
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", aoRedimensionar);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      limpar();
    };

    ligar();
    mq.addEventListener("change", ligar);
    return () => {
      mq.removeEventListener("change", ligar);
      desligar();
    };
  }, [reduzir, n]);

  return (
    <ol
      aria-label={rotulo}
      className="flex flex-col gap-[clamp(2.5rem,7vw,4rem)] [@media(min-width:1024px)_and_(min-height:700px)]:gap-[16svh]"
      style={
        {
          // Os quatro números da pilha. `--pilha-topo` deixa espaço para a
          // barra fixa da nav (44px) e mais um respiro; `--pilha-passo` é o
          // degrau entre uma pasta e a seguinte — a fatia da pasta de baixo
          // que continua aparecendo, além da aba.
          "--pilha-topo": "4.25rem",
          "--pilha-passo": "0.625rem",
          "--aba-h": "2.125rem",
          // Altura do corpo de cada pasta enquanto empilhada: a tela menos a
          // nav, a aba, os degraus de TODAS as pastas (a última encaixa mais
          // baixo que a primeira) e uma margem de 20px. Assim a pasta mais
          // funda continua inteira dentro da viewport — sticky que passa da
          // borda de baixo esconde conteúdo que ninguém consegue rolar até ver.
          "--pasta-h": `calc(100svh - var(--pilha-topo) - var(--aba-h) - ${Math.max(0, n - 1)} * var(--pilha-passo) - 1.25rem)`,
        } as CSSProperties
      }
    >
      {itens.map((item, i) => (
        <li
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="[@media(min-width:1024px)_and_(min-height:700px)]:sticky"
          style={{
            top: `calc(var(--pilha-topo) + ${i} * var(--pilha-passo))`,
          }}
        >
          <div
            className="origin-top"
            style={{
              transform: "scale(calc(1 - var(--coberto, 0) * 0.04))",
            }}
          >
            {item}
          </div>
        </li>
      ))}
    </ol>
  );
}
