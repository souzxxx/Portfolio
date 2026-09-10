/**
 * hatch.glsl.ts — o shader de gravura do hero.
 *
 * A tese: a figura da direita nao e um "efeito 3D", e uma CHAPA GRAVADA. Duas
 * cores e nada entre elas — o azul do bloco (#1620DC) e o creme (#F5F3EE). O
 * volume aparece so pela DENSIDADE da hachura, como numa xilogravura, nunca
 * por um degrade de cor.
 *
 * O detalhe que faz isto ler como linha impressa, e nao como textura colada no
 * objeto: a hachura e calculada em `gl_FragCoord` — PIXELS DE TELA —, nao em
 * UV. Consequencia visivel: as linhas ficam paradas no plano da pagina
 * enquanto o objeto gira por baixo delas, exatamente como a trama de uma matriz
 * de impressao. Em UV as linhas girariam junto e o resultado leria como papel
 * de parede enrolado numa esfera.
 *
 * A paleta continua com DUAS cores: o unico lugar onde nasce um valor
 * intermediario e a borda anti-serrilhada da propria linha, com largura de ~1px
 * derivada por `fwidth`. Nao ha meio-tom de cor, so meio-tom de trama.
 */

/**
 * Vertex — normal em view space (a hachura le a luz no espaco da camera, entao
 * a trama continua ancorada na tela mesmo com o objeto girando) e um
 * deslocamento minimo ao longo da normal, que faz a silhueta respirar sem
 * deformar o desenho.
 */
export const vertex = /* glsl */ `
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vNormal = normalize(normalMatrix * normal);

    vec3 pos = position;
    pos += normal * sin(pos.y * 5.0 + uTime * 0.35) * 0.03;

    // Posicao em view space: base tanto da projecao quanto do contorno, que
    // precisa saber para onde a camera esta olhando naquele fragmento.
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vView = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

/**
 * Fragment — duas camadas de hachura em espaco de tela.
 *
 *   camada 1: passo de 9.0px, rotacionada +0.62rad, em toda a superficie;
 *   camada 2: passo de 12.0px, rotacionada -0.95rad, cruzando a primeira
 *             SO nas sombras (l < 0.42), como numa gravura de verdade, onde a
 *             contra-hachura entra apenas onde a tinta precisa fechar.
 *
 * O PASSO E MEDIDO, nao chutado: em 5px de buffer, com o dpr travado em 1.5, a
 * linha cai em 3.3px de CSS e a trama some — a 100% a esfera le como degrade e
 * so aparece como gravura quando se aproxima a lupa. Em 9px de buffer (6px de
 * CSS) a linha le como LINHA na distancia em que a pagina e vista, que e a
 * unica distancia que importa.
 *
 * As duas camadas sao calculadas SEMPRE e so depois misturadas por peso. Isso
 * nao e desperdicio: `fwidth` (derivada de tela) dentro de `if` de fluxo nao
 * uniforme e comportamento indefinido em GLSL — o gradiente e estimado no quad
 * de 2x2 fragmentos, e se metade do quad nao entrou no `if` a derivada vem
 * lixo. Calcular fora do branch e a forma correta de ter AA sem artefato de
 * borda de sombra.
 */
export const fragment = /* glsl */ `
  uniform vec3 uBlue;
  uniform vec3 uCream;

  varying vec3 vNormal;
  varying vec3 vView;

  mat2 rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
  }

  void main() {
    // Luz fixa vinda de cima-direita-frente. Nao e uma luz da cena: e a
    // convencao de iluminacao de uma gravura, decidida uma vez e congelada.
    float l = clamp(dot(normalize(vNormal), normalize(vec3(0.42, 0.78, 0.55))), 0.0, 1.0);

    // Densidade de tinta, COMPRIMIDA para 0.14-0.86. Este intervalo e a
    // diferenca entre gravura e degrade: no cru (0-1) a area clara fica azul
    // chapado — e como o azul do objeto e o MESMO do bloco, meia esfera
    // simplesmente desaparece — e a escura vira creme macico, sem trama. Preso
    // entre 0.14 e 0.86 nao existe um so fragmento sem linha: a esfera inteira
    // e hachura, e o que muda de um polo ao outro e a espessura do traco.
    float tone = mix(0.14, 0.86, smoothstep(0.06, 0.94, 1.0 - l));

    // Contorno. Numa gravura de verdade a trama fecha na virada da forma, e e
    // isso que faz um volume ter borda sem precisar de uma linha de contorno
    // desenhada. rim mede o quanto a normal foge da camera; perto da silhueta
    // o traco engrossa e a esfera ganha aresta contra o azul do bloco.
    float rim = 1.0 - abs(dot(normalize(vNormal), normalize(-vView)));
    tone = max(tone, smoothstep(0.62, 1.0, rim) * 0.78);

    // Onda triangular: continua nas bordas do fract, entao fwidth() se comporta
    // e a AA nao pisca na virada de periodo.
    vec2 p1 = rot(0.62) * gl_FragCoord.xy;
    float line1 = abs(fract(p1.x / 9.0) - 0.5) * 2.0;
    float w1 = fwidth(line1) * 0.9;
    float ink = 1.0 - smoothstep(-w1, w1, line1 - tone);

    vec2 p2 = rot(-0.95) * gl_FragCoord.xy;
    float line2 = abs(fract(p2.x / 12.0) - 0.5) * 2.0;
    float w2 = fwidth(line2) * 0.9;
    float ink2 = 1.0 - smoothstep(-w2, w2, line2 - tone);

    // Entrada da contra-hachura: rampa curta em vez de corte seco em 0.42, para
    // a segunda trama nascer sem desenhar uma fronteira visivel na superficie.
    float crossed = 1.0 - smoothstep(0.30, 0.46, l);
    ink = max(ink, ink2 * crossed);

    gl_FragColor = vec4(mix(uBlue, uCream, ink), 1.0);
  }
`;
