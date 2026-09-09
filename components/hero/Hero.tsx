"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { ArrowDown, FileDown, Github, Mail } from "lucide-react";
import { GradientText } from "../ui/GradientText";
import { Magnetic } from "../ui/Magnetic";
import { StatsCounter } from "./StatsCounter";
import { stats } from "@/lib/projects";

const ParticleField = dynamic(
  () => import("./ParticleField").then((m) => m.ParticleField),
  { ssr: false, loading: () => null },
);

export function Hero() {
  return (
    // pb-20 reserva a faixa do indicador de scroll (`absolute bottom-8`, ~45px
    // do fundo da section). Sem isso o conteúdo centralizado encosta no
    // indicador e ele sobrepõe a última linha de stats — em 1440×900, 1280×800
    // e 390×844. O padding é do fluxo; o `absolute` não o enxerga, então a
    // folga sobra inteira para o indicador.
    <section className="relative isolate flex min-h-screen items-center overflow-hidden pb-20 pt-24">
      {/* 3D particle layer */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <ParticleField />
      </div>

      {/* radial glow + grid overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-radial-glow" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-pattern bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

      {/* Glows de canto. Gradiente radial em vez de `filter: blur()`: um blur
          de 120px sobre um div de 384px obriga o compositor a manter um buffer
          offscreen grande e refiltrá-lo a cada frame. O gradiente pinta direto,
          sem buffer intermediário. Mesma cor, mesma opacidade, mesma posição. */}
      <div className="pointer-events-none absolute -left-32 top-1/3 -z-10 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.20),transparent_70%)]" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 -z-10 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(147,51,234,0.20),transparent_70%)]" />

      <div className="mx-auto w-full max-w-7xl px-6 md:px-12">
        <div className="flex flex-col gap-12">
          {/* Status line */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            disponível para vagas · backend, web &amp; IA · São Paulo, BR
          </motion.div>

          {/* Headline */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="text-balance text-6xl font-semibold leading-[1.05] tracking-tight text-fg sm:text-7xl md:text-8xl lg:text-[120px]"
            >
              Leonardo Souza
            </motion.h1>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 text-balance text-2xl font-medium tracking-tight text-muted sm:text-3xl md:text-4xl lg:text-5xl"
            >
              <GradientText>Backend, Web &amp; IA</GradientText>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.26 }}
              className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-muted sm:text-sm"
            >
              Ciência da Computação · Insper · 5º semestre · São Paulo
            </motion.p>
          </div>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.32 }}
            className="max-w-2xl text-balance text-lg leading-relaxed text-muted md:text-xl"
          >
            Construo backend, web e IA que rodam em produção:{" "}
            <span className="text-fg">
              assistente LLM sobre os dados do próprio usuário
            </span>
            ,{" "}
            <span className="text-fg">
              busca vetorial com pgvector
            </span>{" "}
            para respostas ancoradas no contexto recuperado,{" "}
            <span className="text-fg">
              outbox com retry exponencial e idempotência
            </span>{" "}
            e{" "}
            <span className="text-fg">
              front-end Next.js em sistema com usuário real
            </span>
            . Three.js e GLSL entram quando o problema é de visualização — não
            antes.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Magnetic>
              <a
                href="#projects"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 font-medium text-white shadow-[0_8px_30px_rgba(99,102,241,0.4)] transition hover:shadow-[0_12px_40px_rgba(99,102,241,0.6)]"
              >
                Ver projetos
                <ArrowDown className="h-4 w-4 transition group-hover:translate-y-0.5" />
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="https://github.com/souzxxx"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-6 py-3 font-medium text-fg backdrop-blur transition hover:border-indigo-500/50 hover:bg-surface/80"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="mailto:leonardosouzasilva9@gmail.com"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-6 py-3 font-medium text-fg backdrop-blur transition hover:border-indigo-500/50 hover:bg-surface/80"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="/leonardo-souza-cv.pdf"
                download
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-6 py-3 font-medium text-fg backdrop-blur transition hover:border-indigo-500/50 hover:bg-surface/80"
              >
                <FileDown className="h-4 w-4" />
                Currículo
              </a>
            </Magnetic>
          </motion.div>

          {/* Stats line */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="mt-6 grid grid-cols-2 gap-y-8 border-t border-border/60 pt-10 sm:grid-cols-4"
          >
            {/* 49.071 linhas em ml-copa/data/raw/results.csv — arredondado, sem "+" */}
            <StatsCounter value={stats.matchesProcessed} label="partidas no pipeline de ML" suffix="k" />
            <StatsCounter value={stats.testFiles} label="arquivos de teste" />
            <StatsCounter value={stats.domainModules} label="módulos de domínio" />
            <StatsCounter value={stats.distributedServices} label="serviços distribuídos" />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted"
      >
        <span className="animate-pulse">↓ role</span>
      </motion.div>
    </section>
  );
}
