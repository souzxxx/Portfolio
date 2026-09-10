import { Bloco } from "../ui/Bloco";
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

/**
 * FeaturedShowcase — o bloco PAPEL da fita editorial.
 *
 * O invólucro é a única coisa que mudou aqui: a <section> com `py-32` virou
 * <Bloco ground="paper">, que pinta o campo de cor na própria seção e carrega o
 * ritmo (`--block`/`--gutter`) do site inteiro.
 *
 * A lista NÃO tem gap. A separação entre projetos é o filete tracejado no topo
 * de cada <article> — dois vizinhos encostam e o único traço entre eles é a
 * linha, como numa fita de relatório. Um `gap-16` aqui reintroduziria a leitura
 * de "cards flutuando", que é justamente o que esta wave apaga.
 *
 * O container é `max-w-[96rem]` e não `max-w-7xl`: a coluna de texto já está
 * contida pela medida de 68ch dentro do card, então o container largo serve
 * para a chapa de 22rem e o texto ficarem lado a lado sem espremer nenhum dos
 * dois em telas grandes.
 */
export function FeaturedShowcase() {
  return (
    <Bloco ground="paper" id="projects">
      <div className="mx-auto max-w-[96rem]">
        <SectionHeader
          eyebrow="#02 · TRABALHO SELECIONADO"
          title="Projetos selecionados"
          description="Recorte do que sustenta uma conversa técnica: produto de IA em produção, busca vetorial com pgvector, e-commerce transacional com outbox e idempotência, e web com usuário real. Os links externos desta seção passam por verificação automática semanal."
          tone="paper"
        />

        <div className="mt-[clamp(2.5rem,6vw,5rem)]">
          {showcase.map((project, i) => (
            <FeaturedCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </div>
    </Bloco>
  );
}
