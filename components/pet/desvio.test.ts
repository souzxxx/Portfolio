import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularDesvio, cobertura, deslocar, type Retangulo } from "./desvio";

const ret = (left: number, top: number, right: number, bottom: number): Retangulo => ({
  left,
  top,
  right,
  bottom,
});

/** O botão do pet (88×104) num canto genérico. */
const PET = ret(1000, 600, 1088, 704);

test("sem obstáculos, fica no lugar", () => {
  assert.deepEqual(calcularDesvio(PET, [], 300), { x: 0, y: 0 });
});

test("um obstáculo embaixo: sobe até o fundo ficar 8 px acima do topo dele", () => {
  const icone = ret(1000, 650, 1088, 720);
  const d = calcularDesvio(PET, [icone], 300);
  assert.deepEqual(d, { x: 0, y: 704 - 650 + 8 });
  assert.equal(deslocar(PET, d.x, d.y).bottom, icone.top - 8);
});

test("obstáculo que só aparece depois da primeira subida: as subidas somam", () => {
  const baixo = ret(1000, 650, 1088, 720);
  const cima = ret(1000, 520, 1088, 560);
  // Amostrador como o do hook: só enxerga o que está sob a posição CANDIDATA.
  const pedidos: Retangulo[] = [];
  const amostrar = (c: Retangulo) => {
    pedidos.push(c);
    return [baixo, cima].filter((o) => cobertura(o, c) > 0);
  };
  const d = calcularDesvio(PET, amostrar, 300);
  assert.deepEqual(d, { x: 0, y: 704 - 520 + 8 });
  assert.deepEqual(
    pedidos.map((c) => c.top),
    [600, 600 - 62, 600 - 192],
    "mede no repouso, depois de subir 62 e depois de subir 192",
  );
});

test("coluna de ícones em cima (a mesa em 1366×768): sem lugar subindo, desvia para a esquerda", () => {
  const pet = ret(1223, 617, 1311, 721);
  const tops = [60, 145, 229, 314, 398, 483, 567, 652];
  const icones = tops.map((t) => ret(1230, t, 1318, t + 68));
  const d = calcularDesvio(pet, icones, Math.round(768 * 0.45));
  assert.deepEqual(d, { x: 1311 - 1230 + 8, y: 0 });
  assert.equal(deslocar(pet, d.x, d.y).right, 1230 - 8);
});

test("depois de 4 subidas sem lugar livre, não insiste: tenta o lado", () => {
  // Cinco degraus que cabem folgados no teto, cada um a 40 px do anterior.
  const degraus = [0, 1, 2, 3, 4].map((i) => ret(1000, 660 - i * 120, 1088, 700 - i * 120));
  const d = calcularDesvio(PET, degraus, 10_000);
  assert.deepEqual(d, { x: 1088 - 1000 + 8, y: 0 });
});

test("teto respeitado: sem lugar livre em cima nem ao lado, fica no teto", () => {
  // Uma parede de ícones de 70 px com vãos de 10: nenhuma posição livre.
  const parede: Retangulo[] = [];
  for (let x = 0; x < 1400; x += 80) {
    for (let y = 0; y < 800; y += 80) parede.push(ret(x, y, x + 70, y + 70));
  }
  assert.deepEqual(calcularDesvio(PET, parede, 300), { x: 0, y: 300 });
});

test("um interativo largo coberto em menos de um quinto não conta (linha da lista de projetos)", () => {
  const linha = ret(48, 650, 1318, 777);
  assert.ok(cobertura(linha, PET) < 0.2);
  assert.deepEqual(calcularDesvio(PET, [linha], 300), { x: 0, y: 0 });
});

test("retângulo sem área (link escondido) não conta", () => {
  assert.equal(cobertura(ret(1010, 610, 1010, 610), PET), 0);
  assert.deepEqual(calcularDesvio(PET, [ret(1010, 610, 1010, 610)], 300), { x: 0, y: 0 });
});

test("bordas fracionárias: o desvio é inteiro e nunca fica aquém da folga", () => {
  const icone = ret(1000, 650.4, 1088, 720);
  const d = calcularDesvio(PET, [icone], 300);
  assert.ok(Number.isInteger(d.y));
  assert.ok(deslocar(PET, d.x, d.y).bottom <= icone.top - 8);
});

test("cobertura: fração da área do obstáculo que o pet cobre", () => {
  assert.equal(cobertura(ret(1000, 600, 1088, 704), PET), 1);
  assert.equal(cobertura(ret(1044, 600, 1132, 704), PET), 0.5);
  assert.equal(cobertura(ret(0, 0, 10, 10), PET), 0);
});
