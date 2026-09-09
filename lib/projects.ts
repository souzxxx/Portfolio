export type ProjectStatus = "deployed" | "shipped" | "wip";
export type ProjectCategory = "featured" | "ml" | "systems" | "more" | "academic";

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  isPrivate?: boolean;
  stack: string[];
  github?: string;
  demo?: string;
  cover?: string;
  gallery?: { src: string; label: string }[];
  video?: string;
  highlights?: string[];
  decisions?: { q: string; a: string }[];
  writeup?: string;
  year: string;
}

export const projects: Project[] = [
  // ─── FEATURED ───────────────────────────────────────────────
  {
    slug: "financehub",
    name: "FinanceHub",
    tagline: "Plataforma financeira pessoal end-to-end com IA — produto real em produção",
    description:
      "Aplicação financeira completa com autenticação Supabase, dashboard de saldo/projeção, gestão de transações, orçamento por categoria, recorrências, importação/exportação e assistente IA conversacional (Luna). Monorepo Turbo com backend Python e frontend Next.js, deploy contínuo na Vercel. Os screenshots ao lado são da plataforma autenticada em produção.",
    category: "featured",
    status: "deployed",
    isPrivate: true,
    stack: [
      "Next.js",
      "TypeScript",
      "Python",
      "Turbo",
      "Supabase",
      "PostgreSQL",
      "Groq",
      "Llama 3.3",
      "Vercel",
    ],
    demo: "https://financehub-web-ecru.vercel.app",
    cover: "/projects/financehub/dashboard.png",
    gallery: [
      { src: "/projects/financehub/dashboard.png", label: "Dashboard — saldo, projeção e resumo da semana" },
      { src: "/projects/financehub/luna-ai.png", label: "Luna — assistente IA financeira conversacional" },
      { src: "/projects/financehub/investments.png", label: "Investimentos — patrimônio total e metas" },
      { src: "/projects/financehub/mobile.png", label: "Experiência mobile responsiva" },
    ],
    highlights: [
      "Luna: contexto montado a partir das transações, categorias e orçamentos do próprio usuário autenticado, por consulta parametrizada filtrada por user_id",
      "LLM via SDK da OpenAI apontado para a Groq (Llama 3.3 70B), teto de 500 tokens de saída e histórico truncado nas últimas 10 mensagens",
      "Rate limit por rota com slowapi: 30 req/h no chat, 10/h nos insights, 5/h no relatório mensal",
      "Row Level Security no Postgres nas tabelas do digest da Luna, sobre auth Supabase",
      "Monorepo Turbo: API FastAPI + front Next.js, deploy contínuo na Vercel",
    ],
    decisions: [
      {
        q: "Por que Groq e não OpenAI direto?",
        a: "O SDK é o mesmo; só muda a base_url. Llama 3.3 70B na Groq entrega latência muito menor por um custo que cabe num projeto pessoal, e a troca de provedor é uma linha de configuração se o trade-off mudar.",
      },
      {
        q: "Por que truncar o histórico em 10 mensagens?",
        a: "O contexto financeiro do mês já ocupa o system prompt. Sem teto, uma conversa longa empurra o custo por request para cima e derruba a qualidade da resposta — 10 mensagens cobre a continuidade real de um chat de finanças.",
      },
    ],
    year: "2026",
  },
  {
    slug: "commerce-nda",
    name: "E-commerce transacional (sob NDA)",
    tagline:
      "E-commerce transacional em Spring Boot: outbox com retry exponencial, idempotência de webhook e rate limit em Redis com circuit breaker",
    description:
      "Loja própria de uma marca brasileira — nome sob contrato — em monolito modular Java 21 / Spring Boot 4.1 com storefront Next.js. O sistema move dinheiro de verdade, então a engenharia é quase toda sobre o caminho infeliz: webhook de pagamento validado por assinatura e deduplicado por tabela de webhooks processados; e-mails transacionais em outbox, com claim numa transação curta e envio fora de lock; retentativa com backoff exponencial e chave de idempotência no provedor; rate limit por chave em Redis via script Lua atômico que falha aberto quando o Redis cai. 12 módulos de domínio, migrações Flyway e testes de integração com Testcontainers em Postgres e Redis reais.",
    category: "featured",
    status: "wip",
    isPrivate: true,
    stack: [
      "Java 21",
      "Spring Boot",
      "PostgreSQL",
      "Redis",
      "Next.js",
      "TypeScript",
      "Testcontainers",
      "Flyway",
      "Docker",
    ],
    highlights: [
      "Outbox transacional: claim em transação curta, envio sem segurar lock, backoff exponencial de 30s dobrando até o teto de 1h com jitter",
      "Idempotência ponta a ponta: webhook processado uma única vez, Idempotency-Key no provedor de e-mail",
      "Rate limit por chave em Redis com script Lua atômico, que falha aberto e tem circuit breaker com sonda em half-open",
      "Webhooks de pagamento e de NF-e validados por assinatura",
      "12 módulos de domínio, Flyway e testes de integração com Testcontainers (Postgres + Redis reais)",
    ],
    decisions: [
      {
        q: "Por que outbox e não chamar o provedor de e-mail dentro da transação?",
        a: "Chamada HTTP dentro de transação segura conexão do pool enquanto espera a rede. O outbox quebra em três passos: transação curta que faz o claim, envio sem lock nenhum, transação curta que grava o resultado. A Idempotency-Key é o id da linha, então reenvio depois de crash é no-op.",
      },
      {
        q: "Por que o rate limiter falha ABERTO?",
        a: "Se o Redis cair, bloquear todo mundo derruba o checkout — o custo de deixar passar tráfego por alguns minutos é menor que o de parar de vender. Ele loga ERROR para alertar, e o circuit breaker evita que cada request pague o timeout de conexão enquanto o Redis está fora.",
      },
      {
        q: "Por que monolito modular e não microsserviços?",
        a: "Build solo, ~100 pedidos/mês. Microsserviço aqui compraria latência de rede e complexidade de deploy sem resolver nenhum problema que eu tenha. Os módulos têm fronteira clara para o dia em que valer a pena separar.",
      },
    ],
    year: "2026",
  },
  {
    slug: "sentinel",
    name: "Sentinel",
    tagline:
      "Monitoramento em tempo real: métricas do backend FastAPI transmitidas por WebSocket e renderizadas em 3D",
    description:
      "Dashboard 3D full-stack em que os repositórios do meu GitHub orbitam um núcleo reativo como satélites. O tamanho do repositório mapeia stars + forks, a cor mapeia a linguagem e a velocidade da órbita mapeia o push mais recente. Shaders GLSL próprios desenham plasma, grids holográficos e camadas de glitch. O backend FastAPI transmite métricas de CPU, RAM e disco por WebSocket, e são elas que dirigem o pulso e a cor do núcleo.",
    category: "featured",
    status: "deployed",
    stack: [
      "Next.js 16",
      "Three.js",
      "React Three Fiber",
      "GLSL",
      "FastAPI",
      "WebSocket",
      "TypeScript",
      "Docker",
    ],
    github: "https://github.com/souzxxx/sentinel",
    demo: "https://sentinel-mu-navy.vercel.app",
    cover: "/projects/sentinel/cover.png",
    highlights: [
      "Streaming de métricas por WebSocket com reconexão automática e limite de tentativas",
      "Shaders GLSL próprios (plasma, grid holográfico, glitch)",
      "Câmera fly-to com GSAP, bloom e aberração cromática",
      "Backend FastAPI empurra métricas de CPU/RAM/disco que dirigem a cena",
    ],
    year: "2026",
  },
  {
    slug: "usp-fono",
    name: "USP-Fono",
    tagline: "Parceria com a USP — plataforma para fonoaudiologia",
    description:
      "Projeto desenvolvido em parceria com a Universidade de São Paulo (USP) para área de fonoaudiologia. Aplicação real entregue a um cliente acadêmico/clínico.",
    category: "featured",
    status: "deployed",
    isPrivate: true,
    stack: ["JavaScript", "React", "Vite", "Vercel"],
    demo: "https://usp-fono.vercel.app",
    cover: "/projects/usp-fono/cover.png",
    highlights: [
      "Parceria interuniversitária Insper × USP",
      "Cliente real na área de saúde / fonoaudiologia",
    ],
    year: "2026",
  },
  {
    slug: "projeto-software",
    name: "Projeto Software — Microsserviços",
    tagline: "Sistema distribuído: Gateway (Java) + User Service (Python) + Connections (Java) + Frontend",
    description:
      "Arquitetura de microsserviços de um projeto acadêmico: API Gateway em Java/Spring routeando para User Service (Python/FastAPI) e Connections Service (Java), com frontend JavaScript. Demonstra design distribuído, comunicação inter-serviços e pipeline de deploy.",
    category: "featured",
    status: "shipped",
    stack: [
      "Java",
      "Spring",
      "Python",
      "FastAPI",
      "JavaScript",
      "Docker",
      "Vercel",
    ],
    github: "https://github.com/souzxxx/projeto-software-gateway",
    cover: "/projects/projeto-software/cover.png",
    highlights: [
      "4 serviços independentes: gateway, user service, connections e frontend",
      "Gateway pattern com Java/Spring",
      "Python FastAPI + Java backends",
      "Comunicação inter-serviços via HTTP",
    ],
    year: "2026",
  },

  // ─── ML & DATA ──────────────────────────────────────────────
  {
    slug: "ml-copa",
    name: "ML-Copa",
    tagline: "Predição de Copa do Mundo com XGBoost, Elo adaptativo e Dixon-Coles",
    description:
      "Sistema de predição de Copa do Mundo combinando +50.000 partidas internacionais históricas com ensemble XGBoost, ratings Elo adaptativos e modelos probabilísticos Poisson/Dixon-Coles. Pipeline CRISP-DM com feature engineering pré-match e probabilidades calibradas.",
    category: "ml",
    status: "shipped",
    stack: [
      "Python",
      "XGBoost",
      "Pandas",
      "Scikit-Learn",
      "penaltyblog",
      "Sportmonks API",
    ],
    github: "https://github.com/souzxxx/ml-copa",
    cover: "/projects/ml-copa/feature_importance.png",
    highlights: [
      "+50.000 partidas internacionais (1872–2024)",
      "Elo rating adaptativo + Dixon-Coles",
      "Pipeline CRISP-DM completo",
      "Validação com log-loss e calibração de probabilidades",
    ],
    year: "2026",
  },

  // ─── MORE WORK ──────────────────────────────────────────────
  {
    slug: "universe-project",
    name: "Universe",
    tagline: "Aplicação full-stack Next.js + TypeScript (privada)",
    description:
      "Aplicação full-stack TypeScript em Next.js, de repositório privado. Stack moderna com App Router, otimizações de performance e tipagem estrita end-to-end.",
    category: "more",
    status: "shipped",
    isPrivate: true,
    stack: ["Next.js", "TypeScript", "React", "Vercel"],
    cover: "/projects/universe-project/cover.png",
    year: "2026",
  },
  {
    slug: "soli",
    name: "Soli",
    tagline: "Aplicação social full-stack (JS + Python)",
    description:
      "Aplicação full-stack com frontend e backend separados (JS + Python). Implementação completa com arquitetura cliente-servidor.",
    category: "more",
    status: "shipped",
    stack: ["JavaScript", "Python", "REST API"],
    github: "https://github.com/souzxxx/soli-frontend",
    year: "2025",
  },
  {
    slug: "delivery-tracker",
    name: "Delivery Tracker",
    tagline: "Rastreamento de entregas em tempo real",
    description:
      "Sistema de tracking de entregas full-stack com backend Python e frontend JavaScript. Implementação de comunicação cliente-servidor para visualização de status em tempo real.",
    category: "more",
    status: "shipped",
    stack: ["Python", "JavaScript", "REST API"],
    github: "https://github.com/souzxxx/delivery-tracker-frontend",
    year: "2025",
  },
  {
    slug: "pokedex",
    name: "Pokédex",
    tagline: "Pokédex em React + TypeScript + Vite",
    description:
      "Pokédex completa em React 18 + TypeScript com Vite, consumindo PokéAPI. Foco em type safety, performance de bundle e UX responsivo.",
    category: "more",
    status: "shipped",
    stack: ["React", "TypeScript", "Vite", "PokéAPI"],
    github: "https://github.com/souzxxx/pokedex",
    year: "2026",
  },
  {
    slug: "rfq-automation",
    name: "RFQ Automation",
    tagline: "Automação de Request-For-Quote",
    description:
      "Sistema de automação de processos de Request-For-Quote (RFQ) — pipeline para receber, classificar e responder cotações automaticamente.",
    category: "more",
    status: "shipped",
    stack: ["Python", "Automation"],
    year: "2024",
  },
  {
    slug: "md-project",
    name: "MD-Project",
    tagline: "Matemática Discreta em Prolog",
    description:
      "Projeto acadêmico de matemática discreta implementado em Prolog — paradigma de programação lógica. Demonstra fluência além das linguagens imperativas mais comuns.",
    category: "more",
    status: "shipped",
    stack: ["Prolog", "Logic Programming"],
    github: "https://github.com/souzxxx/MD-Project",
    year: "2026",
  },
  {
    slug: "sistemas-hw",
    name: "Sistemas Hardware/Software",
    tagline: "Projetos de baixo nível e arquitetura de computadores",
    description:
      "Conjunto de projetos da disciplina de Sistemas de Hardware/Software do BCC: arquitetura, processadores, programação de baixo nível.",
    category: "more",
    status: "shipped",
    stack: ["C", "Assembly", "Computer Architecture"],
    github: "https://github.com/souzxxx/SistemasHardwareSoftwareBCC",
    year: "2026",
  },
  {
    slug: "pokemon-showdown",
    name: "Pokémon Showdown PS",
    tagline: "Sistema inspirado em Pokémon Showdown",
    description:
      "Projeto temático de batalhas/sistema inspirado no Pokémon Showdown, exercitando lógica de jogo e estruturas de dados.",
    category: "more",
    status: "shipped",
    stack: ["HTML", "JavaScript"],
    github: "https://github.com/souzxxx/pokemon-showdown-ps",
    year: "2026",
  },
  {
    slug: "projeto-calculo",
    name: "Projeto Cálculo",
    tagline: "Aplicação computacional de cálculo",
    description:
      "Projeto da disciplina de Cálculo aplicando ferramentas computacionais Python para resolver e visualizar problemas matemáticos.",
    category: "more",
    status: "shipped",
    stack: ["Python", "Math"],
    github: "https://github.com/souzxxx/projeto-calculo",
    year: "2025",
  },
];

export const featuredProjects = projects.filter((p) => p.category === "featured");
export const mlProjects = projects.filter((p) => p.category === "ml");
export const systemsProjects = projects.filter((p) => p.category === "systems");
export const moreProjects = projects.filter((p) => p.category === "more");

export const stats = {
  matchesProcessed: 50,
  testFiles: 218,
  domainModules: 12,
  distributedServices: 4,
};
