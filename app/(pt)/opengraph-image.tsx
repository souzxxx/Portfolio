import { dict } from "@/lib/dict";

import { OG_CONTENT_TYPE, OG_SIZE, quadroOg } from "../og";

export const runtime = "edge";

/**
 * A imagem de Open Graph do PORTUGUÊS — vale para "/" e para tudo abaixo dela
 * no grupo `(pt)`, que hoje é só "/cv".
 *
 * O quadro mora em app/og.tsx e é o mesmo das duas línguas; aqui ficam só os
 * quatro exports que o Next exige por ARQUIVO. O `alt` tem que ser uma
 * constante estática (o Next não aceita função), então cada rota exporta o alt
 * do seu idioma — este lê dict.pt, o de app/(en)/en/ lê dict.en.
 */
export const alt = dict.pt.meta.ogAlt;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImagePt() {
  return quadroOg("pt");
}
