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
  assert.equal(g[3][10], true);
  assert.equal(g[4][11], true);
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
  for (const [l, c] of [[3, 4], [3, 6], [5, 4], [5, 6], [3, 10], [5, 12]]) {
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

test("olhando para a frente, o rosto é simétrico no eixo da grade", () => {
  const g = desenharGrade("normal", { x: 0, y: 0 }, 0);
  for (let l = 0; l < LINHAS; l++) {
    for (let c = 0; c < COLUNAS; c++) {
      assert.equal(g[l][c], g[l][COLUNAS - 1 - c], `pixel ${l},${c}`);
    }
  }
});

test("atento e surpreso no olhar extremo ainda cabem nas 16 colunas", () => {
  for (const e of ["atento", "surpreso"] as const) {
    const dir = desenharGrade(e, { x: 1, y: 0 }, 0);
    assert.equal(dir[3][14], true, `${e}: olho direito chega à coluna 14`);
    const esq = desenharGrade(e, { x: -1, y: 0 }, 0);
    assert.equal(esq[3][2], true, `${e}: olho esquerdo chega à coluna 2`);
  }
});

test("dormindo: o z nunca encosta no olho direito fechado", () => {
  for (let fase = 0; fase < 6; fase++) {
    const g = desenharGrade("dormindo", { x: 0, y: 0 }, fase);
    // dois olhos fechados (2 + 2 px) + boca (2 px) + z (7 px): sem sobreposição, soma 13
    assert.equal(acesos(g), 13, `fase ${fase}`);
    // e o z mora à direita do olho direito: nas colunas 10–11 só o olho acende
    for (let l = 0; l < LINHAS; l++) {
      for (const c of [10, 11]) {
        assert.equal(g[l][c], l === 4, `fase ${fase}, pixel ${l},${c}`);
      }
    }
  }
});

test("zFase fracionária não quebra e vale o degrau de baixo", () => {
  const olhar = { x: 0, y: 0 };
  let g: boolean[][] = [];
  assert.doesNotThrow(() => {
    g = desenharGrade("dormindo", olhar, 2.5);
  });
  assert.equal(chaveDaGrade(g), chaveDaGrade(desenharGrade("dormindo", olhar, 2)));
});

test("a boca segue o olhar nos dois sentidos com o mesmo passo", () => {
  const inicioDaBoca = (x: number) =>
    desenharGrade("normal", { x, y: 0 }, 0)[8].indexOf(true);
  const centro = inicioDaBoca(0);
  const esq = inicioDaBoca(-0.5); // dx = -1
  const dir = inicioDaBoca(0.5); // dx = +1
  assert.equal(centro - esq, dir - centro);
  assert.ok(dir - centro > 0);
});
