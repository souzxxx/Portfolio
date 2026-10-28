import { test } from "node:test";
import assert from "node:assert/strict";
import { intervaloPiscada, transicao, type Expressao } from "./maquina";

test("inatividade leva qualquer expressão a dormindo", () => {
  for (const e of ["normal", "piscando", "atento", "surpreso"] as Expressao[]) {
    assert.equal(transicao(e, { tipo: "inatividade" }), "dormindo");
  }
});

test("inatividade em dormindo não muda nada (não rearma o z)", () => {
  assert.equal(transicao("dormindo", { tipo: "inatividade" }), "dormindo");
});

test("atividade acorda com surpresa; fora do sono não muda", () => {
  assert.equal(transicao("dormindo", { tipo: "atividade" }), "surpreso");
  assert.equal(transicao("normal", { tipo: "atividade" }), "normal");
  assert.equal(transicao("atento", { tipo: "atividade" }), "atento");
});

test("surpresa termina em normal", () => {
  assert.equal(transicao("surpreso", { tipo: "fimSurpresa" }), "normal");
  assert.equal(transicao("normal", { tipo: "fimSurpresa" }), "normal");
});

test("hover: normal/piscando/surpreso → atento; sair → normal", () => {
  for (const e of ["normal", "piscando", "surpreso"] as Expressao[]) {
    assert.equal(transicao(e, { tipo: "hover", ativo: true }), "atento");
  }
  assert.equal(transicao("atento", { tipo: "hover", ativo: false }), "normal");
  assert.equal(transicao("normal", { tipo: "hover", ativo: false }), "normal");
});

test("hover não acorda quem dorme (quem acorda é a atividade)", () => {
  assert.equal(transicao("dormindo", { tipo: "hover", ativo: true }), "dormindo");
});

test("piscar só a partir de normal, e volta a normal", () => {
  assert.equal(transicao("normal", { tipo: "piscar" }), "piscando");
  assert.equal(transicao("atento", { tipo: "piscar" }), "atento");
  assert.equal(transicao("dormindo", { tipo: "piscar" }), "dormindo");
  assert.equal(transicao("piscando", { tipo: "fimPiscar" }), "normal");
  assert.equal(transicao("atento", { tipo: "fimPiscar" }), "atento");
});

test("teletransporte assusta qualquer expressão, até quem dorme", () => {
  for (const e of ["normal", "piscando", "atento", "dormindo", "surpreso"] as Expressao[]) {
    assert.equal(transicao(e, { tipo: "teleporte" }), "surpreso", e);
  }
});

test("intervalo da piscada fica entre 3 e 7 segundos", () => {
  assert.equal(intervaloPiscada(0), 3000);
  assert.equal(intervaloPiscada(0.5), 5000);
  assert.ok(intervaloPiscada(0.999999) < 7000);
  assert.equal(intervaloPiscada(-1), 3000);
  assert.equal(intervaloPiscada(2), 7000);
});
