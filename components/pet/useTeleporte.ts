"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import {
  QUADROS,
  TELEPORTE_ENTRA_MS,
  TELEPORTE_SAI_MS,
  jaChegou,
  querDentro,
  type FaseTeleporte,
  type ParteTeleporte,
} from "./teleporte";

/** Um popstate até este tanto antes de a sessão começar foi o que a trouxe. */
const JANELA_VOLTA_MS = 1000;
/** Quanto a primeira medida espera, depois de um voltar, a rolagem que não veio. */
const ESPERA_ROLAGEM_MS = 150;

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
 * é o que deixa o corpo em opacidade 0 depois da saída terminar. Só que o
 * `play()` rebobina nas pontas: ao contrário com o tempo em 0, ou para a
 * frente com ele no fim, salta para a outra ponta e toca tudo. Por isso,
 * antes de tocar, `jaChegou` pergunta se a animação já está onde o rumo novo
 * termina (uma inversão no quadro em que a entrada nem andou); se está, só
 * pausa ali e assenta a fase.
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
 * VOLTAR DO NAVEGADOR (popstate, client-side): o React pinta a home em y = 0
 * e só ~10 ms depois o navegador devolve a rolagem dela. Medida na hora, a
 * cortina estaria lá embaixo, a mesa à vista, e o pet começava a sair para
 * voltar logo que a rolagem chegasse (saindo → entrando). Então a sessão que
 * nasce de um voltar não mede na hora: a rolagem devolvida chega como um
 * `scroll` e mede por ele; se não vier (a home estava no topo, não há o que
 * rolar), mede depois de ESPERA_ROLAGEM_MS. Até lá o pet fica como estava, e
 * assenta direto no certo: fica, ou sai uma vez só.
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

  // Quando foi o último voltar/avançar do navegador. Ouvido sempre, não só
  // na home: o popstate chega ainda no case, antes de a sessão começar.
  const volta = useRef(-Infinity);
  useEffect(() => {
    const marcar = () => {
      volta.current = performance.now();
    };
    window.addEventListener("popstate", marcar);
    return () => window.removeEventListener("popstate", marcar);
  }, []);

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
      // o `finished` do rumo anterior, se ainda vier, não vale mais
      const minha = ++vez;
      if (jaChegou(alvo, Number(corpo.currentTime ?? 0))) {
        for (const a of animacoes) {
          a.pause();
          a.currentTime = alvo ? TELEPORTE_ENTRA_MS : 0;
        }
        mudar(alvo ? "dentro" : "fora");
        return;
      }
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
    let espera = 0;
    const medir = () => {
      quadro = 0;
      // a primeira medida depois de um voltar já veio pelo scroll
      window.clearTimeout(espera);
      const cortina = document.querySelector("[data-cortina]");
      if (!cortina) return;
      quer = querDentro(cortina.getBoundingClientRect().top, quer);
      ir(quer);
    };
    const agendar = () => {
      if (!quadro) quadro = requestAnimationFrame(medir);
    };

    // Vindo de um voltar, espera a rolagem devolvida (ver o topo). A espera
    // termina num quadro, como o scroll: se a rolagem e o fim dela caírem
    // juntos, o quadro já vê a posição devolvida.
    if (performance.now() - volta.current < JANELA_VOLTA_MS) {
      espera = window.setTimeout(agendar, ESPERA_ROLAGEM_MS);
    } else {
      medir();
    }
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    return () => {
      vivo = false;
      window.clearTimeout(espera);
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
