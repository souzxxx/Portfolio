"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * ZoomLinks — o "abrir" do Macintosh: retângulos de contorno que crescem do
 * ícone clicado até a tela inteira, e só então a página troca.
 *
 * Um ouvinte só, no documento, para todo `<a data-zoom>` do site: quem quer o
 * efeito marca o link com o atributo e não importa nada. Clique com modificador
 * (nova aba, download), botão do meio e link externo seguem o comportamento
 * normal do navegador; `prefers-reduced-motion` navega direto.
 *
 * Os contornos usam `mix-blend-mode: difference` com borda branca — é o XOR do
 * QuickDraw: a linha aparece clara sobre carvão e escura sobre papel, sem saber
 * em que campo de cor está passando.
 */
const QUADROS = 7;
const DURACAO = 300;

function zoom(origem: DOMRect): Promise<void> {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const camada = document.createElement("div");
  camada.setAttribute("aria-hidden", "true");
  camada.style.cssText =
    "position:fixed;inset:0;z-index:200;pointer-events:none;mix-blend-mode:difference";
  document.body.appendChild(camada);

  for (let i = 0; i < QUADROS; i++) {
    const r = document.createElement("div");
    r.style.cssText = "position:absolute;border:1px solid #fff;opacity:0";
    camada.appendChild(r);
    const t = (i + 1) / QUADROS;
    const x = origem.left * (1 - t);
    const y = origem.top * (1 - t);
    const w = origem.width + (W - origem.width) * t;
    const h = origem.height + (H - origem.height) * t;
    Object.assign(r.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
    // Cada quadro acende em sequência e apaga logo depois — o rastro em degraus
    // do original, não uma interpolação lisa.
    r.animate(
      [{ opacity: 0 }, { opacity: 1, offset: 0.01 }, { opacity: 1, offset: 0.55 }, { opacity: 0 }],
      { duration: DURACAO * 0.6, delay: (DURACAO / QUADROS) * i, fill: "both" },
    );
  }
  return new Promise((ok) =>
    window.setTimeout(() => {
      ok();
      window.setTimeout(() => camada.remove(), 400);
    }, DURACAO),
  );
}

export function ZoomLinks() {
  const router = useRouter();
  useEffect(() => {
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[data-zoom]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      e.preventDefault();
      const destino = url.pathname + url.search + url.hash;
      if (reduzido.matches) {
        router.push(destino);
        return;
      }
      router.prefetch(destino);
      void zoom(a.getBoundingClientRect()).then(() => router.push(destino));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);
  return null;
}
