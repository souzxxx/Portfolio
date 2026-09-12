import type { Metadata, Viewport } from "next";

import { HTML_LANG } from "@/lib/i18n";

import "../globals.css";
import { fontVariables } from "../fonts";
import { VIEWPORT, metadataDaHome, personJsonLd } from "../metadata";

/**
 * O layout-raiz do PORTUGUÊS — a língua que mora na raiz, "/".
 *
 * ESTE ARQUIVO É UM DOS DOIS LAYOUTS-RAIZ do site; o outro é
 * app/(en)/layout.tsx. O App Router só deixa a RAIZ da árvore renderizar
 * <html>, e o `lang` do <html> é a única coisa que um leitor de tela consulta
 * para escolher a voz — logo, duas línguas com `lang` correto exigem dois
 * layouts-raiz, e dois layouts-raiz exigem que NÃO exista app/layout.tsx
 * (havendo um, ele é a raiz e os dois viram layouts aninhados, cada um
 * emitindo um <html> dentro do outro). O antigo app/layout.tsx foi removido
 * por isso, não por limpeza.
 *
 * O route group `(pt)` NÃO entra na URL: app/(pt)/page.tsx continua servindo
 * "/" e app/(pt)/cv/page.tsx continua servindo "/cv". A URL canônica que já
 * está publicada não muda — essa é a razão de o português ficar no grupo sem
 * prefixo e o inglês carregar o segmento "/en" de verdade.
 *
 * O EFEITO COLATERAL DESEJADO: trocar de idioma atravessa a fronteira entre
 * dois layouts-raiz, então o Next faz navegação de DOCUMENTO INTEIRO em vez de
 * client-side nav. O documento novo já nasce com o `lang`, o `metadata` e o
 * JSON-LD da outra língua — nada é remendado no cliente.
 *
 * O QUE É COMPARTILHADO E O QUE É DUPLICADO AQUI. As fontes (app/fonts.ts), o
 * molde de metadata (app/metadata.ts) e a arte do Open Graph (app/og.tsx) são
 * importados: são as partes onde uma divergência silenciosa custaria caro. O
 * esqueleto <html>/<body> continua escrito nos dois arquivos de propósito —
 * são ~8 linhas, é o que a convenção do Next manda um layout-raiz mostrar, e
 * é exatamente onde as duas línguas PRECISAM diferir.
 */

export const metadata: Metadata = metadataDaHome("pt");
export const viewport: Viewport = VIEWPORT;

export default function PtRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={HTML_LANG.pt} className={fontVariables}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd("pt")),
          }}
        />
        {children}
      </body>
    </html>
  );
}
