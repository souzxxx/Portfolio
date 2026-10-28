import { test } from "node:test";
import assert from "node:assert/strict";
import { desenharGrade } from "../pet/tela";
import { OLHOS_UV, REGIAO, pixelDaTela, regiaoEm } from "./silhueta";

test("regiaoEm classifica a silhueta como a função classe do protótipo", () => {
  assert.equal(regiaoEm(-0.05, -0.19, 0.1), REGIAO.tela);
  assert.equal(regiaoEm(-0.33, 0.2, 0.1), REGIAO.frente);
  assert.equal(regiaoEm(0.3, 0, 0.1), REGIAO.lado);
  assert.equal(regiaoEm(0, -0.48, 0.1), REGIAO.tampo);
  assert.equal(regiaoEm(0.1, 0.145, 0.1), REGIAO.fenda);
  assert.equal(regiaoEm(0, 0.4, 0.1), REGIAO.pe);
  assert.equal(regiaoEm(0.6, 0, 0.1), REGIAO.vazio);
});

test("regiaoEm: moldura em volta da tela e selo no canto de baixo", () => {
  assert.equal(regiaoEm(-0.27, -0.19, 0.1), REGIAO.moldura);
  assert.equal(regiaoEm(-0.05, -0.38, 0.1), REGIAO.moldura);
  assert.equal(regiaoEm(-0.3, 0.265, 0.1), REGIAO.selo);
});

test("regiaoEm: a lateral acompanha o lado (paralaxe do mouse)", () => {
  assert.equal(regiaoEm(0.33, 0, 0.1), REGIAO.lado);
  assert.equal(regiaoEm(0.33, 0, 0.05), REGIAO.vazio, "lado estreito não chega a 0.33");
});

test("pixelDaTela: os cantos da tela são os pixels 0,0 e 15,11", () => {
  assert.deepEqual(pixelDaTela(-0.25, -0.355), { px: 0, py: 0 });
  // a região tela é fechada nas duas pontas: a borda de baixo/direita é o
  // último pixel, não um 16.º que não existe na grade do pet
  assert.deepEqual(pixelDaTela(0.15, -0.025), { px: 15, py: 11 });
  assert.deepEqual(pixelDaTela(-0.04, -0.18), { px: 8, py: 6 });
});

test("pixelDaTela no centro de cada olho de OLHOS_UV cai num pixel aceso do rosto normal", () => {
  const g = desenharGrade("normal", { x: 0, y: 0 }, 0);
  const v = (OLHOS_UV.v0 + OLHOS_UV.v1) / 2;
  for (const olho of [OLHOS_UV.esq, OLHOS_UV.dir]) {
    const { px, py } = pixelDaTela((olho.u0 + olho.u1) / 2, v);
    assert.equal(g[py][px], true, `pixel ${px},${py}`);
  }
});

test("OLHOS_UV cobre exatamente os olhos: por dentro, aceso; logo fora, apagado", () => {
  const g = desenharGrade("normal", { x: 0, y: 0 }, 0);
  const aceso = (u: number, v: number) => {
    const { px, py } = pixelDaTela(u, v);
    return g[py][px];
  };
  const e = 1e-3;
  const { v0, v1 } = OLHOS_UV;
  for (const { u0, u1 } of [OLHOS_UV.esq, OLHOS_UV.dir]) {
    for (const u of [u0 + e, u1 - e]) {
      for (const v of [v0 + e, v1 - e]) assert.equal(aceso(u, v), true, `dentro ${u},${v}`);
    }
    const um = (u0 + u1) / 2;
    const vm = (v0 + v1) / 2;
    assert.equal(aceso(u0 - e, vm), false, "à esquerda do olho");
    assert.equal(aceso(u1 + e, vm), false, "à direita do olho");
    assert.equal(aceso(um, v0 - e), false, "acima do olho");
    assert.equal(aceso(um, v1 + e), false, "abaixo do olho");
  }
});
