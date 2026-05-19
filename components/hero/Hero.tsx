"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { ArrowDown, Github, Mail } from "lucide-react";
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
    <section className="relative isolate flex min-h-screen items-center overflow-hidden pt-24">
      {/* 3D particle layer */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <ParticleField />
      </div>

      {/* radial glow + grid overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-radial-glow" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-pattern bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

      {/* corner indigo glow */}
      <div className="pointer-events-none absolute -left-32 top-1/3 -z-10 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 -z-10 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px]" />

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
            available for opportunities — São Paulo, BR
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
              <GradientText>Software Engineer</GradientText>
              <span className="text-muted"> @ Insper</span>
            </motion.h2>
          </div>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.32 }}
            className="max-w-2xl text-balance text-lg leading-relaxed text-muted md:text-xl"
          >
            Construo sistemas full-stack que vão de{" "}
            <span className="text-fg">dashboards 3D em tempo real</span>,{" "}
            <span className="text-fg">microsserviços distribuídos</span> a{" "}
            <span className="text-fg">modelos preditivos de ML</span>. Foco em
            entregar produto.
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
          </motion.div>

          {/* Stats line */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="mt-6 grid grid-cols-2 gap-y-8 border-t border-border/60 pt-10 sm:grid-cols-4"
          >
            <StatsCounter value={stats.totalRepos} label="GitHub Repos" suffix="+" />
            <StatsCounter value={stats.liveDeployments} label="Live Deploys" />
            <StatsCounter value={stats.semesters} label="Semestres BCC" />
            <StatsCounter value={stats.yearsBuilding} label="Anos buildando" suffix="+" />
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
        <span className="animate-pulse">↓ scroll</span>
      </motion.div>
    </section>
  );
}
