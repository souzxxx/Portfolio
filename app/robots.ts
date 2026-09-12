import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/i18n";

/**
 * robots — liberado para tudo, com o sitemap apontado.
 *
 * "/en" não precisa de regra própria: `allow: "/"` já cobre a árvore inteira, e
 * o inglês é um segmento dela como qualquer outro. As duas rotas de currículo
 * também não entram aqui — elas se excluem pelo `robots: { index: false }` do
 * próprio <head> (app/metadata.ts), que é o lugar certo: `Disallow` em
 * robots.txt IMPEDE a leitura da página, e um crawler que não lê a página nunca
 * chega a ver a meta tag que pede para não indexá-la.
 *
 * `robots.ts` tem que ficar na RAIZ de app/, fora dos dois route groups: o Next
 * só reconhece este arquivo no topo (o mesmo vale para manifest), enquanto
 * sitemap e as imagens de metadata valem em qualquer segmento. E robots.txt é
 * um arquivo só por domínio de qualquer forma — dois seria um a mais.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
