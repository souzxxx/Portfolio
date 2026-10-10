import { Fragment } from "react";
import clsx from "clsx";
import { Bloco } from "../ui/Bloco";
import { Botao } from "../ui/Botao";
import { Meta } from "../ui/Meta";
import { Reveal } from "../ui/Reveal";
import { CopiarEmail } from "./CopiarEmail";
import { RelogioSP } from "./RelogioSP";
import { dict, type Dict } from "@/lib/dict";
import { CV_PDF, type Lang } from "@/lib/i18n";

/**
 * About — o fechamento: contato em CARVÃO, o último campo escuro do site.
 *
 * A PEÇA PRINCIPAL É O CONVITE, NÃO A BIO. "VAMOS CONVERSAR" em Instrument
 * Serif caixa alta, num corpo medido para "CONVERSAR" (4.30em de largura, a
 * palavra mais longa das duas línguas) encher a medida: 23cqw do contêiner
 * (4.30 × 0.23 = 99% da medida) — em 1440 isso dá ~310px de corpo. O "LET’S TALK" do inglês (3.96em) cabe
 * numa linha só no mesmo corpo, então as duas línguas têm o mesmo peso
 * visual sem nenhuma regra por idioma. A conta é a mesma do <WordmarkRow>:
 * unidade de contêiner, não de viewport, para a goteira não entrar no cálculo.
 *
 * EMBAIXO, DUAS COLUNAS: à esquerda a prosa curta (curso, semestre, cidade e
 * as três frentes — o que não pode cair); à direita as linhas de contato e o
 * CTA de currículo. Em cima, a barra de estado do sistema: a seção, o ponto
 * de disponibilidade e o relógio de São Paulo ao vivo.
 *
 * O DOURADO APARECE DUAS VEZES NESTA TELA, e só estas: o ponto de
 * "disponível" (um quadrado de 8px) e o CTA de currículo. Ambos sobre carvão
 * (7.31:1). Gold sobre papel dá 2.14:1 — por isso nada dourado mora em janela
 * creme, nem aqui nem em lugar nenhum do site.
 *
 * ENDEREÇOS NÃO TRADUZEM: o rótulo da linha vem de `dict[lang].sobre.contatos`,
 * o valor (e-mail, usuário do GitHub, URL do LinkedIn) é o mesmo nas duas
 * línguas e mora aqui — um link que diverge em silêncio entre idiomas é o pior
 * tipo de bug de tradução, porque a página continua bonita.
 */

const EMAIL = "leonardosouzasilva9@gmail.com";

const LINKS: {
  chave: Exclude<keyof Dict["sobre"]["contatos"], "email">;
  valor: string;
  href: string;
}[] = [
  {
    chave: "github",
    valor: "github.com/souzxxx",
    href: "https://github.com/souzxxx",
  },
  {
    chave: "linkedin",
    valor: "linkedin.com/in/leonardo-souzx",
    href: "https://www.linkedin.com/in/leonardo-souzx",
  },
];

// Ênfase desenhada, não colorida: sobre carvão a única cor de ênfase seria o
// dourado, e ele é do CTA.
const enfase =
  "font-medium text-cream underline decoration-cream/45 decoration-[1px] underline-offset-4";

const bitmap =
  "font-bitmap text-[10px] uppercase leading-none tracking-[0.08em]";

export function About({ lang }: { lang: Lang }) {
  const d = dict[lang];
  const f = d.contato.fim;

  return (
    <Bloco ground="carvao" id="about" className="pb-0">
      <div className="mx-auto max-w-[96rem]">
        {/* Barra de estado: seção à esquerda, disponibilidade e hora à
            direita. No mobile empilha, cada item numa linha. */}
        <Reveal>
          <div className="flex flex-col gap-3 border-b border-dashed border-cream/25 pb-4 md:flex-row md:items-center md:justify-between">
            <Meta items={[f.eyebrow]} className="text-cream-700" />
            <div
              className={clsx(
                bitmap,
                "flex flex-wrap items-center gap-x-6 gap-y-3 text-cream-600",
              )}
            >
              <span className="inline-flex items-center gap-2 text-cream">
                <span
                  aria-hidden
                  className="h-2 w-2 bg-gold motion-safe:animate-pulse"
                />
                {f.disponivel}
              </span>
              <RelogioSP cidade={f.cidade} />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="[container-type:inline-size]">
            <h2 className="mt-[clamp(1.5rem,4vw,3rem)] font-display text-[23cqw] uppercase leading-[0.84] tracking-[-0.005em] text-cream">
              {f.cta}
            </h2>
          </div>
        </Reveal>

        <div className="mt-[clamp(2.5rem,6vw,5rem)] grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <Reveal delay={0.1}>
            <p className="medida font-sans text-lead text-cream-600">
              {f.prosa.map((trecho, i) =>
                typeof trecho === "string" ? (
                  <Fragment key={i}>{trecho}</Fragment>
                ) : (
                  <span key={i} className={enfase}>
                    {trecho.em}
                  </span>
                ),
              )}
            </p>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="border-b border-dashed border-cream/25">
              <CopiarEmail
                email={EMAIL}
                rotulo={d.sobre.contatos.email}
                copiar={f.copiar}
                copiado={f.copiado}
                copiarAria={f.copiarAria}
              />
              {LINKS.map((l) => (
                <div
                  key={l.chave}
                  className="border-t border-dashed border-cream/25"
                >
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className={clsx(
                      "group grid grid-cols-[minmax(0,1fr)_1.5rem] items-baseline gap-x-3 gap-y-1 py-4",
                      "md:-mx-4 md:grid-cols-[6.5rem_minmax(0,1fr)_1.5rem] md:gap-y-0 md:px-4",
                      "hover:bg-cream hover:text-carvao focus-visible:bg-cream focus-visible:text-carvao focus-visible:outline-cream",
                      "motion-safe:transition-colors motion-safe:duration-150",
                    )}
                  >
                    <span className="font-mono text-tag uppercase text-cream-700 group-hover:text-ink-700 group-focus-visible:text-ink-700 md:col-start-1 md:row-start-1">
                      {d.sobre.contatos[l.chave]}
                    </span>
                    <span
                      aria-hidden
                      className="justify-self-end font-mono text-tag md:col-start-3 md:row-start-1"
                    >
                      ↗
                    </span>
                    <span className="col-span-2 break-all font-mono text-body md:col-span-1 md:col-start-2 md:row-start-1">
                      {l.valor}
                    </span>
                  </a>
                </div>
              ))}
            </div>

            {/* O CTA dourado. `[&>a:focus-visible]:outline-cream` conserta o
                anel de foco: `currentColor` no botão dourado é carvão, e o
                anel desenhado 2px fora dele cairia carvão sobre carvão (1:1).
                O PDF é o do idioma da rota (CV_PDF[lang]). */}
            <div className="mt-8 grid [&>a:focus-visible]:outline-cream md:block">
              <Botao
                href={CV_PDF[lang]}
                download
                variant="gold"
                className="w-full justify-center md:w-auto"
              >
                {d.sobre.cta}
              </Botao>
            </div>
          </Reveal>
        </div>
      </div>
    </Bloco>
  );
}
