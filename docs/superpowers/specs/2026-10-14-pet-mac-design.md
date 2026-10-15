# Pet do souzxxx OS: um Mac 3D que acompanha o visitante

Data: 14/out/2026 · Branch: `feat/pet-mac`

## 1. O que é

Um mascote 3D em forma de Macintosh clássico que fica fixo no canto inferior
direito da tela e acompanha o visitante pelo site. Ele não traz informação
nova: ele dá vida ao "souzxxx OS". A estética é a do site, sem exceção: duas
cores (carvão `#1C1A17` e creme `#F5F3EE`), volume desenhado por hachura e
pixels 1-bit nítidos.

### Decisões já tomadas com o Leonardo

| Tema | Decisão |
|---|---|
| Forma | Mini Macintosh com olhos em pixel na tela |
| Scroll | Fica fixo no canto; balança com mola (inclina, afunda e volta) |
| Comportamentos | Piscar e dormir · reagir ao hover · balão ao clicar |
| Botão de esconder | Não terá |
| Celular | Não aparece (só telas com mouse) |
| Técnica | WebGL com o shader de hachura do hero (opção A), porque o three.js e o R3F já estão no bundle do site |

## 2. Aparência

- **Tamanho na tela:** a caixa do canvas tem 150×150 px CSS. O Mac ocupa cerca
  de 72×88 px dentro dela, e a sobra é o espaço da inclinação. Posição: 24 px da
  direita e 24 px de baixo.
- **Corpo:** gabinete, moldura da tela, fenda do disquete e pé, montados com
  `boxGeometry` (normais planas, faces chapadas). O material é o `ShaderMaterial`
  de `components/hero/hatch.glsl.ts`, com os mesmos uniforms `uCarvao` e
  `uCream`. A hachura fica ancorada na tela: o Mac gira por baixo das linhas,
  igual ao sólido do hero.
- **Tela:** um `planeGeometry` recuado na moldura, com `CanvasTexture` de 16×12
  pixels, `magFilter = NearestFilter` e `minFilter = NearestFilter`. Ele é
  desenhado em creme e carvão puros e não passa pelo shader de hachura, para os
  olhos ficarem nítidos.
- **Funcionando nos dois fundos:** creme domina o gabinete e o contorno do
  shader é carvão. Sobre os blocos em carvão ele aparece como as janelas do OS
  aparecem hoje. Não há inversão de cores.
- **Ajuste no shader compartilhado:** o vertex shader de `hatch.glsl.ts` desloca
  os vértices para o sólido "respirar". Nas caixas do Mac isso deformaria as
  arestas. Entra o uniform `uRespira` (float): `1.0` no hero (comportamento
  atual, sem mudança visível) e `0.0` no pet.
- **Risco de escala da hachura:** a trama tem passo de 11 e 16 px de tela,
  pensado para um objeto de ~400 px. Num objeto de 72 px podem sobrar poucas
  linhas por face. Se o print mostrar menos de 4 linhas visíveis na lateral do
  gabinete, entra o uniform `uPasso` (multiplicador do passo; `1.0` no hero e
  entre `0.5` e `0.6` no pet). Isso se decide pelo print, não no escuro.

### A tela (grade 16×12)

As expressões são funções puras que devolvem quais pixels estão acesos:

| Expressão | Desenho |
|---|---|
| `normal` | Duas órbitas, cada olho um bloco de 2×2 que se desloca até 2 px em x e 1 px em y, conforme o olhar; boca de 4 px |
| `piscando` | Olhos viram uma linha de 2×1 por 120 ms |
| `atento` (hover) | Olhos de 3×3, centralizados na direção do alvo |
| `dormindo` | Olhos em linha; um "z" de 3×3 sobe pelo canto superior direito, 1 px a cada 500 ms, reiniciando no topo |
| `surpreso` | Olhos de 3×3 e boca em "o" de 2×2, por 600 ms ao acordar |

## 3. Comportamento

### Olhar e corpo seguindo o mouse
- O vetor do centro do pet até o cursor, normalizado pela diagonal da janela,
  vira `olhar` (x, y entre -1 e 1).
- Olhos: `round(olhar.x * 2)` e `round(olhar.y * 1)` em pixels, sempre degraus
  inteiros.
- Corpo: `rotation.y = olhar.x * 15°` e `rotation.x = -olhar.y * 8°`, com
  suavização por mola.

### Scroll com mola
- A velocidade do scroll (px/s, a partir de `scrollY` amostrado por frame) vira
  um alvo de inclinação: até 18° em `rotation.x` no sentido do scroll, e um
  afundamento de até 6 px na posição.
- Uma mola amortecida (rigidez ~170, amortecimento ~14, o mesmo vocabulário de
  `EspiaIndice.tsx`) leva a inclinação e a posição ao alvo. Quando o scroll
  para, o alvo volta a zero e ela quica de leve.
- Enquanto a página rola, os olhos olham no sentido do scroll (`olhar.y = ±1`).

### Piscar e dormir
- Uma piscada a cada 3–7 s, com intervalo sorteado a cada vez.
- Após **20 s** sem `pointermove`, `scroll`, `keydown` ou `pointerdown`, ele
  entra em `dormindo`. Qualquer um desses eventos o acorda: `surpreso` por
  600 ms, depois `normal`.
- Enquanto dorme, a mola e o olhar param; só o "z" anima, com um timer de
  500 ms que pede um quadro com `invalidate()`.

### Reação ao hover
- Delegação em `document` (`pointerover`/`pointerout`) com
  `closest("a, button, [data-zoom], [data-previa]")`.
- Ao entrar num alvo: expressão `atento`, olhar travado no centro do retângulo
  do alvo e corpo inclinando 5° extra na direção dele. Ao sair: `normal`.
- O próprio pet não conta como alvo.

### Balão ao clicar
- A caixa do canvas fica dentro de um `<button type="button">` com
  `aria-label` vindo do dict ("Assistente do souzxxx OS" / "souzxxx OS
  assistant") e `aria-expanded`.
- O clique alterna um balão posicionado acima do pet, à direita. Visual de
  janela do site: borda carvão de 1 px, fundo creme, sombra
  `shadow-[4px_4px_0_0_#1C1A17]`, título em `font-bitmap` caixa alta (o nome
  da seção) e texto em `font-sans`, com no máximo 2 frases.
- O conteúdo depende da seção visível: um `IntersectionObserver` nos ids
  `top`, `projects`, `more`, `atividade`, `academic`, `stack` e `about` elege a
  seção que ocupa mais área da janela. Fora da home, a chave vem da rota: case
  (`/projetos/…`, `/en/projects/…`) ou 404.
- Fecha com outro clique no pet, com `Esc` ou com `pointerdown` fora do balão.
  O balão tem `role="status"` para o texto ser anunciado.
- Abrir o balão acorda o pet.

### Dicas (rascunho, revisar no spec)

Antes de publicar, cada dica precisa ser conferida contra a interface real.

| Chave | pt | en |
|---|---|---|
| `top` | As janelas da mesa se arrastam. O Terminal aceita comandos: tente `ajuda`. | The desktop windows can be dragged. The Terminal takes commands: try `help`. |
| `projects` | Cada pasta é um projeto. Clique nela para abrir o case completo. | Each folder is a project. Click it to open the full case study. |
| `more` | Passe o mouse numa linha para espiar a capa; clique para abrir. | Hover a row to peek at the cover; click to open it. |
| `atividade` | Cada quadradinho é um dia de commits no GitHub. | Each little square is a day of commits on GitHub. |
| `academic` | O curso tem 8 semestres e a barra mostra em qual eu estou. | The degree has 8 semesters, and the bar shows which one I'm on. |
| `stack` | A barra de armazenamento mostra quanto cada categoria pesa. | The storage bar shows how much each category takes up. |
| `about` | Quer conversar? O currículo em PDF está aqui embaixo. | Want to talk? The PDF résumé is right down here. |
| `caso` | No fim da página tem o próximo projeto →. | The next project is at the end of the page →. |
| `erro` | Essa página explodiu. O menu lá em cima te leva de volta. | This page blew up. The menu up top takes you back. |

## 4. Onde ele aparece

- Em todas as páginas montadas pelos dois layouts-raiz (`app/(pt)/layout.tsx` e
  `app/(en)/layout.tsx`), ao lado de `<ZoomLinks />`.
- **Não aparece** em `/cv` e `/en/cv` (página de impressão; a checagem é feita
  com `usePathname`), em telas sem `(hover: hover) and (pointer: fine)` nem
  abaixo de 1024 px de largura.
- **Boot:** a entrada espera `var(--boot)`, a mesma variável CSS das janelas do
  hero. A entrada é um degrau curto de opacidade e escala, em `steps(3)`, no
  vocabulário do Boot. Ela é instantânea quando a sessão já viu o boot.
- **Camadas:** `z-[60]`, acima do conteúdo e abaixo do Boot (`z-[100]`). A Lupa
  usa `<dialog>` no top layer, então fica naturalmente por cima.
- **Reduzir movimento:** sem mola, sem inclinação no scroll, sem quique nem
  rotação do corpo. Olhos, piscar, dormir, hover e balão continuam (são trocas
  de pixel, não movimento).

## 5. Arquitetura

```
components/pet/
  Pet.tsx          cliente · entrada: guardas, montagem ociosa, <button>, balão
  PetCena.tsx      cliente · <Canvas frameloop="demand"> + o modelo do Mac
  tela.ts          puro    · grade 16×12 por expressão e olhar → boolean[][]
  maquina.ts       puro    · transições de expressão (eventos → expressão)
  mola.ts          puro    · integrador de mola amortecida (passo fixo)
  secao.ts         cliente · useSecaoAtual(): chave da dica pela seção/rota
  tela.test.ts     node:test
  maquina.test.ts  node:test
  mola.test.ts     node:test
lib/dict.ts, dict.pt.ts, dict.en.ts   + chave `pet` (ariaLabel, titulos, dicas)
components/hero/hatch.glsl.ts         + uniform uRespira (e uPasso, se preciso)
components/hero/EngravedObject.tsx    passa uRespira = 1.0
app/(pt)/layout.tsx, app/(en)/layout.tsx  <Pet textos={dict[lang].pet} />
scripts/verify-pet.ts                 verificação no navegador com Playwright
```

**Fronteiras:**
- `Pet.tsx` só cuida de quando montar e da parte em DOM (botão e balão). Ele
  recebe os textos de **um** idioma por props, vindos do layout (servidor), para
  o dict inteiro não entrar no bundle do cliente. `PetCena` entra com
  `next/dynamic({ ssr: false })` dentro do `CanvasBoundary` que já existe: se o
  WebGL falhar, o pet some e o site segue normal.
- O estado vivo (olhar, velocidade, expressão) fica em `useRef`, não em
  `useState`. Os eventos escrevem no ref e chamam `invalidate()`. O `useFrame`
  lê o ref, avança a mola e redesenha a textura só quando a grade mudou. Mouse
  e scroll nunca causam render do React.
- `frameloop="demand"`: parado, zero quadros. Enquanto a mola não assenta
  (|velocidade| e |deslocamento| abaixo de ε), o `useFrame` pede mais um
  `invalidate()`.
- Aba oculta (`visibilitychange`): timers de piscar, sono e "z" param.
- **Montagem ociosa:** `requestIdleCallback` com teto de 1,5 s (fallback de
  300 ms), igual à "GUARDA 2" do `EngravedObject`.
- `dpr={[1, 2]}`, `gl={{ antialias: false, alpha: true }}`; canvas
  transparente.

## 6. Testes e verificação

- **Unitários (sem dependência nova):** `npx tsx --test components/pet/*.test.ts`
  - `tela`: cada expressão tem as dimensões 16×12; o olhar é limitado a ±2 px
    em x e ±1 px em y; `dormindo` muda a posição do "z" com o tempo.
  - `maquina`: inatividade de 20 s leva a `dormindo`; um evento em `dormindo`
    leva a `surpreso` e depois a `normal`; hover leva a `atento`, e sair dele
    volta a `normal`.
  - `mola`: converge ao alvo; com alvo zero, assenta abaixo de ε em menos de
    2 s simulados; não explode com dt grande (passo fixo com teto).
- **Navegador (`scripts/verify-pet.ts`, Playwright, servidor local):**
  - Desktop 1440×900: o pet monta, não há erros no console, e há screenshots
    dele sobre um bloco em papel e sobre um bloco em carvão.
  - Pet em `dormindo` após 20 s (com timer acelerado por parâmetro de teste) e
    acordando com o mouse.
  - Clique abre o balão com a dica da seção visível; `Esc` fecha.
  - Viewport 390×844 com `hasTouch`: nenhum `canvas` do pet no DOM.
  - `/cv`: sem pet.
  - `reducedMotion: "reduce"`: o pet monta e a rotação do corpo não muda ao
    rolar.
- **Peso:** comparar `First Load JS` do build antes e depois. O esperado é a
  home sem mudança no carregamento inicial (o pet é dinâmico) e o chunk do pet
  com menos de 8 KB gzip.
- **Prints antes e depois** para o Leonardo aprovar a aparência antes do merge.

## 7. Fora do escopo

- Botão de esconder ou preferência salva.
- Versão para celular (2D ou 3D).
- Arrastar o pet, falas automáticas sem clique, sons.
- Qualquer cor além de carvão e creme.
