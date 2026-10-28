import { test } from "node:test";
import assert from "node:assert/strict";
import { CELULA_A, CELULA_L, criarQuadro, pintar, type Quadro } from "./grade";
import { ONDA_VEL, ONDA_VIDA_S, desenharOndas, glifoDoAnel, type Onda } from "./ondas";

const glifoEm = (q: Quadro, i: number, j: number) => q.glifo[j * q.cols + i];
const pintadas = (q: Quadro) => q.alfa.filter((a) => a > 0).length;

// O centro da onda no centro de uma célula (coluna 2, linha 5): a linha 5
// inteira fica com dy = 0 e a conta da distância é só em x.
const COL = 2;
const LIN = 5;
const X = COL * CELULA_L + CELULA_L / 2;
const Y = LIN * CELULA_A + CELULA_A / 2;

test("glifoDoAnel é a tangente do anel em quatro direções", () => {
  assert.equal(glifoDoAnel(10, 0), "|");
  assert.equal(glifoDoAnel(-10, 0), "|");
  assert.equal(glifoDoAnel(0, -10), "-");
  assert.equal(glifoDoAnel(0, 10), "-");
  assert.equal(glifoDoAnel(10, -10), "\\");
  assert.equal(glifoDoAnel(-10, 10), "\\");
  assert.equal(glifoDoAnel(-10, -10), "/");
  assert.equal(glifoDoAnel(10, 10), "/");
});

test("uma onda com t0 = 0 ainda vive em t = 2.29 e some em t = 2.31", () => {
  const onda: Onda = { x: X, y: Y, t0: 0, forca: 1 };
  assert.equal(ONDA_VIDA_S, 2.3);
  assert.deepEqual(desenharOndas(criarQuadro(400, 121), [onda], 2.29), [onda]);

  const q = criarQuadro(400, 121);
  assert.deepEqual(desenharOndas(q, [onda], 2.31), []);
  assert.equal(pintadas(q), 0, "onda morta não pinta");
});

test("devolve só as vivas, na ordem, sem mexer no array recebido", () => {
  const velha: Onda = { x: X, y: Y, t0: 0, forca: 1 };
  const nova: Onda = { x: X, y: Y, t0: 2, forca: 0.5 };
  const ondas = [velha, nova];
  assert.deepEqual(desenharOndas(criarQuadro(400, 121), ondas, 3), [nova]);
  assert.equal(ondas.length, 2);
});

test("força 1 em t = 1: o anel principal passa a ≈ 158 px na horizontal com |, e não a ≈ 80 px", () => {
  const R = (0.55 + 0.45 * 1) * ONDA_VEL * 1 + 8;
  assert.equal(R, 158);
  const q = criarQuadro(400, 121);
  desenharOndas(q, [{ x: X, y: Y, t0: 0, forca: 1 }], 1);

  const iAnel = Math.floor((X + R) / CELULA_L);
  const dxAnel = iAnel * CELULA_L + CELULA_L / 2 - X;
  assert.ok(Math.abs(dxAnel - R) < 6, `a célula escolhida está a ${dxAnel} px`);
  assert.equal(glifoEm(q, iAnel, LIN), "|".charCodeAt(0));
  assert.ok(q.alfa[LIN * q.cols + iAnel] > 0);

  const iDentro = Math.floor((X + 80) / CELULA_L);
  assert.equal(glifoEm(q, iDentro, LIN), 0);
  assert.equal(q.alfa[LIN * q.cols + iDentro], 0);
});

test("a onda pinta com pintarSeMaisForte: não apaga um # mais forte no caminho", () => {
  const q = criarQuadro(400, 121);
  const iAnel = Math.floor((X + 158) / CELULA_L);
  pintar(q, iAnel, LIN, "#", 0.9, 0.13);
  desenharOndas(q, [{ x: X, y: Y, t0: 0, forca: 1 }], 1);
  assert.equal(glifoEm(q, iAnel, LIN), "#".charCodeAt(0));
});
