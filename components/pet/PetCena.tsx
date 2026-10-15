"use client";

/**
 * PetCena — o Mac do pet, em R3F, gravado com o MESMO shader do sólido do hero.
 *
 * Duas cores e hachura ancorada na tela (ver hatch.glsl.ts): o Mac gira por
 * baixo das linhas e o volume aparece pelo degrau de densidade de uma face
 * para a vizinha.
 *
 * ── POR QUE A FRENTE NÃO É HACHURA ────────────────────────────────────────
 * OBSERVADO no build de produção: com as seis faces gravadas, o pet lia como
 * um bloco de listras com um rostinho, não como um Macintosh. Num objeto de
 * ~70 px a trama engolia tudo o que diz "Mac": moldura, tela clara, fenda do
 * disquete. A frente agora é PIXEL ART — o ícone `computador` do PixelIcon
 * virado face de caixa: uma textura 1-bit em Nearest, creme, com contorno,
 * moldura, a tela (onde o rosto de tela.ts entra em escala 2) e a fenda. As
 * outras cinco faces continuam no shader e são elas que dão o VOLUME. É a
 * divisão de um ícone do OS: a forma lida de frente, a profundidade no resto.
 *
 * A trama ficou fina (~2.6 px de CSS em qualquer DPR, via `uPasso`) e o Mac
 * ganhou contorno de casco invertido: carvão por dentro e um fio creme por
 * fora, o mesmo truque do ponteiro do Mac clássico (seta preta de borda
 * branca), que separa a figura tanto do papel quanto do carvão.
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
  BackSide,
  CanvasTexture,
  MeshBasicMaterial,
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
import { COLUNAS, LINHAS, chaveDaGrade, desenharGrade, type Grade } from "./tela";

const GRAU = Math.PI / 180;
/** fov 30 com a câmera a 6 unidades: 3.215 unidades visíveis em 150 px. */
const UNIDADE_POR_PX = 3.215 / 150;
/** Pose de repouso: de cima e de três-quartos o bastante para o topo e a
 *  lateral (as faces gravadas) lerem como volume, com a frente ainda
 *  dominante. ry negativo vira a frente para a esquerda — para a página, já
 *  que o pet mora no canto direito.
 *
 *  rx é 18° e não 12° por causa da PERSPECTIVA: a câmera está na altura do
 *  centro, então já olha a aresta de cima ~8° de baixo para cima. Com 12° o
 *  topo virava um fio de 3 px e sumia de vez quando o olhar subia (o cursor
 *  quase sempre está acima do pet). 18° dá ~10° efetivos. */
const BASE_RX = 18 * GRAU;
const BASE_RY = -20 * GRAU;

const CARVAO = "#1C1A17";
const CREME = "#F5F3EE";

// ── Modelo ─────────────────────────────────────────────────────────────────
// A frente é uma textura de 48×62 pixels; um pixel dela mede 0.025 unidade
// (~1.2 px de CSS), então as linhas finas do desenho têm a espessura das bordas
// de 1 px do site e os pixels do rosto (escala 2) ficam com ~2.3 px.
const FRENTE_L = 48;
const FRENTE_A = 62;
const PIXEL = 0.025;
const GAB_L = FRENTE_L * PIXEL; // 1.2
const GAB_A = FRENTE_A * PIXEL; // 1.55
/** Fundo do gabinete. Um Mac clássico é mais fundo que largo. */
const GAB_P = 1.25;
const GAB_Y = 0.04;
const PE_L = 1.1;
const PE_A = 0.09;
const PE_P = 1.15;
const PE_Y = GAB_Y - GAB_A / 2 - PE_A / 2;
/** A sola do pé: pivô do squash e da inclinação. O Mac achata CONTRA o chão e
 *  tomba a partir dos pés, em vez de encolher para o próprio centro como um
 *  balão. */
const SOLA_Y = PE_Y - PE_A / 2;

/** Rosto de tela.ts em escala inteira: 16×12 vira 32×24 pixels da frente. */
const ESCALA_ROSTO = 2;
/** Canto superior esquerdo do miolo da tela, em pixels da frente. */
const TELA_X = 8;
const TELA_Y = 8;

/** Espessura do contorno de casco: carvão (~1.6 px de CSS) e o fio creme por
 *  fora dele (~1.2 px a mais). Medido no print, não no escuro. */
const CASCO_CARVAO = 0.035;
const CASCO_CREME = 0.06;

/** Passo da trama em px de CSS. O shader mede em px de BUFFER (11 px na
 *  camada 1); multiplicar pelo dpr deixa a linha do mesmo tamanho em DPR 1
 *  e 2. Com o passo do hero, 6 listras atravessavam o Mac inteiro. */
const PASSO_CSS = 2.6;

/**
 * A frente do Mac, pixel a pixel, no vocabulário do ícone `computador`:
 * contorno, moldura de cantos arredondados, tela com borda de 2 px e cantos
 * de CRT, e a fenda do disquete no queixo. O rosto vem pronto da grade.
 *
 *   x: contorno 0 · margem 1–3 · moldura 4 · folga 5 · borda 6–7 ·
 *      tela 8–39 · borda 40–41 · folga 42 · moldura 43 · margem 44–46 ·
 *      contorno 47
 *   y: contorno 0 · margem 1–3 · moldura 4 · folga 5 · borda 6–7 ·
 *      tela 8–31 · borda 32–33 · folga 34 · moldura 35 · queixo 36–60 ·
 *      contorno 61
 */
function pintarFrente(ctx: CanvasRenderingContext2D, grade: Grade) {
  const L = FRENTE_L;
  const A = FRENTE_A;
  ctx.fillStyle = CREME;
  ctx.fillRect(0, 0, L, A);
  ctx.fillStyle = CARVAO;
  const r = (x: number, y: number, w: number, h: number) => ctx.fillRect(x, y, w, h);

  // Contorno do gabinete.
  r(0, 0, L, 1);
  r(0, A - 1, L, 1);
  r(0, 0, 1, A);
  r(L - 1, 0, 1, A);

  // Moldura: retângulo de 1 px sem os quatro cantos (canto arredondado).
  r(5, 4, 38, 1);
  r(5, 35, 38, 1);
  r(4, 5, 1, 30);
  r(43, 5, 1, 30);

  // Borda da tela, 2 px: é ela que destaca a tela creme do creme do gabinete.
  r(6, 6, 36, 2);
  r(6, 32, 36, 2);
  r(6, 8, 2, 24);
  r(40, 8, 2, 24);
  // Cantos de CRT: um pixel para dentro em cada canto do miolo.
  r(TELA_X, TELA_Y, 1, 1);
  r(TELA_X + 31, TELA_Y, 1, 1);
  r(TELA_X, TELA_Y + 23, 1, 1);
  r(TELA_X + 31, TELA_Y + 23, 1, 1);

  // Fenda do disquete, onde o ícone põe: no queixo, à esquerda do centro.
  r(12, 45, 16, 2);

  // Rosto.
  for (let l = 0; l < LINHAS; l++) {
    for (let c = 0; c < COLUNAS; c++) {
      if (grade[l][c]) {
        r(
          TELA_X + c * ESCALA_ROSTO,
          TELA_Y + l * ESCALA_ROSTO,
          ESCALA_ROSTO,
          ESCALA_ROSTO,
        );
      }
    }
  }
}

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
  const dpr = useThree((s) => s.viewport.dpr);
  const [a] = useState(() => criarAnimacao(estado));

  const r = useMemo(() => {
    const hachura = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uTime: { value: 0 },
        uRespira: { value: 0 },
        uPasso: { value: 1 },
        uCarvao: { value: new Vector3(0.11, 0.102, 0.09) },
        uCream: { value: new Vector3(0.961, 0.953, 0.933) },
      },
    });

    const canvas = document.createElement("canvas");
    canvas.width = FRENTE_L;
    canvas.height = FRENTE_A;
    const ctx = canvas.getContext("2d")!;
    const textura = new CanvasTexture(canvas);
    textura.magFilter = NearestFilter;
    textura.minFilter = NearestFilter;
    textura.generateMipmaps = false;
    textura.colorSpace = SRGBColorSpace;
    const frente = new MeshBasicMaterial({ map: textura, toneMapped: false });

    // Casco invertido: a cópia maior da caixa só mostra as faces de TRÁS, que
    // aparecem apenas em volta da silhueta — vira contorno sem pós-processo.
    const cascoCarvao = new MeshBasicMaterial({
      color: CARVAO,
      side: BackSide,
      toneMapped: false,
    });
    const cascoCreme = new MeshBasicMaterial({
      color: CREME,
      side: BackSide,
      toneMapped: false,
    });
    const pe = new MeshBasicMaterial({ color: CARVAO, toneMapped: false });

    // Ordem das faces do boxGeometry: +x, −x, +y, −y, +z, −z. Só a +z (a
    // frente) é pixel art; as outras cinco são gravura.
    const gabinete = [hachura, hachura, hachura, hachura, frente, hachura];
    return { hachura, ctx, textura, frente, cascoCarvao, cascoCreme, pe, gabinete };
  }, []);

  useEffect(() => {
    estado.invalidar = invalidate;
    invalidate();
    return () => {
      estado.invalidar = () => {};
    };
  }, [estado, invalidate]);

  // Linha da trama com o mesmo tamanho em CSS em qualquer DPR (ver PASSO_CSS).
  useEffect(() => {
    r.hachura.uniforms.uPasso.value = (PASSO_CSS * dpr) / 11;
    invalidate();
  }, [r, dpr, invalidate]);

  // As geometrias são do JSX e o R3F as descarta sozinho; materiais e
  // textura entram por prop/memo e são nossos.
  useEffect(
    () => () => {
      r.textura.dispose();
      r.frente.dispose();
      r.hachura.dispose();
      r.cascoCarvao.dispose();
      r.cascoCreme.dispose();
      r.pe.dispose();
    },
    [r],
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
        // A frente inteira é repintada (48×62, alguns fillRect): mais simples
        // que guardar a base num canvas à parte, e só acontece quando o rosto
        // muda.
        pintarFrente(r.ctx, grade);
        r.textura.needsUpdate = true;
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
          {/* Gabinete: frente em pixel art, o resto gravado */}
          <mesh material={r.gabinete} position={[0, GAB_Y, 0]}>
            <boxGeometry args={[GAB_L, GAB_A, GAB_P]} />
          </mesh>
          <Contorno
            tamanho={[GAB_L, GAB_A, GAB_P]}
            y={GAB_Y}
            carvao={r.cascoCarvao}
            creme={r.cascoCreme}
          />
          {/* Pé: um degrau mais estreito e CHAPADO em carvão, como as duas
              linhas de base do ícone. Gravado, uma faixa de 4 px virava um
              tracejado sem leitura. */}
          <mesh material={r.pe} position={[0, PE_Y, 0]}>
            <boxGeometry args={[PE_L, PE_A, PE_P]} />
          </mesh>
          <Contorno
            tamanho={[PE_L, PE_A, PE_P]}
            y={PE_Y}
            carvao={r.cascoCarvao}
            creme={r.cascoCreme}
          />
        </group>
      </group>
    </group>
  );
}

/** Os dois cascos de uma caixa: carvão rente à forma, creme por fora dele. */
function Contorno({
  tamanho: [l, a, p],
  y,
  carvao,
  creme,
}: {
  tamanho: [number, number, number];
  y: number;
  carvao: MeshBasicMaterial;
  creme: MeshBasicMaterial;
}) {
  return (
    <>
      <mesh material={carvao} position={[0, y, 0]}>
        <boxGeometry
          args={[l + 2 * CASCO_CARVAO, a + 2 * CASCO_CARVAO, p + 2 * CASCO_CARVAO]}
        />
      </mesh>
      <mesh material={creme} position={[0, y, 0]}>
        <boxGeometry
          args={[l + 2 * CASCO_CREME, a + 2 * CASCO_CREME, p + 2 * CASCO_CREME]}
        />
      </mesh>
    </>
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
