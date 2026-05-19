import { SectionHeader } from "../ui/SectionHeader";
import { FeaturedCard } from "./FeaturedCard";
import { featuredProjects, mlProjects, systemsProjects } from "@/lib/projects";

export function FeaturedShowcase() {
  // Show all featured + ml + systems as main showcases
  const showcase = [...featuredProjects, ...mlProjects, ...systemsProjects];

  return (
    <section id="projects" className="relative py-32 md:py-40">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <SectionHeader
          eyebrow="Featured work"
          title="Projetos selecionados"
          description="Recorte do que estou shippando: produtos full-stack em produção, sistemas distribuídos e modelos preditivos. Cinco com deploy ao vivo na Vercel."
        />

        <div className="mt-20 flex flex-col gap-10 md:gap-16">
          {showcase.map((project, i) => (
            <FeaturedCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
