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

  os: {
    menu: {
      projetos: "Projetos",
      todos: "Ver todos os projetos ↓",
      disponivel: "Disponível para vagas",
      relogio: "Hora em São Paulo",
    },
    boot: { bemVindo: "Bem-vindo ao souzxxx", iniciando: "Iniciando o sistema…" },
    janelas: {
      leiame: "LEIA-ME.txt",
      terminal: "Terminal",
      render: "render.glsl",
      agora: "Agora",
      lixeira: "Lixeira",
      fechar: "Fechar",
      reabrir: "Abrir",
    },
    icones: {
      rotulo: "Mesa",
      projetos: "Projetos",
      tecna: "TECNA",
      financehub: "FinanceHub",
      quintoandar: "QuintoAndar",
      curriculo: "Currículo.pdf",
      contato: "Contato",
      github: "GitHub",
      lixeira: "Lixeira",
    },
    agora: [
      { rotulo: "No ar", valor: "Site comercial da TECNA" },
      { rotulo: "Construindo", valor: "Portal TECNA · apps internos" },
      { rotulo: "Estudando", valor: "Insper · BCC · 5º semestre" },
    ],
    lixeira: [
      "bugs-de-producao.log — 0 KB",
      "senhas-no-codigo.env — esvaziado",
      "todo-depois.txt — esvaziado",
    ],
    terminal: {
      rotulo: "Comando do terminal",
      dica: "digite help e aperte enter",
      ajuda: [
        ["whoami", "quem é o Leonardo"],
        ["projetos", "lista os projetos, com link para cada case"],
        ["open <projeto>", "abre o case (ex.: open tecna)"],
        ["sobre", "o resumo em uma frase"],
        ["contato", "e-mail, GitHub e LinkedIn"],
        ["cv", "baixa o currículo em PDF"],
        ["clear", "limpa a tela"],
      ],
      whoami:
        "leonardo souza — backend, web & ia · ciência da computação no insper (5º sem) · são paulo",
      sobre:
        "Construo sistemas que se sustentam em produção: APIs, filas com retry e idempotência, LLM sobre dados reais e front-end Next.js com usuário de verdade.",
      naoEncontrado: "comando não encontrado:",
      abrindo: "abrindo",
      sudo: "Permissão concedida. Abrindo um e-mail para contratar o Leonardo…",
      rm: "Permissão negada. Boa tentativa.",
      projetos: "projetos/",
      limpo: "",
    },
    rolar: "Role para ver os projetos",
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

  contato: {
    atividade: {
      eyebrow: "GITHUB · SOUZXXX",
      titulo: "Um ano em blocos",
      totalSufixo: "contribuições nos últimos 12 meses",
      aria: "Mapa de contribuições no GitHub",
      menos: "Menos",
      mais: "Mais",
      maiorSequencia: "Maior sequência",
      melhorDia: "Melhor dia",
      diasAtivos: "Dias ativos",
      dias: "dias",
      de: "de",
      contribuicao: ["contribuição", "contribuições"],
      leituraVazia: "Passe o cursor sobre um bloco",
      perfil: "Ver no GitHub ↗",
      locale: "pt-BR",
    },
    formacao: {
      janela: "Copiando…",
      copiando: "Copiando conhecimento…",
      origem: "Insper · Ciência da Computação",
      destino: "souzxxx",
      semestre: "Semestre",
      de: "de",
      restante: "Restam {n} semestres",
      concluido: "Concluído",
      emCurso: "Em curso",
      naFila: "Na fila",
    },
    stack: {
      janela: "Sobre este computador",
      sistema: "souzxxx OS",
      versao: "Versão 2026 · São Paulo",
      // A brincadeira e a do "Sobre este Mac", mas cada valor e verdade: o que
      // ele processa, quanto curso ja tem na memoria e de onde ele inicia.
      ficha: [
        ["Processador", "Backend · web · IA"],
        ["Memória", "5º semestre de BCC no Insper"],
        ["Disco de inicialização", "São Paulo, BR"],
      ],
      armazenamento: "Armazenamento",
      ferramentas: "ferramentas",
    },
    fim: {
      eyebrow: "#06 · CONTATO",
      cta: "Vamos conversar",
      disponivel: "Disponível para vagas",
      cidade: "São Paulo",
      // A versao curta do paragrafo de `sobre.prosa`: o que nao pode cair e
      // curso, semestre, cidade e as tres frentes. O detalhe de cada sistema
      // ja esta nos cards de projeto, logo acima.
      prosa: [
        "Sou ",
        { em: "Leonardo Souza" },
        ", estudante de Ciência da Computação no ",
        { em: "Insper" },
        " (5º semestre), em São Paulo. Trabalho com backend, web e IA aplicada: fila outbox com idempotência, busca vetorial com pgvector e front-end Next.js em sistema com usuário real. Prefiro ",
        { em: "medir a supor" },
        ".",
      ],
      copiar: "Copiar",
      copiado: "Copiado",
      copiarAria: "Copiar e-mail",
    },
    rodape: {
      linha: ["Feito com Next.js", "deploy na Vercel"],
      topo: "Voltar ao topo ↑",
    },
  },

  vitrine: {
    destaques: {
      caminho: "~/projetos/selecionados",
      secao: "#02",
      titulo: "Trabalho selecionado",
      descricao:
        "As pastas que eu abriria primeiro numa conversa técnica: produto com usuário real, IA em produção, backend que se defende sozinho. Cada uma leva ao case completo, com decisões, arquitetura e capturas.",
    },
    indice: {
      caminho: "~/projetos/indice",
      secao: "#03",
      titulo: "Mais projetos",
      descricao:
        "O resto da gaveta: linguagens, paradigmas e domínios — de Prolog a Python, de compilador a firmware embarcado. Cada linha abre o case.",
    },
    itens: "{n} ITENS",
    numero: "Nº",
    abrirCase: "Abrir case →",
    verNoAr: "Ver no ar ↗",
    espiar: "ABRIR →",
    captura: "captura de tela",
    listaDestaques: "Projetos em destaque",
    listaIndice: "Índice de projetos",
  },

  caso: {
    trilha: { rotulo: "Trilha", os: "souzxxx OS", projetos: "Projetos" },
    numero: "Nº",
    de: "de",
    destaque: "Destaque",
    indice: "Índice",
    rotulos: {
      ano: "Ano",
      status: "Status",
      papel: "Papel",
      stack: "Stack",
      repo: "Repositório",
      noAr: "No ar",
    },
    privado: "Privado",
    publico: "Público",
    verNoAr: "Ver no ar ↗",
    codigo: "Código ↗",
    secoes: {
      projeto: "O projeto",
      feito: "O que foi feito",
      decisoes: "Decisões",
      capturas: "Capturas",
      stack: "Stack",
    },
    ficha: "Informações",
    decisao: "Decisão",
    ok: "OK",
    pergunta: "Pergunta",
    resposta: "Resposta",
    capturas: { uma: "captura", varias: "capturas" },
    ampliar: "Clique para ampliar",
    capaGerada: "Sem captura pública — capa gerada",
    proximo: "Próximo projeto",
    proximoAria: "Próximo projeto:",
    outraLingua: { sigla: "EN", aria: "EN — ler este case em inglês" },
  },
};
