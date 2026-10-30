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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return metadataDoCaso("en", slug);
}

export default async function CasoEn({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CasePage lang="en" slug={slug} />;
}
