import type { CSSProperties, ReactNode } from "react";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { NavBar } from "../nav/NavBar";
import { Footer } from "../Footer";
import { Janela } from "../os/Janela";
import { PixelIcon, type NomeIcone } from "../os/PixelIcon";
import { ProjectCover } from "../projects/ProjectCover";
import { CapaJanela, type Chapa } from "./CapaJanela";
import { GaleriaCaso } from "./GaleriaCaso";
import { ProximoProjeto } from "./ProximoProjeto";
import estilo from "./caso.module.css";
import { dict } from "@/lib/dict";
import { dimensoesDaImagem } from "@/lib/dimensoes";
import {
  HTML_LANG,
  hrefHome,
  hrefProjeto,
  outro,
  type Lang,
} from "@/lib/i18n";
import { ordemDeLeitura, type LocalizedProject } from "@/lib/projects";

/**
 * CasePage — a página de um projeto, escrita uma vez para as duas línguas.
 *
 * As rotas (app/(pt)/projetos/[slug] e app/(en)/en/projects/[slug]) são só o
 * endereço; tudo que aparece mora aqui. A partitura é a mesma da home — mesa
 * carvão em cima, papel embaixo, carvão de novo no fecho — e o vocabulário do
 * souzxxx OS aparece nos pontos de cromo: a trilha em bitmap, a captura dentro
 * de uma janela, a coluna "Informações" como um Get Info, as decisões como
 * caixas de alerta e a stack como etiquetas.
 *
 * SERVER COMPONENT. Só três folhas são de cliente, e cada uma por um motivo:
 * <CapaJanela> e <GaleriaCaso> pela <Lupa>, <ProximoProjeto> pela mola que
 * segue o cursor. Nenhuma delas recebe `dict` inteiro — só a fatia `lupa` ou
 * strings já resolvidas.
 */

/**
 * A NAVEGAÇÃO DO TOPO, isolada aqui de propósito: a NavBar vai ser trocada pela
 * menubar do souzxxx OS no site inteiro, e a troca nesta página deve ser esta
 * linha e nada mais.
 *
 * Os links da NavBar são âncoras da home ("#projects"); numa página de case
 * eles não teriam para onde ir, então recebem o prefixo da home do idioma.
 */
function Navegacao({ lang }: { lang: Lang }) {
  const nav = dict[lang].nav;
  const home = hrefHome(lang);
  return (
    <NavBar
      lang={lang}
      d={{
        ...nav,
        links: nav.links.map((l) =>
          l.href.startsWith("#") ? { ...l, href: `${home}${l.href}` } : l,
        ),
      }}
    />
  );
}

/** O ícone da janela "Informações": o que o projeto É, em 16×16. */
const ICONE: Record<string, NomeIcone> = {
  "tecna-site": "predio",
  "portal-tecna": "predio",
  financehub: "grafico",
  "quintoandar-precificacao": "casa",
  wraeclast: "terminal",
  "commerce-nda": "carta",
  sentinel: "computador",
};

function iconeDe(p: LocalizedProject): NomeIcone {
  return ICONE[p.slug] ?? (p.status === "deployed" ? "globo" : "disquete");
}

function host(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function dois(n: number): string {
  return String(n).padStart(2, "0");
}

/** Uma captura com as dimensões reais; 16:10 quando o cabeçalho não se lê. */
function chapa(src: string, label: string, indice: number): Chapa {
  const dim = dimensoesDaImagem(src) ?? { w: 1600, h: 1000 };
  return { src, label, indice, ...dim };
}

export function CasePage({ lang, slug }: { lang: Lang; slug: string }) {
  const d = dict[lang];
  const c = d.caso;
  const ordem = ordemDeLeitura(lang);
  const i = ordem.findIndex((p) => p.slug === slug);
  if (i < 0) notFound();
  const p = ordem[i];
  const proximo = ordem[(i + 1) % ordem.length];
  const numero = `${c.numero} ${dois(i + 1)}`;
  const deTotal = `${c.de} ${dois(ordem.length)}`;

  // ── as capturas ─────────────────────────────────────────────────────────
  // A Lupa percorre a galeria inteira; sem galeria, só a capa. A capa sai do
  // topo, então a galeria de baixo mostra o resto.
  const itens =
    p.gallery && p.gallery.length > 0
      ? p.gallery
      : p.cover
        ? [{ src: p.cover, label: d.card.capturaDeTela }]
        : [];
  const chapas = itens.map((it, k) => chapa(it.src, it.label, k));
  const capa = p.cover
    ? (chapas.find((ch) => ch.src === p.cover) ?? chapas[0])
    : null;
  const movel = chapas.find((ch) => ch !== capa && ch.h > ch.w) ?? null;
  const resto = chapas.filter((ch) => ch !== capa);
  const contagem = `${itens.length} ${itens.length === 1 ? c.capturas.uma : c.capturas.varias}`;
  const tituloJanela = p.demo ? host(p.demo) : p.slug;

  // ── as seções do papel, numeradas na ordem em que existem ───────────────
  let n = 0;
  const proxNum = () => dois(++n);
  const numProjeto = proxNum();
  const numFeito = p.highlights?.length ? proxNum() : null;
  const numDecisoes = p.decisions?.length ? proxNum() : null;
  const numCapturas = resto.length ? proxNum() : null;
  const numStack = proxNum();

  const stackCurta =
    p.stack.length > 4
      ? `${p.stack.slice(0, 4).join(" · ")} +${p.stack.length - 4}`
      : p.stack.join(" · ");

  const degrau = (k: number) =>
    ({ "--atraso": `${80 + k * 70}ms` }) as CSSProperties;

  return (
    <div id="top">
      <Navegacao lang={lang} />

      <main>
        {/* ── HERO: a mesa ─────────────────────────────────────────────── */}
        <header className="mesa text-cream">
          <div className="mx-auto max-w-[96rem] px-[var(--gutter)] pb-[clamp(7rem,17vw,15rem)] pt-[clamp(1.5rem,3vw,2.5rem)]">
            <div
              className={clsx(
                estilo.entrada,
                "flex items-center justify-between gap-6 border-b border-dashed border-cream/25 pb-3",
              )}
              style={degrau(0)}
            >
              <nav aria-label={c.trilha.rotulo} className="min-w-0">
                <ol className="flex min-w-0 items-center gap-2 font-bitmap text-[10px] uppercase leading-none tracking-[0.08em] text-cream-600 sm:text-[11px]">
                  <li className="shrink-0">
                    <a
                      href={hrefHome(lang)}
                      className="-mx-1 inline-flex min-h-[2.75rem] items-center px-1 hover:text-cream"
                    >
                      {c.trilha.os}
                    </a>
                  </li>
                  <li aria-hidden className="shrink-0 text-cream-700">
                    /
                  </li>
                  <li className="shrink-0">
                    <a
                      href={`${hrefHome(lang)}#projects`}
                      className="-mx-1 inline-flex min-h-[2.75rem] items-center px-1 hover:text-cream"
                    >
                      {c.trilha.projetos}
                    </a>
                  </li>
                  <li aria-hidden className="shrink-0 text-cream-700">
                    /
                  </li>
                  <li
                    aria-current="page"
                    className="min-w-0 truncate bg-cream px-1.5 py-1 text-carvao"
                  >
                    {p.name}
                  </li>
                </ol>
              </nav>

              <a
                href={hrefProjeto(outro(lang), p.slug)}
                hrefLang={HTML_LANG[outro(lang)]}
                aria-label={c.outraLingua.aria}
                className="-mr-2 inline-flex min-h-[2.75rem] min-w-[2.75rem] shrink-0 items-center justify-center px-2 font-bitmap text-[11px] uppercase tracking-[0.08em] text-cream-600 hover:bg-cream hover:text-carvao focus-visible:outline-cream"
              >
                {c.outraLingua.sigla}
              </a>
            </div>

            <p
              className={clsx(
                estilo.entrada,
                "mt-[clamp(2.5rem,7vw,5.5rem)] flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-meta uppercase",
              )}
              style={degrau(1)}
            >
              <span className="text-cream">{numero}</span>
              <span className="text-cream-700">{deTotal}</span>
              <span aria-hidden className="text-cream-700">
                ·
              </span>
              <span className="text-cream-600">
                {p.category === "featured" ? c.destaque : c.indice}
              </span>
            </p>

            <h1
              className={clsx(
                estilo.entrada,
                "mt-4 max-w-[16ch] font-display text-[clamp(3rem,9vw,8rem)] uppercase leading-[0.86] tracking-[0.01em] [hyphens:auto] [overflow-wrap:break-word] [text-wrap:balance]",
              )}
              style={degrau(2)}
            >
              {p.name}
            </h1>

            <div
              className={clsx(
                estilo.entrada,
                "mt-[clamp(1.75rem,3.5vw,2.75rem)] grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end",
              )}
              style={degrau(3)}
            >
              <p className="max-w-[58ch] text-lead text-cream-600">
                {p.tagline}
              </p>

              {p.demo || p.github ? (
                <div className="flex flex-wrap gap-4">
                  {p.demo ? (
                    <a
                      href={p.demo}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[2.75rem] items-center border border-cream bg-cream px-5 font-mono text-meta uppercase text-carvao shadow-[4px_4px_0_0_#0F0E0C] motion-safe:transition-[transform,box-shadow] motion-safe:duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0F0E0C] focus-visible:outline-cream"
                    >
                      {c.verNoAr}
                    </a>
                  ) : null}
                  {p.github ? (
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[2.75rem] items-center border border-cream px-5 font-mono text-meta uppercase text-cream motion-safe:transition-colors motion-safe:duration-150 hover:bg-cream hover:text-carvao focus-visible:outline-cream"
                    >
                      {c.codigo}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* A faixa de metadados: quatro células mono, com o rótulo em
                cream-700 (6.99:1) e o valor em creme. O único dourado da
                tela é o ponto de "no ar". */}
            <dl
              className={clsx(
                estilo.entrada,
                "mt-[clamp(2.5rem,5vw,4rem)] grid grid-cols-2 border-y border-dashed border-cream/25 md:grid-cols-[auto_auto_auto_minmax(0,1fr)]",
              )}
              style={degrau(4)}
            >
              <CelulaMeta rotulo={c.rotulos.ano}>{p.year}</CelulaMeta>
              <CelulaMeta rotulo={c.rotulos.status}>
                <span className="inline-flex items-center gap-2">
                  <span
                    aria-hidden
                    className={clsx(
                      "h-1.5 w-1.5",
                      p.status === "deployed" ? "bg-gold" : "bg-cream",
                    )}
                  />
                  {d.status[p.status]}
                </span>
              </CelulaMeta>
              {p.role ? (
                <CelulaMeta rotulo={c.rotulos.papel} className="col-span-2 md:col-span-1">
                  {p.role}
                </CelulaMeta>
              ) : null}
              <CelulaMeta
                rotulo={c.rotulos.stack}
                className={clsx("col-span-2 md:col-span-1", !p.role && "md:col-span-2")}
              >
                {stackCurta}
              </CelulaMeta>
            </dl>
          </div>
        </header>

        {/* ── A JANELA DA CAPA, na fronteira mesa/papel ──────────────────── */}
        <div className="relative z-10 mx-auto -mt-[clamp(5rem,13vw,12rem)] max-w-[96rem] px-[var(--gutter)]">
          <div
            className={clsx(estilo.pouso, "mx-auto max-w-[78rem] pr-[6px]")}
            style={degrau(5)}
          >
            {capa ? (
              <CapaJanela
                titulo={tituloJanela}
                nome={p.name}
                capa={capa}
                movel={movel}
                itens={itens}
                barra={contagem}
                ampliar={c.ampliar}
                d={d.lupa}
              />
            ) : (
              <Janela titulo={tituloJanela} sombra="breu" as="div">
                <ProjectCover
                  slug={p.slug}
                  name={p.name}
                  language={p.stack[0]}
                  className="aspect-[16/9] w-full md:aspect-[3/1]"
                />
                <div className="flex h-[26px] items-center border-t border-carvao px-3 font-bitmap text-[10px] uppercase leading-none tracking-[0.08em]">
                  {c.capaGerada}
                </div>
              </Janela>
            )}
          </div>
        </div>

        {/* ── O PAPEL ──────────────────────────────────────────────────── */}
        <div className="block-paper">
          <div className="mx-auto max-w-[96rem] px-[var(--gutter)] pb-[var(--block)] pt-[clamp(4rem,9vw,8rem)]">
            <div className="grid gap-y-16 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-x-[clamp(3rem,6vw,7rem)]">
              <div className="min-w-0">
                <Secao num={numProjeto} titulo={c.secoes.projeto} icone="documento">
                  <p className="max-w-[64ch] text-[clamp(1.125rem,0.55vw+1rem,1.375rem)] leading-[1.6] text-carvao">
                    {p.description}
                  </p>
                </Secao>

                {numFeito && p.highlights ? (
                  <Secao num={numFeito} titulo={c.secoes.feito} icone="pasta">
                    <ol className="max-w-[68ch]">
                      {p.highlights.map((h, k) => (
                        <li
                          key={k}
                          className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 border-t border-dashed border-carvao/35 py-6 first:border-t-0 first:pt-0 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-x-6 sm:py-7"
                        >
                          <span
                            aria-hidden
                            className="font-display text-[clamp(2.5rem,4.5vw,4rem)] leading-[0.8] text-carvao"
                          >
                            {dois(k + 1)}
                          </span>
                          <p className="text-body text-ink-600">{h}</p>
                        </li>
                      ))}
                    </ol>
                  </Secao>
                ) : null}

                {numDecisoes && p.decisions ? (
                  <Secao num={numDecisoes} titulo={c.secoes.decisoes} icone="terminal">
                    <div className="grid gap-[clamp(1.75rem,3vw,2.5rem)]">
                      {p.decisions.map((dec, k) => (
                        <Janela
                          key={k}
                          as="article"
                          titulo={`${c.decisao} ${dois(k + 1)}`}
                          className={clsx(
                            "max-w-[46rem] pb-[2px] pr-[2px]",
                            k % 2 === 1 && "md:ml-[clamp(1.5rem,5vw,4rem)]",
                          )}
                        >
                          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 p-5 sm:gap-x-6 sm:p-7">
                            <PixelIcon
                              nome="documento"
                              tamanho={40}
                              className="mt-0.5 h-8 w-8 sm:h-10 sm:w-10"
                            />
                            <div>
                              <h3 className="text-[clamp(1.0625rem,0.4vw+1rem,1.25rem)] font-semibold leading-snug text-carvao">
                                <span className="sr-only">{c.pergunta}: </span>
                                {dec.q}
                              </h3>
                              <p className="mt-3 text-body text-ink-600">
                                <span className="sr-only">{c.resposta}: </span>
                                {dec.a}
                              </p>
                              <div aria-hidden className="mt-6 flex justify-end">
                                <span className="border-2 border-carvao px-7 py-1.5 font-bitmap text-[11px] uppercase leading-none outline outline-1 outline-offset-2 outline-carvao">
                                  {c.ok}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Janela>
                      ))}
                    </div>
                  </Secao>
                ) : null}
              </div>

              {/* A coluna de fatos: um "Get Info" do Mac, fixo enquanto a prosa
                  rola ao lado. No celular ele cai depois da prosa e perde o
                  sticky — fixo numa tela de 390 ele cobriria o texto. */}
              <aside className="lg:row-span-1">
                <div className="lg:sticky lg:top-8">
                  <Janela titulo={c.ficha} as="div" className="pb-0">
                    <div className="flex items-center gap-4 border-b border-carvao p-4">
                      <PixelIcon nome={iconeDe(p)} tamanho={40} />
                      <div className="min-w-0">
                        <p className="font-display text-[1.6rem] uppercase leading-[0.95]">
                          {p.name}
                        </p>
                        <p className="mt-1 font-bitmap text-[10px] uppercase tracking-[0.08em] text-ink-700">
                          {p.category === "featured" ? c.destaque : c.indice} ·{" "}
                          {numero}
                        </p>
                      </div>
                    </div>
                    <dl className="divide-y divide-dashed divide-carvao/30 px-4">
                      <LinhaFicha rotulo={c.rotulos.ano}>{p.year}</LinhaFicha>
                      <LinhaFicha rotulo={c.rotulos.status}>
                        <span className="inline-flex items-center gap-2">
                          <span aria-hidden className="h-1.5 w-1.5 bg-carvao" />
                          {d.status[p.status]}
                        </span>
                      </LinhaFicha>
                      {p.role ? (
                        <LinhaFicha rotulo={c.rotulos.papel}>{p.role}</LinhaFicha>
                      ) : null}
                      <LinhaFicha rotulo={c.rotulos.repo}>
                        {p.github ? (
                          <a
                            href={p.github}
                            target="_blank"
                            rel="noreferrer"
                            className="underline decoration-1 underline-offset-2 hover:bg-carvao hover:text-cream"
                          >
                            {host(p.github)}
                            {new URL(p.github).pathname} ↗
                          </a>
                        ) : (
                          c.privado
                        )}
                      </LinhaFicha>
                      {p.demo ? (
                        <LinhaFicha rotulo={c.rotulos.noAr}>
                          <a
                            href={p.demo}
                            target="_blank"
                            rel="noreferrer"
                            className="break-all underline decoration-1 underline-offset-2 hover:bg-carvao hover:text-cream"
                          >
                            {host(p.demo)} ↗
                          </a>
                        </LinhaFicha>
                      ) : null}
                      {itens.length ? (
                        <LinhaFicha rotulo={c.secoes.capturas}>{contagem}</LinhaFicha>
                      ) : null}
                    </dl>
                  </Janela>
                </div>
              </aside>
            </div>

            {numCapturas ? (
              <Secao
                num={numCapturas}
                titulo={c.secoes.capturas}
                icone="computador"
                className="mt-[clamp(4rem,8vw,7rem)]"
              >
                <GaleriaCaso
                  nome={p.name}
                  itens={itens}
                  mostrar={resto}
                  d={d.lupa}
                />
              </Secao>
            ) : null}

            <Secao
              num={numStack}
              titulo={c.secoes.stack}
              icone="disquete"
              className="mt-[clamp(4rem,8vw,7rem)]"
            >
              <ul className="flex flex-wrap gap-3 sm:gap-4">
                {p.stack.map((t) => (
                  <li
                    key={t}
                    className="inline-flex min-h-[2.25rem] items-center gap-2 border border-carvao bg-cream px-3 font-bitmap text-[11px] uppercase leading-none tracking-[0.06em] text-carvao shadow-[3px_3px_0_0_#1C1A17]"
                  >
                    <span aria-hidden className="h-1.5 w-1.5 bg-carvao" />
                    {t}
                  </li>
                ))}
              </ul>
            </Secao>
          </div>
        </div>

        {/* ── PRÓXIMO PROJETO ──────────────────────────────────────────── */}
        <ProximoProjeto
          href={hrefProjeto(lang, proximo.slug)}
          rotulo={`${c.proximo} →`}
          aria={c.proximoAria}
          numero={`${c.numero} ${dois(((i + 1) % ordem.length) + 1)}`}
          nome={proximo.name}
          tagline={proximo.tagline}
          slug={proximo.slug}
          titulo={proximo.demo ? host(proximo.demo) : proximo.slug}
          capa={proximo.cover}
        />
      </main>

      <Footer lang={lang} />
    </div>
  );
}

/** Uma célula da faixa de metadados do hero. */
function CelulaMeta({
  rotulo,
  children,
  className,
}: {
  rotulo: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "min-w-0 border-dashed border-cream/25 py-4 pr-6 md:border-r md:pl-6 md:first:pl-0 md:last:border-r-0",
        className,
      )}
    >
      <dt className="font-bitmap text-[10px] uppercase leading-none tracking-[0.08em] text-cream-700">
        {rotulo}
      </dt>
      <dd className="mt-2.5 font-mono text-[0.8125rem] uppercase leading-snug tracking-[0.06em] text-cream">
        {children}
      </dd>
    </div>
  );
}

/** Uma linha do "Get Info". */
function LinhaFicha({
  rotulo,
  children,
}: {
  rotulo: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 py-3">
      <dt className="pt-0.5 font-bitmap text-[10px] uppercase leading-tight tracking-[0.08em] text-ink-700">
        {rotulo}
      </dt>
      <dd className="min-w-0 font-mono text-[0.8125rem] leading-snug text-carvao [overflow-wrap:anywhere]">
        {children}
      </dd>
    </div>
  );
}

/** O cabeçalho de seção do papel: ícone, número e título em bitmap, filete. */
function Secao({
  num,
  titulo,
  icone,
  className,
  children,
}: {
  num: string;
  titulo: string;
  icone: NomeIcone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={clsx("[&+&]:mt-[clamp(4rem,8vw,6.5rem)]", className)}>
      <h2 className="mb-[clamp(1.75rem,3.5vw,2.75rem)] flex items-center gap-3 border-b border-carvao pb-3 font-bitmap text-[11px] uppercase leading-none tracking-[0.08em] text-carvao">
        <PixelIcon nome={icone} tamanho={20} />
        <span className="tabular-nums">{num}</span>
        <span aria-hidden>/</span>
        <span>{titulo}</span>
      </h2>
      {children}
    </section>
  );
}

