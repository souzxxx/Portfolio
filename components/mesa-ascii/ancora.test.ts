import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ALTURA_MAC,
  ALTURA_MIN,
  DIREITA_MAC,
  FOLGA_OLHOS,
  INCLINA_MAC,
  MARGEM_TOPO,
  RESPIRA_MAC,
  SALTO_MAC,
  ancorarMac,
  olhosEmRepouso,
  type Ret,
} from "./ancora";
import { OLHOS_UV } from "./silhueta";

/**
 * Fixtures da escadinha da Task 1 (retângulos em coordenadas da mesa).
 * Encostar não é cruzar: as bordas podem coincidir.
 */
const cruza = (a: Ret, b: Ret) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

const crescer = (r: Ret, mx: number, my: number): Ret => ({
  x: r.x - mx,
  y: r.y - my,
  w: r.w + 2 * mx,
  h: r.h + 2 * my,
});

/** Do centro dos olhos até a base do pé, em alturas do Mac (0.675). */
const OLHOS_ACIMA = 0.43 - (OLHOS_UV.v0 + OLHOS_UV.v1) / 2;
/** Quanto o balanço e a respiração mexem os olhos parados, em px de cada lado. */
const balanco = (altura: number) => ({
  x: INCLINA_MAC * OLHOS_ACIMA * altura,
  y: RESPIRA_MAC * OLHOS_ACIMA * altura,
});
/** Folga de float para contas que encostam exatamente no limite. */
const EPS = 1e-6;

const LEIAME_1024 = { x: 41, y: 60, w: 474, h: 871 };
const RENDER_1024 = { x: 607, y: 60, w: 236, h: 260 };
/**
 * A coluna de ícones medida no navegador. O `nav` começa em x = 895 (1024) e
 * 1376 (1512), mas o rótulo mais largo (CURRÍCULO.PDF) passa ~8 px para cada
 * lado da caixa dele, e o texto vence sempre: o obstáculo é o nav com os
 * filhos.
 */
const NAV_1024 = { x: 887, y: 60, w: 104, h: 668 };
const NAV_1512 = { x: 1368, y: 60, w: 104, h: 882 };

/**
 * `cabe`: o rosto cabe no vão ou na faixa com a FOLGA_OLHOS e o balanço.
 * A faixa de 42 px não cabe nem em ALTURA_MIN e cai no melhor esforço.
 */
const FIXTURES = {
  "1512×982, rosto no vão": {
    cabe: true,
    mesa: { w: 1512, h: 982 },
    janelas: {
      leiame: { x: 48, y: 60, w: 758, h: 739 },
      render: { x: 1006, y: 60, w: 312, h: 336 },
      terminal: { x: 838, y: 526, w: 480, h: 248 },
      nav: NAV_1512,
    },
  },
  "1024×768, vão estreito e rosto na faixa": {
    cabe: true,
    mesa: { w: 1024, h: 768 },
    janelas: {
      leiame: LEIAME_1024,
      render: RENDER_1024,
      terminal: { x: 527, y: 384, w: 316, h: 176 },
      nav: NAV_1024,
    },
  },
  "faixa de 42 px, que força o encolhimento": {
    cabe: false,
    mesa: { w: 1024, h: 768 },
    janelas: {
      leiame: LEIAME_1024,
      render: RENDER_1024,
      terminal: { x: 527, y: 362, w: 316, h: 176 },
      nav: NAV_1024,
    },
  },
};

/** Vão de 12 px e faixa de 20 px: nada cabe. */
const IMPOSSIVEL = {
  mesa: { w: 1024, h: 768 },
  janelas: {
    leiame: { x: 41, y: 60, w: 554, h: 871 },
    render: RENDER_1024,
    terminal: { x: 600, y: 340, w: 243, h: 176 },
    nav: NAV_1024,
  },
};

function macInteiroNaMesa(mesa: { w: number; h: number }, a: ReturnType<typeof ancorarMac>) {
  const topo = a.baseY - (1 + SALTO_MAC) * a.altura;
  const sombra = a.baseY + 0.04 * a.altura;
  assert.ok(topo >= MARGEM_TOPO - EPS, `topo no auge do pulo em ${topo}`);
  assert.ok(sombra <= mesa.h + EPS, `sombra até ${sombra}, mesa ${mesa.h}`);
}

/** O ponto mais à direita que o Mac pode pintar fica a FOLGA_OLHOS dos ícones. */
function macAntesDosIcones(a: ReturnType<typeof ancorarMac>, nav: Ret) {
  const direita = a.cx + DIREITA_MAC * a.altura;
  assert.ok(direita + FOLGA_OLHOS <= nav.x + EPS, `Mac até x = ${direita}, ícones em ${nav.x}`);
}

function olhosLivres(
  olhos: Ret[],
  mesa: { w: number; h: number },
  janelas: Record<string, Ret>,
  mx: number,
  my: number,
) {
  for (const o of olhos) {
    const r = crescer(o, mx, my);
    for (const [qual, ret] of Object.entries(janelas)) {
      assert.ok(!cruza(r, ret), `olho ${JSON.stringify(r)} cruza ${qual}`);
    }
    assert.ok(r.x >= 0 && r.y >= 0, JSON.stringify(r));
    assert.ok(r.x + r.w <= mesa.w && r.y + r.h <= mesa.h, JSON.stringify(r));
  }
}

for (const [nome, { cabe, mesa, janelas }] of Object.entries(FIXTURES)) {
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

  test(`${nome}: o Mac inteiro cabe na mesa, do topo no auge do pulo até a sombra`, () => {
    macInteiroNaMesa(mesa, ancorarMac(mesa, janelas));
  });

  test(`${nome}: no máximo da lateral, da inclinação e do pouso, o Mac fica à esquerda dos ícones`, () => {
    macAntesDosIcones(ancorarMac(mesa, janelas), janelas.nav);
  });

  test(`${nome}: com o balanço e a respiração, os olhos continuam livres`, () => {
    const a = ancorarMac(mesa, janelas);
    const { esq, dir } = olhosEmRepouso(a);
    const m = balanco(a.altura);
    olhosLivres([esq, dir], mesa, janelas, m.x, m.y);
  });

  if (cabe) {
    test(`${nome}: e ainda sobra a folga de ${FOLGA_OLHOS} px além do balanço`, () => {
      const a = ancorarMac(mesa, janelas);
      const { esq, dir } = olhosEmRepouso(a);
      const m = balanco(a.altura);
      olhosLivres([esq, dir], mesa, janelas, FOLGA_OLHOS + m.x, FOLGA_OLHOS + m.y);
    });
  }
}

test("1512×982: o rosto fica no vão entre o LEIA-ME e o RENDER, um pouco menor que 78%", () => {
  const { mesa, janelas } = FIXTURES["1512×982, rosto no vão"];
  const a = ancorarMac(mesa, janelas);
  // a 78% os olhos com balanço não cabem nos 200 px do vão; a 74% cabem
  assert.ok(a.altura < ALTURA_MAC * mesa.h, `${a.altura / mesa.h}`);
  assert.ok(a.altura >= 0.7 * mesa.h, `${a.altura / mesa.h}`);
  const { esq, dir } = olhosEmRepouso(a);
  assert.ok(esq.x >= janelas.leiame.x + janelas.leiame.w);
  assert.ok(dir.x + dir.w <= janelas.render.x);
  assert.ok(esq.y >= janelas.render.y && esq.y + esq.h <= janelas.terminal.y);
});

test("1024×768: com vão estreito, o rosto vai para a faixa entre o RENDER e o TERMINAL", () => {
  const { mesa, janelas } = FIXTURES["1024×768, vão estreito e rosto na faixa"];
  const a = ancorarMac(mesa, janelas);
  for (const o of Object.values(olhosEmRepouso(a))) {
    assert.ok(o.y >= janelas.render.y + janelas.render.h);
    assert.ok(o.y + o.h <= janelas.terminal.y);
  }
});

test("faixa de 42 px: nada cabe com folga, e o Mac fica em ALTURA_MIN exata, na faixa", () => {
  const { mesa, janelas } = FIXTURES["faixa de 42 px, que força o encolhimento"];
  const a = ancorarMac(mesa, janelas);
  assert.ok(a.altura < ALTURA_MAC * mesa.h, `${a.altura}`);
  assert.equal(a.altura, ALTURA_MIN * mesa.h);
});

test("impossível (vão de 12 px, faixa de 20 px): ALTURA_MIN exata e o Mac inteiro na mesa", () => {
  const { mesa, janelas } = IMPOSSIVEL;
  const a = ancorarMac(mesa, janelas);
  assert.equal(a.altura, ALTURA_MIN * mesa.h);
  macInteiroNaMesa(mesa, a);
});

test("impossível: mesmo no melhor esforço, o Mac fica à esquerda dos ícones", () => {
  const { mesa, janelas } = IMPOSSIVEL;
  macAntesDosIcones(ancorarMac(mesa, janelas), janelas.nav);
});

test("1024×768: para sair de trás dos ícones, o rosto anda para a esquerda e só encolhe o necessário", () => {
  const { mesa, janelas } = FIXTURES["1024×768, vão estreito e rosto na faixa"];
  const a = ancorarMac(mesa, janelas);
  const semIcones = ancorarMac(mesa, { ...janelas, nav: { x: mesa.w, y: 0, w: 0, h: mesa.h } });
  assert.ok(a.cx < semIcones.cx, `cx ${a.cx} não andou para a esquerda de ${semIcones.cx}`);
  assert.ok(a.altura <= semIcones.altura);
  // o centro dos olhos no x mais à direita que os ícones deixam, e os olhos
  // (com folga e balanço) ainda à direita do LEIA-ME: nesse tamanho cabe, e
  // um passo maior (÷ 0.95) já não cabia
  const U_OLHOS = (OLHOS_UV.esq.u0 + OLHOS_UV.dir.u1) / 2;
  const OLHOS_L = OLHOS_UV.dir.u1 - OLHOS_UV.esq.u0;
  const cabeAEsquerda = (altura: number) =>
    janelas.nav.x - FOLGA_OLHOS - (DIREITA_MAC - U_OLHOS) * altura -
      ((OLHOS_L * altura) / 2 + FOLGA_OLHOS + balanco(altura).x) >=
    janelas.leiame.x + janelas.leiame.w - EPS;
  assert.ok(cabeAEsquerda(a.altura), `${a.altura}`);
  assert.ok(!cabeAEsquerda(a.altura / 0.95), `${a.altura / 0.95} também cabia`);
  for (const o of Object.values(olhosEmRepouso(a))) {
    assert.ok(o.y >= janelas.render.y + janelas.render.h);
    assert.ok(o.y + o.h <= janelas.terminal.y);
  }
});

test("1512×982: os ícones estão longe e o rosto continua no meio do vão", () => {
  const { mesa, janelas } = FIXTURES["1512×982, rosto no vão"];
  const a = ancorarMac(mesa, janelas);
  const semIcones = ancorarMac(mesa, { ...janelas, nav: { x: mesa.w, y: 0, w: 0, h: mesa.h } });
  assert.deepEqual(a, semIcones);
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
