import { pick, type I18n, type Lang } from "./i18n";

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

/**
 * O projeto CRU: uma estrutura só, com os campos de prosa bilíngues.
 *
 * O que é `I18n` é o que uma pessoa lê como frase — tagline, descrição, bullet,
 * pergunta e resposta de decisão, legenda de chapa. O que NÃO é: `slug`,
 * `stack`, `github`, `demo`, `cover`, `video`, `writeup`, `year`, `status` e
 * `category`. Nome de tecnologia é o mesmo nos dois idiomas, e duplicá-lo
 * criaria um lugar onde as duas línguas podem discordar sobre como a coisa se
 * chama — ou, pior, sobre qual arquivo é a capa.
 *
 * `name` É `I18n`, e é o único campo aqui que às vezes tem os dois lados
 * iguais. Metade dos cards se chama por nome próprio (FinanceHub, Sentinel,
 * CacaOS, PredictFlow) e aí `pt` e `en` saem idênticos de propósito; a outra
 * metade se chama por DESCRIÇÃO em português ("Gestão de núcleos CCA",
 * "Compilador de linguagem própria"), e descrição é prosa: sem traduzir, o card
 * de /en apareceria com título em português e tagline em inglês logo abaixo.
 * É a mesma regra que lib/academic.ts já aplica ao `name` de cada highlight —
 * nome próprio sai igual, nome de disciplina traduz pelo sentido.
 */
export interface Project {
  slug: string;
  name: I18n;
  tagline: I18n;
  description: I18n;
  category: ProjectCategory;
  status: ProjectStatus;
  isPrivate?: boolean;
  stack: string[];
  github?: string;
  demo?: string;
  cover?: string;
  gallery?: { src: string; label: I18n }[];
  video?: string;
  /** FeaturedCard mostra todos; ProjectCard, os dois primeiros. */
  highlights?: I18n[];
  /** Só FeaturedCard renderiza — no card do grid não cabe pergunta + resposta. */
  decisions?: { q: I18n; a: I18n }[];
  writeup?: string;
  /**
   * O papel do dono no projeto, quando ele é verificável — a página de case
   * mostra como PAPEL na faixa de metadados. Ausente quando não há o que
   * afirmar além de "fiz", e aí a faixa simplesmente não tem a célula.
   */
  role?: I18n;
  year: string;
}

export const projects: Project[] = [
  // ─── FEATURED ───────────────────────────────────────────────
  {
    // Os números deste card saem do histórico do repositório (git shortlog
    // -sne --all: 101 dos 125 commits) e do código da branch mais recente, não
    // de memória. Projeto de equipe na IOTech: a frase diz "desenvolvedor
    // principal", nunca "sozinho".
    slug: "tecna-site",
    role: {
      pt: "Desenvolvedor principal · equipe IOTech",
      en: "Principal developer · IOTech team",
    },
    name: {
      pt: "TECNA — site comercial",
      en: "TECNA — commercial website",
    },
    tagline: {
      pt: "Site bilíngue de uma construtora de Brasília/DF em Next 16: conteúdo vindo do CMS do Portal no build, rebuild a cada publicação e tradução por LLM revisada por gente",
      en: "Bilingual website for a Brasília/DF builder on Next 16: content pulled from the Portal's CMS at build time, a rebuild on every publish, and LLM translation reviewed by a person",
    },
    description: {
      pt: "Novo site comercial da TECNA, construtora de alto padrão de Brasília/DF, feito pela IOTech: um HUB com as quatro unidades de negócio — TECNA Construtora, TECNA Home, TECNA Engenharia e Imóveis TECNA —, um subsite por unidade com página de obra, Quem Somos, blog, investidor e contato, em português e inglês. É projeto de equipe, e sou o desenvolvedor principal: 101 dos 125 commits do repositório são meus. Todo texto, obra e post é editado num CMS dentro do Portal TECNA; o site lê esse conteúdo no build, se reconstrói por Deploy Hook a cada publicação e, se o CMS não tiver um campo, cai no conteúdo local empacotado em vez de quebrar a página.",
      en: "TECNA's new commercial website — a high-end builder in Brasília/DF — built through IOTech: a HUB with the four business units — TECNA Construtora, TECNA Home, TECNA Engenharia and Imóveis TECNA —, one sub-site per unit with project pages, About, blog, investor and contact pages, in Portuguese and English. It is a team project, and I am the principal developer: 101 of the repository's 125 commits are mine. Every text, project and post is edited in a CMS inside the TECNA Portal; the site reads that content at build time, rebuilds through a Deploy Hook on every publish and, when the CMS is missing a field, falls back to bundled local content instead of breaking the page.",
    },
    category: "featured",
    status: "deployed",
    isPrivate: true,
    stack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Tailwind CSS 4",
      "Server Actions",
      "Anthropic SDK",
      "Playwright",
      "axe-core",
      "Vercel",
    ],
    // Sem `github`: repositório privado da IOTech. O `demo` é o deploy da
    // Vercel — o domínio da TECNA ainda aponta para o WordPress antigo.
    demo: "https://tecna-landingpage.vercel.app",
    cover: "/projects/tecna/cover.webp",
    gallery: [
      {
        src: "/projects/tecna/cover.webp",
        label: {
          pt: "HUB — as quatro unidades; o card em foco sai nítido, os outros desfocados",
          en: "HUB — the four business units; the focused card goes sharp, the rest stay blurred",
        },
      },
      {
        src: "/projects/tecna/construtora.webp",
        label: {
          pt: "Subsite da TECNA Construtora",
          en: "TECNA Construtora sub-site",
        },
      },
      {
        src: "/projects/tecna/imoveis.webp",
        label: {
          pt: "Subsite Imóveis TECNA — lançamentos residenciais",
          en: "Imóveis TECNA sub-site — residential launches",
        },
      },
      {
        src: "/projects/tecna/hub.webp",
        label: {
          pt: "HUB em repouso, sem nenhum card em foco",
          en: "HUB at rest, with no card in focus",
        },
      },
      {
        src: "/projects/tecna/mobile.webp",
        label: {
          pt: "HUB no celular — os cards empilhados",
          en: "HUB on mobile — the cards stacked",
        },
      },
    ],
    highlights: [
      {
        pt: "Next 16 + React 19 + TypeScript + Tailwind 4 com quatro dependências de runtime (next, react, react-dom e @vercel/analytics) e as páginas pré-renderizadas estáticas por generateStaticParams",
        en: "Next 16 + React 19 + TypeScript + Tailwind 4 with four runtime dependencies (next, react, react-dom and @vercel/analytics) and pages prerendered static through generateStaticParams",
      },
      {
        pt: "Contrato tipado entre dois repositórios: o site busca o conteúdo na API do Portal no build, publicar no CMS dispara um Deploy Hook, e o botão “Traduzir o que falta” preenche o inglês por LLM (Anthropic SDK) para alguém revisar antes de salvar",
        en: "A typed contract between two repositories: the site fetches content from the Portal's API at build time, publishing in the CMS fires a Deploy Hook, and a “Translate what's missing” button fills in the English through an LLM (Anthropic SDK) for a person to review before saving",
      },
      {
        pt: "Migração do WordPress sem perder SEO: 28 posts importados com HTML limpo por lista fechada, 9 redirecionamentos permanentes das URLs antigas, hreflang com x-default, JSON-LD e sitemap nas duas línguas",
        en: "Migrating off WordPress without losing SEO: 28 posts imported with HTML sanitized by a closed allowlist, 9 permanent redirects from the old URLs, hreflang with x-default, JSON-LD and a sitemap in both languages",
      },
      {
        pt: "Formulário de contato por server action com validação no servidor, honeypot, trava de tempo de 3 s, rate limit por IP e consentimento LGPD — e ele nunca finge sucesso; CSP estrita, HSTS e nenhum cookie ou terceiro em runtime",
        en: "Contact form as a server action with server-side validation, a honeypot, a 3-second time trap, per-IP rate limiting and LGPD consent — and it never fakes success; strict CSP, HSTS and no cookies or third parties at runtime",
      },
      {
        pt: "E2E em Playwright contra o build de produção, incluindo um spec que percorre o sitemap inteiro caçando a grafia errada da marca, e axe (WCAG 2.1 AA) nas páginas principais a 1440 e 390 px",
        en: "Playwright E2E against the production build, including a spec that crawls the whole sitemap hunting for misspellings of the brand, and axe (WCAG 2.1 AA) on the main pages at 1440 and 390 px",
      },
    ],
    decisions: [
      {
        q: {
          pt: "Por que ler o CMS no build e não a cada request?",
          en: "Why read the CMS at build time instead of on every request?",
        },
        a: {
          pt: "O conteúdo de um site de construtora muda poucas vezes por semana, e quem lê é muito mais gente do que quem edita. No build a página sai estática, rápida e sem depender do Portal estar de pé; a publicação no CMS dispara um Deploy Hook, então o atraso entre salvar e ver no ar é o tempo de um build. E se o CMS ainda não tiver um campo, o site cai no conteúdo local empacotado em vez de renderizar um buraco.",
          en: "A builder's website changes a few times a week, and far more people read it than edit it. At build time the page comes out static, fast and independent of the Portal being up; publishing in the CMS fires a Deploy Hook, so the delay between saving and seeing it live is one build. And when the CMS does not have a field yet, the site falls back to bundled local content instead of rendering a hole.",
        },
      },
      {
        q: {
          pt: "Por que a tradução por LLM não salva sozinha?",
          en: "Why doesn't the LLM translation save itself?",
        },
        a: {
          pt: "É texto institucional de uma empresa, e tradução de máquina erra tom e termo técnico de construção sem avisar. O botão preenche só o que está faltando em inglês, em lotes, sem atropelar o que alguém já digitou; a pessoa lê e só então salva. O LLM economiza a digitação, não a revisão.",
          en: "It is a company's institutional copy, and machine translation gets tone and construction terminology wrong without warning. The button fills in only what is missing in English, in batches, without overwriting what someone already typed; a person reads it and only then saves. The LLM saves the typing, not the review.",
        },
      },
    ],
    year: "2026",
  },
  {
    slug: "financehub",
    role: {
      pt: "Projeto pessoal · solo",
      en: "Personal project · solo",
    },
    name: {
      pt: "FinanceHub",
      en: "FinanceHub",
    },
    tagline: {
      pt: "Plataforma financeira pessoal ponta a ponta com IA, em produção",
      en: "End-to-end personal finance platform with AI, in production",
    },
    description: {
      pt: "Aplicação financeira com autenticação Supabase, dashboard de saldo/projeção, gestão de transações, orçamento por categoria, recorrências, importação/exportação e assistente IA conversacional (Luna). Monorepo Turbo com backend Python e frontend Next.js, deploy contínuo na Vercel. As capturas ao lado são da plataforma autenticada em produção.",
      en: "Personal finance app with Supabase auth, a balance and projection dashboard, transaction management, per-category budgets, recurring entries, import/export and a conversational AI assistant (Luna). Turbo monorepo with a Python backend and a Next.js frontend, continuously deployed on Vercel. The screenshots alongside are from the authenticated platform in production.",
    },
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
      {
        src: "/projects/financehub/dashboard.png",
        label: {
          pt: "Dashboard — saldo, projeção e resumo da semana",
          en: "Dashboard — balance, projection and the week's summary",
        },
      },
      {
        src: "/projects/financehub/luna-ai.png",
        label: {
          pt: "Luna — assistente IA financeira conversacional",
          en: "Luna — conversational AI finance assistant",
        },
      },
      {
        src: "/projects/financehub/investments.png",
        label: {
          pt: "Investimentos — patrimônio total e metas",
          en: "Investments — total net worth and goals",
        },
      },
      {
        src: "/projects/financehub/mobile.png",
        label: {
          pt: "Layout responsivo no celular",
          en: "Responsive layout on mobile",
        },
      },
    ],
    highlights: [
      {
        pt: "Luna: contexto montado a partir das transações, categorias e orçamentos do próprio usuário autenticado, por consulta parametrizada filtrada por user_id",
        en: "Luna: context assembled from the authenticated user's own transactions, categories and budgets, through parameterized queries filtered by user_id",
      },
      {
        pt: "LLM via SDK da OpenAI apontado para a Groq (Llama 3.3 70B), teto de 500 tokens de saída e histórico truncado nas últimas 10 mensagens",
        en: "LLM through the OpenAI SDK pointed at Groq (Llama 3.3 70B), a 500-token output cap and history truncated to the last 10 messages",
      },
      {
        pt: "Rate limit por rota com slowapi: 30 req/h no chat, 10/h nos insights, 5/h no relatório mensal",
        en: "Per-route rate limiting with slowapi: 30 req/h on chat, 10/h on insights, 5/h on the monthly report",
      },
      {
        pt: "Row Level Security no Postgres nas tabelas do digest da Luna, sobre auth Supabase",
        en: "Row level security in Postgres on Luna's digest tables, on top of Supabase auth",
      },
      {
        pt: "Monorepo Turbo: API FastAPI + front Next.js, deploy contínuo na Vercel",
        en: "Turbo monorepo: FastAPI API + Next.js frontend, continuously deployed on Vercel",
      },
    ],
    decisions: [
      {
        q: {
          pt: "Por que Groq e não OpenAI direto?",
          en: "Why Groq and not OpenAI directly?",
        },
        a: {
          pt: "O SDK é o mesmo; só muda a base_url. Llama 3.3 70B na Groq entrega latência muito menor por um custo que cabe num projeto pessoal, e a troca de provedor é uma linha de configuração se o trade-off mudar.",
          en: "The SDK is the same; only the base_url changes. Llama 3.3 70B on Groq delivers far lower latency at a cost a personal project can carry, and switching providers is one line of configuration if the trade-off changes.",
        },
      },
      {
        q: {
          pt: "Por que truncar o histórico em 10 mensagens?",
          en: "Why truncate history at 10 messages?",
        },
        a: {
          pt: "O contexto financeiro do mês já ocupa o system prompt. Sem teto, uma conversa longa empurra o custo por request para cima e derruba a qualidade da resposta — 10 mensagens cobre a continuidade de um chat de finanças.",
          en: "The month's financial context already fills the system prompt. With no cap, a long conversation drives cost per request up and answer quality down — 10 messages covers the continuity of a finance chat.",
        },
      },
    ],
    year: "2026",
  },
  {
    slug: "quintoandar-precificacao",
    role: {
      pt: "API, testes e validação · time de 4",
      en: "API, tests and validation · team of 4",
    },
    name: {
      pt: "Precificação QuintoAndar",
      en: "QuintoAndar Pricing",
    },
    tagline: {
      pt: "Preço de imóvel servido por API FastAPI na AWS: MAPE de 9,32% contra vendas reais de 2010, todo request logado e deploy contínuo com healthcheck",
      en: "Home prices served by a FastAPI API on AWS: 9.32% MAPE against actual 2010 sales, every request logged, continuous deploy with a healthcheck",
    },
    description: {
      pt: "Sprint do 4º semestre do Insper com o QuintoAndar como parceiro: um time de quatro tinha que responder por quanto um imóvel vende e sustentar essa resposta em produção. O dataset é o Ames Housing — 1.285 imóveis residenciais de 2006 a 2009, 80 features — e o teste final foi contra 175 vendas reais de 2010, em holdout temporal com ids disjuntos dos do treino. Saíram dois modelos: uma regressão linear de 4 features para explicar preço a corretor e proprietário (MAPE 11,9%, R² 0,832) e um Gradient Boosting para a calculadora pública. Dos 52 commits do repositório da aplicação, 20 são meus — o maior volume do time: a API FastAPI, o logging de predições, os 36 testes, o script e o relatório de validação com os dados de 2010 e o modelo mínimo de 8 campos.",
      en: "Fourth-semester Insper sprint with QuintoAndar as the partner: a team of four had to answer what a home sells for and keep that answer running in production. The dataset is Ames Housing — 1,285 residential properties from 2006 to 2009, 80 features — and the final test ran against 175 actual 2010 sales, a temporal holdout whose ids are disjoint from the training set. Two models came out of it: a 4-feature linear regression to explain price to agents and owners (11.9% MAPE, R² 0.832) and a Gradient Boosting model for the public calculator. Of the 52 commits in the application repository, 20 are mine — the largest share on the team: the FastAPI API, prediction logging, the 36 tests, the validation script and report against the 2010 data, and the minimal 8-field model.",
    },
    category: "featured",
    // `shipped` e não `deployed`: o sistema rodou em produção com deploy
    // contínuo na EC2 durante a sprint, mas a instância foi desligada quando ela
    // acabou. Sem URL viva não há o que chamar de "no ar" — e por isso também
    // não há `demo`. Sem `github`: os dois repositórios são privados, na
    // organização insper-classroom.
    status: "shipped",
    isPrivate: true,
    stack: [
      "Python",
      "FastAPI",
      "scikit-learn",
      "Pydantic",
      "SQLite",
      "Docker",
      "GitHub Actions",
      "AWS EC2",
    ],
    cover: "/projects/quintoandar-precificacao/cover.png",
    gallery: [
      {
        src: "/projects/quintoandar-precificacao/cover.png",
        label: {
          pt: "Calculadora pública — 8 campos e preço estimado pela API",
          en: "Public calculator — 8 fields and the price the API estimates",
        },
      },
      {
        src: "/projects/quintoandar-precificacao/comparativo-mae.png",
        label: {
          pt: "MAE dos 5 modelos no holdout cronológico de 2009",
          en: "MAE of the 5 models on the 2009 chronological holdout",
        },
      },
      {
        src: "/projects/quintoandar-precificacao/previsto-vs-real.png",
        label: {
          pt: "Previsto vs. real do Gradient Boosting",
          en: "Predicted vs. actual for the Gradient Boosting model",
        },
      },
      {
        src: "/projects/quintoandar-precificacao/latencia.png",
        label: {
          pt: "Latência por chamada em produção (p95 11,7 ms)",
          en: "Latency per call in production (p95 11.7 ms)",
        },
      },
    ],
    highlights: [
      {
        pt: "Gradient Boosting escolhido entre 5 modelos em validação cronológica: MAE de US$ 16.117 e MAPE de 9,83% no holdout de 2009, contra US$ 57.077 e 34,69% do baseline de mediana",
        en: "Gradient Boosting picked among 5 models in chronological validation: $16,117 MAE and 9.83% MAPE on the 2009 holdout, against $57,077 and 34.69% for the median baseline",
      },
      {
        pt: "Validação final contra as 175 vendas reais de 2010: MAE US$ 15.810, MAPE 9,32%, RMSE 26.071 e R² 0,894, com 92% dos imóveis dentro de 20% de erro",
        en: "Final validation against the 175 actual 2010 sales: $15,810 MAE, 9.32% MAPE, 26,071 RMSE and R² 0.894, with 92% of the properties within 20% error",
      },
      {
        pt: "Calculadora pública reduzida de 12 para 8 campos por forward selection, no joelho da curva de erro",
        en: "Public calculator cut from 12 fields to 8 by forward selection, at the knee of the error curve",
      },
      {
        pt: "API FastAPI 0.115 com /predict, /predict/simples, /metrics e /health, contratos em Pydantic e o pré-processamento e as features portados do repo de modelo para ficarem idênticos aos do treino",
        en: "FastAPI 0.115 API with /predict, /predict/simples, /metrics and /health, Pydantic contracts, and the preprocessing and features ported over from the model repo so they match training exactly",
      },
      {
        pt: "Todo request gravado em SQLite — inclusive os 422 — com latência, versão do modelo, entrada e saída; o relatório de uso real fechou 300 chamadas com p95 de 11,7 ms e 94,3% de sucesso",
        en: "Every request written to SQLite — 422s included — with latency, model version, input and output; the real-usage report closed at 300 calls with a p95 of 11.7 ms and 94.3% success",
      },
      {
        pt: "36 testes em pytest distribuídos por 8 arquivos, e CI/CD que roda a suíte a cada push e, no merge da main, faz SSH + rsync e docker compose up --build --wait na EC2, com healthcheck depois do deploy",
        en: "36 pytest tests across 8 files, and CI/CD that runs the suite on every push and, on merge to main, does SSH + rsync and docker compose up --build --wait on EC2, with a healthcheck after the deploy",
      },
    ],
    decisions: [
      {
        q: {
          pt: "Por que split cronológico e não aleatório?",
          en: "Why a chronological split and not a random one?",
        },
        a: {
          pt: "Preço de imóvel anda com o tempo. Um split aleatório deixa venda de 2009 no treino e venda de 2007 no teste, e o modelo passa a ser avaliado sabendo o futuro. O corte é por data, a validação foi o ano de 2009, e o teste final foi contra as 175 vendas de 2010 — ano que o treino nunca viu, com ids disjuntos.",
          en: "Home prices move over time. A random split puts a 2009 sale in training and a 2007 sale in test, and the model ends up evaluated while knowing the future. The cut is by date, validation was the year 2009, and the final test ran against the 175 sales from 2010 — a year training never saw, with disjoint ids.",
        },
      },
      {
        q: {
          pt: "Por que logar também os requests que falham com 422?",
          en: "Why log the requests that fail with 422 as well?",
        },
        a: {
          pt: "Log só de predição bem-sucedida mede o modelo, não o serviço. Gravar o 422 junto é o que mostra qual contrato o cliente está errando e com que frequência — é dele que sai a taxa de sucesso de 94,3% nas 300 chamadas do relatório de uso, em vez de uma impressão de que estava tudo bem.",
          en: "Logging only successful predictions measures the model, not the service. Recording the 422s alongside them is what shows which contract the client is getting wrong and how often — that is where the 94.3% success rate over the report's 300 calls comes from, instead of an impression that everything was fine.",
        },
      },
      {
        q: {
          pt: "Por que não retreinar depois da validação com 2010?",
          en: "Why not retrain after the 2010 validation?",
        },
        a: {
          pt: "O modelo treinado até 2009 errou 9,32% de MAPE num ano que nunca viu, contra 9,83% no holdout de 2009 — ou seja, não houve degradação a corrigir. Retreinar sem sinal de degradação troca um modelo medido por um modelo novo e não medido; a decisão de não mexer ficou escrita no relatório de validação.",
          en: "The model trained through 2009 came in at 9.32% MAPE on a year it had never seen, against 9.83% on the 2009 holdout — so there was no degradation to fix. Retraining with no sign of degradation swaps a measured model for a new, unmeasured one; the decision to leave it alone is written down in the validation report.",
        },
      },
    ],
    year: "2026",
  },
  {
    slug: "wraeclast",
    role: {
      pt: "Projeto pessoal · solo",
      en: "Personal project · solo",
    },
    name: {
      pt: "Project Wraeclast",
      en: "Project Wraeclast",
    },
    tagline: {
      pt: "Assistente com RAG: coleta diária em GitHub Actions, busca vetorial em Postgres com pgvector e resposta ancorada no contexto recuperado",
      en: "RAG assistant: daily ingestion on GitHub Actions, vector search in Postgres with pgvector, and retrieval-grounded answers",
    },
    description: {
      pt: "Assistente pessoal para um jogo cuja meta muda a cada patch. Uma rotina diária coleta economia, o personagem do dono e conteúdo da comunidade, resume cada documento em JSON estruturado com um LLM e grava o embedding num Postgres com pgvector. Na pergunta, a API FastAPI embeda o texto, recupera os trechos mais próximos por distância de cosseno e monta um bloco de contexto com preços, ranking de farms e perfil do personagem — o LLM responde só sobre esse bloco. Não há modelo treinado nem fine-tuning: a inteligência é o corpus curado que cresce todo dia. O site em Next.js tem as telas de hoje, de farms e de bancada de craft, mais um grafo do conhecimento coletado.",
      en: "Personal assistant for a game whose meta shifts with every patch. A daily job collects the game economy, the owner's character and community content, summarizes each document into structured JSON with an LLM, and stores the embedding in Postgres with pgvector. On a question, the FastAPI API embeds the text, retrieves the nearest passages by cosine distance and assembles a context block with prices, a farm ranking and the character profile — the LLM answers from that block only. There is no trained model and no fine-tuning: the intelligence is the curated corpus that grows every day. The Next.js site has a today screen, a farms screen and a crafting bench screen, plus a graph of the knowledge collected.",
    },
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
      {
        pt: "Busca vetorial em Postgres com pgvector: embeddings de 1024 dimensões (truncagem Matryoshka para caber no índice HNSW) recuperados por distância de cosseno e filtráveis por tópico",
        en: "Vector search in Postgres with pgvector: 1024-dimension embeddings (Matryoshka truncation so they fit the HNSW index) retrieved by cosine distance and filterable by topic",
      },
      {
        pt: "Sem fine-tuning e sem modelo próprio: o contexto do chat é montado dos trechos recuperados mais preços, farms e perfil do personagem, e o prompt manda responder só com esse contexto e avisar quando o dado faltar",
        en: "No fine-tuning and no model of my own: the chat context is assembled from the retrieved passages plus prices, farms and the character profile, and the prompt orders the model to answer from that context only and to flag when the data is missing",
      },
      {
        pt: "Coleta pesada separada da API: o cron diário roda no GitHub Actions, sem limite de tempo de execução; só as leituras e o /chat rodam como função serverless na Vercel",
        en: "Heavy ingestion kept out of the API: the daily cron runs on GitHub Actions, with no execution time limit; only the reads and /chat run as serverless functions on Vercel",
      },
      {
        pt: "350 testes passando localmente com pytest e CI de ruff + pytest a cada push; a meta de 80% de cobertura por módulo está registrada e datada no ROADMAP",
        en: "350 tests passing locally under pytest and CI running ruff + pytest on every push; the 80% per-module coverage target is written down and dated in the ROADMAP",
      },
      {
        pt: "O /chat é fechado por token comparado em tempo constante com hmac.compare_digest, e falha fechado quando o token não está configurado",
        en: "/chat is gated by a token compared in constant time with hmac.compare_digest, and it fails closed when the token is not configured",
      },
    ],
    decisions: [
      {
        q: {
          pt: "Por que RAG e não fine-tuning?",
          en: "Why RAG and not fine-tuning?",
        },
        a: {
          pt: "O conteúdo muda a cada patch do jogo. Re-treinar modelo a cada mudança custa caro e envelhece rápido; um corpus curado que ganha documentos novos todo dia fica atualizado por construção, e o LLM entra só para curar texto em JSON e responder ancorado no que foi recuperado.",
          en: "The content changes with every game patch. Retraining a model on every change is expensive and goes stale fast; a curated corpus that gains new documents every day is current by construction, and the LLM only comes in to turn text into JSON and to answer grounded in what was retrieved.",
        },
      },
      {
        q: {
          pt: "Por que a coleta roda no GitHub Actions e não na própria API?",
          en: "Why does ingestion run on GitHub Actions instead of inside the API?",
        },
        a: {
          pt: "Função serverless tem teto de tempo de execução, e a coleta diária (scraping, embeddings e curadoria via LLM) não cabe nesse teto. O job de cron roda no Actions e só grava no banco; a API fica com leitura e chat, que são rápidos o bastante.",
          en: "A serverless function has an execution time ceiling, and the daily ingestion (scraping, embeddings and LLM curation) does not fit under it. The cron job runs on Actions and only writes to the database; the API keeps reads and chat, which are fast enough.",
        },
      },
      {
        q: {
          pt: "Por que truncar o embedding para 1024 dimensões?",
          en: "Why truncate the embedding to 1024 dimensions?",
        },
        a: {
          pt: "O provedor devolve 3072 dimensões por padrão e o índice HNSW do pgvector tem limite prático abaixo disso. A truncagem Matryoshka (parâmetro dimensions na própria chamada) faz o vetor caber no índice sem trocar de provedor nem perder a busca por similaridade.",
          en: "The provider returns 3072 dimensions by default and pgvector's HNSW index has a practical limit below that. Matryoshka truncation (the dimensions parameter on the call itself) makes the vector fit the index without switching providers or giving up similarity search.",
        },
      },
    ],
    year: "2026",
  },
  {
    slug: "commerce-nda",
    role: {
      pt: "Solo · sob contrato",
      en: "Solo · under contract",
    },
    name: {
      pt: "E-commerce transacional (sob NDA)",
      en: "Transactional e-commerce (under NDA)",
    },
    tagline: {
      pt: "E-commerce transacional em Spring Boot: outbox com retry exponencial, idempotência de webhook e rate limit em Redis com circuit breaker",
      en: "Transactional e-commerce in Spring Boot: outbox with exponential retry, webhook idempotency, and rate limiting in Redis behind a circuit breaker",
    },
    description: {
      pt: "Loja própria de uma marca brasileira — nome sob contrato — em monolito modular Java 21 / Spring Boot 4.1 com storefront Next.js. O sistema move dinheiro, então a engenharia é quase toda sobre o caminho infeliz: webhook de pagamento validado por assinatura e deduplicado por tabela de webhooks processados; e-mails transacionais em outbox, com claim numa transação curta e envio fora de lock; retentativa com backoff exponencial e chave de idempotência no provedor; rate limit por chave em Redis via script Lua atômico que falha aberto quando o Redis cai. 12 módulos de domínio, migrações Flyway e testes de integração com Testcontainers em Postgres e Redis reais.",
      en: "A Brazilian brand's own store — name under contract — as a Java 21 / Spring Boot 4.1 modular monolith with a Next.js storefront. The system moves money, so most of the engineering is about the unhappy path: payment webhooks validated by signature and deduplicated against a processed-webhooks table; transactional emails in an outbox, claimed in a short transaction and sent outside any lock; retries with exponential backoff and an idempotency key at the provider; per-key rate limiting in Redis through an atomic Lua script that fails open when Redis goes down. 12 domain modules, Flyway migrations, and integration tests against real Postgres and Redis with Testcontainers.",
    },
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
      {
        pt: "Outbox transacional: claim em transação curta, envio sem segurar lock, backoff exponencial de 30s dobrando até o teto de 1h com jitter",
        en: "Transactional outbox: claim in a short transaction, send without holding a lock, exponential backoff from 30s doubling to a 1h ceiling with jitter",
      },
      {
        pt: "Idempotência ponta a ponta: webhook processado uma única vez, Idempotency-Key no provedor de e-mail",
        en: "End-to-end idempotency: each webhook processed exactly once, an Idempotency-Key at the email provider",
      },
      {
        pt: "Rate limit por chave em Redis com script Lua atômico, que falha aberto e tem circuit breaker com sonda em half-open",
        en: "Per-key rate limiting in Redis with an atomic Lua script that fails open, behind a circuit breaker that probes in half-open",
      },
      {
        pt: "Webhook de pagamento validado por assinatura HMAC; webhook de NF-e por token secreto próprio em comparação constant-time — ambos fail-closed",
        en: "Payment webhooks validated by HMAC signature; the NF-e webhook by its own secret token under constant-time comparison — both fail closed",
      },
      {
        pt: "12 módulos de domínio, Flyway e testes de integração com Testcontainers (Postgres + Redis reais)",
        en: "12 domain modules, Flyway, and integration tests with Testcontainers (real Postgres + Redis)",
      },
    ],
    decisions: [
      {
        q: {
          pt: "Por que outbox e não chamar o provedor de e-mail dentro da transação?",
          en: "Why an outbox instead of calling the email provider inside the transaction?",
        },
        a: {
          pt: "Chamada HTTP dentro de transação segura conexão do pool enquanto espera a rede. O outbox quebra em três passos: transação curta que faz o claim, envio sem lock nenhum, transação curta que grava o resultado. A Idempotency-Key é o id da linha, então reenvio depois de crash é no-op.",
          en: "An HTTP call inside a transaction holds a pool connection while it waits on the network. The outbox breaks that into three steps: a short transaction that claims the row, a send with no lock at all, and a short transaction that records the result. The Idempotency-Key is the row id, so a resend after a crash is a no-op.",
        },
      },
      {
        q: {
          pt: "Por que o rate limiter falha ABERTO?",
          en: "Why does the rate limiter fail OPEN?",
        },
        a: {
          pt: "Se o Redis cair, bloquear todo o tráfego derruba o checkout — o custo de deixar passar tráfego por alguns minutos é menor que o de parar de vender. Ele loga ERROR para alertar, e o circuit breaker evita que cada request pague o timeout de conexão enquanto o Redis está fora.",
          en: "If Redis goes down, blocking all traffic takes checkout down with it — letting traffic through for a few minutes costs less than not selling. It logs ERROR so the failure raises an alert, and the circuit breaker keeps every request from paying the connection timeout while Redis is out.",
        },
      },
      {
        q: {
          pt: "Por que monolito modular e não microsserviços?",
          en: "Why a modular monolith and not microservices?",
        },
        a: {
          pt: "Projeto solo, ~100 pedidos/mês. Microsserviço aqui compraria latência de rede e complexidade de deploy sem resolver nenhum problema que eu tenha. Os módulos têm fronteira clara para o dia em que valer a pena separar.",
          en: "Solo project, ~100 orders/month. Microservices here would buy network latency and deployment complexity without solving a single problem I actually have. The modules have clear boundaries for the day splitting them pays off.",
        },
      },
    ],
    year: "2026",
  },
  {
    // Era `portal-construtora`, com o cliente anônimo. A TECNA agora pode ser
    // nomeada, e o slug virou endereço de página de case — por isso mudou junto,
    // antes de qualquer link externo apontar para ele.
    //
    // Números de autoria relidos no repositório (git shortlog -sne --all, só
    // leitura): 256 dos 1.288 commits, 118 deles no módulo do manual. O script
    // que extrai o catálogo do PDF do manual tem autoria "Claude" no histórico,
    // e por isso saiu daqui: o card só reivindica o que está no nome do dono.
    slug: "portal-tecna",
    role: {
      pt: "Full-stack · equipe IOTech",
      en: "Full-stack · IOTech team",
    },
    name: {
      pt: "Portal TECNA",
      en: "TECNA Portal",
    },
    tagline: {
      pt: "O super app interno da TECNA em Next.js 16: quatro sistemas novos meus — Qualidade com tela de campo sem sinal, Planejamento com caminho crítico, Segurança e Gerenciamento de Projetos —, o manual do proprietário e o CMS do site",
      en: "TECNA's internal super app on Next.js 16: four new systems of mine — Quality with an offline field screen, Planning with critical path, Safety and Project Management —, the homeowner's manual and the website's CMS",
    },
    description: {
      pt: "O Portal TECNA reúne sob um login só os sistemas internos da construtora — atendimento pós-obra, portal do cliente, departamento pessoal, suprimentos, o manual do proprietário e o CMS do site comercial —, num app Next.js 16 / React 19 com um deploy e um PostgreSQL só, via Drizzle. É projeto de equipe na IOTech, em repositório privado: dos 1.288 commits, 256 são meus, entre o fim de agosto e outubro de 2026. O que é meu: 118 commits no módulo do manual do proprietário, os quatro sistemas novos — Qualidade, Planejamento, Segurança e Gerenciamento de Projetos — e o CMS “Site Institucional” que alimenta o site comercial da TECNA.",
      en: "The TECNA Portal puts the builder's internal systems behind a single login — post-handover support, the client portal, personnel administration, procurement, the homeowner's manual and the commercial website's CMS —, in one Next.js 16 / React 19 app with one deploy and one PostgreSQL database, through Drizzle. It is a team project at IOTech, in a private repository: of the 1,288 commits, 256 are mine, from late August to October 2026. What is mine: 118 commits in the homeowner's manual module, the four new systems — Quality, Planning, Safety and Project Management — and the “Site Institucional” CMS that feeds TECNA's commercial website.",
    },
    category: "featured",
    status: "deployed",
    isPrivate: true,
    stack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Drizzle ORM",
      "PostgreSQL",
      "Zod",
      "IndexedDB",
      "Service Worker",
      "Vitest",
      "Playwright",
      "Vercel",
    ],
    // Sem `github`, sem `demo` e sem `cover`: repositório privado da IOTech, e
    // o que se vê do deploy sem login é a tela de autenticação — o mesmo tipo de
    // screenshot que já foi removido do projeto-software por ler como imagem
    // quebrada. A capa cai no ProjectCover.
    highlights: [
      {
        pt: "Qualidade: a tela de campo funciona sem sinal — a aplicação inteira fica no IndexedDB antes de ir para a rede, um service worker reabre a tela offline, e a fila (criar, respostas, arquivos, concluir) só esvazia com a confirmação do servidor, com teto de 3 MB",
        en: "Quality: the field screen works with no signal — the whole inspection lives in IndexedDB before it touches the network, a service worker reopens the screen offline, and the queue (create, answers, files, complete) only drains on the server's confirmation, capped at 3 MB",
      },
      {
        pt: "Reenvio sem duplicar: a inspeção nasce com o id gerado no aparelho (o mesmo corpo de novo responde 200 com criada: false; o mesmo id em outro checklist, 409), o anexo é deduplicado pelo clienteId e a resposta mais velha não passa por cima da mais nova",
        en: "Resending without duplicates: the inspection is created with the id generated on the device (the same body again returns 200 with created: false; the same id on another checklist, 409), attachments are deduplicated by clientId, and an older answer never overwrites a newer one",
      },
      {
        pt: "Planejamento: o cálculo do cronograma é uma função pura usada no servidor e na prévia da tela — dias úteis, predecessoras (vale a mais atrasada), ciclo recusado, atraso real e caminho crítico — e o Gantt mostra a linha de base",
        en: "Planning: the schedule calculation is a pure function shared by the server and the on-screen preview — business days, predecessors (the latest one wins), cycles rejected, actual delay and critical path — and the Gantt shows the baseline",
      },
      {
        pt: "Manual do proprietário: o quadro da obra exportado em PDF e em Excel, e quatro otimizações minhas — uma consulta por obra em vez de uma por unidade, o logo embutido uma vez por PDF em vez de por página, a lista de fichas sem baixar o texto de todas e o segundo PDF da mesma obra saindo na hora",
        en: "Homeowner's manual: the development's board exported to PDF and Excel, and four optimizations of mine — one query per development instead of one per unit, the logo embedded once per PDF instead of per page, the record list without pulling every record's text, and the second PDF of the same development coming out instantly",
      },
      {
        pt: "CMS “Site Institucional”: abas por página do site comercial, gravação por seção que não apaga a edição de outra, limpeza do HTML dos posts por lista fechada e tradução automática por LLM em lotes, sem atropelar o que se digita",
        en: "“Site Institucional” CMS: tabs per page of the commercial website, per-section saving that never wipes another section's edits, post HTML sanitized by a closed allowlist, and batched LLM auto-translation that never overwrites what someone is typing",
      },
    ],
    decisions: [
      {
        q: {
          pt: "Como uma inspeção de qualidade sobrevive a uma obra sem sinal?",
          en: "How does a quality inspection survive a construction site with no signal?",
        },
        a: {
          pt: "Tratando a rede como a parte que falha. Tudo é gravado no aparelho primeiro; o envio é uma fila ordenada que só tira um passo quando o servidor confirma — rede caída, 5xx e 401 param e guardam. Do outro lado, toda rota aceita o mesmo pedido duas vezes sem duplicar, porque a fila VAI reenviar: a inspeção nasce com o id do aparelho e o anexo carrega o clienteId.",
          en: "By treating the network as the part that fails. Everything is written to the device first; sending is an ordered queue that only drops a step when the server confirms — a dropped network, 5xx and 401 stop and keep. On the other side, every route accepts the same request twice without duplicating, because the queue WILL resend: the inspection is born with the device's id and each attachment carries its clientId.",
        },
      },
      {
        q: {
          pt: "O que é meu num sistema de 1.288 commits?",
          en: "What is mine in a 1,288-commit system?",
        },
        a: {
          pt: "É projeto de equipe, e a maior parte dos commits é de outras pessoas. O que reivindico é o que o histórico confirma no meu nome — o manual do proprietário, os quatro sistemas novos e o CMS do site. Login, hub, atendimento pós-obra e portal do cliente aparecem aqui como contexto, não como autoria.",
          en: "It is a team project, and most of the commits belong to other people. What I claim is what the history confirms under my name — the homeowner's manual, the four new systems and the website's CMS. Login, the hub, post-handover support and the client portal are here as context, not as authorship.",
        },
      },
    ],
    year: "2026",
  },
  {
    slug: "sentinel",
    role: {
      pt: "Projeto pessoal · solo",
      en: "Personal project · solo",
    },
    name: {
      pt: "Sentinel",
      en: "Sentinel",
    },
    tagline: {
      pt: "Monitoramento em tempo real: métricas do backend FastAPI transmitidas por WebSocket e renderizadas em 3D",
      en: "Real-time monitoring: FastAPI backend metrics streamed over WebSocket and rendered in 3D",
    },
    description: {
      pt: "Dashboard 3D full-stack em que os repositórios do meu GitHub orbitam um núcleo reativo como satélites. O tamanho do repositório mapeia stars + forks, a cor mapeia a linguagem e a velocidade da órbita mapeia o push mais recente. Shaders GLSL próprios desenham plasma, grids holográficos e camadas de glitch. O backend FastAPI transmite métricas de CPU, RAM e disco por WebSocket, e são elas que dirigem o pulso e a cor do núcleo.",
      en: "Full-stack 3D dashboard where my GitHub repositories orbit a reactive core like satellites. Repository size maps to stars + forks, color maps to language, and orbital speed maps to the most recent push. Hand-written GLSL shaders draw the plasma, the holographic grids and the glitch layers. The FastAPI backend streams CPU, RAM and disk metrics over WebSocket, and those are what drive the core's pulse and color.",
    },
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
      {
        pt: "Streaming de métricas por WebSocket com reconexão automática e limite de tentativas",
        en: "Metrics streamed over WebSocket with automatic reconnection and a retry cap",
      },
      {
        pt: "Shaders GLSL próprios (plasma, grid holográfico, glitch)",
        en: "Hand-written GLSL shaders (plasma, holographic grid, glitch)",
      },
      {
        pt: "Câmera fly-to com GSAP, bloom e aberração cromática",
        en: "Fly-to camera with GSAP, bloom and chromatic aberration",
      },
      {
        pt: "Backend FastAPI empurra métricas de CPU/RAM/disco que dirigem a cena",
        en: "A FastAPI backend pushes CPU/RAM/disk metrics that drive the scene",
      },
    ],
    year: "2026",
  },

  // ─── MORE WORK ──────────────────────────────────────────────
  {
    slug: "projeto-software",
    name: {
      pt: "Projeto Software — Microsserviços",
      en: "Software Design — Microservices",
    },
    tagline: {
      pt: "Sistema distribuído: Gateway (Java) + User Service (Python) + Connections (Java) + Frontend",
      en: "Distributed system: Gateway (Java) + User Service (Python) + Connections (Java) + Frontend",
    },
    description: {
      pt: "Arquitetura de microsserviços de um projeto acadêmico: API Gateway em Java/Spring que roteia para o User Service (Python/FastAPI) e o Connections Service (Java), com frontend JavaScript. Os quatro serviços sobem separados e se comunicam por HTTP, com pipeline de deploy.",
      en: "Microservice architecture for an academic project: a Java/Spring API Gateway that routes to the User Service (Python/FastAPI) and the Connections Service (Java), with a JavaScript frontend. The four services run separately and talk over HTTP, with a deploy pipeline.",
    },
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
      {
        pt: "4 serviços independentes: gateway, user service, connections e frontend",
        en: "4 independent services: gateway, user service, connections and frontend",
      },
      {
        pt: "Padrão gateway em Java/Spring",
        en: "Gateway pattern in Java/Spring",
      },
      {
        pt: "Back-ends em Python/FastAPI e Java",
        en: "Backends in Python/FastAPI and Java",
      },
      {
        pt: "Comunicação inter-serviços via HTTP",
        en: "Service-to-service communication over HTTP",
      },
    ],
    year: "2026",
  },
  {
    slug: "cca-gestao",
    role: {
      pt: "Backend · time de 7",
      en: "Backend · team of 7",
    },
    name: {
      pt: "Gestão de núcleos CCA",
      en: "CCA center management",
    },
    tagline: {
      pt: "Spring Boot 4 / Java 21 + React 19 para núcleos socioeducativos: inscrição pública, matrícula, chamada e três papéis de acesso",
      en: "Spring Boot 4 / Java 21 + React 19 for social-education centers: public sign-up, enrollment, daily attendance and three access roles",
    },
    description: {
      pt: "Sprint do 3º semestre, time de sete: sistema de gestão para núcleos CCA (Centro para Crianças e Adolescentes), da inscrição pública à chamada diária. Backend em Java 21 e Spring Boot 4 (webmvc, data-jpa, validation) sobre MySQL, com senha em BCrypt, documentação em springdoc OpenAPI e Dockerfile multi-stage — 11 domínios, 13 controllers e cerca de 73 endpoints REST; o front é React 19 com Vite 7 e react-router. Meus são os módulos de Inscrição e Fila de Espera, e 23 dos 90 commits do backend — o segundo maior volume do time.",
      en: "Third-semester sprint, a team of seven: a management system for CCA centers (Centro para Crianças e Adolescentes — centers for children and teenagers), from public sign-up to daily attendance. Java 21 and Spring Boot 4 backend (webmvc, data-jpa, validation) over MySQL, with BCrypt passwords, springdoc OpenAPI documentation and a multi-stage Dockerfile — 11 domains, 13 controllers and about 73 REST endpoints; the frontend is React 19 with Vite 7 and react-router. The Sign-up and Waiting List modules are mine, along with 23 of the backend's 90 commits — the second largest share on the team.",
    },
    category: "more",
    status: "shipped",
    isPrivate: true,
    stack: [
      "Java 21",
      "Spring Boot",
      "Spring Data JPA",
      "MySQL",
      "React 19",
      "Vite",
    ],
    // Sem `github` e sem `cover`: o repositório é privado (organização
    // insper-classroom) e não há deploy de pé para fotografar — o card cai na
    // capa gerada por ProjectCover.
    highlights: [
      {
        pt: "Inscrição e Fila de Espera meus de ponta a ponta — entidade, DTOs, controller e service — com idade calculada, múltiplos responsáveis por criança, vínculo inscrição↔fila e reordenação pelo admin",
        en: "Sign-up and Waiting List, mine end to end — entity, DTOs, controller and service — with computed age, multiple guardians per child, a sign-up↔waiting-list link, and reordering by the admin",
      },
      {
        pt: "23 dos 90 commits do backend, o segundo maior volume entre os sete do time",
        en: "23 of the backend's 90 commits, the second largest share among the team's seven",
      },
      {
        pt: "11 domínios, 13 controllers e ~73 endpoints REST em Java 21 / Spring Boot 4, com papéis Admin, Gestor e Professor",
        en: "11 domains, 13 controllers and ~73 REST endpoints in Java 21 / Spring Boot 4, with Admin, Manager and Teacher roles",
      },
      {
        pt: "DTOs refatorados para records de Java; no front, Inscrições e Matrículas saíram dos mocks para a API real, com suporte a múltiplos CCAs",
        en: "DTOs refactored into Java records; on the frontend, Sign-ups and Enrollments moved off mocks onto the real API, with support for multiple CCAs",
      },
    ],
    year: "2025",
  },
  {
    slug: "ml-copa",
    name: {
      pt: "ML-Copa",
      en: "ML-Copa",
    },
    tagline: {
      pt: "Predição de Copa do Mundo com XGBoost, Elo adaptativo e Dixon-Coles",
      en: "World Cup prediction with XGBoost, adaptive Elo and Dixon-Coles",
    },
    description: {
      pt: "Sistema de predição de Copa do Mundo combinando 49 mil partidas internacionais históricas com ensemble XGBoost, ratings Elo adaptativos e modelos probabilísticos Poisson/Dixon-Coles. Pipeline CRISP-DM com feature engineering pré-match e probabilidades calibradas.",
      en: "World Cup prediction system combining 49 thousand historical international matches with an XGBoost ensemble, adaptive Elo ratings and Poisson/Dixon-Coles probability models. CRISP-DM pipeline with pre-match feature engineering and calibrated probabilities.",
    },
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
      {
        pt: "49.071 partidas internacionais (1872–2024)",
        en: "49,071 international matches (1872–2024)",
      },
      {
        pt: "Elo rating adaptativo + Dixon-Coles",
        en: "Adaptive Elo rating + Dixon-Coles",
      },
      {
        pt: "Pipeline CRISP-DM completo",
        en: "Full CRISP-DM pipeline",
      },
      {
        pt: "Validação com log-loss e calibração de probabilidades",
        en: "Validation with log-loss and probability calibration",
      },
    ],
    year: "2026",
  },
  {
    slug: "cacaos",
    name: {
      pt: "CacaOS",
      en: "CacaOS",
    },
    tagline: {
      pt: "Firmware em C++ para ESP32 com tela touch: 8 mini-apps em LVGL e simulador SDL2 para desenvolver sem a placa",
      en: "C++ firmware for an ESP32 with a touch screen: 8 LVGL mini-apps and an SDL2 simulator for developing without the board",
    },
    description: {
      pt: "Firmware de aplicação em C++ para um ESP32 com display touch de 320×240, feito como presente físico: um launcher com oito mini-apps em pixel art (galeria, contador, tamagotchi, pomodoro, mood tracker e outros). Não é sistema operacional — não tem kernel nem escalonador próprio; é um loop cooperativo sobre o framework Arduino, com LVGL desenhando a interface. O detalhe de engenharia que interessa está fora dos apps: um segundo ambiente de build compila o mesmo código de UI contra SDL2 no Mac, trocando por shims só os módulos de hardware, e uma máquina de estados de WiFi pausa e retoma o rádio para conseguir escanear redes durante uma tentativa de conexão.",
      en: "Application firmware in C++ for an ESP32 with a 320×240 touch display, built as a physical gift: a launcher with eight pixel-art mini-apps (gallery, counter, tamagotchi, pomodoro, mood tracker and others). It is not an operating system — no kernel, no scheduler of its own; it is a cooperative loop on top of the Arduino framework, with LVGL drawing the interface. The engineering worth reading is outside the apps: a second build environment compiles the same UI code against SDL2 on the Mac, swapping in shims only for the hardware modules, and a WiFi state machine pauses and resumes the radio so it can scan networks during a connection attempt.",
    },
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
      {
        pt: "Ambiente de simulador nativo em SDL2 paralelo ao build de hardware: a UI inteira roda no Mac sem a placa, com shims só nos módulos de display, touch, SD, WiFi e sensores",
        en: "A native SDL2 simulator environment alongside the hardware build: the whole UI runs on the Mac without the board, with shims only in the display, touch, SD, WiFi and sensor modules",
      },
      {
        pt: "Máquina de estados de WiFi com pause/resume do rádio, porque iniciar scan durante uma tentativa de conexão falha em silêncio no ESP-IDF; a troca de credenciais tem rollback automático quando a rede nova não conecta",
        en: "A WiFi state machine that pauses and resumes the radio, because starting a scan during a connection attempt fails silently in ESP-IDF; changing credentials rolls back automatically when the new network does not connect",
      },
      {
        pt: "Driver de touch reescrito em bit-banging para liberar o barramento SPI real ao cartão SD, que disputava os mesmos pinos",
        en: "Touch driver rewritten with bit-banging to hand the real SPI bus back to the SD card, which was contending for the same pins",
      },
      {
        pt: "CI no GitHub Actions que compila o firmware de verdade a cada push e reporta o uso de flash e RAM",
        en: "CI on GitHub Actions that actually compiles the firmware on every push and reports flash and RAM usage",
      },
      {
        pt: "Pipeline próprio de assets: sprite sheet PNG convertido para o formato binário do LVGL, para reduzir uso de RAM e flash no dispositivo",
        en: "Custom asset pipeline: PNG sprite sheets converted to LVGL's binary format to cut RAM and flash usage on the device",
      },
    ],
    decisions: [
      {
        q: {
          pt: "Como testar a UI antes de a placa chegar?",
          en: "How do you test the UI before the board arrives?",
        },
        a: {
          pt: "Um segundo ambiente de build compila o mesmo código de apps e UI contra SDL2 no desktop; só display, touch, SD, WiFi e sensores são substituídos por shims. O resto roda idêntico ao que roda na placa.",
          en: "A second build environment compiles the same app and UI code against SDL2 on the desktop; only display, touch, SD, WiFi and sensors are replaced by shims. Everything else runs identically to what runs on the board.",
        },
      },
      {
        q: {
          pt: "Por que bit-bang no touch em vez do driver SPI padrão?",
          en: "Why bit-bang the touch instead of using the stock SPI driver?",
        },
        a: {
          pt: "O controlador de touch e o cartão SD disputam o mesmo barramento. Reescrever o touch em bit-banging manual dos pinos devolveu o SPI real ao SD, que sem isso parava de funcionar.",
          en: "The touch controller and the SD card contend for the same bus. Rewriting the touch as manual bit-banging of the pins gave the real SPI back to the SD card, which stopped working otherwise.",
        },
      },
    ],
    year: "2026",
  },
  {
    slug: "lp-compiler",
    name: {
      pt: "Compilador de linguagem própria",
      en: "Custom language compiler",
    },
    tagline: {
      pt: "Compilador em Java: lexer, parser recursivo-descendente, interpretador tree-walking e gerador de assembly NASM x86 32-bit",
      en: "Compiler in Java: lexer, recursive-descent parser, tree-walking interpreter and a NASM x86 32-bit assembly generator",
    },
    description: {
      pt: "Linguagem própria com sintaxe inspirada em Rust, implementada em Java: análise léxica, parser recursivo-descendente, AST e dois back-ends. O interpretador tree-walking cobre a linguagem inteira — variáveis tipadas com mutabilidade, funções recursivas com escopo léxico encadeado, structs com campos aninhados e if como expressão. O gerador de código emite NASM x86 de 32 bits, montado e executado dentro de um container, e cobre só o subconjunto inteiro: cada nó sem representação em assembly cru lança erro explícito em vez de fingir suporte. A gramática está formalizada em EBNF no repositório.",
      en: "My own language with Rust-inspired syntax, implemented in Java: lexical analysis, a recursive-descent parser, an AST and two back ends. The tree-walking interpreter covers the whole language — typed variables with mutability, recursive functions with chained lexical scope, structs with nested fields, and if as an expression. The code generator emits 32-bit NASM x86, assembled and run inside a container, and covers only the integer subset: every node with no representation in raw assembly raises an explicit error instead of faking support. The grammar is formalized in EBNF in the repository.",
    },
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
      {
        pt: "Dois back-ends sobre a mesma AST: interpretador tree-walking com a linguagem completa, e gerador de NASM x86 32-bit limitado ao subconjunto inteiro, com erro explícito em cada nó não suportado",
        en: "Two back ends over the same AST: a tree-walking interpreter with the full language, and a NASM x86 32-bit generator limited to the integer subset, with an explicit error at every unsupported node",
      },
      {
        pt: "Escopo léxico por cadeia de tabelas de símbolos: bloco só cria escopo filho quando é bloco explícito, preservando o escopo do chamador no corpo direto de função",
        en: "Lexical scope as a chain of symbol tables: a block only creates a child scope when it is an explicit block, which preserves the caller's scope in a function's direct body",
      },
      {
        pt: "Pipeline de baixo nível automatizado: gerar o .asm, montar com nasm, linkar com gcc -m32 -nostartfiles e executar o binário ELF32 dentro de um container Linux",
        en: "Automated low-level pipeline: emit the .asm, assemble with nasm, link with gcc -m32 -nostartfiles, and run the ELF32 binary inside a Linux container",
      },
      {
        pt: "Gramática formalizada em EBNF com diagrama sintático, evoluída em 38 commits com versionamento semântico",
        en: "Grammar formalized in EBNF with a syntax diagram, evolved over 38 commits under semantic versioning",
      },
      {
        pt: "Arquivos de casos cobrindo 19 cenários de erro de léxico, sintaxe e semântica — divisão por zero, reatribuição de variável imutável, tipo incompatível",
        en: "Case files covering 19 lexical, syntax and semantic error scenarios — division by zero, reassigning an immutable variable, type mismatch",
      },
    ],
    decisions: [
      {
        q: {
          pt: "Por que dois back-ends em vez de um?",
          en: "Why two back ends instead of one?",
        },
        a: {
          pt: "O interpretador cobre a linguagem inteira, inclusive string, ponto flutuante e struct. O gerador de assembly x86 puro não tem heap nem runtime de string, então em vez de emular o que não cabe, cada nó não suportado lança erro nomeado — o limite fica explícito no código, não escondido num comportamento errado.",
          en: "The interpreter covers the whole language, strings, floating point and structs included. The raw x86 assembly generator has no heap and no string runtime, so instead of emulating what does not fit, every unsupported node raises a named error — the limit is explicit in the code, not hidden behind wrong behavior.",
        },
      },
    ],
    year: "2026",
  },
  {
    slug: "usp-fono",
    name: {
      pt: "USP-Fono",
      en: "USP-Fono",
    },
    tagline: {
      pt: "Parceria com a USP — aplicação web para fonoaudiologia",
      en: "Partnership with USP — web application for speech-language pathology",
    },
    description: {
      pt: "Aplicação web em React e Vite para a área de fonoaudiologia, desenvolvida com a Universidade de São Paulo (USP). Está no ar, entregue a um cliente da área de saúde.",
      en: "React and Vite web application for speech-language pathology, built with Universidade de São Paulo (USP). It is live, delivered to a client in healthcare.",
    },
    category: "more",
    status: "deployed",
    isPrivate: true,
    stack: ["JavaScript", "React", "Vite", "Vercel"],
    demo: "https://usp-fono.vercel.app",
    cover: "/projects/usp-fono/cover.png",
    highlights: [
      {
        pt: "Parceria interuniversitária Insper × USP",
        en: "Cross-university partnership, Insper × USP",
      },
      {
        pt: "Cliente da área de saúde — fonoaudiologia",
        en: "Client in healthcare — speech-language pathology",
      },
    ],
    year: "2026",
  },
  {
    slug: "predictflow",
    name: {
      pt: "PredictFlow",
      en: "PredictFlow",
    },
    tagline: {
      pt: "Frontend Next.js 15 de um painel de pipeline de vendas: importação de CSV, dashboards Chart.js e alerta de negociação atrasada",
      en: "Next.js 15 frontend for a sales pipeline dashboard: CSV import, Chart.js dashboards and overdue-deal alerts",
    },
    description: {
      pt: "Sprint do 2º semestre, time de cinco: painel de pipeline de vendas que importa um CSV de negociações, classifica cada uma em cotado, execução ou negado, detecta atraso e dispara alerta por e-mail. O backend é FastAPI com MongoDB (Motor) e JWT, feito pelo time; o que é meu é o frontend — 29 dos 75 commits, o maior volume do repositório: autenticação, dashboard e as telas de pedido e de equipe.",
      en: "Second-semester sprint, a team of five: a sales pipeline dashboard that imports a CSV of deals, classifies each one as quoted, in execution or denied, detects when one runs late and fires an email alert. The backend is FastAPI with MongoDB (Motor) and JWT, built by the team; what is mine is the frontend — 29 of the 75 commits, the largest share in the repository: authentication, the dashboard, and the order and team screens.",
    },
    category: "more",
    status: "shipped",
    isPrivate: true,
    stack: [
      "Next.js 15",
      "React 19",
      "Tailwind CSS",
      "Chart.js",
      "JWT",
      "FastAPI",
      "MongoDB",
    ],
    // Sem `github` e sem `cover`: repositório privado da organização da
    // disciplina, sem deploy de pé para capturar. A stack lista a API porque ela
    // é o que o front consome — a autoria reivindicada aqui é só a do frontend.
    highlights: [
      {
        pt: "Maior contribuidor do frontend: 29 dos 75 commits (39%) — a API FastAPI/MongoDB é do time, não minha",
        en: "Top contributor on the frontend: 29 of the 75 commits (39%) — the FastAPI/MongoDB API is the team's, not mine",
      },
      {
        pt: "Fluxo de autenticação inteiro em Next.js 15 (Pages Router): login, registro e recuperação de senha, com o JWT guardado em cookie",
        en: "The whole auth flow in Next.js 15 (Pages Router): login, sign-up and password recovery, with the JWT kept in a cookie",
      },
      {
        pt: "Dashboard em Chart.js com indicador do percentual de negociações atrasadas",
        en: "Chart.js dashboard with an indicator for the percentage of overdue deals",
      },
      {
        pt: "Detalhe e timeline do pedido com filtros por cliente e por responsável, e página de equipe paginada separando usuários listados e não listados",
        en: "Order detail and timeline with filters by client and by owner, and a paginated team page separating listed from unlisted users",
      },
    ],
    year: "2025",
  },
  {
    slug: "soli",
    name: {
      pt: "Soli",
      en: "Soli",
    },
    tagline: {
      pt: "Aplicação social full-stack (JS + Python)",
      en: "Full-stack social application (JS + Python)",
    },
    description: {
      pt: "Frontend em JavaScript e backend em Python separados, com API REST entre os dois. O repositório aberto é o do frontend.",
      en: "Separate JavaScript frontend and Python backend, with a REST API between them. The public repository is the frontend one.",
    },
    category: "more",
    status: "shipped",
    stack: ["JavaScript", "Python", "REST API"],
    github: "https://github.com/souzxxx/soli-frontend",
    year: "2025",
  },
  {
    slug: "delivery-tracker",
    name: {
      pt: "Delivery Tracker",
      en: "Delivery Tracker",
    },
    tagline: {
      pt: "Rastreamento de entregas em tempo real",
      en: "Real-time delivery tracking",
    },
    description: {
      pt: "Backend em Python e frontend em JavaScript, com API REST entre os dois, para acompanhar o status de cada entrega enquanto ele muda.",
      en: "Python backend and JavaScript frontend, with a REST API between them, to follow each delivery's status as it changes.",
    },
    category: "more",
    status: "shipped",
    stack: ["Python", "JavaScript", "REST API"],
    github: "https://github.com/souzxxx/delivery-tracker-frontend",
    year: "2025",
  },
  {
    slug: "pokedex",
    name: {
      pt: "Pokédex",
      en: "Pokédex",
    },
    tagline: {
      pt: "Pokédex em React + TypeScript + Vite",
      en: "Pokédex in React + TypeScript + Vite",
    },
    description: {
      pt: "Pokédex em React 18 e TypeScript com Vite, consumindo a PokéAPI. Foco em tipagem estrita, tamanho de bundle e layout responsivo.",
      en: "Pokédex in React 18 and TypeScript with Vite, consuming the PokéAPI. Focused on strict typing, bundle size and responsive layout.",
    },
    category: "more",
    status: "shipped",
    stack: ["React", "TypeScript", "Vite", "PokéAPI"],
    github: "https://github.com/souzxxx/pokedex",
    year: "2026",
  },
  {
    slug: "md-project",
    name: {
      pt: "MD-Project",
      en: "MD-Project",
    },
    tagline: {
      pt: "Matemática Discreta em Prolog",
      en: "Discrete Mathematics in Prolog",
    },
    description: {
      pt: "Projeto acadêmico de matemática discreta em Prolog: o problema é escrito como fatos e regras, e a busca da solução fica com o interpretador, não com um algoritmo imperativo.",
      en: "Academic discrete mathematics project in Prolog: the problem is written as facts and rules, and the search for a solution is left to the interpreter rather than to an imperative algorithm.",
    },
    category: "more",
    status: "shipped",
    stack: ["Prolog", "Logic Programming"],
    github: "https://github.com/souzxxx/MD-Project",
    year: "2026",
  },
  {
    slug: "sistemas-hw",
    name: {
      pt: "Sistemas Hardware/Software",
      en: "Hardware/Software Systems",
    },
    tagline: {
      pt: "Projetos de baixo nível e arquitetura de computadores",
      en: "Low-level projects and computer architecture",
    },
    description: {
      pt: "Projetos da disciplina de Sistemas de Hardware/Software do BCC, em C e Assembly: arquitetura de computadores, processador e programação de baixo nível.",
      en: "Projects from the BCC Hardware/Software Systems course, in C and Assembly: computer architecture, the processor, and low-level programming.",
    },
    category: "more",
    status: "shipped",
    stack: ["C", "Assembly", "Computer Architecture"],
    github: "https://github.com/souzxxx/SistemasHardwareSoftwareBCC",
    year: "2026",
  },
  {
    slug: "pokemon-showdown",
    name: {
      pt: "Pokémon Showdown PS",
      en: "Pokémon Showdown PS",
    },
    tagline: {
      pt: "Sistema inspirado em Pokémon Showdown",
      en: "System inspired by Pokémon Showdown",
    },
    description: {
      pt: "Batalhas no estilo Pokémon Showdown, escritas em HTML e JavaScript — exercício de lógica de jogo e estruturas de dados.",
      en: "Pokémon Showdown-style battles, written in HTML and JavaScript — an exercise in game logic and data structures.",
    },
    category: "more",
    status: "shipped",
    stack: ["HTML", "JavaScript"],
    github: "https://github.com/souzxxx/pokemon-showdown-ps",
    year: "2026",
  },
];

export const stats = {
  // 49.071 partidas em ml-copa/data/raw/results.csv (49.072 linhas − cabeçalho).
  // Arredondado para baixo: o hero mostra "49k", nunca um número acima do real.
  matchesProcessed: 49,
  testFiles: 218,
  domainModules: 12,
  distributedServices: 4,
};

// ─── VISÃO ACHATADA ─────────────────────────────────────────────
//
// `projects` acima é a lista CRUA: cada campo de prosa é um `I18n`. Quem
// renderiza não deve ver isso. `getProjects(lang)` achata a estrutura no idioma
// pedido e devolve `LocalizedProject`, onde toda prosa já é `string` — o
// componente recebe texto e não precisa saber que existe um segundo idioma.
//
// A lista crua continua exportada porque scripts/check-assets.ts e
// scripts/check-links.ts a importam e leem SÓ campo não textual (`slug`,
// `cover`, `gallery[].src`, `video`, `github`, `demo`, `writeup`). Achatar para
// esses dois seria escolher um idioma sem motivo.

/** O mesmo projeto, já no idioma pedido: toda prosa virou `string`. */
export interface LocalizedProject {
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
  role?: string;
  year: string;
}

function achatar(project: Project, lang: Lang): LocalizedProject {
  return {
    ...project,
    name: pick(project.name, lang),
    role: project.role ? pick(project.role, lang) : undefined,
    tagline: pick(project.tagline, lang),
    description: pick(project.description, lang),
    gallery: project.gallery?.map((chapa) => ({
      src: chapa.src,
      label: pick(chapa.label, lang),
    })),
    highlights: project.highlights?.map((item) => pick(item, lang)),
    decisions: project.decisions?.map((decisao) => ({
      q: pick(decisao.q, lang),
      a: pick(decisao.a, lang),
    })),
  };
}

/** Todos os projetos, no idioma pedido e na ordem em que estão declarados. */
export function getProjects(lang: Lang): LocalizedProject[] {
  return projects.map((project) => achatar(project, lang));
}

/**
 * Só os "more" — o índice tabular do ProjectGrid. Quem consome "featured" é a
 * ORDER curada de FeaturedShowcase.tsx, não um filtro.
 */
export function getMoreProjects(lang: Lang): LocalizedProject[] {
  return getProjects(lang).filter((p) => p.category === "more");
}

// ─── ORDEM DE LEITURA ───────────────────────────────────────────
//
// A curadoria dos destaques. Era a constante ORDER dentro de
// components/projects/FeaturedShowcase.tsx; subiu para cá quando as páginas de
// case passaram a precisar dela para o "Próximo projeto". O aviso que morava lá
// continua valendo: projeto `featured` fora desta lista não renderiza na home.
export const FEATURED_ORDER = [
  "tecna-site",
  "financehub",
  "quintoandar-precificacao",
  "portal-tecna",
  "wraeclast",
  "commerce-nda",
  "sentinel",
] as const;

/**
 * Todos os projetos na ordem em que um visitante os percorre pelas páginas de
 * case: primeiro os destaques na ordem curada, depois os "more" na ordem em que
 * estão declarados. É a sequência do "Próximo projeto →", que dá a volta no fim.
 */
export function ordemDeLeitura(lang: Lang): LocalizedProject[] {
  const todos = getProjects(lang);
  const destaques = FEATURED_ORDER.map((slug) =>
    todos.find((p) => p.slug === slug),
  ).filter((p): p is LocalizedProject => Boolean(p));
  const vistos = new Set(destaques.map((p) => p.slug));
  return [...destaques, ...todos.filter((p) => !vistos.has(p.slug))];
}
