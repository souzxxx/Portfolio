import type { Metadata } from "next";

import { CvDocument } from "@/components/cv/CvDocument";

import { metadataDoCv } from "../../../metadata";

/**
 * "/en/cv" — o currículo em inglês, o mesmo documento com a língua trocada.
 *
 * Ela é a fonte de public/leonardo-souza-cv-en.pdf: "npm run cv" imprime as
 * DUAS rotas e reprova se qualquer um dos dois PDFs passar de uma página A4.
 * O CSS é um só para os dois idiomas, então acrescentar uma linha aqui aperta
 * o A4 do português também — o guard existe exatamente para cobrar isso.
 */
export const metadata: Metadata = metadataDoCv("en");

export default function CvEn() {
  return <CvDocument lang="en" />;
}
