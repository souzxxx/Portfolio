"use client";

import dynamic from "next/dynamic";
import clsx from "clsx";
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { motion, useDragControls } from "framer-motion";
import { Janela } from "./Janela";
import { PixelIcon, type NomeIcone } from "./PixelIcon";
import { Terminal } from "./Terminal";
import type { Dict } from "@/lib/dict";
import { CV_PDF, hrefProjeto } from "@/lib/i18n";
import { stats as numeros } from "@/lib/projects";
import type { Lang } from "@/lib/i18n";

/**
 * Desktop — o hero do site: a mesa do souzxxx OS.
 *
 * Uma janela de papel (LEIA-ME) com o nome, a frase e os CTAs; ao lado, a
 * gravura GLSL numa janela própria, um terminal que responde e um bilhete de
 * "Agora"; na borda direita, os ícones. No desktop com mouse as janelas se
 * arrastam pela barra de título e vêm para a frente no clique; no toque elas
 * são um layout fixo em coluna — arrastar janela com o polegar é briga com o
 * scroll, não brincadeira.
 *
 * A POSIÇÃO INICIAL É LAYOUT, NÃO COORDENADA. As janelas nascem numa grade de
 * CSS e o arraste só soma um deslocamento por transform. Assim a mesa se
 * recompõe sozinha em 1024, 1440 ou 2560 px sem tabela de posições, e o HTML do
 * servidor já sai montado.
 *
 * A entrada (`.janela-entra`) é CSS, num wrapper por fora do elemento que o
 * framer arrasta: animação de CSS em `transform` venceria o transform inline do
 * arraste e a janela voltaria para o lugar a cada frame.
 */
const EngravedObject = dynamic(
  () => import("../hero/EngravedObject").then((m) => m.EngravedObject),
  { ssr: false, loading: () => null },
);

type IdJanela = "leiame" | "render" | "terminal" | "agora" | "lixeira";

function useArrastavel() {
  const [pode, setPode] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const sync = () => setPode(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);
  return pode;
}

/** Uma janela da mesa: entrada em CSS por fora, arraste do framer por dentro. */
function JanelaMesa({
  id,
  titulo,
  ordem,
  z,
  arrastavel,
  limites,
  aFrente,
  onFechar,
  rotuloFechar,
  className,
  corpoClassName,
  children,
}: {
  id: IdJanela;
  titulo: string;
  ordem: number;
  z: number;
  arrastavel: boolean;
  limites: RefObject<HTMLDivElement>;
  aFrente: (id: IdJanela) => void;
  onFechar?: () => void;
  rotuloFechar: string;
  className?: string;
  corpoClassName?: string;
  children: ReactNode;
}) {
  const controles = useDragControls();
  return (
    <div
      className={clsx("janela-entra relative", className)}
      style={{ "--ordem": ordem, zIndex: z } as CSSProperties}
    >
      <motion.div
        drag={arrastavel}
        dragControls={controles}
        dragListener={false}
        dragMomentum={false}
        dragElastic={0.06}
        dragConstraints={limites}
        onPointerDownCapture={() => aFrente(id)}
        className="h-full"
      >
        <Janela
          titulo={titulo}
          ativa={z >= 50}
          sombra="breu"
          onFechar={onFechar}
          rotuloFechar={rotuloFechar}
          alca={arrastavel ? { onPointerDown: (e) => controles.start(e) } : undefined}
          className="h-full"
          corpoClassName={corpoClassName}
          as="div"
        >
          {children}
        </Janela>
      </motion.div>
    </div>
  );
}

function Icone({
  nome,
  rotulo,
  href,
  onClick,
  externo,
  download,
}: {
  nome: NomeIcone;
  rotulo: string;
  href?: string;
  onClick?: () => void;
  externo?: boolean;
  download?: boolean;
}) {
  const conteudo = (
    <>
      <span className="grid h-12 w-12 place-items-center text-carvao [--icon-fill:#F5F3EE] group-hover:text-cream group-hover:[--icon-fill:#1C1A17] group-focus-visible:text-cream group-focus-visible:[--icon-fill:#1C1A17]">
        <PixelIcon nome={nome} tamanho={44} className="drop-shadow-[2px_2px_0_#0F0E0C]" />
      </span>
      <span className="max-w-[6.5rem] px-1 py-px text-center font-bitmap text-[10px] uppercase leading-tight tracking-[0.06em] text-cream group-hover:bg-cream group-hover:text-carvao group-focus-visible:bg-cream group-focus-visible:text-carvao">
        {rotulo}
      </span>
    </>
  );
  const cls =
    "group flex w-[5.5rem] flex-col items-center gap-1.5 outline-none focus-visible:outline-none";
  if (href)
    return (
      <a
        href={href}
        className={cls}
        target={externo ? "_blank" : undefined}
        rel={externo ? "noreferrer" : undefined}
        download={download || undefined}
        data-zoom={href.startsWith("/") && !download ? "" : undefined}
      >
        {conteudo}
      </a>
    );
  return (
    <button type="button" onClick={onClick} className={cls}>
      {conteudo}
    </button>
  );
}

export function Desktop({
  lang,
  hero,
  os,
  projetos,
}: {
  lang: Lang;
  hero: Dict["hero"];
  os: Dict["os"];
  projetos: { slug: string; name: string; apelido: string }[];
}) {
  const mesa = useRef<HTMLDivElement>(null);
  const arrastavel = useArrastavel();
  const [pilha, setPilha] = useState<IdJanela[]>(["agora", "render", "terminal", "leiame"]);
  const [fechadas, setFechadas] = useState<Set<IdJanela>>(new Set(["lixeira"]));

  const aFrente = (id: IdJanela) =>
    setPilha((p) => (p[p.length - 1] === id ? p : [...p.filter((x) => x !== id), id]));
  const z = (id: IdJanela) => 10 + pilha.indexOf(id) * 10 + (pilha[pilha.length - 1] === id ? 30 : 0);
  const fechar = (id: IdJanela) => () =>
    setFechadas((s) => new Set(s).add(id));
  const abrir = (id: IdJanela) => {
    setFechadas((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
    aFrente(id);
  };

  const stats: [string, string][] = [
    [`${numeros.matchesProcessed}k`, hero.stats.partidas],
    [String(numeros.testFiles), hero.stats.testes],
    [String(numeros.domainModules), hero.stats.modulos],
    [String(numeros.distributedServices), hero.stats.servicos],
  ];

  const enfase = "underline decoration-carvao/35 decoration-1 underline-offset-[5px]";
  const cta =
    "inline-flex min-h-[2.75rem] items-center border border-carvao px-4 font-mono text-[12px] uppercase tracking-[0.14em] transition-colors duration-150";

  return (
    <section
      aria-labelledby="hero-nome"
      className="mesa relative overflow-hidden pt-7 text-cream [@media(min-width:1024px)_and_(min-height:760px)]:sticky [@media(min-width:1024px)_and_(min-height:760px)]:top-0 [@media(min-width:1024px)_and_(min-height:760px)]:h-[100svh]"
    >
      <div
        ref={mesa}
        className="relative mx-auto grid h-full max-w-[110rem] gap-x-8 gap-y-6 px-[var(--gutter)] pb-16 pt-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_auto] lg:pb-10 lg:pt-8"
      >
        {/* ── LEIA-ME ─────────────────────────────────────────────── */}
        <JanelaMesa
          id="leiame"
          titulo={os.janelas.leiame}
          ordem={0}
          z={z("leiame")}
          arrastavel={arrastavel}
          limites={mesa}
          aFrente={aFrente}
          rotuloFechar={os.janelas.fechar}
          className="self-start lg:max-w-[48rem]"
        >
          <div className="px-5 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-700">
              {hero.selo.map((s, i) => (
                <Fragment key={s}>
                  {i > 0 ? <span aria-hidden className="px-2">·</span> : null}
                  {s}
                </Fragment>
              ))}
            </p>
            <h1
              id="hero-nome"
              className="mt-5 font-display text-[clamp(3.6rem,9.2vw,8.75rem)] uppercase leading-[0.84] tracking-[0.005em] text-carvao"
            >
              <span className="block">{hero.nome[0]}</span>
              <span className="block">{hero.nome[1]}</span>
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-dashed border-carvao/40 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-600">
              <span className="bg-carvao px-2 py-1 text-cream">{hero.subtitulo}</span>
              {hero.formacao.map((f) => (
                <span key={f}>{f}</span>
              ))}
            </div>
            <p className="mt-5 max-w-[60ch] font-sans text-[clamp(1rem,0.35vw+0.92rem,1.125rem)] leading-[1.6] text-ink-600">
              {hero.prosa.map((t, i) =>
                typeof t === "string" ? (
                  <Fragment key={`${i}${t}`}>{t}</Fragment>
                ) : (
                  <span key={`${i}${t.em}`} className={clsx(enfase, "text-carvao")}>
                    {t.em}
                  </span>
                ),
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href="#projects"
                className={clsx(cta, "bg-carvao text-cream shadow-[3px_3px_0_0_#A8A49B] hover:bg-cream hover:text-carvao")}
              >
                {hero.cta.projetos}
              </a>
              <a href="https://github.com/souzxxx" target="_blank" rel="noreferrer" className={clsx(cta, "hover:bg-carvao hover:text-cream")}>
                {hero.cta.github}
              </a>
              <a href="https://www.linkedin.com/in/leonardo-souzx" target="_blank" rel="noreferrer" className={clsx(cta, "hover:bg-carvao hover:text-cream")}>
                {hero.cta.linkedin}
              </a>
              <a href={CV_PDF[lang]} download className={clsx(cta, "hover:bg-carvao hover:text-cream")}>
                {hero.cta.curriculo}
              </a>
            </div>
          </div>
          {/* Barra de status do Finder: os números que antes eram contadores
              soltos no hero, agora com cara de "Obter informações". */}
          <dl className="grid grid-cols-2 border-t border-carvao font-mono text-[11px] uppercase tracking-[0.12em] text-ink-700 sm:grid-cols-4">
            {stats.map(([n, rotulo], i) => (
              <div
                key={rotulo}
                className={clsx(
                  "flex flex-col gap-0.5 px-5 py-3 sm:px-8",
                  i % 2 === 1 && "border-l border-dashed border-carvao/40",
                  i === 2 && "sm:border-l sm:border-dashed sm:border-carvao/40",
                  i > 1 && "border-t border-dashed border-carvao/40 sm:border-t-0",
                )}
              >
                <dt className="order-2 leading-tight">{rotulo}</dt>
                <dd className="order-1 font-display text-[1.75rem] normal-case leading-none tracking-normal text-carvao">
                  {n}
                </dd>
              </div>
            ))}
          </dl>
        </JanelaMesa>

        {/* ── COLUNA DO MEIO: gravura, terminal, agora ─────────────── */}
        <div className="flex min-w-0 flex-col gap-6 lg:gap-0">
          {fechadas.has("render") ? null : (
            <JanelaMesa
              id="render"
              titulo={os.janelas.render}
              ordem={1}
              z={z("render")}
              arrastavel={arrastavel}
              limites={mesa}
              aFrente={aFrente}
              onFechar={fechar("render")}
              rotuloFechar={os.janelas.fechar}
              className="hidden w-[min(100%,19.5rem)] self-end lg:block lg:mr-6"
              corpoClassName="relative aspect-square bg-carvao"
            >
              <EngravedObject />
              <p className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-cream-700">
                <span>icosaedro · glsl</span>
                <span>three.js</span>
              </p>
            </JanelaMesa>
          )}

          {fechadas.has("terminal") ? null : (
            <JanelaMesa
              id="terminal"
              titulo={os.janelas.terminal}
              ordem={2}
              z={z("terminal")}
              arrastavel={arrastavel}
              limites={mesa}
              aFrente={aFrente}
              onFechar={fechar("terminal")}
              rotuloFechar={os.janelas.fechar}
              className="h-[15.5rem] w-full lg:-mt-16 lg:max-w-[30rem]"
              corpoClassName="h-[calc(100%-22px)]"
            >
              <Terminal lang={lang} d={os.terminal} projetos={projetos} />
            </JanelaMesa>
          )}

          {fechadas.has("agora") ? null : (
            <JanelaMesa
              id="agora"
              titulo={os.janelas.agora}
              ordem={3}
              z={z("agora")}
              arrastavel={arrastavel}
              limites={mesa}
              aFrente={aFrente}
              onFechar={fechar("agora")}
              rotuloFechar={os.janelas.fechar}
              className="w-full lg:ml-auto lg:mr-2 lg:mt-5 lg:w-[19rem]"
              corpoClassName="bg-carvao text-cream"
            >
              <dl className="divide-y divide-dashed divide-cream/20 px-3 py-1">
                {os.agora.map((a, i) => (
                  <div key={a.rotulo} className="flex items-baseline gap-3 py-2">
                    <dt className="flex w-24 shrink-0 items-center gap-2 font-bitmap text-[9px] uppercase tracking-[0.08em] text-cream-700">
                      {i === 0 ? (
                        <span aria-hidden className="h-[7px] w-[7px] bg-gold motion-safe:animate-[piscar_1.6s_steps(2)_infinite]" />
                      ) : (
                        <span aria-hidden className="h-[7px] w-[7px] border border-cream-700" />
                      )}
                      {a.rotulo}
                    </dt>
                    <dd className="font-sans text-[13px] text-cream">{a.valor}</dd>
                  </div>
                ))}
              </dl>
            </JanelaMesa>
          )}
        </div>

        {/* ── ÍCONES ────────────────────────────────────────────────── */}
        <nav
          aria-label={os.icones.rotulo}
          className="janela-entra grid grid-cols-4 justify-items-center gap-y-5 sm:grid-cols-8 lg:flex lg:flex-col lg:items-center lg:gap-4"
          style={{ "--ordem": 4 } as CSSProperties}
        >
          <Icone nome="pasta" rotulo={os.icones.projetos} href="#projects" />
          <Icone nome="predio" rotulo={os.icones.tecna} href={hrefProjeto(lang, "tecna-site")} />
          <Icone nome="grafico" rotulo={os.icones.financehub} href={hrefProjeto(lang, "financehub")} />
          <Icone nome="casa" rotulo={os.icones.quintoandar} href={hrefProjeto(lang, "quintoandar-precificacao")} />
          <Icone nome="documento" rotulo={os.icones.curriculo} href={CV_PDF[lang]} download />
          <Icone nome="carta" rotulo={os.icones.contato} href="#about" />
          <Icone nome="disquete" rotulo={os.icones.github} href="https://github.com/souzxxx" externo />
          <Icone
            nome={fechadas.has("terminal") ? "terminal" : "lixeira"}
            rotulo={fechadas.has("terminal") ? os.janelas.terminal : os.icones.lixeira}
            onClick={() => abrir(fechadas.has("terminal") ? "terminal" : "lixeira")}
          />
        </nav>

        {/* ── LIXEIRA (easter egg) ─────────────────────────────────── */}
        {fechadas.has("lixeira") ? null : (
          <div className="absolute inset-0 z-[90] grid place-items-center p-6">
            <Janela
              titulo={os.janelas.lixeira}
              sombra="breu"
              onFechar={fechar("lixeira")}
              rotuloFechar={os.janelas.fechar}
              className="w-[min(26rem,100%)]"
              as="div"
              role="dialog"
              aria-label={os.janelas.lixeira}
            >
              <ul className="space-y-2 px-5 py-4 font-mono text-[13px] text-carvao">
                {os.lixeira.map((l) => (
                  <li key={l} className="flex items-center gap-3">
                    <PixelIcon nome="documento" tamanho={20} />
                    <span className="line-through decoration-carvao/50">{l}</span>
                  </li>
                ))}
              </ul>
            </Janela>
          </div>
        )}
      </div>

      <p
        aria-hidden
        className="pointer-events-none absolute bottom-3 left-1/2 hidden -translate-x-1/2 items-center gap-2 font-bitmap text-[10px] uppercase tracking-[0.1em] text-cream-700 [@media(min-width:1024px)_and_(min-height:760px)]:flex"
      >
        <span className="motion-safe:animate-[piscar_1.2s_steps(2)_infinite]">↓</span>
        {os.rolar}
      </p>
    </section>
  );
}
