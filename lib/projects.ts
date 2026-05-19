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
  video?: string;
  highlights?: string[];
  year: string;
}

export const projects: Project[] = [
  // ─── FEATURED ───────────────────────────────────────────────
  {
    slug: "sentinel",
    name: "Sentinel",
    tagline: "Real-time 3D monitoring dashboard with sci-fi aesthetics",
    description:
      "Full-stack 3D dashboard where my GitHub repositories orbit a reactive core as satellites. Repo size maps to stars + forks, color to language, orbit speed to push recency. Custom GLSL shaders create plasma effects, holographic grids, and glitch overlays. WebSocket streams CPU/RAM/disk metrics that drive the core's pulse and color.",
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
      "Custom GLSL shaders (plasma, holographic grid, glitch)",
      "Camera fly-to with GSAP, bloom + chromatic aberration",
      "Real-time WebSocket streaming with auto-reconnect",
      "Inspired by Iron Man / Minority Report interfaces",
    ],
    year: "2026",
  },
  {
    slug: "financehub",
    name: "FinanceHub",
    tagline: "Turbo monorepo platform for financial workflows",
    description:
      "Monorepo plataforma financeira (Turbo + apps/packages) com backend Python e frontend Web. Arquitetura modular preparada para escalar features financeiras independentes. Deploy contínuo na Vercel.",
    category: "featured",
    status: "deployed",
    isPrivate: true,
    stack: ["Turbo", "Python", "Next.js", "TypeScript", "Vercel"],
    github: "https://github.com/souzxxx/financehub",
    demo: "https://financehub-web-ecru.vercel.app",
    cover: "/projects/financehub/cover.png",
    highlights: [
      "Monorepo Turbo com workspaces independentes",
      "Documentação técnica: planning, deploy, features, análise crítica",
      "Backend Python + frontend Web full-stack",
    ],
    year: "2026",
  },
  {
    slug: "universe-project",
    name: "Universe",
    tagline: "Full-stack Next.js TypeScript application",
    description:
      "Aplicação full-stack TypeScript em Next.js privada e deployada em produção. Stack moderna com App Router, otimizações de performance e tipagem estrita end-to-end.",
    category: "featured",
    status: "deployed",
    isPrivate: true,
    stack: ["Next.js", "TypeScript", "React", "Vercel"],
    github: "https://github.com/souzxxx/universe-project",
    demo: "https://universe-project-navy.vercel.app",
    cover: "/projects/universe-project/cover.png",
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
    github: "https://github.com/souzxxx/usp-fono-isa",
    demo: "https://usp-fono.vercel.app",
    cover: "/projects/usp-fono/cover.png",
    highlights: [
      "Parceria interuniversitária Insper × USP",
      "Cliente real na área de saúde / fonoaudiologia",
    ],
    year: "2026",
  },

  // ─── ML & DATA ──────────────────────────────────────────────
  {
    slug: "ml-copa",
    name: "ML-Copa",
    tagline: "FIFA World Cup prediction with XGBoost + adaptive Elo + Dixon-Coles",
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

  // ─── SYSTEMS & ARCHITECTURE ─────────────────────────────────
  {
    slug: "projeto-software",
    name: "Projeto Software — Microsserviços",
    tagline: "Sistema distribuído: Gateway (Java) + User Service (Python) + Connections (Java) + Frontend",
    description:
      "Arquitetura de microsserviços em produção acadêmica: API Gateway em Java/Spring routeando para User Service (Python/FastAPI) e Connections Service (Java). Frontend JavaScript deployado na Vercel. Demonstra design distribuído, comunicação inter-serviços e deploy contínuo.",
    category: "systems",
    status: "deployed",
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
    demo: "https://projeto-sofware-2026-1-front.vercel.app",
    cover: "/projects/projeto-software/cover.svg",
    highlights: [
      "4 serviços independentes deployados",
      "Gateway pattern com Java/Spring",
      "Python FastAPI + Java backends",
      "Frontend JS deployado na Vercel",
    ],
    year: "2026",
  },

  // ─── MORE WORK ──────────────────────────────────────────────
  {
    slug: "soli",
    name: "Soli",
    tagline: "Full-stack social/community application",
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
    tagline: "React + TypeScript + Vite Pokédex",
    description:
      "Pokédex completa em React 18 + TypeScript com Vite, consumindo PokéAPI. Foco em type safety, performance de bundle e UX responsivo.",
    category: "more",
    status: "shipped",
    stack: ["React", "TypeScript", "Vite", "PokéAPI"],
    github: "https://github.com/souzxxx/pokedex",
    year: "2026",
  },
  {
    slug: "ascii-video-player",
    name: "ASCII Video Player",
    tagline: "Reprodutor de vídeo em ASCII no terminal",
    description:
      "Player Python que converte vídeos em tempo real para ASCII art e reproduz direto no terminal. Frame interpolation para playback suave, suporte cross-platform.",
    category: "more",
    status: "shipped",
    stack: ["Python", "OpenCV", "Pillow"],
    github: "https://github.com/souzxxx/ascii-video-player",
    cover: "/projects/ascii-video-player/shot.png",
    video: "/projects/ascii-video-player/video.mp4",
    year: "2025",
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
  totalRepos: 22,
  liveDeployments: 5,
  semesters: 4,
  yearsBuilding: 3,
};
