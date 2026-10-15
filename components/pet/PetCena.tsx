"use client";

/**
 * PetCena — o Mac do pet, em R3F, gravado com o MESMO shader do sólido do hero.
 *
 * Duas cores e hachura ancorada na tela (ver hatch.glsl.ts): o Mac gira por
 * baixo das linhas e o volume aparece pelo degrau de densidade de uma face
 * para a vizinha. A TELA é a exceção: um plano com textura de 16×12 em
 * Nearest, fora do shader, para os olhos continuarem pixel nítido.
 *
 * ── VIVO, NÃO ÍCONE ───────────────────────────────────────────────────────
 * O pedido do Leonardo foi "bem animado, fluido, tipo o bot do Grok ou o
 * Dots". Um ícone que gira para o mouse não é isso; um bicho é. Então, em cima
 * das molas do olhar e do scroll, o corpo tem:
 *
 *   - respiração: flutua ±0.06 num seno de 2.6 s, com um balanço lateral em
 *     outro período (nunca sincroniza, nunca lê como metrônomo). Dormindo, a
 *     respiração fica lenta (4.5 s) e funda, e a cabeça pesa para a frente;
 *   - squash & stretch: a escala tem MOLA PRÓPRIA, puxada pela velocidade
 *     vertical (estica) e pela aceleração para cima (achata). Volume
 *     conservado: o que estica em y afina em x e z;
 *   - olhar com atraso: os olhos (pixels) mudam no mesmo quadro; o corpo passa
 *     por um filtro de ~80 ms antes da mola, então a cabeça CHEGA DEPOIS e
 *     passa um pouco do ponto;
 *   - pulinho: no clique (`estado.pulo`) e ao acordar (`surpreso`), agacha,
 *     decola, cai e achata no pouso;
 *   - hover: além dos olhos arregalados, o corpo inclina ~8° para o alvo.
 *
 * Com `prefers-reduced-motion` NADA disso existe: pose de repouso fixa, e só
 * a tela troca de pixel (piscar, dormir, hover continuam).
 *
 * `frameloop="demand"` continua, mas com outro papel. Enquanto o movimento é
 * permitido, o useFrame pede o próximo quadro SEMPRE — respiração que para
 * não é respiração, e num canvas de 150 px o custo é pequeno (decisão
 * registrada no ledger do plano: o pedido mais recente do dono vence o
 * "parado, zero quadros" do spec). Com movimento reduzido nada anda, e aí o
 * demand faz o que fazia: só existe quadro quando um evento pede.
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CanvasTexture,
  NearestFilter,
  SRGBColorSpace,
  ShaderMaterial,
  Vector3,
  type Group,
} from "three";
import { fragment, vertex } from "../hero/hatch.glsl";
import {
  aproximar,
  avancarFase,
  compensarVolume,
  criarSalto,
  limiteSuave,
  limitarDt,
  passoSalto,
  pedirSalto,
  type Salto,
} from "./animacao";
import type { EstadoPet } from "./estado";
import type { Expressao } from "./maquina";
import { AMORTECIMENTO, RIGIDEZ, passoMola, type Mola } from "./mola";
import { COLUNAS, LINHAS, chaveDaGrade, desenharGrade } from "./tela";

const GRAU = Math.PI / 180;
/** fov 30 com a câmera a 6 unidades: 3.215 unidades visíveis em 150 px. */
const UNIDADE_POR_PX = 3.215 / 150;
/** Pose de repouso: um pouco de cima e de três-quartos, para o topo e a lateral
 *  (as faces de trama mais densa) aparecerem mesmo parado. */
const BASE_RX = 6 * GRAU;
const BASE_RY = -10 * GRAU;
/** A sola do pé (centro do pé em -0.7, meia altura 0.05). É o pivô do squash e
 *  da inclinação: o Mac achata CONTRA o chão e tomba a partir dos pés, em vez
 *  de encolher para o próprio centro como um balão. */
const SOLA_Y = -0.75;

const CARVAO = "#1C1A17";
const CREME = "#F5F3EE";

// ── Olhar ──────────────────────────────────────────────────────────────────
// Medido em simulação (degrau de 0 a 1): só a mola do mola.ts chega a 50% em
// 100 ms — junto com os olhos, sem atraso nenhum. Com o filtro de 80 ms na
// frente e uma mola um pouco mais solta (ζ ≈ 0.41), os 50% caem em ~167 ms e
// o pico passa ~13% do alvo antes de assentar (~0.7 s). É o "olho vai, a
// cabeça vem atrás e passa do ponto".
const TAU_OLHAR = 0.08;
const K_OLHAR = 150;
const C_OLHAR = 10;

// ── Inclinação lateral (rotation.z) ───────────────────────────────────────
/** Inclinação na direção do alvo de hover. */
const INCLINA_HOVER = 8 * GRAU;
/** Rad de inclinação por rad/s de giro em y: o corpo "deita na curva" quando
 *  vira rápido, e a mola devolve. Varrida de um lado ao outro (±15°) ≈ 2°. */
const INCLINA_CURVA = 0.015;
/** ζ ≈ 0.5: a inclinação tem um quique só, mais preguiçoso que o do olhar. */
const K_INCLINA = 120;
const C_INCLINA = 11;

// ── Respiração ────────────────────────────────────────────────────────────
const PERIODO_ACORDADO = 2.6;
const PERIODO_SONO = 4.5;
const FLUTUA_ACORDADO = 0.06;
const FLUTUA_SONO = 0.085;
/** Peito que enche: amplitude da escala em y, em fase com a subida. */
const RESPIRA_ACORDADO = 0.012;
const RESPIRA_SONO = 0.03;
/** O balanço lateral roda a 0.7× a respiração (período ~3.7 s acordado): duas
 *  ondas que não batem, então o movimento nunca se repete igual. */
const BALANCO_Z = 1.5 * GRAU;
const RAZAO_BALANCO = 0.7;
/** Dormindo: a cabeça pesa para a frente, tomba de lado e o corpo afunda. */
const CABECEIA_SONO = 5 * GRAU;
const TOMBA_SONO = 4 * GRAU;
const AFUNDA_SONO = 0.05;
/** Adormece devagar (cochilo) e acorda de estalo, junto com o pulinho. */
const TAU_ADORMECER = 0.9;
const TAU_ACORDAR = 0.12;

// ── Squash & stretch ──────────────────────────────────────────────────────
// Mola da escala bem mais rígida e mais solta que as outras (ω ≈ 17 rad/s,
// ζ ≈ 0.35): o "boing" de gelatina, que treme duas vezes e assenta em ~1 s.
const K_ESC = 300;
const C_ESC = 12;
/** Teto do desvio de escala: 0.92–1.08, aplicado por tanh (sem platô seco). */
const LIMITE_ESC = 0.08;
/** Estica por unidade/s de velocidade vertical (decolagem 2.83 u/s ≈ +7%). */
const GANHO_VEL = 0.055;
/** Estica com a rolagem: na rolagem cheia, +3%. */
const GANHO_ROLAGEM = 0.03;
/** Achata por unidade/s² de aceleração PARA CIMA da mola vertical — o fundo do
 *  quique, quando a mola empurra o corpo de volta. No tranco máximo da rolagem
 *  (~22 u/s²) dá cerca de -6%. */
const GANHO_ACEL = 0.003;
// Impulsos na velocidade da mola da escala, medidos em simulação para cair
// perto do teto já depois do tanh: agachar ≈ 0.934, pouso ≈ 0.93.
const IMPULSO_AGACHA = -2.8;
const IMPULSO_POUSO = -5.0;
/** Piscar dá uma microbalançada (~-1.5%); ficar atento, um "espichar" (~+3%). */
const IMPULSO_PISCADA = -0.5;
const IMPULSO_ATENTO = 0.9;
/** No ar o nariz acompanha a parábola: sobe olhando para cima, desce olhando
 *  para baixo (~3° na decolagem). Passa por mola, para a decolagem não virar
 *  degrau na rotação. */
const VOO_RX = 0.02;

/** Avança a mola NO LUGAR: o objeto da mola é o mesmo a vida inteira. O
 *  `{x, v}` que passoMola devolve não escapa daqui, e o V8 consegue não
 *  alocá-lo depois de inlinar. */
function avancar(m: Mola, alvo: number, dt: number, k = RIGIDEZ, c = AMORTECIMENTO) {
  const r = passoMola(m, alvo, dt, k, c);
  m.x = r.x;
  m.v = r.v;
}

function zerar(m: Mola) {
  m.x = 0;
  m.v = 0;
}

const limitar = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/** Tudo o que a animação lembra entre quadros. Criado uma vez; o useFrame só
 *  escreve campos, nunca cria objeto. */
interface Animacao {
  rxOlhar: Mola;
  ryOlhar: Mola;
  rxRolagem: Mola;
  rxVoo: Mola;
  py: Mola;
  rz: Mola;
  esc: Mola;
  /** Saída do filtro de atraso: o alvo que a mola do olhar persegue. */
  atrasoRx: number;
  atrasoRy: number;
  salto: Salto;
  /** 0 acordado, 1 dormindo, contínuo entre os dois. */
  sono: number;
  faseY: number;
  faseZ: number;
  ultimoPulo: number;
  ultimaExpressao: Expressao;
  // Entradas da última grade desenhada, para nem recalcular a grade quando
  // nada mudou (o caso de quase todos os quadros).
  telaExpressao: Expressao | "";
  telaZ: number;
  telaX: number;
  telaY: number;
  chave: string;
  olharTela: { x: number; y: number };
}

function criarAnimacao(estado: EstadoPet): Animacao {
  const mola = (): Mola => ({ x: 0, v: 0 });
  return {
    rxOlhar: mola(),
    ryOlhar: mola(),
    rxRolagem: mola(),
    rxVoo: mola(),
    py: mola(),
    rz: mola(),
    esc: mola(),
    atrasoRx: 0,
    atrasoRy: 0,
    salto: criarSalto(),
    sono: 0,
    faseY: 0,
    faseZ: 0,
    // Começa sincronizado: montar não é motivo para pular.
    ultimoPulo: estado.pulo,
    ultimaExpressao: estado.expressao,
    telaExpressao: "",
    telaZ: Number.NaN,
    telaX: Number.NaN,
    telaY: Number.NaN,
    chave: "",
    olharTela: { x: 0, y: 0 },
  };
}

function MacGravado({ estado }: { estado: EstadoPet }) {
  const corpo = useRef<Group>(null);
  const molde = useRef<Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  const [a] = useState(() => criarAnimacao(estado));

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          uTime: { value: 0 },
          uRespira: { value: 0 },
          uPasso: { value: 1 },
          uCarvao: { value: new Vector3(0.11, 0.102, 0.09) },
          uCream: { value: new Vector3(0.961, 0.953, 0.933) },
        },
      }),
    [],
  );

  const { ctx, textura } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = COLUNAS;
    canvas.height = LINHAS;
    const ctx = canvas.getContext("2d")!;
    const textura = new CanvasTexture(canvas);
    textura.magFilter = NearestFilter;
    textura.minFilter = NearestFilter;
    textura.generateMipmaps = false;
    textura.colorSpace = SRGBColorSpace;
    return { ctx, textura };
  }, []);

  useEffect(() => {
    estado.invalidar = invalidate;
    invalidate();
    return () => {
      estado.invalidar = () => {};
    };
  }, [estado, invalidate]);

  // As geometrias e o meshBasicMaterial são do JSX e o R3F descarta sozinho;
  // o ShaderMaterial e a textura entram por prop/memo e são nossos.
  useEffect(
    () => () => {
      textura.dispose();
      material.dispose();
    },
    [textura, material],
  );

  useFrame((_, delta) => {
    const g = corpo.current;
    const p = molde.current;
    if (!g || !p) return;
    const dt = limitarDt(delta);

    // ── Tela ──────────────────────────────────────────────────────────────
    // Os olhos usam o olhar CRU, sem filtro: mudam neste quadro, antes do
    // corpo. É metade da antecipação.
    const rolando = Math.abs(estado.rolagem) > 0.05;
    const fonte = estado.alvoHover ?? estado.olhar;
    const ox = rolando ? estado.olhar.x : fonte.x;
    const oy = rolando ? Math.sign(estado.rolagem) : fonte.y;
    if (
      estado.expressao !== a.telaExpressao ||
      estado.zFase !== a.telaZ ||
      ox !== a.telaX ||
      oy !== a.telaY
    ) {
      a.telaExpressao = estado.expressao;
      a.telaZ = estado.zFase;
      a.telaX = ox;
      a.telaY = oy;
      a.olharTela.x = ox;
      a.olharTela.y = oy;
      // Só redesenha (e só sobe textura) quando a grade de fato mudou: o
      // olhar anda em degraus de pixel, quase todo mousemove cai no mesmo.
      const grade = desenharGrade(estado.expressao, a.olharTela, estado.zFase);
      const chave = chaveDaGrade(grade);
      if (chave !== a.chave) {
        ctx.fillStyle = CREME;
        ctx.fillRect(0, 0, COLUNAS, LINHAS);
        ctx.fillStyle = CARVAO;
        for (let l = 0; l < LINHAS; l++) {
          for (let c = 0; c < COLUNAS; c++) {
            if (grade[l][c]) ctx.fillRect(c, l, 1, 1);
          }
        }
        textura.needsUpdate = true;
        a.chave = chave;
      }
    }

    // ── Movimento reduzido: pose de repouso e mais nada ───────────────────
    // As molas são ZERADAS (não levadas a zero): o teste de navegador exige
    // `estado.rot` exatamente 0. Fases voltam a 0 para, se a preferência mudar
    // com a página aberta, a respiração nascer do repouso, sem tranco.
    if (estado.reduzido) {
      zerar(a.rxOlhar);
      zerar(a.ryOlhar);
      zerar(a.rxRolagem);
      zerar(a.rxVoo);
      zerar(a.py);
      zerar(a.rz);
      zerar(a.esc);
      a.atrasoRx = 0;
      a.atrasoRy = 0;
      a.salto.y = 0;
      a.salto.v = 0;
      a.salto.agacha = 0;
      a.salto.pendente = false;
      a.sono = 0;
      a.faseY = 0;
      a.faseZ = 0;
      a.ultimoPulo = estado.pulo;
      a.ultimaExpressao = estado.expressao;
      g.position.y = 0;
      g.rotation.set(BASE_RX, BASE_RY, 0);
      p.rotation.z = 0;
      p.scale.set(1, 1, 1);
      estado.rot.x = 0;
      estado.rot.y = 0;
      // Sem invalidate: o próximo quadro só existe se um evento pedir.
      return;
    }

    // ── Gatilhos ──────────────────────────────────────────────────────────
    // Clique e despertar no mesmo quadro (clicar no pet dormindo) viram UM
    // pulo só: os dois só ligam a mesma flag.
    const expr = estado.expressao;
    let pular = estado.pulo !== a.ultimoPulo;
    a.ultimoPulo = estado.pulo;
    if (expr !== a.ultimaExpressao) {
      if (expr === "surpreso") pular = true;
      else if (expr === "piscando") a.esc.v += IMPULSO_PISCADA;
      else if (expr === "atento") a.esc.v += IMPULSO_ATENTO;
      a.ultimaExpressao = expr;
    }
    if (pular && pedirSalto(a.salto)) a.esc.v += IMPULSO_AGACHA;
    if (passoSalto(a.salto, dt) === "pousou") a.esc.v += IMPULSO_POUSO;

    const dormindo = expr === "dormindo";
    a.sono = aproximar(
      a.sono,
      dormindo ? 1 : 0,
      dt,
      dormindo ? TAU_ADORMECER : TAU_ACORDAR,
    );
    const s = a.sono;

    // ── Alvos ─────────────────────────────────────────────────────────────
    // Dormindo, o olhar e a mola param (spec): os alvos voltam a zero e quem
    // mexe é só a respiração.
    let alvoRx = 0;
    let alvoRy = 0;
    let alvoRxRolagem = 0;
    let alvoPy = 0;
    let alvoRz = 0;
    if (!dormindo) {
      const hover = estado.alvoHover;
      alvoRy = ox * 15 * GRAU + (hover ? hover.x * 5 * GRAU : 0);
      alvoRx = oy * 8 * GRAU;
      alvoRxRolagem = -estado.rolagem * 18 * GRAU;
      alvoPy = -Math.abs(estado.rolagem) * 6 * UNIDADE_POR_PX;
      if (hover) {
        // Direção, não distância: um link logo à esquerda inclina tanto quanto
        // um do outro lado da tela. O piso de 0.25 evita que um alvo quase em
        // cima do pet faça a direção girar ao menor tremor.
        const d = Math.max(Math.hypot(hover.x, hover.y), 0.25);
        alvoRz = -limitar(hover.x / d, -1, 1) * INCLINA_HOVER;
      }
      // "Deitar na curva": usa a velocidade do quadro anterior, de propósito —
      // é consequência do giro, chega depois dele.
      alvoRz -= a.ryOlhar.v * INCLINA_CURVA;
    }

    // ── Molas ─────────────────────────────────────────────────────────────
    a.atrasoRx = aproximar(a.atrasoRx, alvoRx, dt, TAU_OLHAR);
    a.atrasoRy = aproximar(a.atrasoRy, alvoRy, dt, TAU_OLHAR);
    avancar(a.rxOlhar, a.atrasoRx, dt, K_OLHAR, C_OLHAR);
    avancar(a.ryOlhar, a.atrasoRy, dt, K_OLHAR, C_OLHAR);
    // Scroll fica com a mola do spec (170/14), sem filtro: é reação física,
    // não intenção, e não espera os olhos.
    avancar(a.rxRolagem, alvoRxRolagem, dt);
    avancar(a.py, alvoPy, dt);
    avancar(a.rxVoo, -a.salto.v * VOO_RX, dt);
    avancar(a.rz, alvoRz, dt, K_INCLINA, C_INCLINA);

    // Squash & stretch. A aceleração é a mesma conta do mola.ts, com sinal
    // "para cima": positiva no fundo do quique, quando a mola empurra o corpo
    // de volta — é aí que ele achata.
    const aceleracao = -RIGIDEZ * (a.py.x - alvoPy) - AMORTECIMENTO * a.py.v;
    const alvoEsc =
      GANHO_VEL * Math.abs(a.py.v + a.salto.v) +
      GANHO_ROLAGEM * Math.abs(estado.rolagem) -
      GANHO_ACEL * Math.max(0, aceleracao);
    avancar(a.esc, alvoEsc, dt, K_ESC, C_ESC);

    // ── Respiração ────────────────────────────────────────────────────────
    const periodo = PERIODO_ACORDADO + (PERIODO_SONO - PERIODO_ACORDADO) * s;
    a.faseY = avancarFase(a.faseY, dt, periodo);
    a.faseZ = avancarFase(a.faseZ, dt, periodo / RAZAO_BALANCO);
    const onda = Math.sin(a.faseY);
    const flutua = (FLUTUA_ACORDADO + (FLUTUA_SONO - FLUTUA_ACORDADO) * s) * onda;
    const respira = (RESPIRA_ACORDADO + (RESPIRA_SONO - RESPIRA_ACORDADO) * s) * onda;
    const balanco = BALANCO_Z * Math.sin(a.faseZ);

    // ── Pose ──────────────────────────────────────────────────────────────
    g.position.y = a.py.x + a.salto.y + flutua - AFUNDA_SONO * s;
    g.rotation.x =
      BASE_RX + a.rxOlhar.x + a.rxRolagem.x + a.rxVoo.x + CABECEIA_SONO * s;
    g.rotation.y = BASE_RY + a.ryOlhar.x;
    p.rotation.z = a.rz.x + balanco + TOMBA_SONO * s;
    const sy = 1 + limiteSuave(a.esc.x + respira, LIMITE_ESC);
    const sxz = compensarVolume(sy);
    p.scale.set(sxz, sy, sxz);

    // Só o que as molas do olhar e do scroll somam; pose de repouso,
    // respiração e pulo ficam de fora (o teste de navegador lê isto).
    estado.rot.x = a.rxOlhar.x + a.rxRolagem.x;
    estado.rot.y = a.ryOlhar.x;

    invalidate();
  });

  return (
    <group ref={corpo}>
      {/* Pivô na sola: escala e inclinação lateral nascem do chão. O grupo de
          dentro devolve o modelo à posição original. */}
      <group ref={molde} position={[0, SOLA_Y, 0]}>
        <group position={[0, -SOLA_Y, 0]}>
          {/* Gabinete */}
          <mesh material={material} position={[0, 0.08, 0]}>
            <boxGeometry args={[1.25, 1.42, 1.15]} />
          </mesh>
          {/* Moldura da tela, saltada 3 cm da frente */}
          <mesh material={material} position={[0, 0.3, 0.6]}>
            <boxGeometry args={[1.0, 0.78, 0.06]} />
          </mesh>
          {/* Tela 4:3 (16×12), fora do shader */}
          <mesh position={[0, 0.3, 0.635]}>
            <planeGeometry args={[0.8, 0.6]} />
            <meshBasicMaterial map={textura} toneMapped={false} />
          </mesh>
          {/* Fenda do disquete */}
          <mesh material={material} position={[0.28, -0.36, 0.585]}>
            <boxGeometry args={[0.38, 0.05, 0.04]} />
          </mesh>
          {/* Pé */}
          <mesh material={material} position={[0, -0.7, -0.05]}>
            <boxGeometry args={[1.05, 0.1, 1.0]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export function PetCena({ estado }: { estado: EstadoPet }) {
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop="demand"
      // Mesmo raciocínio do hero: o shader faz o próprio AA por fwidth.
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 6], fov: 30 }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <MacGravado estado={estado} />
    </Canvas>
  );
}
