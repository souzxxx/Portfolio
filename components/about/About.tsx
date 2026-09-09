"use client";

import { motion } from "framer-motion";
import { Github, Mail, MapPin, ArrowUpRight, FileDown } from "lucide-react";
import { Reveal } from "../ui/Reveal";
import { GradientText } from "../ui/GradientText";
import { Magnetic } from "../ui/Magnetic";

export function About() {
  return (
    <section id="about" className="relative overflow-clip py-32 md:py-40">
      {/* Glow decorativo — gradiente radial, sem `filter: blur()`. Continua
          preso pelo `overflow-clip` da section, então não estoura o scroll
          horizontal no celular. */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.10),transparent_70%)]" />

      <div className="mx-auto max-w-5xl px-6 md:px-12">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Contato
          </span>
        </Reveal>

        <Reveal delay={0.05}>
          <h2 className="mt-8 text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-fg sm:text-6xl md:text-7xl">
            Vamos construir algo que{" "}
            <GradientText>aguenta produção</GradientText>.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-8 max-w-3xl text-balance text-lg leading-relaxed text-muted md:text-xl">
            Sou <span className="font-medium text-fg">Leonardo Souza</span>,
            estudante de Ciência da Computação no{" "}
            <span className="text-fg">Insper</span> (4º semestre), em São Paulo.
            Trabalho com backend e IA aplicada: assistente LLM em cima dos dados
            reais do usuário autenticado, fila outbox com retry exponencial e
            chave de idempotência, rate limit em Redis com circuit breaker que
            falha aberto, e webhooks de pagamento validados por assinatura.
            Também construí um dashboard 3D alimentado por WebSocket e um
            sistema de microsserviços em Java e Python. Prefiro{" "}
            <span className="text-fg">medir a supor</span> — e prefiro o sistema
            que se defende sozinho ao que só funciona no caminho feliz.
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
            <Magnetic className="max-w-full">
              <motion.a
                href="mailto:leonardosouzasilva9@gmail.com"
                className="group inline-flex max-w-full items-center gap-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4 text-base font-medium text-white shadow-[0_10px_40px_rgba(99,102,241,0.4)] transition hover:shadow-[0_14px_50px_rgba(99,102,241,0.6)] sm:px-8"
              >
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span className="break-all text-left">
                  leonardosouzasilva9@gmail.com
                </span>
                <ArrowUpRight className="h-4 w-4 flex-shrink-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </motion.a>
            </Magnetic>
            <Magnetic className="max-w-full">
              <a
                href="https://github.com/souzxxx"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex max-w-full items-center gap-3 rounded-full border border-border bg-surface/60 px-6 py-4 text-base font-medium text-fg backdrop-blur transition hover:border-indigo-500/50 hover:bg-surface sm:px-8"
              >
                <Github className="h-5 w-5 flex-shrink-0" />
                <span className="break-all text-left">github.com/souzxxx</span>
                <ArrowUpRight className="h-4 w-4 flex-shrink-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </Magnetic>
            {/* TODO(linkedin): renderizar o botão de LinkedIn assim que a URL
                real do perfil for confirmada. Não inventar slug — link morto é
                exatamente o problema que esta rodada conserta. */}
            <Magnetic className="max-w-full">
              <a
                href="/leonardo-souza-cv.pdf"
                download
                className="group inline-flex max-w-full items-center gap-3 rounded-full border border-border bg-surface/60 px-6 py-4 text-base font-medium text-fg backdrop-blur transition hover:border-indigo-500/50 hover:bg-surface sm:px-8"
              >
                <FileDown className="h-5 w-5 flex-shrink-0" />
                <span className="text-left">Baixar currículo</span>
              </a>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
