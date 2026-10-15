import { test } from "node:test";
import assert from "node:assert/strict";
import { assentou, passoMola, type Mola } from "./mola";

function simular(m: Mola, alvo: number, segundos: number, dt = 1 / 60) {
  let atual = m;
  let minimo = atual.x;
  let t = 0;
  let assentouEm: number | null = null;
  while (t < segundos) {
    atual = passoMola(atual, alvo, dt);
    minimo = Math.min(minimo, atual.x);
    t += dt;
    if (assentouEm === null && assentou(atual, alvo)) assentouEm = t;
  }
  return { atual, minimo, assentouEm };
}

test("converge ao alvo", () => {
  const { atual } = simular({ x: 0, v: 0 }, 1, 3);
  assert.ok(Math.abs(atual.x - 1) < 1e-3);
});

test("voltando a zero, assenta em menos de 2 s e quica (passa de zero)", () => {
  const { assentouEm, minimo } = simular({ x: 1, v: 0 }, 0, 3);
  assert.ok(assentouEm !== null && assentouEm < 2, `assentou em ${assentouEm}`);
  assert.ok(minimo < 0, "sem quique");
});

test("dt enorme não explode (passo tem teto)", () => {
  const r = passoMola({ x: 1, v: 0 }, 0, 5);
  assert.ok(Number.isFinite(r.x) && Math.abs(r.x) <= 1.5);
});

test("dt negativo ou zero não move", () => {
  assert.deepEqual(passoMola({ x: 0.5, v: 0.1 }, 0, -1), { x: 0.5, v: 0.1 });
  assert.deepEqual(passoMola({ x: 0.5, v: 0.1 }, 0, 0), { x: 0.5, v: 0.1 });
});

test("assentou exige posição E velocidade pequenas", () => {
  assert.equal(assentou({ x: 0, v: 0 }, 0), true);
  assert.equal(assentou({ x: 0, v: 0.5 }, 0), false);
  assert.equal(assentou({ x: 0.5, v: 0 }, 0), false);
});
