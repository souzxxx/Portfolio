import { Bloco } from "../ui/Bloco";
import { SectionHeader } from "../ui/SectionHeader";
import { FeaturedCard } from "./FeaturedCard";
import { getProjects, type LocalizedProject } from "@/lib/projects";
import { dict } from "@/lib/dict";
import type { Lang } from "@/lib/i18n";

// Ordem curada e explícita: o que abre a conversa técnica vem primeiro.
// Slug ausente em lib/projects.ts é ignorado em vez de quebrar a página.
//
// ATENÇÃO: esta lista é a única porta de entrada da seção. Projeto com
// category: "featured" fora de ORDER não renderiza em lugar nenhum — nem aqui,
// nem no ProjectGrid, que lê só "more" — e nada disso falha o build. Ao promover
// um projeto para destaque, troque a categoria E acrescente o slug aqui.
//
// A ordem é a MESMA nos dois idiomas, e de propósito: `slug` não é prosa, não
// passa por `I18n`, e uma curadoria que divergisse entre "/" e "/en" seria duas
// seções diferentes se fazendo passar por uma.
const ORDER = [
  "financehub",
  "quintoandar-precificacao",
  "commerce-nda",
  "portal-construtora",
  "sentinel",
  "wraeclast",
] as const;

/**
 * Os destaques já no idioma pedido. A lista CRUA (`projects`) não é mais
 * importada aqui: `getProjects(lang)` devolve `LocalizedProject`, onde toda
 * prosa já é `string`, e é isso que o <FeaturedCard> consome — ele não precisa
 * saber que existe um segundo idioma.
 *
 * O `find` continua sendo por `slug`, que é o único campo desta busca que NÃO
 * é bilíngue. Por isso a função pode ser chamada com qualquer idioma quando o
 * que se quer é só a contagem (ver FEATURED_COUNT logo abaixo).
 */
function destaques(lang: Lang): LocalizedProject[] {
  const todos = getProjects(lang);
  return ORDER.map((slug) => todos.find((p) => p.slug === slug)).filter(
    (p): p is LocalizedProject => Boolean(p),
  );
}

/**
 * Quantos destaques o site REALMENTE renderiza — depois do filtro, não o
 * tamanho de ORDER: slug escrito errado aqui some da tela sem quebrar o build,
 * e a numeração do índice tem que seguir o que a página mostra, não o que a
 * lista prometeu.
 *
 * O ProjectGrid continua a contagem a partir daqui (`#07` quando são 6
 * destaques). Antes disso o deslocamento era um `+ 6` cravado no meio do
 * template string de lá, que passou a estar errado no instante em que esta
 * lista ganhou um sexto item.
 *
 * O IDIOMA CRAVADO NO "pt" AQUI NÃO ESCOLHE NADA. O filtro é por `slug`, e
 * `achatar()` não mexe em slug nenhum: `destaques("pt").length` e
 * `destaques("en").length` são o mesmo número por construção. Manter isto como
 * const de módulo (e não como função de `lang`) é o que preserva a assinatura
 * que o ProjectGrid importa — um `FEATURED_COUNT(lang)` obrigaria aquele
 * componente a passar idioma para descobrir um número que não muda com ele.
 */
export const FEATURED_COUNT = destaques("pt").length;

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
 *
 * IDIOMA POR PROP, e este componente continua de SERVIDOR. `lang` desce da
 * rota (pt em "/", en em "/en") e vira `dict[lang]` aqui dentro; nada disso
 * precisa de estado, então a seção inteira — cabeçalho, prosa e as seis capas —
 * continua saindo pronta no HTML. O único JavaScript desta tela é o do
 * <FeaturedCard>, que já era cliente por causa da folha de contato.
 */
export function FeaturedShowcase({ lang }: { lang: Lang }) {
  const d = dict[lang];
  const showcase = destaques(lang);

  return (
    <Bloco ground="paper" id="projects">
      <div className="mx-auto max-w-[96rem]">
        <SectionHeader
          eyebrow={d.secoes.destaques.eyebrow}
          title={d.secoes.destaques.title}
          description={d.secoes.destaques.description}
          tone="paper"
        />

        <div className="mt-[clamp(2.5rem,6vw,5rem)]">
          {showcase.map((project, i) => (
            <FeaturedCard
              key={project.slug}
              project={project}
              index={i}
              // As TRES fatias que o card e o que ele abre precisam, ja no
              // idioma da rota. Ver `DictCard` em lib/dict.ts: o card e de
              // cliente, e um `import { dict }` la dentro traria as duas
              // linguas inteiras para o bundle.
              d={{ card: d.card, lupa: d.lupa, status: d.status }}
            />
          ))}
        </div>
      </div>
    </Bloco>
  );
}
