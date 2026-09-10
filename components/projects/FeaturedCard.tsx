"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { Reveal } from "../ui/Reveal";
import { Meta } from "../ui/Meta";
import { Label } from "../ui/Label";
import { DashedRule } from "../ui/DashedRule";
import { Botao } from "../ui/Botao";
import { StatusPill } from "../ui/StatusPill";
import { Chapa } from "../ui/Chapa";
import { ProjectCover } from "./ProjectCover";
import type { Project } from "@/lib/projects";

/**
 * FeaturedCard — uma faixa da fita editorial dos projetos em destaque.
 *
 * Saiu o card de vidro inteiro: canto de 24px, borda tenue, fundo translucido,
 * desfoque de fundo, sombra difusa colorida, 40px de padding, hover que acende
 * a borda, `whileHover` de escala e os seis icones de biblioteca. Entrou papel:
 * filete tracejado no topo, chapa a esquerda, texto a direita, e nada mais — a
 * separacao entre projetos e o filete, nao uma caixa.
 *
 * A ALTERNANCIA PAR/IMPAR MORREU. Nao existe mais `index % 2` nem
 * `md:order-1`/`md:order-2`: a capa fica SEMPRE a esquerda e o texto SEMPRE a
 * direita, em todos. Alternar lado e o gesto que faz uma pagina ler como
 * landing page; repeticao rigida e o que faz ler como fita/relatorio, que e a
 * tese desta identidade.
 *
 * ── MOBILE 390px, DESENHADO E NAO HERDADO ─────────────────────────────────
 * Uma coluna, e a capa em SANGRIA TOTAL: `-mx-[var(--gutter)] w-screen` cancela
 * o gutter do <Bloco> e leva a chapa de borda a borda da viewport, em 4:5
 * (retrato) para ela dominar a primeira tela de cada projeto. No desktop a
 * mesma capa volta para dentro da coluna de 22rem, quadrada. A troca de
 * proporcao viaja numa custom property (`--capa`, um numero puro: 0.8 no
 * celular, 1 a partir de md) porque `ratio` e uma prop unica de string — assim
 * uma imagem so atende as duas telas, sem segunda instancia do next/image.
 *
 * ── AS CAPAS SAEM EM COR NATURAL ──────────────────────────────────────────
 * A cianotipia (base azul + `screen` + `multiply` creme + hachura diagonal, com
 * a cor real voltando no hover e um botao `[ COR ]` no mobile) foi removida dos
 * screenshots reais. Screenshot de projeto e PROVA de que a coisa existe e
 * roda; tingir a prova e cobri-la de listras faz o leitor decodificar o efeito
 * em vez de ler a interface, e esconde justamente o que o card esta afirmando.
 * Sobrou uma moldura de 1px em carvao — no mobile so em cima e embaixo, porque
 * la a chapa sangra ate as bordas da viewport e uma moldura fechada viraria
 * dois fios colados no vidro. A gravura de duas cores continua nas capas
 * GERADAS (<ProjectCover>, projetos sem screenshot), onde ela e desenho e nao
 * registro.
 */

// Sangria de mobile aplicada a chapa (figura ou capa procedural).
const CAPA_SANGRIA = "-mx-[var(--gutter)] w-screen md:mx-0 md:w-full";
// 100vw enquanto sangra; 22rem quando volta para a coluna do desktop.
const CAPA_SIZES = "(max-width: 768px) 100vw, 22rem";
// Moldura da chapa sobre papel: 1px de carvao (15.66:1). `border-y` no mobile,
// onde a imagem sangra; as quatro bordas a partir de `md`, onde ela volta para
// dentro da coluna de 22rem.
const CAPA_MOLDURA = "border-y border-carvao md:border";

export function FeaturedCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const gallery = project.gallery && project.gallery.length > 0 ? project.gallery : null;
  // O crossfade e animacao de JS: o bloco global de `prefers-reduced-motion`
  // do globals.css zera transicao e animacao de CSS, mas nao alcanca o framer.
  // Com a preferencia ligada, a troca de chapa e instantanea.
  const semMovimento = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState(0);
  const active = gallery ? gallery[activeIdx] : null;

  return (
    <Reveal delay={index * 0.04}>
      <article className="grid border-t border-dashed border-carvao/30 py-[clamp(2.5rem,5vw,4.5rem)] md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:gap-x-12">
        {/* ── ESQUERDA: a chapa ───────────────────────────────────────────── */}
        <div className="[--capa:0.8] md:[--capa:1]">
          {gallery && active ? (
            <>
              {/* Empilhamento por grid (as duas camadas na mesma celula) em vez
                  de `absolute inset-0`: mantem a figura no fluxo, entao a altura
                  da celula continua vindo da propria proporcao da chapa e o
                  botao `[ COR ]` continua caindo logo abaixo dela. */}
              <div className="grid [&>*]:col-start-1 [&>*]:row-start-1">
                <AnimatePresence initial={false}>
                  {/* O UNICO crossfade do site. Ele nao esta aqui para enfeitar:
                      a legenda troca junto com a chapa, e os 0.35s sao o tempo
                      de perceber que a legenda mudou. */}
                  <motion.div
                    key={active.src}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: semMovimento ? 0 : 0.35, ease: "linear" }}
                  >
                    <Chapa
                      src={active.src}
                      alt={`${project.name} — ${active.label}`}
                      ratio="var(--capa)"
                      sizes={CAPA_SIZES}
                      // SEM `priority`, nem no primeiro card. MEDIDO em
                      // 1440x900: esta chapa nasce em y = 2239px, duas telas e
                      // meia abaixo da dobra — e `priority` emitiria no <head>
                      // um `<link rel="preload" as="image" fetchpriority="high">`
                      // com srcset ate 1920w, roubando banda e prioridade de
                      // rede da Instrument Serif do <h1>, que e o LCP. A Chapa
                      // ja cai em `loading="lazy"` sem a prop.
                      className={clsx(CAPA_SANGRIA, CAPA_MOLDURA)}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <Meta items={[active.label]} className="mt-2 text-ink-700" />

              {/* Folha de contato: a fresta de 1px entre as miniaturas E o
                  divisor — o fundo escuro do container aparece pelo `gap-px`,
                  sem borda em nenhuma delas. */}
              <div className="mt-3 grid grid-cols-4 gap-px bg-carvao/25">
                {gallery.map((shot, i) => (
                  <button
                    key={shot.src}
                    type="button"
                    aria-label={shot.label}
                    aria-pressed={activeIdx === i}
                    // Hover NAO e o unico caminho: clique e foco fazem o mesmo,
                    // entao teclado e toque chegam a qualquer chapa.
                    onMouseEnter={() => setActiveIdx(i)}
                    onFocus={() => setActiveIdx(i)}
                    onClick={() => setActiveIdx(i)}
                    className={clsx(
                      // Tambem em cor natural. O <button> nao pode conter um
                      // <figure>, entao a miniatura nao passa pela <Chapa>: o
                      // next/image com `fill` entra direto, e o `relative` daqui
                      // e o que lhe da o retangulo de referencia.
                      "relative h-14 overflow-hidden md:h-16",
                      "motion-safe:transition-opacity motion-safe:duration-150",
                      activeIdx === i
                        ? "outline outline-2 outline-carvao outline-offset-0"
                        : "opacity-75 hover:opacity-100 focus-visible:opacity-100",
                    )}
                  >
                    <Image
                      src={shot.src}
                      alt=""
                      fill
                      sizes="120px"
                      className="object-cover object-top"
                    />
                  </button>
                ))}
              </div>
            </>
          ) : project.cover ? (
            <Chapa
              src={project.cover}
              alt={`${project.name} — captura de tela`}
              ratio="var(--capa)"
              sizes={CAPA_SIZES}
              className={clsx(CAPA_SANGRIA, CAPA_MOLDURA)}
            />
          ) : (
            // Sem screenshot: a gravura procedural de raios, carvao + creme.
            <ProjectCover
              slug={project.slug}
              name={project.name}
              language={project.stack[0]}
              className={clsx(CAPA_SANGRIA, "aspect-[var(--capa)]")}
            />
          )}
        </div>

        {/* ── DIREITA: o texto ────────────────────────────────────────────── */}
        <div className="mt-5 md:mt-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {/* Vocabulario de metadado do site — BUILD/ANO/REPO. */}
            <Meta
              items={[
                `BUILD ${String(index + 1).padStart(3, "0")}`,
                `ANO ${project.year}`,
                project.isPrivate && "REPO: PRIVADO",
              ]}
              className="text-ink-700"
            />
            <StatusPill status={project.status} />
          </div>

          <h3 className="mt-5 text-balance font-display text-d2 uppercase text-carvao">
            {project.name}
          </h3>

          {/* MEDIDA PROPRIA, mais apertada que a `medida` de 68ch da prosa: em
              `text-tag` (11px, tracking 0.18em, caixa alta) a linha corria os
              ~940px da coluna inteira, ou seja ~150 caracteres na tipografia
              menos legivel do sistema. 52ch da mono param a linha antes disso, e
              `text-balance` reparte as duas linhas em vez de deixar a segunda
              orfa — era o caso do commerce-nda ("REDIS COM CIRCUIT BREAKER"). */}
          <p className="mt-3 max-w-[52ch] text-balance font-mono text-tag uppercase text-carvao">
            {project.tagline}
          </p>

          <p className="medida mt-6 font-sans text-body text-ink-600">
            {project.description}
          </p>

          {project.highlights && (
            <ul className="mt-8">
              {project.highlights.map((h, i) => (
                <li
                  key={h}
                  // No celular o numero vai ACIMA do texto: uma calha de 2.5rem
                  // sobrando de 350px espremeria a linha em duas ou tres
                  // palavras. Da md para cima ele volta para a calha.
                  className="grid grid-cols-1 gap-1 border-t border-dashed border-carvao/20 py-3 md:grid-cols-[2.5rem_1fr] md:gap-3"
                >
                  <span className="font-mono text-tag text-carvao">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {/* `medida` no TEXTO e nao na linha: o filete tracejado
                      atravessa a coluna inteira (e o que faz a lista ler como
                      tabela), enquanto a prosa para nas 68ch — alinhada com a
                      descricao e com a resposta de cada decisao. */}
                  <span className="medida font-sans text-body text-ink-600">{h}</span>
                </li>
              ))}
            </ul>
          )}

          {project.decisions && (
            <div className="mt-10">
              {project.decisions.map((d, i) => (
                <div key={d.q} className="mt-8 first:mt-0">
                  <DashedRule className="border-carvao" />
                  <Label className="mt-4 block text-carvao">
                    DECISÃO {String(i + 1).padStart(2, "0")}
                  </Label>
                  <p className="mt-2 text-balance font-display text-d3 uppercase text-carvao">
                    {d.q}
                  </p>
                  <p className="medida mt-2 font-sans text-body text-ink-600">
                    {d.a}
                  </p>
                </div>
              ))}
            </div>
          )}

          <Meta
            items={[`STACK: ${project.stack.join(" · ")}`]}
            className="mt-8 text-ink-700"
          />

          <div className="mt-8 flex flex-wrap gap-3">
            {project.demo && (
              <Botao href={project.demo} external variant="solid" className="text-cream">
                VER NO AR ↗
              </Botao>
            )}
            {project.github && !project.isPrivate && (
              <Botao href={project.github} external variant="outline" className="hover:text-cream">
                CÓDIGO ↗
              </Botao>
            )}
            {/* Repositorio fechado nao vira botao: um retangulo com a mesma
                forma dos CTAs promete um clique que nao existe. Vira metadado,
                na mesma linha, alinhado com os botoes. */}
            {project.isPrivate && (
              <Meta
                items={["REPOSITÓRIO PRIVADO"]}
                className="self-center text-ink-700"
              />
            )}
            {project.writeup && (
              <Botao
                href={project.writeup}
                external
                variant="outline"
                className="hover:text-cream"
              >
                ARQUITETURA &amp; DECISÕES ↗
              </Botao>
            )}
          </div>
        </div>
      </article>
    </Reveal>
  );
}
