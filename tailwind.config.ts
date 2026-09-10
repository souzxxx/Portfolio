import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    // Raios e sombras zerados na RAIZ (nao em extend): apaga de uma vez os
    // 50 `rounded-*` (40 deles `rounded-full`) e as 9 `shadow-*` do repo, sem
    // cacar classe arquivo por arquivo. `full: "0"` e deliberado — o ponto de
    // status vira quadrado, que e o desejado nesta identidade.
    borderRadius: {
      none: "0",
      sm: "0",
      DEFAULT: "0",
      md: "0",
      lg: "0",
      xl: "0",
      "2xl": "0",
      "3xl": "0",
      full: "0",
    },
    boxShadow: {
      none: "none",
      sm: "none",
      DEFAULT: "none",
      md: "none",
      lg: "none",
      xl: "none",
      "2xl": "none",
      inner: "none",
    },
    extend: {
      // ---------------------------------------------------------------------
      // DUAS COLUNAS DE COR, E UM SO ESCURO.
      //
      // O sistema anterior tinha DOIS escuros: um acento cromatico saturado
      // usado como campo inteiro e o "breu" #141414 das secoes de indice e
      // contato. O acento saiu (satura demais: em bloco chapado do tamanho de
      // uma dobra o olho cansa antes de terminar de ler), e com ele saiu tambem
      // a razao de existir do breu — dois cinzas escuros vizinhos dao 1.06:1 um
      // contra o outro, ou seja, seriam indistinguiveis como campos de cor.
      // Agora existe UM escuro — carvao #1C1A17 — e UM claro — papel creme
      // #F5F3EE. Todo bloco do site e um dos dois.
      //
      // MATRIZ DE CONTRASTE (WCAG 2.1, calculada — nao estimada)
      //
      //   cream    #F5F3EE sobre carvao    #1C1A17 = 15.66:1  texto principal sobre carvao
      //   cream600 #D8D4C8 sobre carvao    #1C1A17 = 11.72:1  secundario sobre carvao
      //   cream700 #A8A49B sobre carvao    #1C1A17 =  6.99:1  terciario sobre carvao
      //   cream    #F5F3EE sobre carvao700 #0F0E0C = 17.40:1  sobre carvao pressed
      //   carvao   #1C1A17 sobre cream     #F5F3EE = 15.66:1  texto principal sobre papel
      //   ink600   #3C3A34 sobre cream     #F5F3EE = 10.25:1  prosa secundaria sobre papel
      //   ink700   #5A5750 sobre cream     #F5F3EE =  6.50:1  rotulo mono sobre papel
      //   gold     #D4A017 sobre carvao    #1C1A17 =  7.31:1  dourado sobre carvao
      //   carvao   #1C1A17 sobre gold      #D4A017 =  7.31:1  texto do CTA dourado
      //
      // DUAS PROIBICOES ABSOLUTAS, medidas:
      //   1. gold #D4A017 sobre cream #F5F3EE = 2.14:1. O DOURADO NUNCA TOCA
      //      PAPEL — nem como texto nem como bloco (2.14 reprova tanto o 4.5:1
      //      de texto quanto o minimo 3:1 de contorno de componente da 1.4.11).
      //      O dourado e o UNICO acento cromatico do site e existe num lugar so:
      //      o CTA de curriculo, que vive sobre carvao.
      //   2. Nao existe um segundo escuro. Antes de acrescentar um cinza
      //      "quase carvao" para diferenciar duas secoes vizinhas, lembre que
      //      #1C1A17 contra #141414 da 1.06:1: a diferenca nao chega ao olho, so
      //      ao inspetor. O ritmo entre secoes se faz alternando carvao e papel
      //      (ver a partitura em app/page.tsx), nunca dois escuros encostados.
      //
      // POR QUE `ink` NAO TEM `DEFAULT`: `ink.600` e `ink.700` sao as duas
      // diluicoes do carvao usadas na prosa sobre papel. Um `ink.DEFAULT` seria
      // um SEGUNDO NOME para o mesmo #1C1A17 — e o portfolio e lido como
      // amostra de codigo, entao um token so pode ter um nome. Texto cheio
      // sobre papel e `text-carvao`.
      //
      // O carvao #1C1A17 (R28 G26 B23) nao e preto puro: os 5 pontos de
      // diferenca entre R e B deixam o campo QUENTE, o que casa com o creme do
      // papel (que tambem puxa amarelo) e tira do bloco a leitura de "fundo
      // #000 de terminal". `carvao.700` #0F0E0C e a mesma cor um degrau abaixo,
      // reservada a estado pressed — em botao escuro o hover continua sendo a
      // INVERSAO creme/carvao, nao um escurecimento.
      // ---------------------------------------------------------------------
      colors: {
        carvao: { DEFAULT: "#1C1A17", 700: "#0F0E0C" },
        cream: { DEFAULT: "#F5F3EE", 600: "#D8D4C8", 700: "#A8A49B" },
        ink: { 600: "#3C3A34", 700: "#5A5750" },
        gold: "#D4A017",
      },
      // DECISAO DE SISTEMA: `font-mono` passa a ser Courier Prime (maquina de
      // escrever), o que converte as 23 ocorrencias de `font-mono` ja
      // existentes no repo numa unica edicao, sem re-classar arquivo por
      // arquivo. NAO existe token `font-type`.
      //
      // `font-code` continua sendo o slot de CODIGO REAL, mas hoje resolve na
      // mono do sistema: enquanto ele nao tiver call site, carregar 71 kB de
      // Geist Mono no preload do documento e pagar por um glifo que nunca e
      // pintado (ver a nota em app/layout.tsx). O dia em que existir um bloco
      // de codigo, `--font-geist-mono` volta para a frente desta lista.
      fontFamily: {
        display: ["var(--font-display)", "Times New Roman", "Times", "serif"],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-typewriter)", "Courier New", "monospace"],
        code: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        bitmap: ["var(--font-bitmap)", "Courier New", "monospace"],
      },
      // Escala fluida. Pares [size, { lineHeight, letterSpacing }] para que o
      // ritmo vertical e o tracking viajem junto com o tamanho — nenhuma
      // classe `leading-*`/`tracking-*` extra no call site.
      //
      // REGRA DE DIACRITICO: `d1` (leading 0.88) e EXCLUSIVO da linha do nome,
      // que nao tem acento. Qualquer titulo que possa carregar C/A/O com til ou
      // cedilha (FORMACAO, DECISOES, SAO PAULO) usa `d2` ou `d3`, cujo leading
      // minimo e 0.95 — assim o til nao encosta na linha de cima.
      //
      // O TETO DE `d1` CAIU DE 8.5rem PARA 7rem. MEDIDO em 1440x900: com 136px
      // as duas linhas do nome comiam 239px e empurravam CTAs e numeros para
      // fora da primeira dobra. Com 112px o nome continua sendo o maior
      // elemento da pagina por larga margem (o proximo, `d2`, e 72px) e a
      // coluna esquerda devolve 42px. `d1` so tem UM call site — o <h1> do
      // hero —, entao o ajuste nao vaza para nenhum outro titulo.
      fontSize: {
        d1: ["clamp(3.5rem, 12vw, 7rem)", { lineHeight: "0.88", letterSpacing: "0.02em" }],
        d2: ["clamp(2.25rem, 6vw, 4.5rem)", { lineHeight: "0.95", letterSpacing: "0.03em" }],
        d3: ["clamp(1.5rem, 3.4vw, 2.375rem)", { lineHeight: "1.02", letterSpacing: "0.03em" }],
        wm: ["clamp(5rem, 27vw, 22rem)", { lineHeight: "0.74", letterSpacing: "-0.01em" }],
        lead: ["clamp(1.0625rem, 0.4vw + 1rem, 1.25rem)", { lineHeight: "1.55", letterSpacing: "0" }],
        body: ["clamp(1rem, 0.22vw + 0.95rem, 1.125rem)", { lineHeight: "1.62", letterSpacing: "0" }],
        selo: ["0.8125rem", { lineHeight: "1.3", letterSpacing: "0.32em" }],
        meta: ["0.75rem", { lineHeight: "1.35", letterSpacing: "0.16em" }],
        tag: ["0.6875rem", { lineHeight: "1.3", letterSpacing: "0.18em" }],
        cmd: ["0.75rem", { lineHeight: "1.5", letterSpacing: "0" }],
      },
      letterSpacing: {
        alta: "0.02em",
        meta: "0.16em",
        tag: "0.18em",
        wide: "0.32em",
      },
    },
  },
  plugins: [],
};

export default config;
