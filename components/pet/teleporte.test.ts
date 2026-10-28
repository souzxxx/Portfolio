import { test } from "node:test";
import assert from "node:assert/strict";
import { QUADROS, TELEPORTE_ENTRA_MS, jaChegou, querDentro, type ParteTeleporte } from "./teleporte";

const PARTES: ParteTeleporte[] = [
  "corpo",
  "risco",
  "linha-esq",
  "linha-dir",
  "residuo-esq",
  "residuo-dir",
];

test("entra quando o topo do SOUZXXX chega à MenuBar (28 px) ou passa dela", () => {
  assert.equal(querDentro(28, false), true);
  assert.equal(querDentro(29, false), false);
  assert.equal(querDentro(-500, false), true);
});

test("histerese: dentro, só sai 32 px abaixo do limiar", () => {
  assert.equal(querDentro(60, true), true);
  assert.equal(querDentro(61, true), false);
});

test("jaChegou: sair com a animação no 0, ou entrar com ela no fim, é chegar sem tocar", () => {
  // o play() rebobina nesses dois pontos: tocar daria a volta inteira
  assert.equal(jaChegou(false, 0), true);
  assert.equal(jaChegou(false, -1), true);
  assert.equal(jaChegou(true, TELEPORTE_ENTRA_MS), true);
  assert.equal(jaChegou(true, TELEPORTE_ENTRA_MS + 1), true);
});

test("jaChegou: no meio do caminho, ou na ponta oposta, ainda tem o que tocar", () => {
  assert.equal(jaChegou(false, 1), false);
  assert.equal(jaChegou(false, TELEPORTE_ENTRA_MS), false);
  assert.equal(jaChegou(true, TELEPORTE_ENTRA_MS - 1), false);
  assert.equal(jaChegou(true, 0), false);
});

test("o roteiro tem exatamente as seis partes", () => {
  assert.deepEqual(Object.keys(QUADROS).sort(), [...PARTES].sort());
});

test("toda parte: offsets estritamente crescentes de 0 a 1, todo keyframe em degrau", () => {
  for (const parte of PARTES) {
    const ks = QUADROS[parte];
    assert.ok(ks.length >= 2, `${parte}: pelo menos dois keyframes`);
    assert.equal(ks[0].offset, 0, `${parte}: começa em 0`);
    assert.equal(ks[ks.length - 1].offset, 1, `${parte}: termina em 1`);
    for (let i = 1; i < ks.length; i++) {
      const antes = ks[i - 1].offset as number;
      const agora = ks[i].offset as number;
      assert.ok(agora > antes, `${parte}: offset ${agora} depois de ${antes}`);
    }
    for (const k of ks) {
      assert.equal(k.easing, "steps(1, end)", `${parte}: offset ${k.offset}`);
    }
  }
});

test("corpo começa invisível e termina inteiro, sem transform", () => {
  const ks = QUADROS.corpo;
  assert.equal(ks[0].opacity, "0");
  const ultimo = ks[ks.length - 1];
  assert.equal(ultimo.opacity, "1");
  assert.equal(ultimo.transform, "none");
});

test("toda parte que não é o corpo termina invisível", () => {
  for (const parte of PARTES) {
    if (parte === "corpo") continue;
    const ks = QUADROS[parte];
    assert.equal(ks[ks.length - 1].opacity, "0", parte);
  }
});

test("esquerda e direita são espelho uma da outra, e a esquerda anda para a esquerda", () => {
  const deslocamento = (k: Keyframe) => {
    const m = /^translateX\((-?\d+(?:\.\d+)?)(?:px)?\)$/.exec(String(k.transform));
    assert.ok(m, `transform inesperado: ${String(k.transform)}`);
    return Number(m[1]);
  };
  for (const tipo of ["linha", "residuo"] as const) {
    const esq = QUADROS[`${tipo}-esq`];
    const dir = QUADROS[`${tipo}-dir`];
    assert.equal(esq.length, dir.length, tipo);
    for (let i = 0; i < esq.length; i++) {
      assert.equal(esq[i].offset, dir[i].offset, `${tipo}[${i}]`);
      assert.equal(esq[i].opacity, dir[i].opacity, `${tipo}[${i}]`);
      // soma zero, e não `-dir`: o assert estrito separa 0 de -0
      assert.equal(deslocamento(esq[i]) + deslocamento(dir[i]), 0, `${tipo}[${i}]`);
    }
    assert.ok(esq.some((k) => deslocamento(k) < 0), `${tipo}-esq anda para a esquerda`);
  }
});
