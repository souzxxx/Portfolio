import Link from "next/link";
import { Janela } from "./Janela";
import { PixelIcon } from "./PixelIcon";

/**
 * ErroDoSistema — a 404 do souzxxx OS: a caixa da bomba do Macintosh.
 *
 * Bilíngue por construção (as duas línguas na mesma caixa): a 404 pode nascer
 * de um endereço que não diz em que idioma o visitante estava.
 */
export function ErroDoSistema() {
  return (
    <main className="mesa grid min-h-[100svh] place-items-center px-[var(--gutter)] py-16">
      <Janela titulo="Erro do sistema · System error" sombra="breu" className="w-[min(34rem,100%)]">
        <div className="flex gap-5 px-6 py-6 sm:px-8">
          <PixelIcon nome="bomba" tamanho={56} className="text-carvao" />
          <div className="min-w-0">
            <p className="font-display text-[clamp(1.6rem,4vw,2.2rem)] uppercase leading-[0.95]">
              Desculpe, ocorreu um erro do sistema.
            </p>
            <p className="mt-2 font-sans text-[15px] text-ink-600">
              Sorry, a system error occurred. Esta página não existe — this page does not exist.
            </p>
            <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-700">
              ID = 404
            </p>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-3 border-t border-dashed border-carvao/40 px-6 py-4 sm:px-8">
          <Link
            href="/en"
            className="inline-flex min-h-[2.75rem] items-center border border-carvao px-4 font-mono text-[12px] uppercase tracking-[0.14em] hover:bg-carvao hover:text-cream"
          >
            Restart (EN)
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-[2.75rem] items-center border-2 border-carvao bg-carvao px-4 font-mono text-[12px] uppercase tracking-[0.14em] text-cream shadow-[0_0_0_2px_#F5F3EE,0_0_0_3px_#1C1A17] hover:bg-cream hover:text-carvao"
          >
            Reiniciar
          </Link>
        </div>
      </Janela>
    </main>
  );
}
