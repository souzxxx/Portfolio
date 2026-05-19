"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Github, ExternalLink, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import { Reveal } from "../ui/Reveal";
import { StackChips } from "./StackChips";
import { StatusPill } from "../ui/StatusPill";
import { ProjectCover } from "./ProjectCover";
import type { Project } from "@/lib/projects";

export function FeaturedCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const reversed = index % 2 === 1;
  const gallery = project.gallery && project.gallery.length > 0 ? project.gallery : null;
  const [activeIdx, setActiveIdx] = useState(0);
  const active = gallery ? gallery[activeIdx] : null;

  return (
    <Reveal delay={index * 0.06}>
      <article
        className={clsx(
          "group relative grid items-center gap-8 rounded-3xl border border-border/60 bg-surface/40 p-6 backdrop-blur-xl",
          "transition-all duration-500 hover:border-indigo-500/40",
          "md:grid-cols-2 md:gap-12 md:p-10",
        )}
      >
        <span className="absolute right-6 top-6 font-mono text-xs uppercase tracking-widest text-muted">
          0{index + 1} / featured
        </span>

        <div className={clsx("relative", reversed && "md:order-2")}>
          <div className="relative overflow-hidden rounded-2xl border border-border/80 shadow-2xl shadow-indigo-950/40">
            {gallery && active ? (
              <div className="relative aspect-[16/10] w-full bg-surface">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.src}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={active.src}
                      alt={`${project.name} — ${active.label}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover object-top"
                      priority={index < 2 && activeIdx === 0}
                    />
                  </motion.div>
                </AnimatePresence>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-10">
                  <p className="text-xs font-medium text-white/90">{active.label}</p>
                </div>
              </div>
            ) : project.cover ? (
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative aspect-[16/10] w-full"
              >
                <Image
                  src={project.cover}
                  alt={`${project.name} screenshot`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority={index < 2}
                />
              </motion.div>
            ) : (
              <ProjectCover slug={project.slug} name={project.name} language={project.stack[0]} />
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          {gallery && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {gallery.map((shot, i) => (
                <button
                  key={shot.src}
                  type="button"
                  onMouseEnter={() => setActiveIdx(i)}
                  onFocus={() => setActiveIdx(i)}
                  onClick={() => setActiveIdx(i)}
                  className={clsx(
                    "relative aspect-[16/10] overflow-hidden rounded-lg border transition",
                    activeIdx === i
                      ? "border-indigo-400 ring-2 ring-indigo-500/50"
                      : "border-border/60 opacity-70 hover:opacity-100",
                  )}
                  aria-label={shot.label}
                >
                  <Image
                    src={shot.src}
                    alt={shot.label}
                    fill
                    sizes="120px"
                    className="object-cover object-top"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={clsx("flex flex-col gap-5", reversed && "md:order-1")}>
          <div className="flex items-center gap-3">
            <StatusPill status={project.status} isPrivate={project.isPrivate} />
            <span className="font-mono text-xs text-muted">{project.year}</span>
          </div>

          <div>
            <h3 className="text-balance text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
              {project.name}
            </h3>
            <p className="mt-2 text-balance text-lg text-indigo-300">
              {project.tagline}
            </p>
          </div>

          <p className="text-balance text-base leading-relaxed text-muted">
            {project.description}
          </p>

          {project.highlights && (
            <ul className="grid gap-2">
              {project.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-2 text-sm text-fg/80"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-400" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}

          <StackChips stack={project.stack} />

          <div className="mt-2 flex flex-wrap gap-3">
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noreferrer"
                className="group/btn inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-medium text-white shadow-[0_8px_25px_rgba(99,102,241,0.35)] transition hover:shadow-[0_12px_35px_rgba(99,102,241,0.55)]"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Live Demo
                <ArrowUpRight className="h-3.5 w-3.5 transition group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-5 py-2.5 text-sm font-medium text-fg backdrop-blur transition hover:border-indigo-500/50 hover:bg-surface"
              >
                <Github className="h-3.5 w-3.5" />
                Source
              </a>
            )}
          </div>
        </div>
      </article>
    </Reveal>
  );
}
