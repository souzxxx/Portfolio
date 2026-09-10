import clsx from "clsx";
import { Reveal } from "./Reveal";
import { DashedRule } from "./DashedRule";
import { Meta } from "./Meta";

/**
 * SectionHeader — a abertura padrao de secao.
 *
 * API (contrato, nao mude):
 *   <SectionHeader
 *     eyebrow={string} title={string} description?={string}
 *     tone?={"paper" | "blue" | "ink"}   // default: "paper"
 *     className?={string}
 *   />
 *
 * Saiu a pilula com borda indigo, fundo indigo/10 e ponto `animate-pulse`;
 * entrou a abertura editorial: filete tracejado na largura do container,
 * rotulo mono em caixa alta logo abaixo, titulo em serifa caixa alta e a
 * descricao em prosa dentro da medida de 68ch.
 *
 * `tone` NAO pinta fundo (fundo e sempre do <Bloco>): ele so escolhe os tons
 * secundarios aprovados naquele campo de cor, seguindo a matriz de contraste —
 * no papel `ink.700`/`ink.600`, no azul `cream.600` (nunca `cream.700`, que da
 * 3.71:1 sobre azul e reprova AA), no breu `cream.700`/`cream.600`.
 *
 * O titulo usa `text-d2` (leading 0.95) e nao `text-d1`: titulo de secao pode
 * carregar FORMACAO, DECISOES, SAO PAULO, e com leading 0.88 o til encostaria
 * na linha de cima.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  tone = "paper",
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  tone?: "paper" | "blue" | "ink";
  className?: string;
}) {
  const eyebrowTone =
    tone === "paper" ? "text-ink-700" : tone === "blue" ? "text-cream-600" : "text-cream-700";
  const proseTone = tone === "paper" ? "text-ink-600" : "text-cream-600";

  return (
    <Reveal>
      <div className={className}>
        <DashedRule />
        <Meta items={[eyebrow]} className={clsx("mt-4", eyebrowTone)} />
        <h2 className="mt-5 text-balance font-display text-d2 uppercase">
          {title}
        </h2>
        {description && (
          <p className={clsx("medida mt-5 font-sans text-lead", proseTone)}>
            {description}
          </p>
        )}
      </div>
    </Reveal>
  );
}
