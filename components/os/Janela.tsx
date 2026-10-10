import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

/**
 * Janela — o cromo de janela do souzxxx OS, no desenho do Macintosh 1-bit.
 *
 * Barra de título com seis filetes horizontais, título centralizado num recorte
 * de papel e a caixa de fechar à esquerda; corpo em papel creme, borda de 1px e
 * sombra DURA (sem blur) deslocada para baixo e para a direita. É a única peça
 * de "profundidade" do sistema: o resto do site continua chapado.
 *
 * SEM HOOK E SEM "use client": a janela é só desenho. Quem precisa arrastar
 * (o desktop do hero) passa `alca` — os handlers de ponteiro vão direto na barra
 * de título — e quem precisa fechar passa `onFechar`. Usada no servidor, ela é
 * uma moldura estática; usada no cliente, é uma janela de verdade.
 *
 * `ativa={false}` apaga os filetes, como o Mac fazia com a janela de trás: dá
 * para empilhar várias e o olho sabe qual está na frente sem cor nenhuma.
 */
export function Janela({
  titulo,
  children,
  ativa = true,
  onFechar,
  rotuloFechar = "Fechar",
  alca,
  acessorio,
  sombra = "carvao",
  className,
  corpoClassName,
  as: Tag = "section",
  ...resto
}: {
  titulo: string;
  children: ReactNode;
  ativa?: boolean;
  onFechar?: () => void;
  rotuloFechar?: string;
  /** Props espalhadas na barra de título — o ponto de pega do arraste. */
  alca?: HTMLAttributes<HTMLDivElement>;
  /** Algo pequeno na ponta direita da barra (ex.: contador "3/7"). */
  acessorio?: ReactNode;
  /** "carvao" sobre papel; "breu" sobre o desktop carvão, onde carvão sumiria. */
  sombra?: "carvao" | "breu" | "nenhuma";
  className?: string;
  corpoClassName?: string;
  as?: "section" | "div" | "article" | "aside";
} & Omit<HTMLAttributes<HTMLElement>, "title">) {
  return (
    <Tag
      {...resto}
      className={clsx(
        "janela flex flex-col border border-carvao bg-cream text-carvao",
        sombra === "carvao" && "shadow-[4px_4px_0_0_#1C1A17]",
        sombra === "breu" && "shadow-[6px_6px_0_0_#0F0E0C]",
        className,
      )}
    >
      <div
        {...alca}
        className={clsx(
          "relative flex h-[22px] shrink-0 items-center border-b border-carvao px-2",
          alca && "cursor-grab touch-none select-none active:cursor-grabbing",
          alca?.className,
        )}
      >
        {/* Os filetes. Ficam num absoluto atrás do título e da caixa de
            fechar, que pintam papel por cima e "recortam" as listras. */}
        {ativa ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-[3px] inset-y-[4px] bg-[repeating-linear-gradient(to_bottom,#1C1A17_0_1px,transparent_1px_3px)]"
          />
        ) : null}

        {onFechar ? (
          <button
            type="button"
            onClick={onFechar}
            aria-label={`${rotuloFechar}: ${titulo}`}
            className="relative z-10 grid h-[13px] w-[13px] place-items-center border border-carvao bg-cream outline-offset-2 hover:bg-carvao"
          >
            <span aria-hidden className="h-[5px] w-[5px] border border-cream" />
          </button>
        ) : (
          <span
            aria-hidden
            className="relative z-10 h-[13px] w-[13px] border border-carvao bg-cream"
          />
        )}

        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="bg-cream px-2 font-bitmap text-[10px] uppercase leading-none tracking-[0.08em]">
            {titulo}
          </span>
        </span>

        {acessorio ? (
          <span className="relative z-10 ml-auto bg-cream pl-2 font-mono text-[10px] leading-none">
            {acessorio}
          </span>
        ) : null}
      </div>

      <div className={clsx("min-h-0 flex-1", corpoClassName)}>{children}</div>
    </Tag>
  );
}
