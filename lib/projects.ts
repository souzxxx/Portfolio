export type ProjectStatus = "deployed" | "shipped" | "wip";

/**
 * As duas — e únicas — superfícies que renderizam projeto:
 *   "featured" → FeaturedShowcase, e SÓ se o slug estiver na constante ORDER de
 *                components/projects/FeaturedShowcase.tsx;
 *   "more"     → ProjectGrid, todos.
 *
 * O tipo é estreito de propósito: categoria que nenhum componente consome
 * (havia "ml", "systems" e "academic") faz o projeto sumir do site em silêncio,
 * sem erro de compilação. Antes de adicionar valor aqui, adicione quem renderiza.
 */
export type ProjectCategory = "featured" | "more";

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
  /** FeaturedCard mostra todos; ProjectCard, os dois primeiros. */
  highlights?: string[];
  /** Só FeaturedCard renderiza — no card do grid não cabe pergunta + resposta. */
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
    slug: "wraeclast",
    name: "Project Wraeclast",
    tagline:
      "Assistente com RAG: coleta diária em GitHub Actions, busca vetorial em Postgres com pgvector e resposta ancorada no contexto recuperado",
    description:
      "Assistente pessoal para um jogo cuja meta muda a cada patch. Uma rotina diária coleta economia, o personagem do dono e conteúdo da comunidade, resume cada documento em JSON estruturado com um LLM e grava o embedding num Postgres com pgvector. Na pergunta, a API FastAPI embeda o texto, recupera os trechos mais próximos por distância de cosseno e monta um bloco de contexto com preços, ranking de farms e perfil do personagem — o LLM responde só sobre esse bloco. Não há modelo treinado nem fine-tuning: a inteligência é o corpus curado que cresce todo dia. O site em Next.js tem as telas de hoje, farms, bancada de craft e um grafo do conhecimento coletado.",
    category: "featured",
    status: "wip",
    isPrivate: false,
    stack: [
      "Python",
      "FastAPI",
      "PostgreSQL",
      "pgvector",
      "Next.js",
      "TypeScript",
      "GitHub Actions",
      "Vercel",
    ],
    github: "https://github.com/souzxxx/project-wraeclast",
    // Sem `demo` e sem `cover`: os dois deploys do site respondem 503
    // (DEPLOYMENT_PAUSED), então não há link vivo para apontar nem tela para
    // fotografar. O card cai na capa gerada por ProjectCover — declarar um
    // caminho de imagem inexistente derrubaria o build no check-assets.
    highlights: [
      "Busca vetorial em Postgres com pgvector: embeddings de 1024 dimensões (truncagem Matryoshka para caber no índice HNSW) recuperados por distância de cosseno e filtráveis por tópico",
      "Sem fine-tuning e sem modelo próprio: o contexto do chat é montado dos trechos recuperados mais preços, farms e perfil do personagem, e o prompt manda responder só com esse contexto e avisar quando o dado faltar",
      "Coleta pesada separada da API: o cron diário roda no GitHub Actions, sem limite de tempo de execução; só as leituras e o /chat rodam como função serverless na Vercel",
      "350 testes passando localmente com pytest e CI de ruff + pytest a cada push; a meta de 80% de cobertura por módulo está registrada e datada no ROADMAP",
      "O /chat é fechado por token comparado em tempo constante com hmac.compare_digest, e falha fechado quando o token não está configurado",
    ],
    decisions: [
      {
        q: "Por que RAG e não fine-tuning?",
        a: "O conteúdo muda a cada patch do jogo. Re-treinar modelo a cada mudança custa caro e envelhece rápido; um corpus curado que ganha documentos novos todo dia fica atualizado por construção, e o LLM entra só para curar texto em JSON e responder ancorado no que foi recuperado.",
      },
      {
        q: "Por que a coleta roda no GitHub Actions e não na própria API?",
        a: "Função serverless tem teto de tempo de execução, e a coleta diária (scraping, embeddings e curadoria via LLM) não cabe nesse teto. O job de cron roda no Actions e só grava no banco; a API fica com leitura e chat, que são rápidos o bastante.",
      },
      {
        q: "Por que truncar o embedding para 1024 dimensões?",
        a: "O provedor devolve 3072 dimensões por padrão e o índice HNSW do pgvector tem limite prático abaixo disso. A truncagem Matryoshka (parâmetro dimensions na própria chamada) faz o vetor caber no índice sem trocar de provedor nem perder a busca por similaridade.",
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
      "Webhook de pagamento validado por assinatura HMAC; webhook de NF-e por token secreto próprio em comparação constant-time — ambos fail-closed",
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
    slug: "portal-construtora",
    name: "Portal interno de construtora",
    tagline:
      "Módulo de manual do proprietário num portal Next.js em produção: importação auditável de PDF, exportação em PDF/Excel e três otimizações de performance",
    description:
      "Portal em Next.js 16 e React 19 que reúne sob um login só os sistemas internos de uma construtora — atendimento pós-obra, portal do cliente, avaliação de obras, departamento pessoal e o manual do proprietário do imóvel. É projeto de equipe em repositório privado: dos 583 commits, cerca de 150 são meus, e 108 deles estão concentrados no módulo do manual do proprietário — que é o que descrevo aqui. O documento que esse módulo gera é lido pelo comprador do imóvel como parte do contrato, então a exigência não é volume de tela: é que o dado de garantia esteja certo e que o caminho da correção seja auditável.",
    category: "featured",
    status: "deployed",
    isPrivate: true,
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "Drizzle ORM",
      "PostgreSQL",
      "Tailwind",
      "Vitest",
      "Playwright",
      "Vercel",
    ],
    // Sem `github`, sem `demo` e sem `cover`: repositório privado de terceiro,
    // e o que se vê dos deploys sem login é tela de autenticação — o mesmo tipo
    // de screenshot que já foi removido do projeto-software por ler como imagem
    // quebrada. Cliente não identificado por contrato.
    highlights: [
      "Módulo do manual do proprietário: de um manual real em PDF de 197 páginas sai um catálogo estruturado com 33 fichas de sistemas construtivos, 146 garantias, 39 manutenções preventivas, 78 cuidados e 131 casos de perda de garantia",
      "O script de importação não escreve no banco: ele gera um .sql que um humano lê em diff antes de virar migração, e confere a extração por contagem estrutural em vez de conferir texto a olho",
      "Três otimizações de performance minhas no mesmo módulo: fim do N+1 (uma consulta por obra em vez de uma por unidade), logo do PDF embutido uma vez em vez de por página, e lista de fichas carregada sem baixar o texto de todas",
      "Sistema de equipe em produção: as 204 rotas de API passam por uma casca única que centraliza autenticação, papel, permissão de app e capacidade, relida do banco a cada request",
      "A suíte roda contra um Postgres real e descartável, com as migrações de verdade e uma trava explícita para nunca apontar para o banco de produção — 181 arquivos de teste em Vitest e 6 suítes de ponta a ponta em Playwright",
    ],
    decisions: [
      {
        q: "Como importar dado de garantia de um PDF sem arriscar gravar uma extração errada num documento contratual?",
        a: "O script de importação nunca grava no banco. Ele emite um .sql revisável em diff, que só vira migração depois de alguém ler; a conferência é estrutural (quantas fichas, quantas garantias, quantas preventivas), porque conferir centenas de linhas de texto no olho não é verificação, é esperança.",
      },
      {
        q: "Por que isto entra no portfólio como módulo, e não como produto inteiro?",
        a: "É projeto de equipe: a maior parte dos commits do repositório é de outro desenvolvedor. O que reivindico é o que o histórico confirma como meu — o módulo do manual do proprietário e as otimizações dele. O resto do sistema aparece como contexto, não como autoria.",
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

  // ─── MORE WORK ──────────────────────────────────────────────
  {
    slug: "projeto-software",
    name: "Projeto Software — Microsserviços",
    tagline: "Sistema distribuído: Gateway (Java) + User Service (Python) + Connections (Java) + Frontend",
    description:
      "Arquitetura de microsserviços de um projeto acadêmico: API Gateway em Java/Spring routeando para User Service (Python/FastAPI) e Connections Service (Java), com frontend JavaScript. Demonstra design distribuído, comunicação inter-serviços e pipeline de deploy.",
    category: "more",
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
    // Sem `cover` até existir um screenshot que mostre o sistema rodando.
    // O screenshot antigo (já removido do repo) era a tela de login vazia
    // (retângulo escuro com um botão "Log In"), que num card de destaque lê
    // como imagem quebrada. Até lá o card usa a capa gerada por ProjectCover,
    // que ao menos é claramente intencional.
    highlights: [
      "4 serviços independentes: gateway, user service, connections e frontend",
      "Gateway pattern com Java/Spring",
      "Python FastAPI + Java backends",
      "Comunicação inter-serviços via HTTP",
    ],
    year: "2026",
  },
  {
    slug: "ml-copa",
    name: "ML-Copa",
    tagline: "Predição de Copa do Mundo com XGBoost, Elo adaptativo e Dixon-Coles",
    description:
      "Sistema de predição de Copa do Mundo combinando 49 mil partidas internacionais históricas com ensemble XGBoost, ratings Elo adaptativos e modelos probabilísticos Poisson/Dixon-Coles. Pipeline CRISP-DM com feature engineering pré-match e probabilidades calibradas.",
    category: "more",
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
      "49.071 partidas internacionais (1872–2024)",
      "Elo rating adaptativo + Dixon-Coles",
      "Pipeline CRISP-DM completo",
      "Validação com log-loss e calibração de probabilidades",
    ],
    year: "2026",
  },
  {
    slug: "cacaos",
    name: "CacaOS",
    tagline:
      "Firmware em C++ para ESP32 com tela touch: 8 mini-apps em LVGL e simulador SDL2 para desenvolver sem a placa",
    description:
      "Firmware de aplicação em C++ para um ESP32 com display touch de 320×240, feito como presente físico: um launcher com oito mini-apps em pixel art (galeria, contador, tamagotchi, pomodoro, mood tracker e outros). Não é sistema operacional — não tem kernel nem escalonador próprio; é um loop cooperativo sobre o framework Arduino, com LVGL desenhando a interface. O detalhe de engenharia que interessa está fora dos apps: um segundo ambiente de build compila o mesmo código de UI contra SDL2 no Mac, trocando por shims só os módulos de hardware, e uma máquina de estados de WiFi pausa e retoma o rádio para conseguir escanear redes durante uma tentativa de conexão.",
    category: "more",
    status: "wip",
    isPrivate: false,
    stack: [
      "C++",
      "PlatformIO",
      "LVGL",
      "ESP32",
      "SDL2",
      "GitHub Actions",
    ],
    github: "https://github.com/souzxxx/cacaOS",
    // Sem `cover`: é firmware gravado em placa, não tem deploy para capturar, e
    // os sprites disponíveis são PNGs de ~500 bytes de pixel art — inúteis como
    // capa 16:10, além de virem de asset pack de terceiros.
    highlights: [
      "Ambiente de simulador nativo em SDL2 paralelo ao build de hardware: a UI inteira roda no Mac sem a placa, com shims só nos módulos de display, touch, SD, WiFi e sensores",
      "Máquina de estados de WiFi com pause/resume do rádio, porque iniciar scan durante uma tentativa de conexão falha em silêncio no ESP-IDF; a troca de credenciais tem rollback automático quando a rede nova não conecta",
      "Driver de touch reescrito em bit-banging para liberar o barramento SPI real ao cartão SD, que disputava os mesmos pinos",
      "CI no GitHub Actions que compila o firmware de verdade a cada push e reporta o uso de flash e RAM",
      "Pipeline próprio de assets: sprite sheet PNG convertido para o formato binário do LVGL, para reduzir uso de RAM e flash no dispositivo",
    ],
    decisions: [
      {
        q: "Como testar a UI antes de a placa chegar?",
        a: "Um segundo ambiente de build compila o mesmo código de apps e UI contra SDL2 no desktop; só display, touch, SD, WiFi e sensores são substituídos por shims. O resto roda idêntico ao que roda na placa.",
      },
      {
        q: "Por que bit-bang no touch em vez do driver SPI padrão?",
        a: "O controlador de touch e o cartão SD disputam o mesmo barramento. Reescrever o touch em bit-banging manual dos pinos devolveu o SPI real ao SD, que sem isso parava de funcionar.",
      },
    ],
    year: "2026",
  },
  {
    slug: "lp-compiler",
    name: "Compilador de linguagem própria",
    tagline:
      "Compilador em Java: lexer, parser recursivo-descendente, interpretador tree-walking e gerador de assembly NASM x86 32-bit",
    description:
      "Linguagem própria com sintaxe inspirada em Rust, implementada em Java: análise léxica, parser recursivo-descendente, AST e dois back-ends. O interpretador tree-walking cobre a linguagem inteira — variáveis tipadas com mutabilidade, funções recursivas com escopo léxico encadeado, structs com campos aninhados e if como expressão. O gerador de código emite NASM x86 de 32 bits, montado e executado dentro de um container, e cobre só o subconjunto inteiro: cada nó sem representação em assembly cru lança erro explícito em vez de fingir suporte. A gramática está formalizada em EBNF no repositório.",
    category: "more",
    status: "shipped",
    isPrivate: true,
    stack: [
      "Java",
      "Assembly x86",
      "NASM",
      "Docker",
      "Bash",
    ],
    // Sem `github` e sem `cover`: o repositório é privado (guard da wave 1 —
    // repositório privado não vira link) e os únicos assets são diagramas
    // sintáticos de 1056×4436, altos demais para servir de capa.
    highlights: [
      "Dois back-ends sobre a mesma AST: interpretador tree-walking com a linguagem completa, e gerador de NASM x86 32-bit limitado ao subconjunto inteiro, com erro explícito em cada nó não suportado",
      "Escopo léxico por cadeia de tabelas de símbolos: bloco só cria escopo filho quando é bloco explícito, preservando o escopo do chamador no corpo direto de função",
      "Pipeline de baixo nível automatizado: gerar o .asm, montar com nasm, linkar com gcc -m32 -nostartfiles e executar o binário ELF32 dentro de um container Linux",
      "Gramática formalizada em EBNF com diagrama sintático, evoluída em 38 commits com versionamento semântico",
      "Arquivos de casos cobrindo 19 cenários de erro de léxico, sintaxe e semântica — divisão por zero, reatribuição de variável imutável, tipo incompatível",
    ],
    decisions: [
      {
        q: "Por que dois back-ends em vez de um?",
        a: "O interpretador cobre a linguagem inteira, inclusive string, ponto flutuante e struct. O gerador de assembly x86 puro não tem heap nem runtime de string, então em vez de emular o que não cabe, cada nó não suportado lança erro nomeado — o limite fica explícito no código, não escondido num comportamento errado.",
      },
    ],
    year: "2026",
  },
  {
    slug: "usp-fono",
    name: "USP-Fono",
    tagline: "Parceria com a USP — plataforma para fonoaudiologia",
    description:
      "Projeto desenvolvido em parceria com a Universidade de São Paulo (USP) para área de fonoaudiologia. Aplicação real entregue a um cliente acadêmico/clínico.",
    category: "more",
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

// Único derivado exportado: quem consome "featured" é a ORDER curada de
// FeaturedShowcase.tsx, não um filtro.
export const moreProjects = projects.filter((p) => p.category === "more");

export const stats = {
  // 49.071 partidas em ml-copa/data/raw/results.csv (49.072 linhas − cabeçalho).
  // Arredondado para baixo: o hero mostra "49k", nunca um número acima do real.
  matchesProcessed: 49,
  testFiles: 218,
  domainModules: 12,
  distributedServices: 4,
};
