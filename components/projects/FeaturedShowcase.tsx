import { SectionHeader } from "../ui/SectionHeader";
import { FeaturedCard } from "./FeaturedCard";
import { projects, type Project } from "@/lib/projects";

// Ordem curada e explícita: o que abre a conversa técnica vem primeiro.
// Slug ausente em lib/projects.ts é ignorado em vez de quebrar a página.
const ORDER = [
  "financehub",
  "commerce-nda",
  "projeto-software",
  "sentinel",
  "ml-copa",
  "usp-fono",
] as const;

const showcase = ORDER.map((slug) => projects.find((p) => p.slug === slug)).filter(
  (p): p is Project => Boolean(p),
);

export function FeaturedShowcase() {
  return (
    <section id="projects" className="relative py-32 md:py-40">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <SectionHeader
          eyebrow="Projetos em destaque"
          title="Projetos selecionados"
          description="Recorte do que sustenta uma conversa técnica: produto com IA em produção, e-commerce transacional com outbox e idempotência, sistemas distribuídos e modelos preditivos. Os links externos desta seção passam por verificação automática semanal."
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
