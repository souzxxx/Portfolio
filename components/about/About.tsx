import clsx from "clsx";
import { Bloco } from "../ui/Bloco";
import { Botao } from "../ui/Botao";
import { Meta } from "../ui/Meta";
import { Reveal } from "../ui/Reveal";
import { SerifDisplay } from "../ui/SerifDisplay";

/**
 * About — o bloco de CONTATO, quarto campo de cor do site: BREU.
 *
 * E aqui que vive o UNICO elemento dourado do portfolio inteiro (o CTA de
 * curriculo), e e aqui por razao medida, nao por gosto: gold #E8B23A sobre
 * cream #F5F3EE da 1.74:1 (reprova ate o minimo 3:1 de componente da 1.4.11),
 * enquanto sobre ink #141414 da 9.53:1 nos dois sentidos. O dourado so existe
 * porque existe um fundo breu para segura-lo.
 *
 * Sem server-side state e sem hook nenhum: componente de servidor. O unico
 * pedaco de cliente que entra e o <Reveal>, que ja e "use client" por conta
 * propria — o resto vai como HTML, e o bundle da home nao cresce.
 *
 * O feedback de interacao das linhas de contato e UM so: a linha inteira
 * inverte creme<->breu. Sem icone, sem seta que desliza, sem sombra.
 */

type Contato = {
  rotulo: string;
  valor: string;
  href: string;
  externo?: boolean;
};

const contatos: Contato[] = [
  {
    rotulo: "E-mail",
    valor: "leonardosouzasilva9@gmail.com",
    href: "mailto:leonardosouzasilva9@gmail.com",
  },
  {
    rotulo: "GitHub",
    valor: "github.com/souzxxx",
    href: "https://github.com/souzxxx",
    externo: true,
  },
  {
    rotulo: "LinkedIn",
    valor: "linkedin.com/in/leonardo-souzx",
    href: "https://www.linkedin.com/in/leonardo-souzx",
    externo: true,
  },
];

// Enfase dentro da prosa: peso + sublinhado fino de 1px em creme a 45%. Sobre
// breu, cor de enfase seria ou o azul (2.00:1, proibido) ou o dourado (que e
// exclusivo do CTA) — entao a enfase aqui e desenhada, nao colorida.
const enfase =
  "font-medium underline decoration-cream/45 decoration-[1px] underline-offset-4";

export function About() {
  return (
    <Bloco ground="ink" id="about">
      <div className="mx-auto max-w-[72rem]">
        <Reveal>
          <Meta
            items={["#06 · CONTATO", "SÃO PAULO, BR", "DESDE 2026"]}
            className="text-cream-700"
          />
        </Reveal>

        <Reveal delay={0.05}>
          <SerifDisplay
            as="h2"
            className="mt-6 text-balance text-d2 text-cream"
          >
            Vamos construir algo que aguenta produção.
          </SerifDisplay>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="medida mt-10 font-sans text-lead text-cream">
            Sou <span className={enfase}>Leonardo Souza</span>, estudante de
            Ciência da Computação no <span className={enfase}>Insper</span> (5º
            semestre), em São Paulo. Trabalho nas três frentes: backend, web e IA
            aplicada. No backend, fila outbox com retry exponencial e chave de
            idempotência, rate limit em Redis com circuit breaker que falha
            aberto e webhooks de pagamento validados por assinatura. Na web,
            front-end Next.js e TypeScript em sistema com usuário real —
            inclusive um módulo que gera um documento que o cliente final lê como
            parte do contrato. Em IA, assistente LLM em cima dos dados do usuário
            autenticado e busca vetorial em Postgres com pgvector, onde a
            resposta é ancorada no que foi recuperado, sem fine-tuning. Prefiro{" "}
            <span className={enfase}>medir a supor</span> — e prefiro o sistema
            que se defende sozinho ao que só funciona no caminho feliz.
          </p>
        </Reveal>

        <Reveal delay={0.16}>
          {/* O tracejado mora na <li>, nao na <a>: assim a linha invertida nao
              come a propria borda de cima quando o fundo vira creme. */}
          <ul className="mt-14 border-b border-dashed border-cream/25">
            {contatos.map((c) => (
              <li
                key={c.rotulo}
                className="border-t border-dashed border-cream/25"
              >
                <a
                  href={c.href}
                  target={c.externo ? "_blank" : undefined}
                  rel={c.externo ? "noreferrer" : undefined}
                  className={clsx(
                    "group grid grid-cols-[minmax(0,1fr)_1.5rem] items-baseline gap-x-3 gap-y-1 py-4",
                    "md:grid-cols-[6.5rem_minmax(0,1fr)_1.5rem] md:gap-y-0",
                    "hover:bg-cream hover:text-ink focus-visible:bg-cream focus-visible:text-ink",
                    // O anel global e `currentColor`; com a linha invertida a
                    // cor de texto vira breu e o anel — desenhado 2px FORA da
                    // caixa, ja sobre o bloco breu — ficaria breu sobre breu.
                    // Forcar creme devolve 16.61:1 ao anel sem tocar a
                    // inversao, que continua sendo o feedback principal.
                    "focus-visible:outline-cream",
                    "md:-mx-4 md:px-4",
                    "motion-safe:transition-colors motion-safe:duration-150",
                  )}
                >
                  <span className="font-mono text-tag uppercase text-cream-700 group-hover:text-ink-700 group-focus-visible:text-ink-700 md:col-start-1 md:row-start-1">
                    {c.rotulo}
                  </span>
                  <span
                    aria-hidden
                    className="justify-self-end font-mono text-tag md:col-start-3 md:row-start-1"
                  >
                    ↗
                  </span>
                  <span className="col-span-2 break-all font-mono text-body md:col-span-1 md:col-start-2 md:row-start-1">
                    {c.valor}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.22}>
          {/* `grid` no mobile faz o <a> do Botao esticar para 100% da largura
              (item de grade estica por padrao); `md:block` devolve a caixa ao
              tamanho do conteudo. O `className` do Botao chega no <span> do
              rotulo, entao a largura precisa vir daqui.

              O variante arbitrario `[&>a:focus-visible]` tambem so pode vir
              daqui, e conserta um furo REAL de acessibilidade medido no
              navegador: o anel de foco global e `outline: 2px solid
              currentColor`, e no CTA dourado `currentColor` e #141414 — a
              MESMA cor do bloco onde o anel e desenhado (offset 2px, ou seja,
              fora do dourado). Resultado medido: anel breu sobre breu, 1:1,
              invisivel no teclado, justo no unico CTA principal do site.
              Creme devolve 16.61:1. A regra global usa `:where()`, entao
              especificidade 0 — esta utility ganha sem `!important`. */}
          <div className="mt-12 grid [&>a:focus-visible]:outline-cream md:block">
            <Botao
              href="/leonardo-souza-cv.pdf"
              download
              variant="gold"
              className="w-full justify-center md:w-auto"
            >
              Baixar currículo ↓
            </Botao>
          </div>
        </Reveal>
      </div>
    </Bloco>
  );
}
