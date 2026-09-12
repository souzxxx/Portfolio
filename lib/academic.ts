import { pick, type I18n, type Lang } from "./i18n";

/**
 * A linha do tempo do curso. Só a PROSA é bilíngue.
 *
 * `number` fica de fora do `I18n` de propósito: o semestre é o mesmo número nos
 * dois idiomas, e duplicá-lo criaria um lugar onde as duas línguas podem
 * discordar sobre em que semestre a pessoa está. O que muda é o ORDINAL, e ele
 * viaja dentro do `label` ("3º Semestre" / "3rd Semester") — reconstruí-lo no
 * componente exigiria uma tabela de sufixo por idioma (º / st-nd-rd-th) só para
 * pintar cinco rótulos.
 *
 * NOME PRÓPRIO NÃO TRADUZ, esteja ele no `name` ou dentro da descrição: nome
 * de projeto (PhishingApp, PredictFlow, MD-Project, NQueens, Frozen Lake), de
 * instituição, empresa ou entidade (Insper, QuintoAndar, SPFC, CCA) e a sigla
 * de disciplina do Insper (ARQOBJ) saem idênticos nos dois idiomas. Nome de
 * DISCIPLINA traduz pelo sentido: quem lê em inglês precisa saber que
 * "Megadados" é Big Data, não decorar o rótulo do boletim.
 */
export interface Semester {
  number: number;
  label: I18n;
  highlights: { name: I18n; description: I18n }[];
}

/** O mesmo semestre já achatado num idioma — o que o componente recebe. */
export interface LocalizedSemester {
  number: number;
  label: string;
  highlights: { name: string; description: string }[];
}

const SEMESTRES: Semester[] = [
  {
    number: 1,
    label: { pt: "1º Semestre", en: "1st Semester" },
    highlights: [
      {
        name: { pt: "Insper Intro", en: "Insper Intro" },
        description: {
          pt: "Fundamentos de programação e lógica",
          en: "Programming and logic fundamentals",
        },
      },
      {
        name: { pt: "Aulas Base", en: "Core Courses" },
        description: {
          pt: "Matemática, algoritmos e estruturas iniciais",
          en: "Math, algorithms and basic data structures",
        },
      },
      {
        name: { pt: "Sprint", en: "Sprint" },
        description: {
          pt: "Rede social em Django 5 + PostgreSQL com login Google; comentários, curtidas, denúncias e perfil",
          en: "Social network in Django 5 + PostgreSQL with Google sign-in; comments, likes, content reporting and profile",
        },
      },
    ],
  },
  {
    number: 2,
    label: { pt: "2º Semestre", en: "2nd Semester" },
    highlights: [
      {
        name: { pt: "Bits e Processadores", en: "Bits and Processors" },
        description: {
          pt: "Arquitetura de computadores: ALU, datapath e linguagem de montagem",
          en: "Computer architecture: ALU, datapath and assembly language",
        },
      },
      {
        name: { pt: "PhishingApp", en: "PhishingApp" },
        description: {
          pt: "Aplicação de segurança para detecção de phishing",
          en: "Security application for phishing detection",
        },
      },
      {
        name: { pt: "Programação Eficaz", en: "Effective Programming" },
        description: {
          pt: "POO, padrões de projeto e qualidade de código",
          en: "OOP, design patterns and code quality",
        },
      },
      {
        name: { pt: "Sprint", en: "Sprint" },
        description: {
          pt: "PredictFlow: painel de pipeline de vendas em Next.js sobre API FastAPI/MongoDB; autenticação JWT e dashboards",
          en: "PredictFlow: sales pipeline front end in Next.js over a FastAPI/MongoDB API; JWT authentication and dashboards",
        },
      },
    ],
  },
  {
    number: 3,
    label: { pt: "3º Semestre", en: "3rd Semester" },
    highlights: [
      {
        name: { pt: "ARQOBJ", en: "ARQOBJ" },
        description: {
          pt: "Arquitetura orientada a objetos avançada",
          en: "Advanced object-oriented architecture",
        },
      },
      {
        name: { pt: "Álgebra Linear", en: "Linear Algebra" },
        description: {
          pt: "Fundamentos matemáticos para computação gráfica e ML",
          en: "Mathematical foundations for computer graphics and ML",
        },
      },
      {
        name: { pt: "Discreta", en: "Discrete Math" },
        description: {
          pt: "Matemática discreta — implementação em Prolog (MD-Project)",
          en: "Discrete mathematics — implemented in Prolog (MD-Project)",
        },
      },
      {
        name: { pt: "Inteligência Artificial", en: "Artificial Intelligence" },
        description: {
          pt: "Q-Learning, SARSA e agentes para NQueens, Frozen Lake e SPFC",
          en: "Q-Learning, SARSA and agents for NQueens, Frozen Lake and SPFC",
        },
      },
      {
        name: { pt: "SPRINT", en: "SPRINT" },
        description: {
          pt: "Gestão de núcleos CCA em Spring Boot/Java 21 + React; módulos de inscrição e fila de espera",
          en: "CCA student group management in Spring Boot/Java 21 + React; enrollment and waitlist modules",
        },
      },
    ],
  },
  {
    number: 4,
    label: { pt: "4º Semestre", en: "4th Semester" },
    highlights: [
      {
        name: { pt: "Projeto de Software", en: "Software Design" },
        description: {
          pt: "Arquitetura de microsserviços com Docker (Java Gateway + Python User Service + JS Front)",
          en: "Microservice architecture with Docker (Java Gateway + Python User Service + JS Front)",
        },
      },
      {
        name: { pt: "Machine Learning", en: "Machine Learning" },
        description: {
          pt: "Modelagem supervisionada, validação e modelos em produção",
          en: "Supervised modeling, validation and models in production",
        },
      },
      {
        name: { pt: "Linguagens & Paradigmas", en: "Languages & Paradigms" },
        description: {
          pt: "Estudo formal de paradigmas além do imperativo e da orientação a objetos",
          en: "Formal study of paradigms beyond imperative and object-oriented",
        },
      },
      {
        name: { pt: "Sistemas Hardware/Software", en: "Hardware/Software Systems" },
        description: {
          pt: "Interface com o sistema operacional, syscalls e programação de baixo nível",
          en: "Operating system interface, syscalls and low-level programming",
        },
      },
      {
        name: { pt: "Sprint", en: "Sprint" },
        description: {
          pt: "Precificação de imóveis com QuintoAndar: API FastAPI + Gradient Boosting em produção na AWS, CI/CD e 36 testes",
          en: "Real estate pricing with QuintoAndar: API in FastAPI + Gradient Boosting in production on AWS, CI/CD and 36 tests",
        },
      },
    ],
  },
  {
    number: 5,
    label: { pt: "5º Semestre (atual)", en: "5th Semester (current)" },
    highlights: [
      {
        name: {
          pt: "Plataformas, Microsserviços e APIs",
          en: "Platforms, Microservices and APIs",
        },
        description: {
          pt: "Design de APIs, comunicação entre serviços, plataformas escaláveis",
          en: "API design, service-to-service communication, scalable platforms",
        },
      },
      {
        name: { pt: "Startup em Inteligência Artificial", en: "AI Startup" },
        description: {
          pt: "Produto de IA do zero: validação, LLMs aplicados e entrada no mercado",
          en: "AI product from scratch: validation, applied LLMs and go-to-market",
        },
      },
      {
        name: { pt: "Megadados", en: "Big Data" },
        description: {
          pt: "Dados em larga escala: modelagem, pipelines e consultas distribuídas",
          en: "Large-scale data: modeling, pipelines and distributed queries",
        },
      },
      {
        name: {
          pt: "Análise de Algoritmos e Entrevistas Técnicas",
          en: "Algorithm Analysis and Technical Interviews",
        },
        description: {
          pt: "Complexidade, estruturas de dados e resolução de problemas sob pressão",
          en: "Complexity, data structures and problem solving under pressure",
        },
      },
      {
        name: { pt: "Jogos e Interação", en: "Games and Interaction" },
        description: {
          pt: "Loops de jogo, interação em tempo real e experiência do usuário",
          en: "Game loops, real-time interaction and user experience",
        },
      },
    ],
  },
];

/** Achata a linha do tempo no idioma pedido, na ordem em que ela é exibida. */
export function getSemestres(lang: Lang): LocalizedSemester[] {
  return SEMESTRES.map((sem) => ({
    number: sem.number,
    label: pick(sem.label, lang),
    highlights: sem.highlights.map((item) => ({
      name: pick(item.name, lang),
      description: pick(item.description, lang),
    })),
  }));
}
