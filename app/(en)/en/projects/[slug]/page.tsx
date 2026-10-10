import type { Metadata } from "next";

import { CasePage } from "@/components/case/CasePage";
import { metadataDoCaso, slugsDosCasos } from "@/components/case/metadata";

/**
 * "/en/projects/<slug>" — o case de um projeto em inglês. Gêmea de
 * app/(pt)/projetos/[slug]/page.tsx: mesma página, outro parâmetro.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return slugsDosCasos();
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  return metadataDoCaso("en", params.slug);
}

export default function CasoEn({ params }: { params: { slug: string } }) {
  return <CasePage lang="en" slug={params.slug} />;
}
