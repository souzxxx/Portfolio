"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DictPet } from "@/lib/dict";
import { CanvasBoundary } from "../hero/CanvasBoundary";
import { criarEstado } from "./estado";
import { rotaDoPet, useSecaoAtual } from "./secao";
import { useDesvio } from "./useDesvio";
import { usePetEventos } from "./usePetEventos";
import type { FaseTeleporte } from "./teleporte";
import { useTeleporte } from "./useTeleporte";

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
 * O BOTÃO e a ENTRADA esperam o primeiro quadro da PetCena (`onPronto`).
 * Até lá o wrapper fica transparente e sem botão: nada de alvo invisível
 * enquanto o chunk do three baixa, e o canvas mede a caixa sem escala.
 *
 * NA HOME (spec §5) o pet não divide a tela com a mesa: enquanto ela está à
 * vista, ele fica fora de cena, e entra com o teletransporte quando a borda
 * de cima do SOUZXXX encosta na MenuBar; rolando de volta, sai do mesmo
 * jeito. Quem decide e toca é o useTeleporte (regra e quadros em
 * teleporte.ts). Fora de cena a cena continua MONTADA e pronta, para o
 * primeiro teletransporte não esperar download nem shader, mas escondida:
 * `visibility: hidden`, `inert`, sem botão e sem pedir quadro
 * (`estado.oculto`). O botão, o balão e o desvio só existem com ele
 * `dentro`; se o balão estava aberto quando ele saiu, fecha. Nas outras
 * rotas a fase é sempre `dentro` e a entrada é a `.pet-entra` de antes, que
 * só toca quando ele chega invisível (ver `ultimaNaHome`).
 *
 * O EFEITO é DOM em volta do canvas, sem tocar no shader: o corpo (o canvas)
 * estica e pisca, e ao lado dele um risco, quatro linhas de velocidade e
 * duas silhuetas chapadas (as imagens residuais). As silhuetas ficam ATRÁS do
 * corpo, para só a borda deslocada aparecer; o risco e as linhas, na frente.
 * Todos se posicionam por `left`/`top`, nunca por `transform`, que é o que a
 * animação escreve.
 *
 * DESVIO: quando um controle fica embaixo do botão, o pet sai de cima (sobe;
 * sem lugar em cima, vai para a esquerda). Ver desvio.ts e useDesvio.ts. Anda
 * por `translate` e não por `transform`, porque a `.pet-entra` tem fill
 * `both` e prende o `transform` depois de acabar.
 *
 * O texto chega por prop numa língua só, vindo do layout (servidor). Ver a
 * regra de fatias no fim de lib/dict.ts.
 */
const PetCena = dynamic(() => import("./PetCena").then((m) => m.PetCena), {
  ssr: false,
  loading: () => null,
});

const MIDIA = "(hover: hover) and (pointer: fine) and (min-width: 1024px)";

/** As peças do teletransporte, paradas: invisíveis e sem clique (o `aria-hidden` vai em cada uma). */
const EFEITO = "pointer-events-none absolute opacity-0";
/** Risco e linhas: traço creme com um filete carvão, que lê sobre papel e sobre carvão. */
const TRACO = "bg-cream shadow-[0_0_0_1px_#1C1A17]";
/** Imagem residual: a silhueta chapada do Mac (o retângulo do botão). */
const RESIDUO = "left-[31px] top-[23px] h-[104px] w-[88px] border border-carvao bg-cream";

type JanelaDeTeste = Window & { __sxPetSonoMs?: number; __sxPet?: unknown };

export function Pet({ textos }: { textos: DictPet }) {
  const pathname = usePathname() ?? "/";
  const reduzido = useReducedMotion() ?? false;
  const [cabe, setCabe] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [falhou, setFalhou] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [cenaPronta, setCenaPronta] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const estado = useRef(criarEstado()).current;

  const rota = rotaDoPet(pathname);
  const naHome = rota === "home";
  const mostrar = cabe && pronto && !falhou && rota !== "cv";
  const fase = useTeleporte(raiz, { ativo: naHome && mostrar, pronto: cenaPronta, reduzido });
  const dentro = fase === "dentro";
  estado.reduzido = reduzido;
  estado.oculto = fase === "fora";
  const despachar = usePetEventos(estado, raiz, mostrar);
  const chave = useSecaoAtual(pathname, mostrar);
  const desvio = useDesvio(raiz, mostrar && cenaPronta && dentro);
  const aoFicarPronta = useCallback(() => setCenaPronta(true), []);

  // Fora da home, a `.pet-entra` só toca para quem CHEGA invisível: carga
  // direta do case (ou do 404), ou vindo da home com o pet fora de cena. O Pet
  // mora no layout e não desmonta numa troca de rota client-side; com ele
  // visível na home, pôr a classe de novo reiniciaria a animação do zero
  // (opacidade 0) e o pet piscaria. A última fase da home é guardada no
  // render, e não num efeito, para o primeiro render fora dela já sair com a
  // classe certa.
  const ultimaNaHome = useRef<FaseTeleporte>("fora");
  if (!mostrar) ultimaNaHome.current = "fora";
  else if (naHome) ultimaNaHome.current = fase;
  const entra = cenaPronta && !naHome && ultimaNaHome.current === "fora";

  // Sem pet, sem cena: a próxima montagem (voltar do /cv, por exemplo) é um
  // canvas novo e espera o primeiro quadro DELE.
  useEffect(() => {
    if (!mostrar) setCenaPronta(false);
  }, [mostrar]);

  // Saiu de cena: o balão vai junto, para não ficar falando sozinho no canto.
  useEffect(() => {
    if (!dentro) setAberto(false);
  }, [dentro]);

  // Fora de cena a PetCena para de pedir quadro; ao sair de `fora` ela
  // precisa de um empurrão para voltar a desenhar. E quem chega se assusta.
  useEffect(() => {
    if (fase === "fora") return;
    estado.invalidar();
    if (fase === "entrando") despachar({ tipo: "teleporte" });
  }, [fase, estado, despachar]);

  // `inert` pelo DOM: o @types/react 18 ainda não conhece o atributo. Sem
  // estar dentro, nada do pet recebe foco nem clique.
  useEffect(() => {
    if (raiz.current) raiz.current.inert = !dentro;
  }, [dentro, mostrar]);

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
      data-teleporte={fase}
      className={`${entra ? "pet-entra " : ""}pet-desvio pointer-events-none fixed bottom-6 right-6 z-[60] h-[150px] w-[150px]`}
      style={{
        opacity: cenaPronta ? undefined : 0,
        visibility: fase === "fora" ? "hidden" : undefined,
        translate: `${-desvio.x}px ${-desvio.y}px`,
      }}
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

      {/* Atrás do corpo: só a borda deslocada da silhueta aparece. */}
      <span aria-hidden data-teleporte-parte="residuo-esq" className={`${EFEITO} ${RESIDUO}`} />
      <span aria-hidden data-teleporte-parte="residuo-dir" className={`${EFEITO} ${RESIDUO}`} />

      {/* O corpo é o que estica e pisca. A animação escreve `transform` aqui
          e não no wrapper: o desvio anda por `translate` no wrapper, e o R3F
          mede por offsetSize, que ignora transform (canvas fica 150×150). */}
      <div data-teleporte-parte="corpo" className="absolute inset-0">
        <CanvasBoundary onFalha={() => setFalhou(true)}>
          <PetCena estado={estado} onPronto={aoFicarPronta} />
        </CanvasBoundary>
      </div>

      {/* Na frente: o risco no eixo do Mac e as linhas de velocidade. */}
      <span aria-hidden data-teleporte-parte="risco" className={`${EFEITO} ${TRACO} left-[73px] top-[23px] h-[104px] w-[3px]`} />
      <span aria-hidden data-teleporte-parte="linha-esq" className={`${EFEITO} ${TRACO} left-[22px] top-[52px] h-px w-5`} />
      <span aria-hidden data-teleporte-parte="linha-esq" className={`${EFEITO} ${TRACO} left-[22px] top-[88px] h-px w-7`} />
      <span aria-hidden data-teleporte-parte="linha-dir" className={`${EFEITO} ${TRACO} right-[22px] top-[52px] h-px w-5`} />
      <span aria-hidden data-teleporte-parte="linha-dir" className={`${EFEITO} ${TRACO} right-[22px] top-[88px] h-px w-7`} />

      {cenaPronta && dentro ? (
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
          className="pointer-events-auto absolute left-1/2 top-1/2 h-[104px] w-[88px] -translate-x-1/2 -translate-y-1/2 cursor-pointer focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#F5F3EE,0_0_0_4px_#1C1A17]"
        />
      ) : null}
    </div>
  );
}
