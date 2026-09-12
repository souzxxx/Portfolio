import { dict } from "@/lib/dict";

import { OG_CONTENT_TYPE, OG_SIZE, quadroOg } from "../../og";

export const runtime = "edge";

/**
 * A imagem de Open Graph do INGLÊS — vale para "/en" e para "/en/cv".
 *
 * Ela mora em app/(en)/en/ e não em app/(en)/ porque imagem de metadata segue
 * o SEGMENTO da URL: em app/(en)/ ela seria emitida para "/", onde já existe a
 * versão em português, e as duas disputariam o mesmo endereço.
 */
export const alt = dict.en.meta.ogAlt;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImageEn() {
  return quadroOg("en");
}
