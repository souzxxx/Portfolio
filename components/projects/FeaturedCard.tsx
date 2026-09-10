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
import { DuotoneImage } from "../ui/DuotoneImage";
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
 * direita, nos cinco. Alternar lado e o gesto que faz uma pagina ler como
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
 * A SANGRIA VAI NO `className` DA FIGURA, nao num wrapper: o DuotoneImage
 * devolve um fragmento (figura + botao `[ COR ]`), e o botao precisa continuar
 * dentro do gutter, alinhado com o texto — se a sangria estivesse no wrapper,
 * ele iria parar colado na borda esquerda da tela.
 */

// Sangria de mobile aplicada a chapa (figura ou capa procedural).
const CAPA_SANGRIA = "-mx-[var(--gutter)] w-screen md:mx-0 md:w-full";
// 100vw enquanto sangra; 22rem quando volta para a coluna do desktop.
const CAPA_SIZES = "(max-width: 768px) 100vw, 22rem";
// A miniatura nao passa pelo <DuotoneImage> — um <figure> dentro de um <button>
// nao e HTML valido —, entao ela usa a classe `.duotone` crua e nao tem a prop
// `preset`. A calibracao clara chega pelas mesmas duas custom properties que o
// preset "light" escreve (1.05 / 0.86): sem isto, os quatro screenshots de UI
// clara do FinanceHub estouram no `screen` e a folha de contato sai em branco.
// A utility ganha da classe `.duotone` por ordem de camada — `.duotone` mora em
// `@layer base`, e as utilities do Tailwind saem depois.
const THUMB_CLARO = "[--duo-contrast:1.05] [--duo-bright:0.86]";

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
      <article className="grid border-t border-dashed border-ink/30 py-[clamp(2.5rem,5vw,4.5rem)] md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:gap-x-12">
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
                    <DuotoneImage
                      src={active.src}
                      alt={`${project.name} — ${active.label}`}
                      ratio="var(--capa)"
                      sizes={CAPA_SIZES}
                      priority={index === 0 && activeIdx === 0}
                      // UI clara: com o preset padrao a imagem estoura no
                      // `screen` e a chapa sai lavada.
                      preset="light"
                      className={CAPA_SANGRIA}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <Meta items={[active.label]} className="mt-2 text-ink-700" />

              {/* Folha de contato: a fresta de 1px entre as miniaturas E o
                  divisor — o fundo escuro do container aparece pelo `gap-px`,
                  sem borda em nenhuma delas. */}
              <div className="mt-3 grid grid-cols-4 gap-px bg-ink/25">
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
                      // A miniatura tambem e cianotipia: `.duotone` pede so um
                      // <img> como filho direto, e o next/image com `fill` e
                      // exatamente isso.
                      "duotone relative h-14 md:h-16",
                      THUMB_CLARO,
                      "motion-safe:transition-opacity motion-safe:duration-150",
                      activeIdx === i
                        ? "outline outline-2 outline-blue outline-offset-0"
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
            <DuotoneImage
              src={project.cover}
              alt={`${project.name} — captura de tela`}
              ratio="var(--capa)"
              sizes={CAPA_SIZES}
              priority={index === 0}
              preset="dark"
              className={CAPA_SANGRIA}
            />
          ) : (
            // Sem screenshot: a gravura procedural de raios, azul + creme.
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

          <h3 className="mt-5 text-balance font-display text-d2 uppercase text-ink">
            {project.name}
          </h3>

          <p className="mt-3 font-mono text-tag uppercase text-blue">
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
                  className="grid grid-cols-1 gap-1 border-t border-dashed border-ink/20 py-3 md:grid-cols-[2.5rem_1fr] md:gap-3"
                >
                  <span className="font-mono text-tag text-blue">
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
                  <DashedRule className="border-ink" />
                  <Label className="mt-4 block text-blue">
                    DECISÃO {String(i + 1).padStart(2, "0")}
                  </Label>
                  <p className="mt-2 text-balance font-display text-d3 uppercase text-ink">
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
