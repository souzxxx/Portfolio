"use client";

/**
 * EngravedObject — a gravura da coluna direita do hero.
 *
 * Um icosaedro abstrato renderizado por ShaderMaterial GLSL autoral (ver
 * `hatch.glsl.ts`) em hachura cruzada de exatamente DUAS cores: o carvao do
 * bloco e o creme. Objeto abstrato de proposito — zero leitura mitologica, nada de
 * estatua, busto ou figura; a referencia entra como TRATAMENTO (duas cores,
 * linha, alto contraste), nunca como assunto.
 *
 * NAO importa nada do pacote drei (nem o helper shaderMaterial, nem Points,
 * nem PointMaterial). Com isso o drei sai inteiro do bundle do cliente, o que
 * sozinho paga o custo das tres fontes novas. A dependencia continua no
 * package.json, como pedido.
 *
 * ── PLANO B (primeiro caminho ACIONADO) ───────────────────────────────────
 * A trama saia como retícula de pontos na metade em sombra. O primeiro caminho
 * do plano — limpar pelo shader — resolveu: as duas familias de linha estavam a
 * exatamente 90 graus uma da outra, o que produz malha quadrada e nao
 * contra-hachura (a analise completa esta em `hatch.glsl.ts`). Nao foi preciso
 * travar o dpr nem trocar a coluna por SVG.
 *
 * O SOLIDO PASSOU A SER FACETADO no mesmo ajuste. `icosahedronGeometry` com
 * detalhe 4 e uma esfera para todos os efeitos: normal continua, tom continuo,
 * e com a hachura ancorada na tela (nao no objeto) a rotacao nao entrega
 * volume nenhum — a figura lia como um DISCO texturizado. Com detalhe 0 o
 * three devolve normais planas (`computeVertexNormals`, 20 faces): cada face
 * ganha um tom chapado proprio e o degrau de densidade de uma face para a
 * vizinha e a propria leitura de volume, que e exatamente como uma gravura
 * descreve um solido. Detalhe >= 1 volta a normalizar as normais e desfaz isto.
 *
 * SE PRECISAR DO PLANO B COMPLETO: substitua a coluna direita por um SVG
 * procedural de raios — linhas retas de 1px em creme irradiando de um foco,
 * determinístico, sem `Math.random`, na mesma familia da capa procedural dos
 * projetos — e MANTENHA a dependencia instalada. O hero continua sendo bloco
 * carvao + serifa, que e o que faz a identidade; o objeto e ornamento, nunca
 * informacao.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Vector3, type Mesh } from "three";
import { CanvasBoundary } from "./CanvasBoundary";
import { fragment, vertex } from "./hatch.glsl";

function EngravedIcosahedron() {
  const mesh = useRef<Mesh>(null);

  // #1C1A17 e #F5F3EE em 0-1. O ShaderMaterial cru nao passa por conversao de
  // color space (nao inclui o chunk de colorspace), entao o valor escrito em
  // gl_FragColor chega ao buffer exatamente como esta aqui — e o carvao do
  // objeto casa PIXEL A PIXEL com o `bg-carvao` da section. E isso que faz a
  // figura "ser" o fundo em vez de um retangulo colado sobre ele.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCarvao: { value: new Vector3(0.11, 0.102, 0.09) },
      uCream: { value: new Vector3(0.961, 0.953, 0.933) },
    }),
    [],
  );

  useFrame((_, delta) => {
    const node = mesh.current;
    if (!node) return;
    // Rotacao unica e lenta. SEM lerp de ponteiro, SEM parallax de scroll: a
    // referencia e estatica e confiante, o objeto nao persegue o mouse.
    node.rotation.y += delta * 0.12;
    uniforms.uTime.value += delta;
  });

  return (
    // z = -2 afasta o objeto para 6 unidades da camera. Com fov 38 a 4
    // unidades a altura visivel no plano do objeto e 2.75, e uma esfera de raio
    // 1.55 (diametro 3.1) NAO cabe: os quatro lados saem do frustum e a esfera
    // vira um quadrado de cantos cortados. A 6 unidades a altura visivel e
    // 4.13, e a figura ocupa 75% do quadro com folga em volta — que e a
    // proporcao de uma estampa, nao de um zoom.
    <mesh ref={mesh} position={[0, 0, -2]}>
      {/* Detalhe 0 = 20 faces com normal plana. Ver a nota de faceteamento no
          cabecalho: e o que troca a leitura de "disco texturizado" por
          "solido gravado". */}
      <icosahedronGeometry args={[1.55, 0]} />
      <shaderMaterial
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export function EngravedObject() {
  const reduced = useReducedMotion();
  const [wide, setWide] = useState(false);
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(true);
  const holder = useRef<HTMLDivElement>(null);

  // GUARDA 1 (>= 1024px). Subiu de 768 porque so a partir de `lg` existe uma
  // coluna para a figura: abaixo disso o hero e uma coluna so, o objeto nem
  // aparece no desenho, e nao ha razao para gastar GPU de celular com WebGL.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const sync = () => setWide(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // GUARDA 2 (ocioso). O chunk do three so entra depois que a thread principal
  // esta livre: o LCP e o <h1> de texto, e ele NUNCA disputa rede nem CPU com
  // um ornamento. `requestIdleCallback` com teto de 1.2s; onde nao existe
  // (Safari antigo), 300ms de espera, que ja e depois do primeiro paint.
  useEffect(() => {
    if (reduced || !wide) return;
    let idle: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => setReady(true);

    if (typeof window.requestIdleCallback === "function") {
      idle = window.requestIdleCallback(start, { timeout: 1200 });
    } else {
      timer = setTimeout(start, 300);
    }

    return () => {
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [reduced, wide]);

  // GUARDA 3 (viewport). Fora da tela o render loop PARA — `frameloop="never"`
  // em vez de continuar girando escondido enquanto o visitante le o resto.
  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced, wide]);

  // GUARDA 4 (movimento). Com `prefers-reduced-motion` o canvas nao monta —
  // nao e "anima menos", e nao existe.
  if (reduced || !wide) return null;

  return (
    <div ref={holder} className="absolute inset-0">
      {ready ? (
        <CanvasBoundary>
          <Canvas
            dpr={[1, 1.5]}
            frameloop={inView ? "always" : "never"}
            // `antialias: false` e deliberado: o shader faz o proprio AA por
            // `fwidth`, a hachura QUER linha crua, e desligar o MSAA economiza
            // fill rate num efeito que e todo fragment shader.
            gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
            camera={{ position: [0, 0, 4], fov: 38 }}
            className="absolute inset-0"
          >
            <Suspense fallback={null}>
              <EngravedIcosahedron />
            </Suspense>
          </Canvas>
        </CanvasBoundary>
      ) : null}
    </div>
  );
}
