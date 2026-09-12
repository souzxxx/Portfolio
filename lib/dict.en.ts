import type { Dict } from "./dict";

/**
 * en — o texto do site em ingles, a lingua da rota "/en".
 *
 * ESCRITO, NAO TRADUZIDO. O leitor alvo e um engenheiro ou recrutador tecnico
 * lendo em ingles; a frase precisa soar escrita em ingles, e nao decalcada do
 * portugues. Por isso alguns trechos nao batem palavra a palavra com lib/dict.pt.ts
 * — "retry exponencial" vira "exponential backoff", "no ar" vira "live",
 * "entregue" vira "shipped" — mas NENHUM fato muda: numero, percentual, data,
 * nome de tecnologia e afirmacao de autoria viajam identicos. Nao ha numeral
 * formatado aqui para reconverter: os numeros medidos moram em lib/projects.ts
 * e a numeracao das secoes (#02–#06) e a mesma nas duas linguas.
 *
 * NOME PROPRIO NAO TRADUZ: Insper, Leonardo Souza, Sao Paulo, pgvector, Redis,
 * Next.js, TypeScript, Three.js, GLSL, Postgres, Prolog, Python, Vercel.
 *
 * ONDE A ENFASE CAI. `hero.prosa` tem quatro enfases e `sobre.prosa` tem tres,
 * iguais as do portugues — mesmas IDEIAS enfatizadas, mesma QUANTIDADE —, mas o
 * corte nao cai na mesma virgula: em ingles "vector search with pgvector" e um
 * sintagma so, e "I'd rather measure than assume" agrupa o verbo e o objeto que
 * o portugues separa. A pontuacao continua morando nos trechos SEM enfase, entao
 * concatenar a lista devolve o paragrafo corrido, com os espacos no lugar.
 *
 * CAIXA ALTA MORA AQUI pelo mesmo motivo do portugues: BUILD, STATUS: LIVE,
 * STACK:, REPO: PRIVATE e SINCE 2026 sao vocabulario do site, nao estilo — em
 * caixa alta na fonte eles sobrevivem ao copy/paste, ao leitor de tela e a
 * qualquer lugar que nao carregue o CSS.
 */
export const en: Dict = {
  meta: {
    title: "Leonardo Souza — Backend, Web & AI",
    description:
      "Backend, web, and applied AI in production: an LLM assistant over the user's data, vector search in Postgres with pgvector, an outbox queue with retries and idempotency, rate limiting in Redis with a circuit breaker, and a Next.js front-end in a system with real users. Computer Science at Insper, São Paulo.",
    shortDescription:
      "Backend, web, and applied AI in production. Computer Science at Insper, São Paulo.",
    jobTitle: "Software engineer — backend, web, and AI",
    // "Resume" e a palavra que o leitor americano espera; a rota e o arquivo
    // continuam /cv e leonardo-souza-cv-en.pdf, e o rotulo da barra de comando
    // continua "CV" porque nomeia o endereco, nao o documento.
    cvTitle: "Leonardo Souza — Resume",
    cvDescription:
      "One-page resume: backend, web, and applied AI in production. Computer Science at Insper, São Paulo.",
    // Ver a nota do português: a linha é composta em satori, que não reflui.
    ogSelo: "Portfolio · São Paulo, BR · 2026",
    ogStack:
      "Java · Spring Boot · Node.js · Python · TypeScript · Next.js · AI in production",
    ogAlt: "Leonardo Souza — Backend, Web & AI",
  },

  nav: {
    principal: "Main",
    atalhos: "Shortcuts",
    // Os href sao ancoras da propria pagina e NAO mudam de idioma: "/en"
    // renderiza as mesmas secoes com os mesmos id. So o label e bilingue.
    links: [
      { href: "#projects", label: "Projects" },
      { href: "#academic", label: "Education" },
      { href: "#stack", label: "Stack" },
      { href: "#about", label: "Contact" },
    ],
    contatoCurto: "Contact ↗",
    voltarAoTopo: "Back to top",
    idioma: "Language",
    // Escrito na lingua da pagina ATUAL (ingles) nomeando o idioma de DESTINO
    // (portugues): este e o aria-label do link que leva de "/en" para "/".
    trocarIdioma: "View in Portuguese",
    idiomaAtual: "English (current language)",
  },

  hero: {
    selo: ["SÃO PAULO, BR", "AVAILABLE FOR WORK", "BACKEND, WEB & AI"],
    // Quebra decidida, nunca herdada do wrap: sao dois <span class="block">.
    nome: ["Leonardo", "Souza"],
    subtitulo: "Backend, Web & AI",
    formacao: ["COMPUTER SCIENCE", "INSPER", "FIFTH SEMESTER", "SÃO PAULO"],
    // Quatro enfases, na mesma ordem do portugues: o assistente, a busca
    // vetorial, a outbox e o front-end. A pontuacao viaja nos trechos SEM
    // enfase — a virgula depois do assistente, o ", and " antes do front-end, o
    // ponto final —, entao concatenar devolve o paragrafo inteiro. Quem editar
    // aqui edita a pontuacao junto; nao existe separador implicito.
    prosa: [
      "I build backend, web, and AI that run in production: ",
      { em: "an LLM assistant over the user's own data" },
      ", ",
      { em: "vector search with pgvector" },
      " for answers grounded in the retrieved context, ",
      { em: "an outbox with exponential backoff and idempotency" },
      // Virgula serial antes do ultimo item da lista: sem ela, o " and " do
      // ingles encostaria no "and idempotency" que fecha o trecho anterior e a
      // frase tropecaria em dois "and" seguidos. O portugues nao tem o problema
      // porque o item anterior termina em "idempotência" e o " e " solto la
      // ainda le como conjuncao de lista.
      ", and ",
      { em: "a Next.js front-end in a system with real users" },
      ". Three.js and GLSL come in when the problem is visualization — not before.",
    ],
    cta: {
      projetos: "View projects ↓",
      github: "GitHub ↗",
      linkedin: "LinkedIn ↗",
      email: "Email ↗",
      curriculo: "Resume ↓",
    },
    // Os rotulos ficam aqui; os NUMEROS continuam em lib/projects.ts (`stats`),
    // que e onde eles sao medidos. Um numero nao tem idioma.
    stats: {
      partidas: "matches in the ML pipeline",
      testes: "test files",
      modulos: "domain modules",
      servicos: "distributed services",
    },
    terminal: {
      rotulo: "CV",
      copiar: "COPY",
      copiado: "COPIED",
    },
  },

  secoes: {
    destaques: {
      eyebrow: "#02 · SELECTED WORK",
      title: "Selected projects",
      description:
        "A selection of what holds up in a technical conversation: an AI product in production, vector search with pgvector, transactional e-commerce with an outbox and idempotency, and web with real users. The external links in this section are checked automatically every week.",
    },
    indice: {
      eyebrow: "#03 · INDEX",
      title: "More projects",
      description:
        "What I built exploring languages, paradigms, and domains — from Prolog to Python, from a compiler to embedded firmware, from games to process automation.",
    },
    academico: {
      eyebrow: "#04 · EDUCATION",
      // <SectionHeader> renderiza o titulo em CAIXA ALTA, e e isso que derruba
      // as formas curtas: "B.S. CS" deixa dois pontos finais no meio de uma
      // linha toda maiuscula, e "B.S. in CS" sairia "B.S. IN CS", com a
      // preposicao lendo como sigla. Por extenso a linha sobrevive a caixa
      // alta; o grau ("B.S. in Computer Science") continua na description logo
      // abaixo, que e onde o portugues tambem expande a sigla BCC.
      title: "Insper · Computer Science",
      description:
        "B.S. in Computer Science. Five semesters, from discrete math to distributed systems, applied AI, large-scale data, and low-level architecture.",
    },
    stack: {
      eyebrow: "#05 · TOOLING",
      title: "Technologies I use",
      // A descricao anuncia a ORDEM das colunas da tabela logo abaixo
      // (languages → front-end → back-end → ML → infra), que e o que o leitor
      // vai encontrar. Nenhuma promessa que a tabela nao prove.
      description:
        "Languages, front-end, back-end, ML, and infra — from what I write to where it runs.",
    },
  },

  card: {
    // Rotulos de metadado que o componente concatena com o dado: `BUILD 001`,
    // `YEAR 2026`, `DECISION 02`, `STACK: …`. Os dois-pontos fazem parte do
    // rotulo, como em `STATUS:` e `REPO:`.
    build: "BUILD",
    ano: "YEAR",
    repoPrivado: "REPO: PRIVATE",
    repositorioPrivado: "PRIVATE REPOSITORY",
    decisao: "DECISION",
    stack: "STACK:",
    verNoAr: "VIEW LIVE ↗",
    codigo: "CODE ↗",
    arquitetura: "ARCHITECTURE & DECISIONS ↗",
    capturaDeTela: "screenshot",
  },

  lupa: {
    // Mesma regra do portugues: uma palavra em caixa alta ao lado da legenda,
    // no dialeto de metadado da chapa. Sem seta — ↗ e ↓ ja significam "sai do
    // site" e "baixa arquivo", e ampliar nao faz nenhum dos dois.
    ampliar: "EXPAND",
    // Prefixo: o componente completa com a legenda da chapa, que ja chega
    // bilingue de `gallery[].label` em lib/projects.ts — em /en a frase sai
    // "Expand: Luna — conversational AI finance assistant".
    ampliarAria: "Expand:",
    titulo: "Expanded image",
    fechar: "Close",
    anterior: "Previous image",
    proxima: "Next image",
    // O contador aparece como "02 / 04" na tela; em aria a barra vira palavra,
    // porque leitor de tela le "/" como "barra" ou simplesmente pula.
    de: "of",
  },

  status: {
    deployed: "LIVE",
    shipped: "SHIPPED",
    wip: "IN PROGRESS",
    prefixo: "STATUS:",
  },

  categorias: {
    language: "LANGUAGES",
    frontend: "FRONT-END",
    backend: "BACK-END",
    ml: "ML",
    infra: "INFRA",
  },

  sobre: {
    selo: ["#06 · CONTACT", "SÃO PAULO, BR", "SINCE 2026"],
    titulo: "Let's build something that holds up in production.",
    // Tres enfases: o nome, a instituicao e a unica frase de metodo do
    // paragrafo. Em ingles o metodo cabe em um sintagma so ("measure than
    // assume"), onde o portugues separa o verbo do objeto.
    prosa: [
      "I'm ",
      { em: "Leonardo Souza" },
      ", a Computer Science student at ",
      { em: "Insper" },
      " (fifth semester), in São Paulo. I work on all three fronts: backend, web, and applied AI. On the backend, an outbox queue with exponential backoff and an idempotency key, rate limiting in Redis with a circuit breaker that fails open, and payment webhooks validated by signature. On the web, a Next.js and TypeScript front-end in a system with real users — including a module that generates a document the end client reads as part of the contract. In AI, an LLM assistant over the authenticated user's data and vector search in Postgres with pgvector, where the answer is grounded in what was retrieved, no fine-tuning. I'd rather ",
      { em: "measure than assume" },
      " — and I'd rather have a system that defends itself than one that only works on the happy path.",
    ],
    // Rotulo da linha; o VALOR (o endereco, o usuario do GitHub) e o mesmo nos
    // dois idiomas e por isso continua no componente.
    contatos: {
      email: "Email",
      github: "GitHub",
      linkedin: "LinkedIn",
    },
    cta: "Download resume ↓",
  },

  rodape: {
    email: "Email",
    tecnica: [
      "Next.js 14 (App Router)",
      "typed content in lib/",
      "deployed on Vercel",
      "São Paulo",
    ],
  },
};
