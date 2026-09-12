import type { Metadata, Viewport } from "next";

import { HTML_LANG } from "@/lib/i18n";

import "../globals.css";
import { fontVariables } from "../fonts";
import { VIEWPORT, metadataDaHome, personJsonLd } from "../metadata";

/**
 * O layout-raiz do INGLÊS — a língua que mora em "/en".
 *
 * Gêmeo de app/(pt)/layout.tsx: leia lá a razão de existirem DOIS layouts-raiz
 * e de app/layout.tsx ter deixado de existir. Aqui só muda o que tem que
 * mudar: `lang="en"` no <html>, o `metadata` em inglês (com `canonical`
 * apontando para "/en") e o `jobTitle` do JSON-LD.
 *
 * REPARE NA GEOMETRIA DA PASTA: o layout está em app/(en)/ mas a página está
 * em app/(en)/en/page.tsx. O grupo `(en)` não entra na URL — quem coloca o
 * "/en" no endereço é o segmento `en` de verdade, um nível abaixo. Os dois
 * precisam existir: o grupo, para poder haver um segundo layout-raiz; o
 * segmento, para haver URL. Mover a página para app/(en)/page.tsx faria o
 * inglês disputar "/" com o português e o build falharia com rota duplicada.
 */

export const metadata: Metadata = metadataDaHome("en");
export const viewport: Viewport = VIEWPORT;

export default function EnRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={HTML_LANG.en} className={fontVariables}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd("en")),
          }}
        />
        {children}
      </body>
    </html>
  );
}
