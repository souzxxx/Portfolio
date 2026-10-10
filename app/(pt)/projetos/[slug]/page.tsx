import type { Metadata } from "next";

import { CasePage } from "@/components/case/CasePage";
import { metadataDoCaso, slugsDosCasos } from "@/components/case/metadata";

/**
 * "/projetos/<slug>" — o case de um projeto em português. A rota é só o
 * endereço: a página inteira mora em components/case/CasePage.tsx, escrita uma
 * vez para as duas línguas. Todo slug sai estático no build, e slug que não
 * existe em lib/projects.ts é 404 em vez de render sob demanda.
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
  return metadataDoCaso("pt", params.slug);
}

export default function CasoPt({ params }: { params: { slug: string } }) {
  return <CasePage lang="pt" slug={params.slug} />;
}
