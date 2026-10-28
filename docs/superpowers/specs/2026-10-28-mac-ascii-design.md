# Mac em ASCII na mesa, janelas em escadinha e pet que se teletransporta

Data: 28/out/2026 · Branch sugerida: `feat/mac-ascii`

Arquivos de referência ao lado deste:
- `2026-10-28-mac-ascii-prototipo.html`: os três protótipos mostrados ao Leonardo.
  **Ele escolheu o C ("Mosaico vivo", função `cenaMosaico`).** O A e o B
  ficaram de fora. Abra o arquivo direto no navegador.
- `2026-10-28-mac-ascii-print-referencia.png`: o print do Leonardo com as janelas
  na disposição que ele quer. Ele arrumou à mão, arrastando o TERMINAL e o
  AGORA para baixo.

## 1. Por que

O Leonardo viu o daoho.dev, um lago de carpas desenhado em ASCII atrás do texto,
e quer essa sensação na mesa do souzxxx OS, com um Macintosh no lugar das carpas.
Ao mesmo tempo, quer resolver duas coisas que o incomodam no hero:

1. As três janelas da direita (RENDER.GLSL, TERMINAL e AGORA) "aparecem
   amontoadas". Em quase toda tela, o TERMINAL cobre a parte de baixo do RENDER.
2. O pet (o Mac 3D do canto) aparece já no hero. Agora o hero vai ter um Mac
   gigante no fundo, e dois Macs ao mesmo tempo disputam atenção.

A ideia que amarra tudo: **o Mac gigante mora na mesa. Quando a mesa some atrás
do SOUZXXX, ele "se teletransporta" e vira o pet do canto.** Na home, nunca
aparecem os dois Macs ao mesmo tempo.

O padrão de qualidade é o mesmo do pet: "vivo e fluido". O Leonardo julga pelo
que vê no navegador, então cada parte precisa de prints ou de um GIF antes de
ser dada como pronta.

## 2. O que muda (resumo)

| Parte | Hoje | Depois |
|---|---|---|
| Fundo da mesa | Pontilhado 1-bit estático | O mesmo pontilhado, com um Mac gigante em ASCII vivo por cima dele e atrás das janelas |
| Janelas da direita | Posições fixas; o TERMINAL sobe 64 px sobre o RENDER | Escadinha sem sobreposição, como no print |
| Pet na home | Visível desde o hero | Some no hero; entra com teletransporte quando o SOUZXXX chega ao topo e sai do mesmo jeito ao rolar de volta |
| Pet nas outras páginas | Visível | **Sem mudança** |
| Celular / tela < 1024 px | Sem pet; janelas em coluna | **Sem mudança.** O Mac ASCII também não aparece |

## 3. O Mac em ASCII (versão C do protótipo)

### 3.1 Aparência

Siga a `cenaMosaico` do protótipo. É ela que foi aprovada. Em resumo:

- **Grade de células** de 9×11 px CSS sobre a mesa inteira. Cada célula pode ter
  um preenchimento (retângulo creme com alfa baixo, com 1 px de folga, que deixa
  a grade aparecer, como no daoho) e um caractere por cima.
- **Cores:** só creme `#F5F3EE` sobre o carvão da mesa, com alfas variados. O
  dourado `#D4A017` aparece em um único detalhe, o selinho `*` no canto do
  gabinete. A regra do site vale: dourado só sobre carvão.
- **Silhueta em 3/4:** frente, lateral direita e tampo. Proporção e regiões
  como na função `classe(u, v, lado)` do protótipo:
  - frente: textura de caracteres `.:+xX%` escolhidos por ruído que **escorre**
    com o tempo (a "escama" das carpas), um pouco mais clara à esquerda;
  - lateral: hachura `/` em xadrez, ecoando a hachura do pet e da gravura GLSL;
  - tampo: `-` e `=`;
  - contorno: `#` onde a silhueta encontra o vazio e nas arestas
    frente/lateral e frente/tampo;
  - moldura da tela: células mais claras, com `+` na borda de dentro;
  - tela: escura, com `.` esparsos e uma linha de varredura `-` que desce;
  - fenda do disquete: `_`; pé: `=`; sombra no chão: elipse de `.`.
- **Rosto** numa grade de 16×12 "pixels" de tela (a função `acesa` do
  protótipo). Pixel aceso = célula creme sólida, sem caractere. Expressões:
  `normal` (olhos 2×2 e sorriso), `piscando`, `atento` (olhos 3×3, quando o
  mouse chega perto do Mac) e `surpreso` (olhos 3×3 e boca em "o", depois de um
  clique perto dele). É o mesmo vocabulário do pet. Não invente rostos novos.
- **Tamanho:** cerca de 78% da altura da mesa, como no protótipo. Grande e
  parcialmente escondido atrás das janelas: essa é a graça.

### 3.2 Comportamento

Tudo como no protótipo C:

- **Sempre vivo:** respira (a escala vertical oscila ~1,8%), balança de leve
  (inclinação), a textura escorre e ele pisca a cada 2–5 s.
- **Mouse:** os olhos seguem o cursor em degraus inteiros (±2 px de tela na
  horizontal, ±1 na vertical). A lateral fica mais estreita ou mais larga
  conforme o mouse (uma paralaxe pequena). Mouse perto do Mac deixa os olhos
  `atento`.
- **Ondas:** o movimento do mouse sobre a mesa abre anéis em ASCII (`- \ | /`,
  escolhidos pela tangente), um a cada ~50 px de deslocamento. O clique abre um
  anel forte. São dois anéis concêntricos que crescem e somem em ~2,3 s.
- **Clique na mesa vazia:** o Mac dá um pulo com amassa-e-estica no pouso. Se o
  clique foi perto dele, a cara fica `surpreso`.
- **Sem mouse** (toque numa tela ≥ 1024 px, ou cursor fora da mesa): os olhos
  voltam ao centro e o resto da vida continua.

### 3.3 Onde ele fica

- Ele é um canvas 2D que cobre a mesa inteira, **acima do pontilhado e abaixo
  de todas as janelas e ícones**. As janelas continuam opacas por cima dele.
- A posição sai do layout medido (os retângulos das janelas, com
  ResizeObserver), não de porcentagens fixas. **Requisito:** na disposição
  inicial e **em repouso** (olhar ao centro, olhos `normal` 2×2), os dois olhos
  ficam inteiramente visíveis, sem janela por cima, em todos os tamanhos da
  seção 6. Quando os olhos andam (±2/±1) ou crescem (`atento`, `surpreso`),
  a borda de uma janela pode cobrir parte deles. Como chegar nisso fica com
  quem constrói. O protótipo resolve com o Mac centrado em ~62% da largura, o
  que deixa o rosto no vão entre o LEIA-ME e o RENDER. Em 1024 px esse vão tem
  só ~12 px, e o lugar do rosto passa a ser a faixa livre entre o RENDER e o
  TERMINAL (seção 4). Se for preciso, o Mac pode ficar menor que 78% nessas
  telas.
- Se o visitante arrastar janelas, o Mac não se mexe para acompanhar.
- O canvas não pode roubar cliques. Arrastar janelas, clicar em links, ícones,
  no terminal e na lixeira continua igual. Os eventos de mouse do Mac são
  ouvidos na `section.mesa`, e "clique na mesa vazia" é um clique cujo alvo não
  está dentro de uma janela, de um ícone ou de um controle.

### 3.4 Desempenho e acessibilidade

- Canvas 2D, sem three.js e sem dependência nova. DPR limitado a 2. Desenhe só
  as células não vazias.
- A animação para quando a mesa sai da tela (IntersectionObserver) e quando a
  aba fica oculta.
- Meta: 60 fps num MacBook M1 sem travar o scroll. Se o print de desempenho
  mostrar quadros longos, prefira reduzir o custo por quadro (atlas de glifos,
  menos trocas de `fillStyle`) a reduzir a vida do Mac.
- `prefers-reduced-motion`: desenha um quadro só, parado (Mac de pé, olhos ao
  centro), sem ondas e sem pulo.
- O canvas é decorativo (`aria-hidden`). Não precisa de texto nem de entrada
  nos dicionários pt/en.
- Os glifos usam a mesma fonte do protótipo aprovado: `600 10px` na pilha do
  token `font-code` (`ui-monospace, SFMono-Regular, Menlo, monospace`).
  **Não** use o `font-mono` do site (Courier Prime): o traço fino dele em 10 px
  e alfa baixo deixa a textura bem mais apagada que a aprovada.
- Só existe em telas ≥ 1024 px de largura, a mesma condição do layout de três
  colunas da mesa. Abaixo disso, nada é montado.

## 4. As janelas em escadinha

### 4.1 O problema medido

Hoje o RENDER tem 312×334 px e fica no topo da coluna do meio. O TERMINAL tem
`lg:-mt-16` e sobe 64 px sobre o RENDER. O AGORA fica colado embaixo do TERMINAL.
Como os tamanhos não acompanham a altura da tela, medido em 1024×768 até
2560×1440:

- o TERMINAL cobre a base do RENDER e corta o icosaedro em todos os tamanhos;
- em 1366×768 a mesa é sticky com `overflow-hidden`, e o AGORA encosta no fim
  da mesa ou passa dele.

### 4.2 A disposição nova (a do print)

Na coluna do meio, de cima para baixo:

1. **RENDER** no topo, **inteiro** (nada por cima), alinhado à direita da coluna.
2. Uma **faixa livre** de carvão, por onde o Mac aparece.
3. **TERMINAL** mais largo, avançando para a esquerda além do RENDER, com a
   borda direita alinhada à do RENDER.
4. **AGORA** logo abaixo do TERMINAL, com um respiro pequeno e a borda direita
   alinhada à dele.

No print, a 1485×933 CSS px, isso dá RENDER no topo, uma faixa de ~100 px,
TERMINAL e AGORA quase colados, e o AGORA terminando perto do fim da mesa.

Regras:

- **Nenhuma janela sobrepõe outra na disposição inicial,** em qualquer tamanho
  da seção 6.
- **No modo sticky** (≥ 1024 px de largura e ≥ 760 px de altura), as três
  janelas e a faixa cabem inteiras dentro da mesa. Quando a altura não dá, o
  RENDER (quadrado) e a altura do TERMINAL encolhem com a altura da tela. Os
  mínimos sugeridos são RENDER ≥ 14rem, TERMINAL ≥ 10rem e faixa ≥ 3rem; os
  valores exatos ficam com quem constrói, desde que o print aprove.
- **Telas altas** (1920×1080, 2560×1440): a coluna fica presa nas duas pontas,
  como no print. O RENDER fica no topo e o AGORA termina perto do fim da mesa,
  com o mesmo respiro do print. As janelas não passam do tamanho de hoje, e a
  altura que sobra vai toda para a faixa entre o RENDER e o TERMINAL, onde o Mac
  aparece mais.
- Essas regras de caber valem para a coluna do meio. O LEIA-ME não entra: hoje
  a barra de números dele já fica cortada em 1024×768, 1280×800 e 1366×768, e
  isso continua fora do escopo (seção 7).
- **Abaixo de 760 px de altura** a mesa não é sticky e pode crescer. As janelas
  seguem a mesma escadinha, sem sobreposição.
- O LEIA-ME, os ícones, o arraste, a ordem de empilhamento ao clicar, o fechar,
  a lixeira e a animação de entrada `.janela-entra` continuam como estão.
- No celular (coluna única) nada muda.

## 5. O pet que se teletransporta

### 5.1 Quando

**Só na home** (`/` e `/en`). Nas outras rotas, o pet continua exatamente como
hoje.

- **Some no hero:** enquanto a mesa está à vista, o pet não aparece. Também não
  há botão nem alvo de clique no canto.
- **Entra** quando a borda de cima do SOUZXXX gigante (o `CutWordmark`) chega à
  linha de baixo da MenuBar fixa (28 px). Nessa hora o SOUZXXX já cobriu a mesa
  inteira e o Mac ASCII saiu de cena.
- **Sai** quando o visitante rola de volta e a borda do SOUZXXX desce abaixo
  dessa linha. A saída é o mesmo teletransporte, ao contrário.
- **Histerese:** entra no limiar e só sai ~32 px abaixo dele, para não piscar
  com a página parada no limite. Se o estado inverter no meio de um
  teletransporte, a animação inverte a partir de onde está e não reinicia.
- **Página aberta já rolada** (recarregar no meio da página, ou abrir em
  `/#projects`): o pet entra com o teletransporte assim que a página assenta.
- O chunk do pet (three.js) continua carregando quando o navegador fica ocioso,
  como hoje. O primeiro teletransporte não pode esperar download. A cena fica
  montada e pronta, só escondida.

### 5.2 Como: o teletransporte do Dragon Ball

A referência do Leonardo é o teletransporte do Goku: o personagem some num piscar
e aparece no outro lugar com um "tremido" rápido. Ele riu ao descrever. É
para ser divertido e rápido, não um efeito elaborado.

Tradução para o 1-bit do site (proposta de quem escreveu, para validar no
navegador):

- **Entrada (~400 ms, em degraus, sem easing suave):**
  1. Um risco vertical creme, da altura do Mac e com 2–3 px de largura, pisca no
     lugar do pet, com dois ou três traços horizontais curtos (linhas de
     velocidade) dos lados.
  2. O pet surge esticado na vertical e fininho e abre para a largura normal em
     3–4 degraus, passando um pouco do ponto.
  3. Uma ou duas "imagens residuais" (silhuetas chapadas do Mac, deslocadas uns
     8 px para os lados e com metade da opacidade) somem em seguida.
  4. Ele pisca (aparece/some/aparece) e assenta com o quique de mola que já
     existe. A cara fica `surpreso` por ~600 ms e depois volta ao normal.
- **Saída (~300 ms):** o inverso. Tremido, imagem residual, encolhe para o risco
  vertical, risco some, as linhas de velocidade somem por último.
- O efeito vive no DOM/CSS em volta do canvas do pet: wrapper, pseudo-elementos
  ou um canvas 2D pequeno. Ele **não** deve exigir mudanças no shader do pet. As
  imagens residuais podem ser silhuetas chapadas; não precisam copiar o canvas
  WebGL.
- Sem som.
- Enquanto está fora, o pet não recebe foco nem clique. Se o balão estava
  aberto quando ele saiu, o balão fecha.
- `prefers-reduced-motion`: sem teletransporte, o pet só aparece e some, sem
  animação.
- O desvio de controles (`useDesvio`), a mola do scroll, o olhar, o sono, o
  balão e as dicas por seção continuam iguais quando ele está dentro.

## 6. Como saber que ficou pronto

Tamanhos de referência: 1024×768, 1280×720, 1280×800, 1366×768, 1440×900,
1512×982, 1680×1050, 1920×1080 e 2560×1440.

**Janelas**
- Um teste no navegador (Playwright, como o `scripts/verify-pet.ts`) mede os
  retângulos das janelas na disposição inicial. Ele falha se duas janelas
  quaisquer se cruzarem, ou se, no modo sticky, o RENDER, o TERMINAL ou o
  AGORA passar do fim da mesa.
- Prints antes e depois em 1512×982 e 1280×800. O depois deve lembrar o print de
  referência.

**Mac ASCII**
- Nos mesmos tamanhos, os dois olhos em repouso ficam visíveis sem janela por
  cima. O teste calcula o retângulo dos olhos a partir do estado exposto num
  modo de teste, como o `__sxPet` do pet.
- Um GIF curto em 1512×982 com o Mac respirando, os olhos seguindo o mouse, as
  ondas, um clique com pulo e o `atento` de perto.
- Com `prefers-reduced-motion`, um print do quadro parado.
- Nenhum clique de controle da mesa muda de comportamento: arrastar janela,
  links, ícones, terminal, fechar e lixeira.
- As funções puras (classificação da silhueta, rosto, escolha do glifo do anel)
  têm testes unitários no estilo dos `components/pet/*.test.ts`.

**Pet**
- Na home, com a mesa à vista, não há pet nem botão no canto.
- Rolando até o SOUZXXX chegar à MenuBar, o pet entra com o teletransporte.
  Rolando de volta, ele sai. GIF dos dois.
- Uma página `/projetos/<slug>` mostra o pet como hoje.
- `npx tsx --test components/pet/*.test.ts` e o `scripts/verify-pet.ts` passam,
  com o verify atualizado para a regra nova da home.

**Geral**
- `next build` sem erro. O Leonardo vê tudo rodando localmente antes de
  qualquer merge. Push para a main só com o OK dele.

## 7. Fora do escopo

- Mexer no celular ou em telas < 1024 px.
- O LEIA-ME cortado embaixo em telas baixas (problema que já existe hoje).
- Mac ASCII em outras páginas.
- Trocar a gravura do RENDER.GLSL ou o terminal.
- Lembrar a posição das janelas arrastadas entre visitas.
- Som.
- Dependência nova ou atualização de dependência.
- O passeio (B) ou o giro 3D (A) dos protótipos.

## 8. O que seria um fracasso mesmo funcionando

- O hero ficar pesado: scroll travando, ventoinha ligando, quadro longo.
- O Mac brigar com a leitura: ele é fundo, e as janelas e o texto vencem sempre.
- Parecer um "efeito ASCII" genérico, colorido ou com brilho. Fica no creme e
  carvão do site, com o dourado num detalhe só.
- Dois Macs ao mesmo tempo na tela da home.
- Um teletransporte lento ou "cinematográfico". A graça é ser rápido e meio
  bobo, como no desenho.

## 9. Fica com quem constrói

- A conta da posição do Mac a partir dos retângulos medidos.
- Os tamanhos exatos e a regra de encolher das janelas no modo sticky.
- Os quadros exatos do teletransporte, dentro do roteiro da seção 5.2.
  Valide com um GIF.
- Como portar o protótipo: componente de cliente com a lógica pura separada em
  módulos testáveis, seguindo a organização de `components/pet/`.

## 10. Decisões tomadas por quem escreveu (não ditas pelo Leonardo)

- O Mac ASCII não aparece em telas < 1024 px.
- Com `prefers-reduced-motion`, o Mac fica parado e o pet aparece e some sem
  teletransporte.
- O arraste das janelas continua. A escadinha é só a posição inicial.
- Nas outras rotas, o pet fica como está.
- Histerese de ~32 px no gatilho do pet.
- Página aberta já rolada: o pet entra com teletransporte.
- O roteiro de quadros do teletransporte (5.2).
- Sem som.
- Telas altas: o RENDER fica no topo e o AGORA embaixo, e a sobra vira faixa
  para o Mac (4.2).
- O requisito dos olhos vale em repouso; quando eles andam ou crescem, podem
  encostar numa janela (3.3).
- A fonte do canvas é a do protótipo (SF Mono / `font-code`), não a Courier
  Prime do site (3.4).
- O LEIA-ME cortado em telas baixas fica para outra vez (4.2, 7).
