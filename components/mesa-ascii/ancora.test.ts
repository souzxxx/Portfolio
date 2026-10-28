import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ALTURA_MAC,
  ALTURA_MIN,
  ancorarMac,
  olhosEmRepouso,
  type Ret,
} from "./ancora";

/**
 * Fixtures da escadinha da Task 1 (retângulos em coordenadas da mesa).
 * Encostar não é cruzar: as bordas podem coincidir.
 */
const cruza = (a: Ret, b: Ret) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

const FIXTURES = {
  "1512×982, rosto no vão": {
    mesa: { w: 1512, h: 982 },
    janelas: {
      leiame: { x: 48, y: 60, w: 758, h: 739 },
      render: { x: 1006, y: 60, w: 312, h: 336 },
      terminal: { x: 838, y: 526, w: 480, h: 248 },
    },
  },
  "1024×768, vão estreito e rosto na faixa": {
    mesa: { w: 1024, h: 768 },
    janelas: {
      leiame: { x: 41, y: 60, w: 474, h: 871 },
      render: { x: 607, y: 60, w: 236, h: 260 },
      terminal: { x: 527, y: 384, w: 316, h: 176 },
    },
  },
  "faixa de 42 px, que força o encolhimento": {
    mesa: { w: 1024, h: 768 },
    janelas: {
      leiame: { x: 41, y: 60, w: 474, h: 871 },
      render: { x: 607, y: 60, w: 236, h: 260 },
      terminal: { x: 527, y: 362, w: 316, h: 176 },
    },
  },
};

for (const [nome, { mesa, janelas }] of Object.entries(FIXTURES)) {
  test(`${nome}: os olhos em repouso não ficam embaixo de nenhuma janela`, () => {
    const { esq, dir } = olhosEmRepouso(ancorarMac(mesa, janelas));
    for (const olho of [esq, dir]) {
      for (const [qual, ret] of Object.entries(janelas)) {
        assert.ok(!cruza(olho, ret), `olho ${JSON.stringify(olho)} cruza ${qual}`);
      }
    }
  });

  test(`${nome}: os olhos ficam dentro da mesa`, () => {
    const { esq, dir } = olhosEmRepouso(ancorarMac(mesa, janelas));
    for (const o of [esq, dir]) {
      assert.ok(o.x >= 0 && o.y >= 0, JSON.stringify(o));
      assert.ok(o.x + o.w <= mesa.w && o.y + o.h <= mesa.h, JSON.stringify(o));
    }
  });

  test(`${nome}: a altura fica entre ${ALTURA_MIN} e ${ALTURA_MAC} da mesa`, () => {
    const { altura } = ancorarMac(mesa, janelas);
    assert.ok(altura >= ALTURA_MIN * mesa.h, `${altura}`);
    assert.ok(altura <= ALTURA_MAC * mesa.h, `${altura}`);
  });
}

test("1512×982: com vão largo, o rosto fica entre o LEIA-ME e o RENDER, no tamanho cheio", () => {
  const { mesa, janelas } = FIXTURES["1512×982, rosto no vão"];
  const a = ancorarMac(mesa, janelas);
  assert.equal(a.altura, ALTURA_MAC * mesa.h);
  const { esq, dir } = olhosEmRepouso(a);
  assert.ok(esq.x >= janelas.leiame.x + janelas.leiame.w);
  assert.ok(dir.x + dir.w <= janelas.render.x);
  assert.ok(esq.y >= janelas.render.y && esq.y + esq.h <= janelas.render.y + janelas.render.h);
});

test("1024×768: com vão estreito, o rosto vai para a faixa entre o RENDER e o TERMINAL", () => {
  const { mesa, janelas } = FIXTURES["1024×768, vão estreito e rosto na faixa"];
  const a = ancorarMac(mesa, janelas);
  assert.equal(a.altura, ALTURA_MAC * mesa.h, "64 px de faixa já cabem sem encolher");
  for (const o of Object.values(olhosEmRepouso(a))) {
    assert.ok(o.y >= janelas.render.y + janelas.render.h);
    assert.ok(o.y + o.h <= janelas.terminal.y);
  }
});

test("faixa de 42 px: o Mac encolhe abaixo de 78% para os olhos caberem", () => {
  const { mesa, janelas } = FIXTURES["faixa de 42 px, que força o encolhimento"];
  const { altura } = ancorarMac(mesa, janelas);
  assert.ok(altura < ALTURA_MAC * mesa.h, `${altura}`);
});

test("olhosEmRepouso: o centro dos dois olhos cai no ponto da âncora que mira o rosto", () => {
  const a = { cx: 700, baseY: 800, altura: 700 };
  const { esq, dir } = olhosEmRepouso(a);
  // olhos 2×2 da grade 16×12 numa tela de 0.4 × 0.33 alturas
  assert.ok(Math.abs(esq.w - 0.05 * 700) < 1e-9);
  assert.ok(Math.abs(esq.h - 0.055 * 700) < 1e-9);
  assert.equal(esq.y, dir.y);
  assert.ok(Math.abs((esq.x + dir.x + dir.w) / 2 - (700 - 0.05 * 700)) < 1e-9);
  assert.ok(Math.abs(esq.y + esq.h / 2 - (800 - 0.675 * 700)) < 1e-9);
});
