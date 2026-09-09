import { SectionHeader } from "../ui/SectionHeader";
import { FeaturedCard } from "./FeaturedCard";
import { projects, type Project } from "@/lib/projects";

// Ordem curada e explícita: o que abre a conversa técnica vem primeiro.
// Slug ausente em lib/projects.ts é ignorado em vez de quebrar a página.
//
// ATENÇÃO: esta lista é a única porta de entrada da seção. Projeto com
// category: "featured" fora de ORDER não renderiza em lugar nenhum — nem aqui,
// nem no ProjectGrid, que lê só "more" — e nada disso falha o build. Ao promover
// um projeto para destaque, troque a categoria E acrescente o slug aqui.
const ORDER = [
  "financehub",
  "wraeclast",
  "commerce-nda",
  "portal-construtora",
  "sentinel",
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
          description="Recorte do que sustenta uma conversa técnica: produto de IA em produção, busca vetorial com pgvector, e-commerce transacional com outbox e idempotência, e web com usuário real. Os links externos desta seção passam por verificação automática semanal."
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
