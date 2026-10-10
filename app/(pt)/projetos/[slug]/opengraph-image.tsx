import { dict } from "@/lib/dict";

import { OG_CONTENT_TYPE, OG_SIZE, quadroOg } from "../../../og";

/**
 * A arte de compartilhamento do case. Sem este arquivo a página sai SEM
 * og:image: o `openGraph` do generateMetadata substitui o do layout, e a arte
 * do grupo (app/(pt)/opengraph-image.tsx) não desce para o segmento. Por ora é
 * a mesma arte do site; uma arte por projeto é trabalho de outra wave.
 */
export const runtime = "edge";

export const alt = dict.pt.meta.ogAlt;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImageCasoPt() {
  return quadroOg("pt");
}
