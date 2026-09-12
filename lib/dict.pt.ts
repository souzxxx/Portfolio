import type { Dict } from "./dict";

/**
 * pt — o texto do site em portugues, a lingua da rota "/".
 *
 * O QUE ESTE ARQUIVO E: a mesma copy que hoje esta cravada dentro dos
 * componentes, extraida para um lugar so. Nada aqui foi inventado — cada string
 * saiu de um <Hero>, <SectionHeader>, <About>, <Footer> ou do metadata do
 * layout, e os numeros, nomes de tecnologia e afirmacoes de autoria viajaram
 * intactos. O que mudou foi TOM, em cinco frases que o proprio dono do site
 * apontou como mal escritas (a de abertura do <About> e a descricao do indice
 * entre elas); a lista completa esta no commit.
 *
 * O TIPO E QUEM COBRA A PARIDADE. `const pt: Dict` e `const en: Dict` obrigam
 * as duas linguas a terem exatamente as mesmas chaves: rotulo esquecido vira
 * erro de build, e nao um "Baixar curriculo" sobrando na pagina em ingles.
 *
 * CAIXA ALTA MORA AQUI, e nao no CSS, para os rotulos de metadado. <Meta> e
 * <Label> ja aplicam `uppercase`, mas o dialeto do site (BUILD nnn, STATUS: NO
 * AR, STACK:, REPO: PRIVADO, DESDE 2026) e vocabulario, nao estilo: escrito em
 * caixa alta na fonte, ele continua legivel em `copy` de texto, no leitor de
 * tela que fala o conteudo e em qualquer lugar que nao carregue o CSS do site.
 */
export const pt: Dict = {
  meta: {
    title: "Leonardo Souza — Backend, Web & IA",
    description:
      "Backend, web e IA aplicada em produção: assistente LLM sobre dados do usuário, busca vetorial em Postgres com pgvector, fila outbox com retry e idempotência, rate limit em Redis com circuit breaker e front-end Next.js em sistema com usuário real. Ciência da Computação no Insper, São Paulo.",
    shortDescription:
      "Backend, web e IA aplicada em produção. Ciência da Computação no Insper, São Paulo.",
    jobTitle: "Engenheiro de software — backend, web e IA",
    cvTitle: "Leonardo Souza — Currículo",
    cvDescription:
      "Currículo de uma página: backend, web e IA aplicada em produção. Ciência da Computação no Insper, São Paulo.",
    // ARTE DO OPEN GRAPH. A linha de stack perdeu o "São Paulo" do fim (ele já
    // abre o quadro, na primeira faixa) e ganhou Node.js no lugar — o runtime
    // estava faltando na vitrine e é o que sustenta metade do que vem depois
    // dele na lista. A troca deixa a linha MAIS curta que a anterior (76 contra
    // 78 caracteres), o que importa: satori não reflui texto, então uma linha
    // longa demais aqui sai cortada no preview sem nenhum erro de build.
    ogSelo: "Portfólio · São Paulo, BR · 2026",
    ogStack:
      "Java · Spring Boot · Node.js · Python · TypeScript · Next.js · IA em produção",
    ogAlt: "Leonardo Souza — Backend, Web & IA",
  },

  nav: {
    principal: "Principal",
    atalhos: "Atalhos",
    // Os href sao ancoras da propria pagina e NAO mudam de idioma: "/en" ja
    // renderiza as mesmas secoes com os mesmos id. Traduzir "#projects" para
    // "#projetos" quebraria todo link externo que alguem tenha salvo.
    links: [
      { href: "#projects", label: "Projetos" },
      { href: "#academic", label: "Formação" },
      { href: "#stack", label: "Stack" },
      { href: "#about", label: "Contato" },
    ],
    contatoCurto: "Contato ↗",
    voltarAoTopo: "Voltar ao topo",
    idioma: "Idioma",
    // O seletor mostra so as duas siglas (PT · EN). A sigla sozinha nao diz ao
    // leitor de tela para onde o link leva, entao o aria-label diz — e diz na
    // lingua da pagina atual, que e a que o leitor esta pronunciando.
    trocarIdioma: "Ver em inglês",
    idiomaAtual: "Português (idioma atual)",
  },

  hero: {
    selo: ["SÃO PAULO, BR", "DISPONÍVEL PARA VAGAS", "BACKEND, WEB & IA"],
    // Quebra decidida, nunca herdada do wrap: sao dois <span class="block">.
    nome: ["Leonardo", "Souza"],
    subtitulo: "Backend, Web & IA",
    formacao: ["CIÊNCIA DA COMPUTAÇÃO", "INSPER", "5º SEMESTRE", "SÃO PAULO"],
    // Quatro enfases, na mesma ordem em que o paragrafo as apresenta: o
    // assistente, a busca vetorial, a fila e o front-end. A pontuacao viaja nos
    // trechos SEM enfase — a virgula depois do assistente, o " e " antes do
    // front-end, o ponto final —, entao concatenar a lista devolve o paragrafo
    // corrido, com os espacos no lugar. Quem editar aqui edita a pontuacao
    // junto; nao existe separador implicito.
    prosa: [
      "Construo backend, web e IA que rodam em produção: ",
      { em: "assistente LLM sobre os dados do próprio usuário" },
      ", ",
      { em: "busca vetorial com pgvector" },
      " para respostas ancoradas no contexto recuperado, ",
      { em: "outbox com retry exponencial e idempotência" },
      " e ",
      { em: "front-end Next.js em sistema com usuário real" },
      ". Three.js e GLSL entram quando o problema é de visualização — não antes.",
    ],
    cta: {
      projetos: "Ver projetos ↓",
      github: "GitHub ↗",
      linkedin: "LinkedIn ↗",
      email: "Email ↗",
      curriculo: "Currículo ↓",
    },
    // Os rotulos ficam aqui; os NUMEROS continuam em lib/projects.ts (`stats`),
    // que e onde eles sao medidos. Um numero nao tem idioma.
    stats: {
      partidas: "partidas no pipeline de ML",
      testes: "arquivos de teste",
      modulos: "módulos de domínio",
      servicos: "serviços distribuídos",
    },
    terminal: {
      rotulo: "CV",
      copiar: "COPIAR",
      copiado: "COPIADO",
    },
  },

  secoes: {
    destaques: {
      eyebrow: "#02 · TRABALHO SELECIONADO",
      title: "Projetos selecionados",
      description:
        "Recorte do que sustenta uma conversa técnica: produto de IA em produção, busca vetorial com pgvector, e-commerce transacional com outbox e idempotência, e web com usuário real. Os links externos desta seção passam por verificação automática semanal.",
    },
    indice: {
      eyebrow: "#03 · ÍNDICE",
      title: "Mais projetos",
      description:
        "O que construí explorando linguagens, paradigmas e domínios — de Prolog a Python, de compilador a firmware embarcado, de jogos a automação de processos.",
    },
    academico: {
      eyebrow: "#04 · FORMAÇÃO",
      title: "Insper · BCC",
      description:
        "Bacharelado em Ciência da Computação. Cinco semestres, da matemática discreta a sistemas distribuídos, IA aplicada, dados em larga escala e arquitetura de baixo nível.",
    },
    stack: {
      eyebrow: "#05 · FERRAMENTAL",
      title: "Tecnologias que uso",
      // A descricao anuncia a ORDEM das colunas da tabela logo abaixo
      // (linguagens → front-end → back-end → ML → infra), que e o que o leitor
      // vai encontrar. A frase anterior prometia escolher "a ferramenta certa,
      // não a moda" — uma afirmacao que a tabela nao prova.
      description:
        "Linguagens, front-end, back-end, ML e infra — do que eu escrevo até onde aquilo roda.",
    },
  },

  card: {
    // Rotulos de metadado que o componente concatena com o dado: `BUILD 001`,
    // `ANO 2026`, `DECISÃO 02`, `STACK: …`. Os dois-pontos fazem parte do
    // rotulo, como em `STATUS:` e `REPO:`.
    build: "BUILD",
    ano: "ANO",
    repoPrivado: "REPO: PRIVADO",
    repositorioPrivado: "REPOSITÓRIO PRIVADO",
    decisao: "DECISÃO",
    stack: "STACK:",
    verNoAr: "VER NO AR ↗",
    codigo: "CÓDIGO ↗",
    arquitetura: "ARQUITETURA & DECISÕES ↗",
    capturaDeTela: "captura de tela",
  },

  lupa: {
    // A afordancia e uma palavra em caixa alta ao lado da legenda, no mesmo
    // dialeto de metadado do resto da chapa — nao um icone de lupa e nao um
    // retangulo de CTA, que prometeria navegacao. Sem seta: ↗ e ↓ ja significam
    // "sai do site" e "baixa arquivo" neste vocabulario, e ampliar nao faz
    // nenhum dos dois.
    ampliar: "AMPLIAR",
    // Prefixo: o componente completa com a legenda da chapa ("Ampliar: Luna —
    // assistente IA financeira conversacional"). Sozinho, "Ampliar" repetido em
    // quatro botoes da mesma folha de contato nao diz qual imagem abre.
    ampliarAria: "Ampliar:",
    titulo: "Imagem ampliada",
    fechar: "Fechar",
    anterior: "Imagem anterior",
    proxima: "Próxima imagem",
    // O contador aparece como "02 / 04" na tela; em aria a barra vira palavra,
    // porque leitor de tela le "/" como "barra" ou simplesmente pula.
    de: "de",
  },

  status: {
    deployed: "NO AR",
    shipped: "ENTREGUE",
    wip: "EM CURSO",
    prefixo: "STATUS:",
  },

  categorias: {
    language: "LINGUAGENS",
    frontend: "FRONT-END",
    backend: "BACK-END",
    ml: "ML",
    infra: "INFRA",
  },

  sobre: {
    selo: ["#06 · CONTATO", "SÃO PAULO, BR", "DESDE 2026"],
    titulo: "Vamos construir algo que se sustenta em produção.",
    // Tres enfases: o nome, a instituicao e a unica frase de metodo do
    // paragrafo. Mesma regra de pontuacao do hero — ela mora nos trechos sem
    // enfase, e concatenar devolve o paragrafo inteiro.
    prosa: [
      "Sou ",
      { em: "Leonardo Souza" },
      ", estudante de Ciência da Computação no ",
      { em: "Insper" },
      " (5º semestre), em São Paulo. Trabalho nas três frentes: backend, web e IA aplicada. No backend, fila outbox com retry exponencial e chave de idempotência, rate limit em Redis com circuit breaker que falha aberto e webhooks de pagamento validados por assinatura. Na web, front-end Next.js e TypeScript em sistema com usuário real — inclusive um módulo que gera um documento que o cliente final lê como parte do contrato. Em IA, assistente LLM sobre os dados do usuário autenticado e busca vetorial em Postgres com pgvector, onde a resposta é ancorada no que foi recuperado, sem fine-tuning. Prefiro ",
      { em: "medir a supor" },
      " — e prefiro o sistema que se defende sozinho ao que só funciona no caminho feliz.",
    ],
    // Rotulo da linha; o VALOR (o endereço, o usuario do GitHub) e o mesmo nos
    // dois idiomas e por isso continua no componente.
    contatos: {
      email: "E-mail",
      github: "GitHub",
      linkedin: "LinkedIn",
    },
    cta: "Baixar currículo ↓",
  },

  rodape: {
    email: "Email",
    tecnica: [
      "Next.js 14 (App Router)",
      "conteúdo tipado em lib/",
      "deploy na Vercel",
      "São Paulo",
    ],
  },
};
