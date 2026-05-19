import { SectionHeader } from "../ui/SectionHeader";
import { ProjectCard } from "./ProjectCard";
import { moreProjects } from "@/lib/projects";

export function ProjectGrid() {
  return (
    <section id="more" className="relative py-32 md:py-40">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <SectionHeader
          eyebrow="More work"
          title="Mais projetos"
          description="Coisas que construí explorando linguagens, paradigmas e domínios — de Prolog a Python, de jogos a automação de processos."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {moreProjects.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
