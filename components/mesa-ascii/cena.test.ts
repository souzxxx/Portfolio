import { test } from "node:test";
import assert from "node:assert/strict";
import { DIREITA_MAC, LADO, LADO_MOUSE, SALTO_MAC, olhosEmRepouso } from "./ancora";
import {
  criarMac,
  desenharMac,
  modoDoRosto,
  pularMac,
  type EntradaMac,
  type Mac,
} from "./cena";
import { CELULA_A, CELULA_L, criarQuadro, type Quadro } from "./grade";
import { pixelDaTela } from "./silhueta";

/** A âncora e a mesa fixas do plano: o Mac de 700 px com o pé em y = 800. */
const ANCORA = { cx: 700, baseY: 800, altura: 700 };
const MESA = { w: 1400, h: 900 };

const entrada = (extra: Partial<EntradaMac> = {}): EntradaMac => ({
  t: 0,
  dt: 0.016,
  mesa: MESA,
  ancora: ANCORA,
  mouse: null,
  reduzido: true,
  ...extra,
});

/** Um quadro novo com um Mac novo; `preparar` mexe no Mac antes de desenhar. */
function desenhar(e: EntradaMac, preparar?: (m: Mac) => void) {
  const q = criarQuadro(MESA.w, MESA.h);
  const m = criarMac(q, () => 0.5);
  preparar?.(m);
  desenharMac(q, m, e);
  return { q, m };
}

const centroX = (i: number) => i * CELULA_L + CELULA_L / 2;
const centroY = (j: number) => j * CELULA_A + CELULA_A / 2;
/** Pixel de tela aceso é uma célula creme quase sólida, sem caractere. */
const acesa = (q: Quadro, i: number, j: number) => q.fundo[j * q.cols + i] >= 0.9;

function celulasAcesas(q: Quadro) {
  const lista: { i: number; j: number }[] = [];
  for (let j = 0; j < q.linhas; j++)
    for (let i = 0; i < q.cols; i++) if (acesa(q, i, j)) lista.push({ i, j });
  return lista;
}

/** A linha acesa mais alta à esquerda do meio dos olhos (u < −0.05). */
function topoDoOlhoEsq(q: Quadro) {
  const meio = ANCORA.cx - 0.05 * ANCORA.altura;
  let topo = Infinity;
  for (const { i, j } of celulasAcesas(q)) if (centroX(i) < meio) topo = Math.min(topo, j);
  return topo;
}

/**
 * Os pixels de tela (16×12) dos olhos acesos, lidos de volta pelo (u, v) que
 * a cena guardou de cada célula. Cada pixel tem 17.5 × 19.25 px, maior que a
 * célula, então todo pixel aceso tem ao menos um centro de célula dentro.
 */
function pixelsDosOlhos(q: Quadro, m: Mac) {
  const pixels = new Set<string>();
  const linhas = new Set<number>();
  for (const { i, j } of celulasAcesas(q)) {
    const id = j * q.cols + i;
    const { px, py } = pixelDaTela(m.U[id], m.V[id]);
    if (py >= 7) continue; // da linha 7 para baixo é a boca
    pixels.add(`${px},${py}`);
    linhas.add(j);
  }
  return { pixels, linhas: linhas.size };
}

const blocos = (cols: number[], linhas: number[]) =>
  new Set(cols.flatMap((c) => linhas.map((l) => `${c},${l}`)));

test("em repouso, toda célula com centro dentro de cada retângulo de olhosEmRepouso está acesa", () => {
  const { q } = desenhar(entrada());
  const olhos = olhosEmRepouso(ANCORA);
  for (const r of [olhos.esq, olhos.dir]) {
    let contadas = 0;
    for (let j = 0; j < q.linhas; j++) {
      const y = centroY(j);
      if (y <= r.y || y >= r.y + r.h) continue;
      for (let i = 0; i < q.cols; i++) {
        const x = centroX(i);
        if (x <= r.x || x >= r.x + r.w) continue;
        contadas++;
        assert.ok(acesa(q, i, j), `célula (${i}, ${j}) do olho apagada`);
      }
    }
    assert.ok(contadas >= 9, `só ${contadas} células no olho`);
  }
});

test("em repouso, a célula no centro da tela entre os olhos (u = -0.05, v = -0.30) não está acesa", () => {
  const { q } = desenhar(entrada());
  const i = Math.floor((ANCORA.cx - 0.05 * ANCORA.altura) / CELULA_L);
  const j = Math.floor((ANCORA.baseY + (-0.3 - 0.43) * ANCORA.altura) / CELULA_A);
  assert.ok(!acesa(q, i, j));
});

test("nenhuma célula com centro acima de baseY - 0.99·altura ou abaixo de baseY + 0.05·altura é pintada", () => {
  const { q } = desenhar(entrada());
  const cima = ANCORA.baseY - 0.99 * ANCORA.altura;
  const baixo = ANCORA.baseY + 0.05 * ANCORA.altura;
  let pintadas = 0;
  for (let j = 0; j < q.linhas; j++) {
    const fora = centroY(j) < cima || centroY(j) > baixo;
    for (let i = 0; i < q.cols; i++) {
      const id = j * q.cols + i;
      const pintada = q.glifo[id] !== 0 || q.alfa[id] !== 0 || q.fundo[id] !== 0;
      if (pintada) pintadas++;
      if (fora) assert.ok(!pintada, `célula (${i}, ${j}) pintada fora do Mac`);
    }
  }
  assert.ok(pintadas > 1000, "o Mac nem foi desenhado");
});

test("modoDoRosto: com susto > 0 → surpreso; dentro de piscaFim → piscando; perto → atento; senão normal", () => {
  const m = criarMac(criarQuadro(MESA.w, MESA.h), () => 0.5);
  m.piscaFim = 1;
  m.susto = 0.5;
  assert.equal(modoDoRosto(m, 0.5, true), "surpreso");
  m.susto = 0;
  assert.equal(modoDoRosto(m, 0.5, true), "piscando");
  assert.equal(modoDoRosto(m, 2, true), "atento");
  assert.equal(modoDoRosto(m, 2, false), "normal");
});

test("pulo: com reduzido: false, depois de pularMac(m, false, 0) o olho esquerdo aceso mais alto em t = 0.25 fica em linha menor que em repouso", () => {
  const e = entrada({ reduzido: false, t: 0.25 });
  const repouso = topoDoOlhoEsq(desenhar(e).q);
  const pulando = topoDoOlhoEsq(desenhar(e, (m) => pularMac(m, false, 0)).q);
  assert.ok(Number.isFinite(repouso) && Number.isFinite(pulando));
  assert.ok(pulando < repouso, `pulando na linha ${pulando}, repouso na ${repouso}`);
  // sobe pelo menos o salto (fase 0.45 → 62 px); o esticão do voo, sozinho,
  // já levantaria o olho uma linha, e isso não pode passar por pulo
  const salto = Math.sin(0.25 * 1.8 * Math.PI) * SALTO_MAC * ANCORA.altura;
  assert.ok(repouso - pulando >= Math.floor(salto / CELULA_A), `subiu ${repouso - pulando} linhas`);
});

test("atento: com o mouse em cima do Mac, os olhos acesos ocupam 3×3 pixels de tela", () => {
  const repouso = desenhar(entrada());
  // na altura dos olhos e no eixo do Mac: perto, e o olhar fica no centro
  const mouse = { x: ANCORA.cx, y: ANCORA.baseY - 0.62 * ANCORA.altura };
  const atento = desenhar(entrada({ reduzido: false, mouse }));

  const r = pixelsDosOlhos(repouso.q, repouso.m);
  const a = pixelsDosOlhos(atento.q, atento.m);
  assert.deepEqual(r.pixels, blocos([4, 5, 10, 11], [3, 4]));
  assert.deepEqual(a.pixels, blocos([4, 5, 6, 10, 11, 12], [3, 4, 5]));
  assert.ok(a.linhas > r.linhas, `${a.linhas} linhas atento, ${r.linhas} em repouso`);
});

test("piscada: passou de proxPisca, fecha os olhos por 0.13 s e sorteia a próxima entre 2.2 e 5.2 s", () => {
  for (const [sorte, intervalo] of [
    [0, 2.2],
    [1, 5.2],
  ]) {
    const q = criarQuadro(MESA.w, MESA.h);
    const m = criarMac(q, () => sorte);
    desenharMac(q, m, entrada({ reduzido: false, t: 2 }));
    assert.ok(Math.abs(m.piscaFim - 2.13) < 1e-9);
    assert.ok(Math.abs(m.proxPisca - (2 + intervalo)) < 1e-9);
    assert.equal(modoDoRosto(m, 2.1, false), "piscando");
    assert.equal(modoDoRosto(m, 2.14, false), "normal");
  }
});

test("pularMac perto do Mac assusta: a cara fica surpreso no quadro seguinte", () => {
  const q = criarQuadro(MESA.w, MESA.h);
  const m = criarMac(q, () => 0.5);
  pularMac(m, true, 0.5);
  desenharMac(q, m, entrada({ reduzido: false, t: 0.516 }));
  assert.equal(modoDoRosto(m, 0.516, false), "surpreso");
});

test("clique com o Mac no ar não reinicia o pulo: ele não cai no chão no meio do voo", () => {
  const q = criarQuadro(MESA.w, MESA.h);
  const m = criarMac(q, () => 0.5);
  pularMac(m, false, 0);
  // 0.25 s: fase 0.45, perto do topo do salto
  pularMac(m, false, 0.25);
  assert.equal(m.pulo, 0, "o segundo clique recomeçou o pulo");
  // e o quadro em 0.3 s é o do primeiro pulo, não o de um pulo que mal saiu do chão
  const e = entrada({ reduzido: false, t: 0.3 });
  const umPulo = topoDoOlhoEsq(desenhar(e, (n) => pularMac(n, false, 0)).q);
  const doisCliques = topoDoOlhoEsq(
    desenhar(e, (n) => {
      pularMac(n, false, 0);
      pularMac(n, false, 0.25);
    }).q,
  );
  assert.equal(doisCliques, umPulo);
});

test("clique perto com o Mac no ar: não reinicia o pulo, mas o susto vale", () => {
  const q = criarQuadro(MESA.w, MESA.h);
  const m = criarMac(q, () => 0.5);
  pularMac(m, false, 0);
  pularMac(m, true, 0.25);
  assert.equal(m.pulo, 0);
  assert.equal(m.susto, 1);
});

test("depois do pouso (fase ≥ 1, 1/1.8 s) um clique novo pula de novo", () => {
  const q = criarQuadro(MESA.w, MESA.h);
  const m = criarMac(q, () => 0.5);
  pularMac(m, false, 0);
  pularMac(m, false, 0.6);
  assert.equal(m.pulo, 0.6);
});

test("reduzido: o quadro não depende de t, do mouse nem de um pulo", () => {
  const parado = desenhar(entrada()).q;
  const mexido = desenhar(
    entrada({ t: 3.7, dt: 0.05, mouse: { x: 900, y: 300 } }),
    (m) => pularMac(m, true, 3.5),
  ).q;
  assert.deepEqual(mexido, parado);
});

test("DIREITA_MAC é um teto de verdade: nada pintado passa de cx + DIREITA_MAC·altura, nem no pior caso", () => {
  // a lateral no máximo (mouse todo à esquerda) junto com a inclinação do
  // mouse todo à direita e o pouso do pulo: uma combinação que nem acontece,
  // varrendo o balanço e a respiração por um ciclo inteiro
  const limite = ANCORA.cx + DIREITA_MAC * ANCORA.altura;
  let maisDireita = -Infinity;
  for (let t = 0; t < 8; t += 0.05) {
    const e = entrada({ t, dt: 0.001, reduzido: false, mouse: { x: MESA.w, y: 300 } });
    const { q } = desenhar(e, (m) => {
      m.lado = LADO + LADO_MOUSE;
      m.pulo = t - 0.5; // fase 0.9: amassado e alargado no pouso
    });
    for (let j = 0; j < q.linhas; j++)
      for (let i = 0; i < q.cols; i++) {
        const id = j * q.cols + i;
        const pintada = q.fundo[id] > 0.004 || (q.alfa[id] > 0.01 && q.glifo[id] !== 32 && q.glifo[id] !== 0);
        if (pintada) maisDireita = Math.max(maisDireita, centroX(i));
      }
  }
  assert.ok(maisDireita <= limite, `célula com centro em x = ${maisDireita}, teto ${limite}`);
  // e o teto não é folgado à toa: o pior caso chega a 4% dele
  assert.ok(maisDireita >= limite - 0.04 * ANCORA.altura, `pior caso em ${maisDireita}, teto ${limite}`);
});
