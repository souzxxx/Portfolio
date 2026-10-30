import type { Metadata, Viewport } from "next";

import { HTML_LANG } from "@/lib/i18n";

import "./globals.css";
import { fontVariables } from "./fonts";
import { VIEWPORT } from "./metadata";
import { ErroDoSistema } from "@/components/os/ErroDoSistema";
import { ZoomLinks } from "@/components/os/ZoomLinks";
import { Pet } from "@/components/pet/Pet";
import { dict } from "@/lib/dict";

/**
 * A 404 de endereço que não casa com rota nenhuma.
 *
 * Com dois layouts-raiz (pt e en) não existe um `app/not-found.tsx` global, e
 * antes um pega-tudo `app/(pt)/[...resto]` chamava `notFound()` para a 404 do
 * souzxxx OS sair dentro do layout em português. Só que esse pega-tudo era
 * rota DINÂMICA: cada endereço inventado por um robô virava uma renderização
 * no servidor. Este arquivo é a convenção do Next para exatamente esse caso
 * (vários layouts-raiz): o Next pula a renderização e devolve esta página,
 * gerada uma vez no build.
 *
 * Ela não passa por layout nenhum, então repete aqui o que o layout em
 * português entregava à 404: CSS global, as fontes, o pet e os zoom-rects. O
 * JSON-LD da pessoa fica de fora — não descreve uma página que não existe.
 *
 * As 404 de dentro de cada idioma (`notFound()` num segmento, slug de case
 * inexistente) continuam com o not-found.tsx de cada grupo.
 */
export const metadata: Metadata = {
  title: "Erro do sistema — Leonardo Souza",
  robots: { index: false },
};
export const viewport: Viewport = VIEWPORT;

export default function GlobalNotFound() {
  return (
    <html
      lang={HTML_LANG.pt}
      className={fontVariables}
      data-scroll-behavior="smooth"
    >
      <body>
        <ErroDoSistema />
        <ZoomLinks />
        <Pet textos={dict.pt.pet} />
      </body>
    </html>
  );
}
