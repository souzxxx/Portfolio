"use client";

import { motion } from "framer-motion";
import { Github, Mail, MapPin, ArrowUpRight } from "lucide-react";
import { Reveal } from "../ui/Reveal";
import { GradientText } from "../ui/GradientText";
import { Magnetic } from "../ui/Magnetic";

export function About() {
  return (
    <section id="about" className="relative py-32 md:py-40">
      {/* decorative glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[140px]" />

      <div className="mx-auto max-w-5xl px-6 md:px-12">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Get in touch
          </span>
        </Reveal>

        <Reveal delay={0.05}>
          <h2 className="mt-8 text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-fg sm:text-6xl md:text-7xl">
            Vamos construir algo{" "}
            <GradientText>impecável</GradientText>.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-8 max-w-3xl text-balance text-lg leading-relaxed text-muted md:text-xl">
            Sou <span className="text-fg font-medium">Leonardo Souza</span>,
            estudante no <span className="text-fg">Insper</span> (4º semestre).
            Construo full-stack — do shader GLSL ao microsserviço Java, do
            modelo XGBoost à animação 3D — escolhendo a ferramenta certa para
            cada problema. Movido por{" "}
            <span className="text-fg">qualidade, velocidade e impacto real</span>.
          </p>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-10 flex items-center gap-2 font-mono text-sm text-muted">
            <MapPin className="h-4 w-4 text-indigo-400" />
            São Paulo, Brasil
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="mt-12 flex flex-wrap gap-4">
            <Magnetic>
              <motion.a
                href="mailto:leonardosouzasilva9@gmail.com"
                className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-4 text-base font-medium text-white shadow-[0_10px_40px_rgba(99,102,241,0.4)] transition hover:shadow-[0_14px_50px_rgba(99,102,241,0.6)]"
              >
                <Mail className="h-5 w-5" />
                leonardosouzasilva9@gmail.com
                <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </motion.a>
            </Magnetic>
            <Magnetic>
              <a
                href="https://github.com/souzxxx"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-3 rounded-full border border-border bg-surface/60 px-8 py-4 text-base font-medium text-fg backdrop-blur transition hover:border-indigo-500/50 hover:bg-surface"
              >
                <Github className="h-5 w-5" />
                github.com/souzxxx
                <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
