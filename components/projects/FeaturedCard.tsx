"use client";

import Image from "next/image";
import { motion } from "framer-motion";
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
  return (
    <Reveal delay={index * 0.06}>
      <article
        className={clsx(
          "group relative grid items-center gap-8 rounded-3xl border border-border/60 bg-surface/40 p-6 backdrop-blur-xl",
          "transition-all duration-500 hover:border-indigo-500/40",
          "md:grid-cols-2 md:gap-12 md:p-10",
        )}
      >
        {/* corner number */}
        <span className="absolute right-6 top-6 font-mono text-xs uppercase tracking-widest text-muted">
          0{index + 1} / featured
        </span>

        {/* Image */}
        <div className={clsx("relative", reversed && "md:order-2")}>
          <div className="relative overflow-hidden rounded-2xl border border-border/80 shadow-2xl shadow-indigo-950/40">
            {project.cover ? (
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

            {/* gradient hover overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>

        {/* Content */}
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
