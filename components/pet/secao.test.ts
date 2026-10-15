import { test } from "node:test";
import assert from "node:assert/strict";
import { escolherSecao, rotaDoPet } from "./secao";

test("home nos dois idiomas, com e sem barra final", () => {
  for (const p of ["/", "/en", "/en/"]) assert.equal(rotaDoPet(p), "home");
});

test("currículo nos dois idiomas", () => {
  for (const p of ["/cv", "/en/cv", "/cv/"]) assert.equal(rotaDoPet(p), "cv");
});

test("páginas de case nos dois idiomas", () => {
  assert.equal(rotaDoPet("/projetos/financehub"), "caso");
  assert.equal(rotaDoPet("/en/projects/financehub"), "caso");
});

test("qualquer outra coisa é a página de erro", () => {
  for (const p of ["/nada", "/projetos", "/en/projects", "/projetos/a/b", "/en/qualquer"]) {
    assert.equal(rotaDoPet(p), "erro", p);
  }
});

test("sem seção visível, a dica é a da mesa (topo)", () => {
  assert.equal(escolherSecao(new Map()), "top");
  assert.equal(escolherSecao(new Map([["projects", 0], ["stack", 0]])), "top");
});

test("vence a seção com mais pixels visíveis", () => {
  assert.equal(escolherSecao(new Map([["academic", 300], ["stack", 600]])), "stack");
});
