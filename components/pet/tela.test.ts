import { test } from "node:test";
import assert from "node:assert/strict";
import {
  COLUNAS,
  LINHAS,
  chaveDaGrade,
  desenharGrade,
  olharEmPixels,
} from "./tela";

const EXPRESSOES = ["normal", "piscando", "atento", "dormindo", "surpreso"] as const;
const acesos = (g: boolean[][]) => g.flat().filter(Boolean).length;

test("toda expressão devolve 12 linhas de 16 colunas, mesmo com olhar extremo", () => {
  for (const e of EXPRESSOES) {
    for (const olhar of [
      { x: 0, y: 0 },
      { x: 9, y: 9 },
      { x: -9, y: -9 },
    ]) {
      const g = desenharGrade(e, olhar, 3);
      assert.equal(g.length, LINHAS);
      for (const linha of g) assert.equal(linha.length, COLUNAS);
    }
  }
});

test("olharEmPixels limita a ±2 em x e ±1 em y, sem -0", () => {
  assert.deepEqual(olharEmPixels({ x: 5, y: -9 }), { dx: 2, dy: -1 });
  assert.deepEqual(olharEmPixels({ x: 0.2, y: 0.2 }), { dx: 0, dy: 0 });
  assert.deepEqual(olharEmPixels({ x: -0.3, y: 0 }), { dx: -1, dy: 0 });
  assert.ok(Object.is(olharEmPixels({ x: -0.1, y: -0.1 }).dx, 0));
  assert.ok(Object.is(olharEmPixels({ x: -0.1, y: -0.1 }).dy, 0));
});

test("normal, olhando para a frente: olhos 2×2 nas órbitas e boca de 4 px", () => {
  const g = desenharGrade("normal", { x: 0, y: 0 }, 0);
  assert.equal(g[3][4], true);
  assert.equal(g[4][5], true);
  assert.equal(g[3][9], true);
  assert.equal(g[4][10], true);
  assert.equal(g[8][6], true);
  assert.equal(g[8][9], true);
  assert.equal(acesos(g), 12);
});

test("olhar para a direita desloca os olhos 2 px", () => {
  const g = desenharGrade("normal", { x: 1, y: 0 }, 0);
  assert.equal(g[3][6], true);
  assert.equal(g[3][4], false);
});

test("piscando acende menos pixels que normal", () => {
  const olhar = { x: 0, y: 0 };
  assert.ok(acesos(desenharGrade("piscando", olhar, 0)) < acesos(desenharGrade("normal", olhar, 0)));
  assert.equal(acesos(desenharGrade("piscando", olhar, 0)), 8);
});

test("atento tem olhos 3×3", () => {
  const g = desenharGrade("atento", { x: 0, y: 0 }, 0);
  for (const [l, c] of [[3, 4], [3, 6], [5, 4], [5, 6], [3, 9], [5, 11]]) {
    assert.equal(g[l][c], true, `pixel ${l},${c}`);
  }
});

test("dormindo: o z sobe com a fase e o ciclo fecha em 6", () => {
  const olhar = { x: 0, y: 0 };
  const f0 = chaveDaGrade(desenharGrade("dormindo", olhar, 0));
  const f1 = chaveDaGrade(desenharGrade("dormindo", olhar, 1));
  const f6 = chaveDaGrade(desenharGrade("dormindo", olhar, 6));
  assert.notEqual(f0, f1);
  assert.equal(f0, f6);
});

test("dormindo ignora o olhar", () => {
  const a = chaveDaGrade(desenharGrade("dormindo", { x: -1, y: -1 }, 2));
  const b = chaveDaGrade(desenharGrade("dormindo", { x: 1, y: 1 }, 2));
  assert.equal(a, b);
});
