import { test } from "node:test";
import assert from "node:assert/strict";
import {
  COR_CREME,
  COR_OURO,
  criarQuadro,
  limparQuadro,
  pintar,
  pintarSeMaisForte,
  type Quadro,
} from "./grade";

const arrays = (q: Quadro) => [q.glifo, q.alfa, q.fundo, q.cor];
const vazio = (q: Quadro) => arrays(q).every((a) => a.every((x) => x === 0));
const glifoEm = (q: Quadro, i: number, j: number) =>
  String.fromCharCode(q.glifo[j * q.cols + i]);
/** Float32 guarda 0.7 como 0.699999988: compara com folga. */
const quase = (a: number, b: number) => Math.abs(a - b) < 1e-6;

test("criarQuadro arredonda para cima: 100×50 px dão 12 colunas e 5 linhas", () => {
  const q = criarQuadro(100, 50);
  assert.equal(q.cols, 12);
  assert.equal(q.linhas, 5);
  for (const a of arrays(q)) assert.equal(a.length, 60);
  assert.ok(vazio(q));
});

test("pintar escreve os quatro campos na célula j·cols + i", () => {
  const q = criarQuadro(100, 50);
  pintar(q, 3, 2, "#", 0.7, 0.13, COR_OURO);
  const id = 2 * q.cols + 3;
  assert.equal(glifoEm(q, 3, 2), "#");
  assert.ok(quase(q.alfa[id], 0.7));
  assert.ok(quase(q.fundo[id], 0.13));
  assert.equal(q.cor[id], COR_OURO);

  pintar(q, 4, 2, ".", 0.2);
  assert.equal(q.fundo[id + 1], 0, "fundo padrão é 0");
  assert.equal(q.cor[id + 1], COR_CREME, "cor padrão é creme");
});

test("pintar fora da grade não lança erro nem escreve", () => {
  const q = criarQuadro(100, 50);
  // (12, 0) cairia na célula (0, 1) se só o índice linear fosse checado
  for (const [i, j] of [[-1, 0], [0, -1], [12, 0], [0, 5], [12, 4], [-1, -1]]) {
    assert.doesNotThrow(() => pintar(q, i, j, "#", 1, 1, COR_OURO));
    assert.doesNotThrow(() => pintarSeMaisForte(q, i, j, "#", 1));
  }
  assert.ok(vazio(q));
});

test("pintar sempre sobrescreve, mesmo com alfa menor", () => {
  const q = criarQuadro(100, 50);
  pintar(q, 1, 1, "#", 0.9, 0.2, COR_OURO);
  pintar(q, 1, 1, " ", 0, 0.95);
  const id = q.cols + 1;
  assert.equal(glifoEm(q, 1, 1), " ");
  assert.equal(q.alfa[id], 0);
  assert.ok(quase(q.fundo[id], 0.95));
  assert.equal(q.cor[id], COR_CREME);
});

test("pintarSeMaisForte não troca um # de 0.8 por - de 0.5, mas troca de 0.5 por 0.8", () => {
  const q = criarQuadro(100, 50);
  pintar(q, 1, 1, "#", 0.8);
  pintarSeMaisForte(q, 1, 1, "-", 0.5);
  assert.equal(glifoEm(q, 1, 1), "#");
  assert.ok(quase(q.alfa[q.cols + 1], 0.8));

  pintar(q, 2, 1, "#", 0.5);
  pintarSeMaisForte(q, 2, 1, "-", 0.8);
  assert.equal(glifoEm(q, 2, 1), "-");
  assert.ok(quase(q.alfa[q.cols + 2], 0.8));
});

test("pintarSeMaisForte escreve sobre espaço mesmo mais fraco, e só troca glifo e alfa", () => {
  const q = criarQuadro(100, 50);
  // um pixel aceso da tela: espaço com fundo cheio
  pintar(q, 0, 0, " ", 0.9, 0.95, COR_OURO);
  pintarSeMaisForte(q, 0, 0, "/", 0.3);
  assert.equal(glifoEm(q, 0, 0), "/");
  assert.ok(quase(q.alfa[0], 0.3));
  assert.ok(quase(q.fundo[0], 0.95), "o fundo fica");
  assert.equal(q.cor[0], COR_OURO, "a cor fica");

  pintarSeMaisForte(q, 5, 3, "|", 0.1);
  assert.equal(glifoEm(q, 5, 3), "|", "célula nunca pintada aceita qualquer alfa");
});

test("limparQuadro zera os quatro arrays", () => {
  const q = criarQuadro(100, 50);
  pintar(q, 0, 0, "#", 1, 1, COR_OURO);
  pintar(q, 11, 4, "*", 0.5, 0.25, COR_OURO);
  assert.ok(!vazio(q));
  limparQuadro(q);
  assert.ok(vazio(q));
  assert.equal(q.cols, 12);
  assert.equal(q.linhas, 5);
});
