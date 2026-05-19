"use client";

import { motion } from "framer-motion";
import { GraduationCap, Sparkles } from "lucide-react";
import { Reveal } from "../ui/Reveal";
import { SectionHeader } from "../ui/SectionHeader";
import { semesters } from "@/lib/academic";

export function AcademicTimeline() {
  return (
    <section id="academic" className="relative py-32 md:py-40">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <SectionHeader
          eyebrow="Academic"
          title="Insper · BCC"
          description="Bacharelado em Ciência da Computação. Quatro semestres explorando da matemática discreta a sistemas distribuídos, IA e arquitetura de baixo nível."
        />

        <div className="mt-20 grid gap-6 md:grid-cols-2">
          {semesters.map((sem, i) => (
            <Reveal key={sem.number} delay={i * 0.06}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 240, damping: 20 }}
                className="group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-surface/40 p-7 backdrop-blur-xl transition-colors hover:border-indigo-500/40"
              >
                {/* corner ornament */}
                <div className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-indigo-300">
                  <GraduationCap className="h-3.5 w-3.5" />
                  S{sem.number}
                </div>

                <h3 className="text-2xl font-semibold tracking-tight text-fg">
                  {sem.label}
                </h3>

                <ul className="mt-6 grid gap-3">
                  {sem.highlights.map((h) => (
                    <li
                      key={h.name}
                      className="flex items-start gap-3 border-l-2 border-indigo-500/30 pl-4"
                    >
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-indigo-400" />
                      <div className="flex flex-col">
                        <span className="font-medium text-fg">{h.name}</span>
                        <span className="text-sm text-muted">
                          {h.description}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>

                <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
