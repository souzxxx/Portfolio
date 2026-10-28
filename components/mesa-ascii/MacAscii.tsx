"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { LIMIAR_PX } from "../pet/teleporte";
import { ancorarMac, olhosEmRepouso, type Ancora, type Ret } from "./ancora";
import { criarMac, desenharMac, pertoDoMac, pularMac, redimensionarMac, type EntradaMac } from "./cena";
import { CELULA_A, CELULA_L, COR_OURO, criarQuadro, limparQuadro, type Quadro } from "./grade";
import { MAX_ONDAS, ONDA_PASSO_PX, desenharOndas, type Onda } from "./ondas";

/**
 * MacAscii — o Mac gigante em ASCII que mora atrás das janelas da mesa.
 *
 * Este arquivo só MEDE, PINTA e OUVE. O que cada célula mostra é da cena
 * (cena.ts), das ondas (ondas.ts) e da âncora (ancora.ts), todas puras.
 *
 * CANVAS 2D, não three nem DOM: são milhares de células por quadro, cada uma
 * um retângulo e um caractere com alfa. Em DOM seriam milhares de nós
 * mexendo a cada quadro; em WebGL, um segundo contexto além do da gravura e
 * do pet. Um canvas 2D com o DPR limitado a 2 pinta só as células acesas.
 *
 * Z NEGATIVO (`-z-10`): a section da mesa é `isolate`, então o z negativo
 * fica DENTRO dela, acima do pontilhado (o fundo da própria section) e abaixo
 * de tudo o mais (janelas, ícones, a dica de rolar). As janelas continuam
 * opacas por cima e o canvas é `pointer-events-none`: não rouba clique.
 *
 * MEDE POR `offset*`, não por `getBoundingClientRect`: a entrada
 * `.janela-entra` e o arraste do framer mexem no `transform` das janelas, e o
 * Mac não pode nascer torto no meio da entrada nem seguir uma janela
 * arrastada. A soma de `offsetLeft/Top` até a section ignora o transform e dá
 * o lugar de layout. Mede no ResizeObserver (a section e as janelas, que
 * mudam de altura quando as fontes chegam) e de novo no fim de cada
 * `.janela-entra`; a última fecha a conta. A coluna de ícones entra na conta
 * com os rótulos, que passam da caixa do `nav`: o Mac não pinta embaixo deles.
 *
 * O RELÓGIO da cena começa em 0 e anda pelo `dt` de cada quadro (no máximo
 * 50 ms, como no protótipo), não pelo `performance.now()`: a primeira piscada
 * é marcada para 1.8 s e dispararia logo no primeiro quadro. Ele só anda com
 * o laço ligado, e o laço só liga com a mesa na tela, a aba visível e o
 * SOUZXXX ainda abaixo da MenuBar. Esse último é o que o IntersectionObserver
 * não vê: no sticky a mesa continua cruzando a viewport por mais ~300–420 px
 * de rolagem depois que o SOUZXXX (`[data-cortina]`, em Home.tsx) a cobriu
 * inteira. Com a borda de cima dele na linha da MenuBar, a mesma em que o pet
 * entra (`LIMIAR_PX`), o Mac já saiu de cena (spec §5.1) e não pinta nada.
 *
 * O CLIQUE na mesa vazia sai no `pointerdown` do mouse, sem esperar soltar.
 * No toque e na caneta ele espera o `click`: o `pointerdown` deles chega antes
 * de o navegador decidir se o dedo vai tocar ou rolar, e toda rolagem que
 * começasse na mesa faria o Mac pular e se assustar. Rolar não é clicar na
 * mesa (spec §3.2), e o `click` só sai de um toque que não virou rolagem.
 *
 * Sem movimento (`prefers-reduced-motion`), um quadro parado, redesenhado só
 * quando a medida muda; nada de laço nem de mouse. Abaixo de 1024 px nada
 * monta, nem o canvas.
 *
 * Com `window.__sxMesaTeste`, expõe `window.__sxMacAscii` para o
 * scripts/verify-mesa.ts: os olhos em repouso e a caixa das células acesas
 * do último quadro, na viewport; os quadros pintados, o custo médio de um
 * quadro e os pulos.
 */
const CREME = "#F5F3EE";
const OURO = "#D4A017";
/** A pilha do token font-code. Não o font-mono do site (Courier Prime): o
 *  traço fino dele a 10 px e alfa baixo apaga a textura aprovada. */
const FONTE = "600 10px ui-monospace, SFMono-Regular, Menlo, monospace";
const DPR_MAX = 2;
/** O dt de um quadro nunca passa disso: uma aba que volta não dá um salto. */
const DT_MAX = 0.05;
/** O rastro do mouse abre uma onda fraca, no máximo uma a cada 80 ms. */
const FORCA_RASTRO = 0.32;
const RASTRO_MIN_S = 0.08;
const FORCA_CLIQUE = 1;
/** Um clique nisso é das janelas, dos ícones ou de um controle, não da mesa. */
const NAO_E_MESA = '[data-janela], nav, a, button, input, textarea, [role="dialog"]';
const JANELAS_DA_ANCORA = ["leiame", "render", "terminal"] as const;

type IdAncora = (typeof JANELAS_DA_ANCORA)[number];

type MacAsciiTeste = {
  olhos: { esq: DOMRectInit; dir: DOMRectInit };
  /** As células acesas do último quadro: o Mac, a sombra e as ondas que houver. */
  mac: DOMRectInit;
  quadros: number;
  msMedio: number;
  pulos: number;
};
type JanelaDeTeste = Window & { __sxMesaTeste?: boolean; __sxMacAscii?: MacAsciiTeste };

/** Só monta no cliente (o Desktop o carrega com `ssr: false`). */
function useMidia(consulta: string) {
  const [bate, setBate] = useState(() => window.matchMedia(consulta).matches);
  useEffect(() => {
    const q = window.matchMedia(consulta);
    const sync = () => setBate(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, [consulta]);
  return bate;
}

/** O que o canvas pinta: preenchimento visível ou um glifo que não é espaço. */
function celulaAcesa(q: Quadro, id: number): boolean {
  if (q.fundo[id] > 0.004) return true;
  const c = q.glifo[id];
  return q.alfa[id] > 0.01 && c !== 32 && c !== 0;
}

/** O retângulo de layout de `el` na section: offsets até ela, sem transform. */
function retNaSecao(el: HTMLElement, secao: HTMLElement): Ret | null {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== secao) {
    x += n.offsetLeft;
    y += n.offsetTop;
    const pai = n.offsetParent as HTMLElement | null;
    if (pai && pai !== secao) {
      x += pai.clientLeft;
      y += pai.clientTop;
    }
    n = pai;
  }
  // `display: none` no caminho, ou a section não é ancestral posicionado
  if (n !== secao || !el.offsetWidth) return null;
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/**
 * O retângulo de `el` com tudo o que ele tem dentro. Os rótulos dos ícones
 * (até 6.5rem) passam ~8 px de cada lado do nav (5.5rem), e o texto vence.
 */
function retComFilhos(el: HTMLElement, secao: HTMLElement): Ret | null {
  const r = retNaSecao(el, secao);
  if (!r) return null;
  let x0 = r.x;
  let y0 = r.y;
  let x1 = r.x + r.w;
  let y1 = r.y + r.h;
  for (const f of el.querySelectorAll("*")) {
    // o SVG do ícone não tem offset*; a caixa dele é a do span em volta
    const q = f instanceof HTMLElement ? retNaSecao(f, secao) : null;
    if (!q) continue;
    x0 = Math.min(x0, q.x);
    y0 = Math.min(y0, q.y);
    x1 = Math.max(x1, q.x + q.w);
    y1 = Math.max(y1, q.y + q.h);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

export function MacAscii({ mesa }: { mesa: RefObject<HTMLElement> }) {
  const cabe = useMidia("(min-width: 1024px)");
  const reduzido = useMidia("(prefers-reduced-motion: reduce)");
  const tela = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const secao = mesa.current;
    const cv = tela.current;
    const ctx = cv?.getContext("2d");
    if (!cabe || !secao || !cv || !ctx) return;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let q: Quadro = criarQuadro(1, 1);
    const mac = criarMac(q);
    let ancora: Ancora | null = null;
    /** A última medida boa de cada janela: uma janela fechada não some com o Mac. */
    const rets: Partial<Record<IdAncora, Ret>> = {};
    let icones: Ret | null = null;
    let ondas: Onda[] = [];
    let mouse: { x: number; y: number } | null = null;
    let rastro: { x: number; y: number; t: number } | null = null;
    let t = 0;
    let antes = -1;
    let raf = 0;
    let naTela = false;
    /** O SOUZXXX já cobriu a mesa: a borda de cima dele na linha da MenuBar. */
    let coberta = false;
    let msTotal = 0;

    const w = window as JanelaDeTeste;
    const teste: MacAsciiTeste | null =
      w.__sxMesaTeste === true
        ? {
            get olhos() {
              const r = secao.getBoundingClientRect();
              const naViewport = (o: Ret): DOMRectInit => ({
                x: r.left + secao.clientLeft + o.x,
                y: r.top + secao.clientTop + o.y,
                width: o.w,
                height: o.h,
              });
              if (!ancora) return { esq: {}, dir: {} };
              const { esq, dir } = olhosEmRepouso(ancora);
              return { esq: naViewport(esq), dir: naViewport(dir) };
            },
            get mac() {
              let i0 = Infinity;
              let j0 = Infinity;
              let i1 = -1;
              let j1 = -1;
              for (let j = 0; j < q.linhas; j++)
                for (let i = 0; i < q.cols; i++)
                  if (celulaAcesa(q, j * q.cols + i)) {
                    i0 = Math.min(i0, i);
                    i1 = Math.max(i1, i);
                    j0 = Math.min(j0, j);
                    j1 = Math.max(j1, j);
                  }
              if (i1 < 0) return {};
              const r = secao.getBoundingClientRect();
              return {
                x: r.left + secao.clientLeft + i0 * CELULA_L,
                y: r.top + secao.clientTop + j0 * CELULA_A,
                width: (i1 - i0 + 1) * CELULA_L,
                height: (j1 - j0 + 1) * CELULA_A,
              };
            },
            quadros: 0,
            msMedio: 0,
            pulos: 0,
          }
        : null;
    if (teste) w.__sxMacAscii = teste;

    const pintar = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.font = FONTE;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const { cols, linhas, glifo, alfa, fundo, cor } = q;
      // quase tudo é creme: o fillStyle só troca no selo dourado
      let corAtual = -1;
      for (let j = 0; j < linhas; j++) {
        const y = j * CELULA_A;
        for (let i = 0; i < cols; i++) {
          const id = j * cols + i;
          if (!celulaAcesa(q, id)) continue;
          const f = fundo[id];
          const a = alfa[id];
          const c = glifo[id];
          const x = i * CELULA_L;
          if (cor[id] !== corAtual) {
            corAtual = cor[id];
            ctx.fillStyle = corAtual === COR_OURO ? OURO : CREME;
          }
          // 1 px de folga em volta do preenchimento: é o que deixa a grade aparecer
          if (f > 0.004) {
            ctx.globalAlpha = f;
            ctx.fillRect(x + 0.5, y + 0.5, CELULA_L - 1, CELULA_A - 1);
          }
          if (a > 0.01 && c !== 32 && c !== 0) {
            // alfa acima de 1 o canvas ignora, e ficaria o da célula anterior
            ctx.globalAlpha = a < 1 ? a : 1;
            ctx.fillText(String.fromCharCode(c), x + CELULA_L / 2, y + CELULA_A / 2 + 0.5);
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    /** Um quadro inteiro: cena, ondas, pintura. `dt = 0` repinta sem andar. */
    const quadro = (dt: number) => {
      if (!ancora) return;
      const inicio = performance.now();
      t += dt;
      const e: EntradaMac = { t, dt, mesa: { w: W, h: H }, ancora, mouse, reduzido };
      limparQuadro(q);
      // as ondas antes: o Mac pinta por cima e elas passam por baixo dele
      if (!reduzido) ondas = desenharOndas(q, ondas, t);
      desenharMac(q, mac, e);
      pintar();
      if (teste) {
        msTotal += performance.now() - inicio;
        teste.quadros++;
        teste.msMedio = msTotal / teste.quadros;
      }
    };

    const medir = () => {
      const novoW = secao.clientWidth;
      const novoH = secao.clientHeight;
      if (!novoW || !novoH) return;
      const novoDpr = Math.min(DPR_MAX, window.devicePixelRatio || 1);
      if (novoW !== W || novoH !== H || novoDpr !== dpr) {
        W = novoW;
        H = novoH;
        dpr = novoDpr;
        // trocar o tamanho do buffer apaga o canvas: o quadro de baixo repinta
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
        q = criarQuadro(W, H);
        redimensionarMac(mac, q);
      }
      for (const id of JANELAS_DA_ANCORA) {
        const el = secao.querySelector<HTMLElement>(`[data-janela="${id}"]`);
        const r = el && retNaSecao(el, secao);
        if (r) rets[id] = r;
      }
      const nav = secao.querySelector<HTMLElement>("nav");
      icones = (nav && retComFilhos(nav, secao)) ?? icones;
      // sem ícones medidos, a borda direita da mesa faz o papel deles
      const navOuBorda = icones ?? { x: W, y: 0, w: 0, h: H };
      const { leiame, render, terminal } = rets;
      if (leiame && render && terminal)
        ancora = ancorarMac({ w: W, h: H }, { leiame, render, terminal, nav: navOuBorda });
      quadro(0);
    };

    const laco = (agora: number) => {
      const dt = antes < 0 ? 1 / 60 : Math.min(DT_MAX, Math.max(0, (agora - antes) / 1000));
      antes = agora;
      quadro(dt);
      raf = requestAnimationFrame(laco);
    };

    const ligar = () => {
      const deve = !reduzido && naTela && !coberta && !document.hidden;
      if (deve && !raf) {
        antes = -1;
        raf = requestAnimationFrame(laco);
      } else if (!deve && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const ro = new ResizeObserver(medir);
    ro.observe(secao);
    for (const el of secao.querySelectorAll<HTMLElement>("[data-janela]")) ro.observe(el);
    const aoAcabarEntrada = (e: AnimationEvent) => {
      if ((e.target as Element).classList?.contains("janela-entra")) medir();
    };
    secao.addEventListener("animationend", aoAcabarEntrada);
    medir();

    if (reduzido) {
      return () => {
        ro.disconnect();
        secao.removeEventListener("animationend", aoAcabarEntrada);
        if (teste && w.__sxMacAscii === teste) delete w.__sxMacAscii;
      };
    }

    const io = new IntersectionObserver(([en]) => {
      naTela = en.isIntersecting;
      ligar();
    });
    io.observe(secao);
    document.addEventListener("visibilitychange", ligar);

    // A cortina: uma leitura por quadro, no máximo, no scroll e no resize.
    let lendoCortina = 0;
    const lerCortina = () => {
      lendoCortina = 0;
      const cortina = document.querySelector("[data-cortina]");
      coberta = !!cortina && cortina.getBoundingClientRect().top <= LIMIAR_PX;
      ligar();
    };
    const aoRolar = () => {
      if (!lendoCortina) lendoCortina = requestAnimationFrame(lerCortina);
    };
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);
    // aberta já rolada (recarregar no meio da página): nasce parado
    lerCortina();

    const naMesa = (e: MouseEvent) => {
      const r = secao.getBoundingClientRect();
      return { x: e.clientX - r.left - secao.clientLeft, y: e.clientY - r.top - secao.clientTop };
    };
    const onda = (x: number, y: number, forca: number) => {
      ondas.push({ x, y, t0: t, forca });
      if (ondas.length > MAX_ONDAS) ondas.shift();
    };
    const aoMover = (e: PointerEvent) => {
      // no toque não há cursor: os olhos ficam no centro
      if (e.pointerType === "touch") return;
      const p = naMesa(e);
      mouse = p;
      if (!rastro || (Math.hypot(p.x - rastro.x, p.y - rastro.y) > ONDA_PASSO_PX && t - rastro.t >= RASTRO_MIN_S)) {
        onda(p.x, p.y, FORCA_RASTRO);
        rastro = { x: p.x, y: p.y, t };
      }
    };
    const aoSair = () => {
      mouse = null;
    };
    /** Clique na mesa vazia: onda forte, pulo e, se foi perto, susto. */
    const clicarNaMesa = (e: MouseEvent) => {
      if (e.button !== 0 || !ancora) return;
      if ((e.target as Element | null)?.closest?.(NAO_E_MESA)) return;
      const p = naMesa(e);
      onda(p.x, p.y, FORCA_CLIQUE);
      const perto = pertoDoMac({ t, dt: 0, mesa: { w: W, h: H }, ancora, mouse: p, reduzido });
      pularMac(mac, perto, t);
      if (teste) teste.pulos++;
    };
    // Quem apertou por último decide quem atende o clique: o mouse já no
    // aperto, o toque e a caneta só no `click` que vem depois (ver o topo).
    // O `click` do mouse chega também, e é ignorado: o pulo já saiu.
    let toque = false;
    const aoApertar = (e: PointerEvent) => {
      toque = e.pointerType === "touch" || e.pointerType === "pen";
      if (!toque) clicarNaMesa(e);
    };
    const aoClicar = (e: MouseEvent) => {
      if (toque) clicarNaMesa(e);
    };
    secao.addEventListener("pointermove", aoMover);
    secao.addEventListener("pointerleave", aoSair);
    secao.addEventListener("pointerdown", aoApertar);
    secao.addEventListener("click", aoClicar);

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      cancelAnimationFrame(lendoCortina);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", ligar);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
      secao.removeEventListener("animationend", aoAcabarEntrada);
      secao.removeEventListener("pointermove", aoMover);
      secao.removeEventListener("pointerleave", aoSair);
      secao.removeEventListener("pointerdown", aoApertar);
      secao.removeEventListener("click", aoClicar);
      if (teste && w.__sxMacAscii === teste) delete w.__sxMacAscii;
    };
  }, [cabe, reduzido, mesa]);

  if (!cabe) return null;
  return (
    <canvas
      ref={tela}
      data-mac-ascii=""
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 block h-full w-full"
    />
  );
}
