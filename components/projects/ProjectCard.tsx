"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Github, ExternalLink, Lock } from "lucide-react";
import clsx from "clsx";
import { Reveal } from "../ui/Reveal";
import { StackChips } from "./StackChips";
import { ProjectCover } from "./ProjectCover";
import type { Project } from "@/lib/projects";

export function ProjectCard({
  project,
  index,
  variant = "default",
}: {
  project: Project;
  index: number;
  variant?: "default" | "compact";
}) {
  return (
    <Reveal delay={(index % 6) * 0.05}>
      <motion.article
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        className={clsx(
          "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface/40 backdrop-blur-xl",
          "transition-colors hover:border-indigo-500/50",
        )}
      >
        {/* video or image or cover */}
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border/60">
          {project.video ? (
            <video
              src={project.video}
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          ) : project.cover ? (
            <Image
              src={project.cover}
              alt={`${project.name} preview`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <ProjectCover slug={project.slug} name={project.name} language={project.stack[0]} className="aspect-auto h-full" />
          )}

          {/* hover gradient */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base/90 via-base/20 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-60" />

          {/* private badge */}
          {project.isPrivate && (
            <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-300 backdrop-blur">
              <Lock className="h-3 w-3" />
              Private
            </div>
          )}

          {project.status === "deployed" && (
            <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-emerald-300 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live
            </div>
          )}
        </div>

        {/* content */}
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-balance text-xl font-semibold tracking-tight text-fg">
              {project.name}
            </h3>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              {project.year}
            </span>
          </div>
          <p className="text-balance text-sm leading-relaxed text-muted">
            {variant === "compact"
              ? project.tagline
              : project.tagline}
          </p>

          {variant !== "compact" && (
            <p className="line-clamp-3 text-balance text-sm text-fg/70">
              {project.description}
            </p>
          )}

          <div className="mt-auto flex flex-col gap-3 pt-2">
            <StackChips stack={project.stack.slice(0, 5)} />
            <div className="flex flex-wrap gap-2">
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-medium text-indigo-300 transition hover:bg-indigo-500/25"
                >
                  <ExternalLink className="h-3 w-3" />
                  Demo
                </a>
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/40 px-3 py-1 text-xs text-fg/80 transition hover:border-indigo-500/40 hover:text-fg"
                >
                  <Github className="h-3 w-3" />
                  Code
                </a>
              )}
            </div>
          </div>
        </div>

        {/* hover accent line */}
        <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </motion.article>
    </Reveal>
  );
}
