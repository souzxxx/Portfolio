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
      // MATRIZ DE CONTRASTE (WCAG 2.1, calculada — nao estimada)
      //
      //   cream    #F5F3EE sobre blue    #1620DC =  8.33:1  texto principal sobre azul
      //   cream600 #D8D4C8 sobre blue    #1620DC =  6.23:1  secundario sobre azul
      //   cream    #F5F3EE sobre blue700 #0D1596 = 12.10:1  sobre azul pressed
      //   ink      #141414 sobre cream   #F5F3EE = 16.61:1  texto principal sobre papel
      //   ink600   #3C3A34 sobre cream   #F5F3EE = 10.25:1  prosa secundaria sobre papel
      //   ink700   #5A5750 sobre cream   #F5F3EE =  6.50:1  rotulo mono sobre papel
      //   blue     #1620DC sobre cream   #F5F3EE =  8.33:1  link/rotulo azul sobre papel
      //   blue700  #0D1596 sobre cream   #F5F3EE = 12.10:1  hover de link sobre papel
      //   cream    #F5F3EE sobre ink     #141414 = 16.61:1  texto principal sobre breu
      //   cream600 #D8D4C8 sobre ink     #141414 = 12.43:1  secundario sobre breu
      //   cream700 #A8A49B sobre ink     #141414 =  7.41:1  terciario sobre breu
      //   gold     #E8B23A sobre ink     #141414 =  9.53:1  dourado sobre breu
      //   ink      #141414 sobre gold    #E8B23A =  9.53:1  texto do CTA dourado
      //
      // TRES PROIBICOES ABSOLUTAS, medidas:
      //   1. cream700 #A8A49B sobre blue = 3.71:1 → REPROVA AA. `cream.700` e
      //      EXCLUSIVO de fundo breu; sobre azul so existem cream.DEFAULT e
      //      cream.600.
      //   2. gold #E8B23A sobre cream = 1.74:1. O dourado NUNCA toca papel —
      //      nem como texto nem como bloco (1.74 tambem reprova o minimo 3:1
      //      de contorno de componente da 1.4.11). O CTA dourado vive no breu.
      //   3. blue #1620DC sobre ink #141414 = 2.00:1. NUNCA texto azul sobre
      //      breu; sobre breu o acento e o creme. E por isso que este sistema
      //      nao precisa de uma quarta cor.
      //
      // O azul de assinatura e #1620DC (R22 G32 B220): subir R/G e baixar B em
      // relacao ao RGB puro tira ~9% de luminancia e da corpo — le como tinta
      // ultramarina de gravura, nao como neon de monitor.
      // ---------------------------------------------------------------------
      colors: {
        blue: { DEFAULT: "#1620DC", 700: "#0D1596" },
        cream: { DEFAULT: "#F5F3EE", 600: "#D8D4C8", 700: "#A8A49B" },
        ink: { DEFAULT: "#141414", 600: "#3C3A34", 700: "#5A5750" },
        gold: "#E8B23A",
        // Aliases legados apontando para os novos valores: evitam que arquivo
        // ainda nao migrado fique visualmente quebrado no meio da wave.
        base: "#F5F3EE",
        surface: "#F5F3EE",
        elevated: "#F5F3EE",
        border: "#141414",
        fg: "#141414",
        muted: "#3C3A34",
        subtle: "#5A5750",
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
