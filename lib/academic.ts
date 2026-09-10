export interface Semester {
  number: number;
  label: string;
  highlights: { name: string; description: string }[];
}

export const semesters: Semester[] = [
  {
    number: 1,
    label: "1º Semestre",
    highlights: [
      { name: "Insper Intro", description: "Fundamentos de programação e lógica" },
      { name: "Aulas Base", description: "Matemática, algoritmos, estruturas iniciais" },
      {
        name: "Sprint",
        description:
          "Rede social em Django 5 + PostgreSQL com login Google; comentários, curtidas, denúncias e perfil",
      },
    ],
  },
  {
    number: 2,
    label: "2º Semestre",
    highlights: [
      {
        name: "Bits e Processadores",
        description: "Arquitetura de computadores, ALU, datapath, montagem",
      },
      {
        name: "PhishingApp",
        description: "Aplicação de segurança / detecção de phishing",
      },
      {
        name: "Programação Eficaz",
        description: "POO, padrões de design, qualidade de código",
      },
      {
        name: "Sprint",
        description:
          "PredictFlow: painel de pipeline de vendas em Next.js sobre API FastAPI/MongoDB; autenticação JWT e dashboards",
      },
    ],
  },
  {
    number: 3,
    label: "3º Semestre",
    highlights: [
      {
        name: "ARQOBJ",
        description: "Arquitetura orientada a objetos avançada",
      },
      {
        name: "Álgebra Linear",
        description: "Fundamentos matemáticos para computação gráfica e ML",
      },
      {
        name: "Discreta",
        description: "Matemática discreta — implementação em Prolog (MD-Project)",
      },
      {
        name: "Inteligência Artificial",
        description:
          "Q-Learning, SARSA, agentes (NQueens, Frozen Lake, agentes para SPFC)",
      },
      {
        name: "SPRINT",
        description:
          "Gestão de núcleos CCA em Spring Boot/Java 21 + React; módulos de inscrição e fila de espera",
      },
    ],
  },
  {
    number: 4,
    label: "4º Semestre",
    highlights: [
      {
        name: "Projeto de Software",
        description:
          "Arquitetura de microsserviços com Docker (Java Gateway + Python User Service + JS Front)",
      },
      {
        name: "Machine Learning",
        description: "Modelagem supervisionada, validação e produção de modelos",
      },
      {
        name: "Linguagens & Paradigmas",
        description: "Estudo formal de paradigmas além de imperativo/OO",
      },
      {
        name: "Sistemas Hardware/Software",
        description: "Interface OS, syscalls, programação de baixo nível",
      },
      {
        name: "Sprint",
        description:
          "Precificação de imóveis com QuintoAndar: API FastAPI + Gradient Boosting em produção na AWS, CI/CD e 36 testes",
      },
    ],
  },
  {
    number: 5,
    label: "5º Semestre (atual)",
    highlights: [
      {
        name: "Plataformas, Microsserviços e APIs",
        description:
          "Design de APIs, comunicação entre serviços, plataformas escaláveis",
      },
      {
        name: "Startup em Inteligência Artificial",
        description:
          "Produto de IA do zero: validação, LLMs aplicados, go-to-market",
      },
      {
        name: "Megadados",
        description:
          "Dados em larga escala: modelagem, pipelines e consultas distribuídas",
      },
      {
        name: "Análise de Algoritmos e Entrevistas Técnicas",
        description:
          "Complexidade, estruturas de dados e resolução de problemas sob pressão",
      },
      {
        name: "Jogos e Interação",
        description:
          "Loops de jogo, interação em tempo real e experiência do usuário",
      },
    ],
  },
];
