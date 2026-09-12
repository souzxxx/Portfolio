import type { Metadata } from "next";

import { CvDocument } from "@/components/cv/CvDocument";

import { metadataDoCv } from "../../metadata";

/**
 * "/cv" — a rota do currículo em português. Só a casca: o documento inteiro —
 * texto, CSS e o ritmo que faz caber em uma página A4 — mora em
 * components/cv/CvDocument.tsx, e a rota em inglês (/en/cv) renderiza o MESMO
 * componente com lang="en".
 *
 * Ela existe para ser impressa: scripts/build-cv.ts abre esta URL no Chromium
 * e grava public/leonardo-souza-cv.pdf, reprovando se o PDF sair com duas
 * páginas. O `noindex` vem de metadataDoCv() — ver a razão lá.
 */
export const metadata: Metadata = metadataDoCv("pt");

export default function CvPt() {
  return <CvDocument lang="pt" />;
}
