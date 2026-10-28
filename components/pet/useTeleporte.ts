"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import {
  QUADROS,
  TELEPORTE_ENTRA_MS,
  TELEPORTE_SAI_MS,
  querDentro,
  type FaseTeleporte,
  type ParteTeleporte,
} from "./teleporte";

/**
 * Liga o teletransporte puro (teleporte.ts) ao DOM: mede o SOUZXXX, toca os
 * quadros com a Web Animations API e devolve a fase para o Pet desenhar.
 *
 * GATILHO: a borda de cima de `[data-cortina]` (o wrapper do CutWordmark, em
 * Home.tsx), lida na montagem, no `scroll` (um cálculo por quadro, no máximo)
 * e no `resize`. A histerese é a do `querDentro`.
 *
 * ANIMAÇÃO: uma por `[data-teleporte-parte]` dentro de `raiz`, todas com a
 * duração da entrada e `fill: "both"`. Elas nascem PAUSADAS no ponto em que o
 * pet está (0 = fora, fim = dentro) e nunca são recriadas no meio do caminho:
 * trocar de rumo é `updatePlaybackRate(±)` + `play()`, que inverte a partir
 * do tempo atual. Recomeçar do zero faria o tremido (rolar para cima e para
 * baixo em volta do limiar) piscar o pet inteiro a cada troca. A saída é a
 * mesma tabela tocada ao contrário, mais rápida (ENTRA/SAI). O `fill: "both"`
 * é o que deixa o corpo em opacidade 0 depois da saída terminar.
 *
 * FASE: `entrando`/`saindo` assim que o rumo troca; `dentro`/`fora` quando a
 * animação do corpo termina. Um contador descarta o `finished` de um rumo que
 * já foi invertido, e o `finished` que rejeita no `cancel` vai para o catch.
 *
 * Antes do primeiro quadro da cena (`pronto`) não há o que mostrar: a fase
 * fica `fora` e, quando a cena fica pronta, as animações nascem em 0. Se a
 * página abriu já rolada (recarregar no meio, abrir em `/#projects`), o
 * gatilho já quer dentro e o pet entra com o teletransporte, não aparece do
 * nada.
 *
 * Sem `ativo` (fora da home, ou sem pet), cancela tudo e devolve `dentro`: o
 * pet das outras rotas é o de sempre. Voltar de lá para a home recomeça do
 * fim (ele estava visível) e, se a home estiver no topo, ele sai pelo
 * teletransporte em vez de sumir.
 *
 * Com `reduzido` não existe animação nenhuma: a fase vai direto para `dentro`
 * ou `fora`.
 */
export function useTeleporte(
  raiz: RefObject<HTMLElement>,
  { ativo, pronto, reduzido }: { ativo: boolean; pronto: boolean; reduzido: boolean },
): FaseTeleporte {
  const [fase, setFase] = useState<FaseTeleporte>("fora");
  // Espelho da fase para as sessões lerem de onde partir sem depender dela
  // (uma sessão que dependesse da fase se refaria a cada troca, e é
  // justamente a sessão que guarda as animações vivas).
  const faseRef = useRef<FaseTeleporte>("fora");
  const mudar = useCallback((f: FaseTeleporte) => {
    faseRef.current = f;
    setFase(f);
  }, []);

  // Fora da home a fase devolvida é `dentro`, mas o que fica guardado para a
  // próxima sessão é o que de fato está na tela: com a cena desenhada, o pet
  // está visível; sem ela (o pet nem montou, ou o chunk ainda baixa), não.
  useEffect(() => {
    if (!ativo) mudar(pronto ? "dentro" : "fora");
  }, [ativo, pronto, mudar]);

  useEffect(() => {
    if (!ativo) return;
    const el = raiz.current;

    // De onde esta sessão parte. Sem cena desenhada, de fora, seja qual for a
    // fase anterior: o wrapper ainda está transparente.
    const visivel = faseRef.current === "dentro" || faseRef.current === "entrando";
    let rumo = reduzido || pronto ? visivel : false;
    if (!reduzido && !pronto) mudar("fora");

    const animacoes: Animation[] = [];
    let corpo: Animation | null = null;
    if (pronto && !reduzido && el) {
      for (const parte of el.querySelectorAll<HTMLElement>("[data-teleporte-parte]")) {
        const nome = parte.dataset.teleporteParte as ParteTeleporte;
        const a = parte.animate(QUADROS[nome], { duration: TELEPORTE_ENTRA_MS, fill: "both" });
        a.pause();
        a.currentTime = rumo ? TELEPORTE_ENTRA_MS : 0;
        animacoes.push(a);
        if (nome === "corpo") corpo = a;
      }
      mudar(rumo ? "dentro" : "fora");
    }

    let vivo = true;
    let vez = 0;
    const ir = (alvo: boolean) => {
      if (reduzido) {
        rumo = alvo;
        mudar(alvo ? "dentro" : "fora");
        return;
      }
      if (!corpo || alvo === rumo) return;
      rumo = alvo;
      const minha = ++vez;
      const taxa = alvo ? 1 : -TELEPORTE_ENTRA_MS / TELEPORTE_SAI_MS;
      for (const a of animacoes) {
        a.updatePlaybackRate(taxa);
        a.play();
      }
      mudar(alvo ? "entrando" : "saindo");
      corpo.finished
        .then(() => {
          if (vivo && minha === vez) mudar(alvo ? "dentro" : "fora");
        })
        .catch(() => {});
    };

    // Sem cena, `rumo` fica em `fora` (nada a mostrar) mas a vontade do
    // gatilho é guardada à parte, para a histerese seguir a rolagem.
    let quer = rumo;
    let quadro = 0;
    const medir = () => {
      quadro = 0;
      const cortina = document.querySelector("[data-cortina]");
      if (!cortina) return;
      quer = querDentro(cortina.getBoundingClientRect().top, quer);
      ir(quer);
    };
    const agendar = () => {
      if (!quadro) quadro = requestAnimationFrame(medir);
    };

    medir();
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    return () => {
      vivo = false;
      cancelAnimationFrame(quadro);
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
      for (const a of animacoes) a.cancel();
    };
  }, [ativo, pronto, reduzido, raiz, mudar]);

  if (!ativo) return "dentro";
  // Sem cena desenhada (e com movimento permitido) é `fora` já no primeiro
  // render da sessão, antes de o efeito acima pôr isso no estado.
  if (!pronto && !reduzido) return "fora";
  return fase;
}
