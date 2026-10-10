import { dict } from "@/lib/dict";

import { OG_CONTENT_TYPE, OG_SIZE, quadroOg } from "../../../../og";

/** Gêmea de app/(pt)/projetos/[slug]/opengraph-image.tsx — leia lá o porquê. */
export const runtime = "edge";

export const alt = dict.en.meta.ogAlt;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImageCasoEn() {
  return quadroOg("en");
}
