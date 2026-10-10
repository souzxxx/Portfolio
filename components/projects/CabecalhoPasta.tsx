import clsx from "clsx";
import { Reveal } from "../ui/Reveal";
import { PixelIcon } from "../os/PixelIcon";
import type { CabecalhoVitrine } from "@/lib/dict";

/**
 * CabecalhoPasta — a abertura das duas seções de projeto, desenhada como a
 * barra de título de uma janela do Finder 1-bit que acabou de abrir.
 *
 * Substitui o <SectionHeader> (filete + eyebrow + título) SÓ nestas duas
 * seções: é aqui que o visitante entra "dentro" do sistema, e a barra listrada
 * com o caminho em bitmap é a mesma peça da <Janela> do hero — o olho reconhece
 * o cromo antes de ler o título. Os filetes e o caminho ficam numa faixa de
 * 22px, exatamente a altura da barra da janela, para as duas lerem como o
 * mesmo objeto em escalas diferentes.
 *
 * A contagem ("07 ITENS") vem pronta do call site: quem sabe quantos itens a
 * seção REALMENTE renderiza é quem filtrou a lista, não o dicionário.
 *
 * De servidor: nada aqui reage a nada. O <Reveal> é o único cliente, e ele já
 * sai visível no HTML (ver components/ui/Reveal.tsx).
 */
export function CabecalhoPasta({
  d,
  contagem,
  tone,
}: {
  d: CabecalhoVitrine;
  contagem: string;
  tone: "paper" | "carvao";
}) {
  const papel = tone === "paper";
  // O recorte que "corta" os filetes tem que ser da cor do campo, senão o
  // rótulo flutua numa caixa de outra cor no meio das listras.
  const recorte = papel ? "bg-cream" : "bg-carvao";

  return (
    <Reveal>
      <header>
        <div className="relative flex h-[22px] items-center justify-between">
          <span
            aria-hidden
            className={clsx(
              "pointer-events-none absolute inset-x-0 inset-y-[4px]",
              papel
                ? "bg-[repeating-linear-gradient(to_bottom,#1C1A17_0_1px,transparent_1px_3px)]"
                : "bg-[repeating-linear-gradient(to_bottom,rgba(245,243,238,0.55)_0_1px,transparent_1px_3px)]",
            )}
          />
          <span
            className={clsx(
              "relative flex items-center gap-2 pr-3 font-bitmap text-[11px] uppercase leading-none tracking-[0.06em]",
              recorte,
            )}
          >
            <PixelIcon
              nome="pasta"
              tamanho={16}
              className={papel ? undefined : "[--icon-fill:#1C1A17]"}
            />
            {d.caminho}
          </span>
          <span
            className={clsx(
              "relative pl-3 font-bitmap text-[11px] uppercase leading-none tracking-[0.06em]",
              recorte,
            )}
          >
            {d.secao} · {contagem}
          </span>
        </div>

        <div className="mt-[clamp(2.25rem,5vw,4.5rem)] grid items-end gap-x-12 gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)]">
          {/* leading 0.95, e não menos: os dois títulos podem carregar til e
              acento em caixa alta (ÍNDICE, SELEÇÃO), e abaixo disso o
              diacrítico encosta na linha de cima. */}
          <h2 className="text-balance font-display text-[clamp(3rem,9.5vw,8.75rem)] uppercase leading-[0.95] tracking-[0.01em]">
            {d.titulo}
          </h2>
          <p
            className={clsx(
              "font-sans text-body lg:pb-3",
              papel ? "text-ink-600" : "text-cream-600",
            )}
          >
            {d.descricao}
          </p>
        </div>
      </header>
    </Reveal>
  );
}

/** "{n} ITENS" com o número em dois dígitos, como o resto da numeração. */
export function contar(modelo: string, n: number) {
  return modelo.replace("{n}", String(n).padStart(2, "0"));
}
