import { dict } from "@/lib/dict";

import { OG_CONTENT_TYPE, OG_SIZE, quadroOg } from "../../../og";
import { slugsDosCasos } from "@/components/case/metadata";

/**
 * A arte de compartilhamento do case. Sem este arquivo a página sai SEM
 * og:image: o `openGraph` do generateMetadata substitui o do layout, e a arte
 * do grupo (app/(pt)/opengraph-image.tsx) não desce para o segmento. Por ora é
 * a mesma arte do site; uma arte por projeto é trabalho de outra wave.
 */
// Os slugs da página saem daqui também: sem eles a arte de cada case seria
// gerada sob demanda a cada crawler. Com eles, sai estática no build.
export const dynamicParams = false;

export function generateStaticParams() {
  return slugsDosCasos();
}

export const alt = dict.pt.meta.ogAlt;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImageCasoPt() {
  return quadroOg("pt");
}
