import { GeistSans } from "geist/font/sans";
import { Instrument_Serif, Courier_Prime, Silkscreen } from "next/font/google";

/**
 * fonts — as quatro famílias do site, declaradas UMA vez para os DOIS
 * layouts-raiz.
 *
 * POR QUE ESTE ARQUIVO EXISTE. Com route group por idioma há dois
 * layouts-raiz (app/(pt)/layout.tsx e app/(en)/layout.tsx) e, portanto, dois
 * lugares que precisam do `className` das fontes no <html>. Copiar as quatro
 * chamadas de `next/font` para os dois seria criar duas verdades sobre
 * `preload`, `display` e `fallback`: a hora em que alguém ligasse `preload` na
 * typewriter para testar algo, ligaria só no português, e a diferença sairia
 * como um preload a mais no HTML de uma das línguas — invisível na tela,
 * visível no waterfall.
 *
 * Além do risco de divergir, `next/font` é resolvido por CALL SITE: cada
 * chamada nova gera o seu próprio arquivo e a sua própria classe CSS. Duas
 * chamadas de `Instrument_Serif` com a mesma configuração dariam DOIS
 * `@font-face` e dois `<link rel="preload">` para o mesmo .woff2. Importando
 * daqui, os dois layouts compartilham literalmente o mesmo objeto, e o HTML
 * de "/" e o de "/en" preloadam exatamente o mesmo arquivo.
 *
 * A configuração abaixo veio inteira do antigo app/layout.tsx, sem alteração
 * de valor — inclusive os comentários, que continuam sendo a razão medida de
 * cada `preload`.
 */

// Tres familias novas (o teto do sistema), subset latin, display swap.
// `preload` so na display: ela e a unica que participa do LCP, que continua
// sendo o <h1> de texto renderizado no servidor. `adjustFontFallback` gera as
// metricas do fallback local, matando FOUT e CLS na troca.
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
  variable: "--font-display",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  fallback: ["Times New Roman", "Times", "serif"],
});

// Mono de maquina de escrever: e o `font-mono` do site inteiro (dado real,
// comandos, rotulos de metadado).
//
// GEIST MONO SAIU DO <html>. MEDIDO no HTML de producao: ela entrava como o
// segundo dos tres `<link rel="preload" as="font">` — 71 kB no caminho critico,
// com prioridade alta, disputando banda com a Instrument Serif (15 kB) que e a
// fonte do LCP — para nao pintar UM glifo: `font-code` (o unico token que
// apontava para `--font-geist-mono`) tem zero call site em app/ e components/.
// O token `font-code` continua declarado no tailwind.config.ts, agora sobre a
// mono do sistema. Quando existir um bloco de codigo REAL, o caminho e trazer
// Geist Mono de volta aqui com `preload: false` e re-apontar o token.
const typewriter = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-typewriter",
  display: "swap",
  preload: false,
  fallback: ["Courier New", "Courier", "monospace"],
});

// Bitmap 8-bit: exclusiva do banner do footer, nada mais no site.
const bitmap = Silkscreen({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bitmap",
  display: "swap",
  preload: false,
  fallback: ["Courier New", "monospace"],
});

/**
 * O `className` do <html> nos dois layouts-raiz: só as quatro variáveis CSS,
 * na mesma ordem de sempre. Quem consome é o Tailwind (tailwind.config.ts
 * aponta `font-display`, `font-mono`, `font-bitmap` e `font-sans` para elas),
 * nunca um componente direto.
 */
export const fontVariables = `${GeistSans.variable} ${display.variable} ${typewriter.variable} ${bitmap.variable}`;
