import { PixelIcon } from "./PixelIcon";
import type { Dict } from "@/lib/dict";

/**
 * Boot — a tela de "Bem-vindo ao souzxxx" que abre a primeira visita da sessão.
 *
 * CSS PURO, sem estado React. A cortina sai no HTML do servidor e se recolhe
 * sozinha por animação (≈1,25 s no total), então a página nunca fica presa
 * atrás dela — nem sem JavaScript, nem com hidratação lenta, nem num crawler.
 *
 * O script inline roda ANTES do primeiro paint (está no corpo, antes da
 * cortina): se a sessão já viu o boot, ele marca `data-boot="pular"` no <html>
 * e o CSS esconde a cortina e zera o atraso das entradas das janelas. Navegar
 * entre home e case e voltar não repete a abertura. `prefers-reduced-motion`
 * também pula (ver globals.css).
 */
const SCRIPT = `try{var d=document.documentElement;if(sessionStorage.getItem("sx-boot")){d.dataset.boot="pular"}else{sessionStorage.setItem("sx-boot","1")}}catch(e){}`;

export function Boot({ d }: { d: Dict["os"]["boot"] }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
      <div aria-hidden className="boot mesa fixed inset-0 z-[100] grid place-items-center">
        <div className="boot-caixa flex w-[min(24rem,86vw)] flex-col items-center gap-5 border border-carvao bg-cream px-8 py-7 text-carvao shadow-[6px_6px_0_0_#0F0E0C]">
          <PixelIcon nome="computador" tamanho={64} />
          <p className="font-display whitespace-nowrap text-[clamp(1.25rem,5vw,1.75rem)] uppercase leading-none tracking-[0.02em]">
            {d.bemVindo}
          </p>
          <div className="w-full">
            <div className="h-3 w-full border border-carvao p-[2px]">
              <div className="boot-barra h-full bg-[repeating-linear-gradient(90deg,#1C1A17_0_2px,transparent_2px_3px)]" />
            </div>
            <p className="mt-2 text-center font-bitmap text-[10px] uppercase tracking-[0.08em]">
              {d.iniciando}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
