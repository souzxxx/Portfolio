import { Bloco } from "../ui/Bloco";
import { CabecalhoPasta, contar } from "./CabecalhoPasta";
import { PastaProjeto } from "./PastaProjeto";
import { Pilha } from "./Pilha";
import {
  FEATURED_ORDER,
  getProjects,
  type LocalizedProject,
} from "@/lib/projects";
import { dict } from "@/lib/dict";
import type { Lang } from "@/lib/i18n";

// Ordem curada e explícita: o que abre a conversa técnica vem primeiro.
// Slug ausente em lib/projects.ts é ignorado em vez de quebrar a página — é o
// que deixa esta lista citar projetos que ainda chegam por outra branch.
//
// ATENÇÃO: esta lista é a única porta de entrada da seção. Projeto com
// category: "featured" fora de ORDER não renderiza em lugar nenhum — nem aqui,
// nem no índice, que lê só "more" — e nada disso falha o build. Ao promover
// um projeto para destaque, troque a categoria E acrescente o slug aqui.
//
// A ordem é a MESMA nos dois idiomas: `slug` não é prosa, não passa por `I18n`.
// A lista mora em lib/projects.ts (FEATURED_ORDER): a barra de menu, o terminal
// e o "Próximo projeto" dos cases percorrem a mesma ordem.
const ORDER = FEATURED_ORDER;

function destaques(lang: Lang): LocalizedProject[] {
  const todos = getProjects(lang);
  return ORDER.map((slug) => todos.find((p) => p.slug === slug)).filter(
    (p): p is LocalizedProject => Boolean(p),
  );
}

/**
 * Quantos destaques o site REALMENTE renderiza — depois do filtro, não o
 * tamanho de ORDER. O índice (ProjectGrid) continua a numeração a partir
 * daqui. O idioma cravado em "pt" não escolhe nada: o filtro é por `slug`, que
 * é igual nas duas línguas.
 */
export const FEATURED_COUNT = destaques("pt").length;

/**
 * FeaturedShowcase — "Trabalho selecionado", o bloco PAPEL logo depois do
 * wordmark: um arquivo de pastas empilhadas (ver <Pilha> e <PastaProjeto>).
 *
 * Saiu a fita editorial de cards longos com decisões e folha de contato; esse
 * conteúdo foi para as páginas de case (`hrefProjeto`). A home passou a ser
 * vitrine: uma captura grande, o nome, duas linhas de prova e o convite para
 * abrir a pasta.
 *
 * DE SERVIDOR. O único JavaScript da seção é a <Pilha> (um listener de scroll
 * que escreve uma custom property) e o <Reveal> do cabeçalho; as sete pastas
 * saem prontas no HTML.
 */
export function FeaturedShowcase({ lang }: { lang: Lang }) {
  const d = dict[lang];
  const showcase = destaques(lang);

  return (
    <Bloco ground="paper" id="projects">
      <div className="mx-auto max-w-[96rem]">
        <CabecalhoPasta
          d={d.vitrine.destaques}
          contagem={contar(d.vitrine.itens, showcase.length)}
          tone="paper"
        />

        <div className="mt-[clamp(3rem,7vw,6rem)]">
          <Pilha rotulo={d.vitrine.listaDestaques}>
            {showcase.map((project, i) => (
              <PastaProjeto
                key={project.slug}
                project={project}
                index={i}
                total={showcase.length}
                lang={lang}
                d={d.vitrine}
                status={d.status}
              />
            ))}
          </Pilha>
        </div>
      </div>
    </Bloco>
  );
}
