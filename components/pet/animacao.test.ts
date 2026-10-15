import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AGACHA_S,
  ALTURA_SALTO,
  DT_MAX,
  GRAVIDADE,
  VEL_DECOLAGEM,
  aproximar,
  avancarFase,
  compensarVolume,
  criarSalto,
  emRepouso,
  limiteSuave,
  limitarDt,
  passoSalto,
  pedirSalto,
  type EventoSalto,
  type Salto,
} from "./animacao";

test("limitarDt: NaN e negativo viram 0; teto de DT_MAX", () => {
  assert.equal(limitarDt(Number.NaN), 0);
  assert.equal(limitarDt(-1), 0);
  assert.equal(limitarDt(5), DT_MAX);
  assert.equal(limitarDt(1 / 60), 1 / 60);
});

test("aproximar: 63% em tau e independe da taxa de quadros", () => {
  assert.ok(Math.abs(aproximar(0, 1, 0.08, 0.08) - (1 - Math.exp(-1))) < 1e-12);
  let a = 0;
  for (let i = 0; i < 10; i++) a = aproximar(a, 1, 0.01, 0.08);
  assert.ok(Math.abs(a - aproximar(0, 1, 0.1, 0.08)) < 1e-12);
  assert.equal(aproximar(0.3, 1, 0.016, 0), 1);
});

test("limiteSuave: nunca passa do teto, é ímpar e quase identidade perto de zero", () => {
  for (const x of [-10, -0.2, 0.2, 10, 1e6]) {
    assert.ok(Math.abs(limiteSuave(x, 0.08)) < 0.08 + 1e-12, String(x));
  }
  assert.equal(limiteSuave(-0.05, 0.08), -limiteSuave(0.05, 0.08));
  assert.ok(Math.abs(limiteSuave(0.002, 0.08) - 0.002) < 1e-6);
});

test("compensarVolume conserva o volume", () => {
  for (const sy of [0.92, 1, 1.08]) {
    const s = compensarVolume(sy);
    assert.ok(Math.abs(s * s * sy - 1) < 1e-12);
  }
});

test("avancarFase: fica em [0, 2π) e troca de período sem salto", () => {
  let f = 0;
  for (let i = 0; i < 1000; i++) {
    const antes = f;
    f = avancarFase(f, 1 / 60, i < 500 ? 2.6 : 4.5);
    assert.ok(f >= 0 && f < Math.PI * 2);
    const passo = (f - antes + Math.PI * 2) % (Math.PI * 2);
    assert.ok(passo < 0.05, `salto de fase ${passo}`);
  }
});

function simularSalto(s: Salto, segundos: number, dt = 1 / 60) {
  const eventos: { ev: EventoSalto; t: number }[] = [];
  let t = 0;
  let maxY = 0;
  let minY = 0;
  while (t < segundos) {
    const ev = passoSalto(s, dt);
    t += dt;
    if (ev !== "nada") eventos.push({ ev, t });
    maxY = Math.max(maxY, s.y);
    minY = Math.min(minY, s.y);
  }
  return { eventos, maxY, minY };
}

test("pulinho: agacha, decola, chega a ~0.25 e pousa uma vez", () => {
  const s = criarSalto();
  assert.ok(emRepouso(s));
  assert.equal(pedirSalto(s), true);
  const { eventos, maxY, minY } = simularSalto(s, 1.5, 1 / 120);
  assert.deepEqual(
    eventos.map((e) => e.ev),
    ["decolou", "pousou"],
  );
  assert.ok(Math.abs(eventos[0].t - AGACHA_S) < 1 / 120 + 1e-9);
  const noAr = eventos[1].t - eventos[0].t;
  assert.ok(Math.abs(noAr - (2 * VEL_DECOLAGEM) / GRAVIDADE) < 0.02, `no ar ${noAr}`);
  assert.ok(maxY <= ALTURA_SALTO + 1e-9 && maxY > ALTURA_SALTO - 0.005, `altura ${maxY}`);
  assert.equal(minY, 0, "nunca abaixo do chão");
  assert.ok(emRepouso(s));
});

test("pedido no ar vira UM pulo encadeado, não um pulo mais alto", () => {
  const s = criarSalto();
  pedirSalto(s);
  passoSalto(s, 0.1);
  passoSalto(s, 0.05);
  assert.equal(pedirSalto(s), false);
  assert.equal(pedirSalto(s), false);
  const { eventos, maxY } = simularSalto(s, 3);
  assert.deepEqual(
    eventos.map((e) => e.ev),
    ["pousou", "decolou", "pousou"],
  );
  assert.ok(maxY <= ALTURA_SALTO + 1e-9);
  assert.ok(emRepouso(s));
});

test("pulinho: dt enorme ou NaN não explode", () => {
  const s = criarSalto();
  pedirSalto(s);
  passoSalto(s, Number.NaN);
  assert.equal(s.agacha, AGACHA_S);
  for (let i = 0; i < 20; i++) passoSalto(s, 5);
  assert.ok(Number.isFinite(s.y) && Number.isFinite(s.v));
  assert.ok(emRepouso(s));
});
