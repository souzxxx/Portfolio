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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return metadataDoCaso("pt", slug);
}

export default async function CasoPt({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CasePage lang="pt" slug={slug} />;
}
