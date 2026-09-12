import { ImageResponse } from "next/og";

import { dict } from "@/lib/dict";
import { SITE_URL, type Lang } from "@/lib/i18n";

/**
 * og — a ARTE do Open Graph, uma só para as duas línguas.
 *
 * E o preview de TODO link compartilhado (LinkedIn, WhatsApp, Slack): a
 * primeira coisa que um recrutador ve, antes de abrir o site. Por isso ela
 * carrega a identidade inteira em um quadro — campo carvao chapado (zero
 * gradiente), nome em serifa display caixa alta com tracking POSITIVO e dois
 * filetes tracejados creme.
 *
 * POR QUE O QUADRO MORA AQUI E NAO NOS DOIS opengraph-image.tsx. O desenho e
 * o MESMO nas duas linguas; so o texto muda. Duplicar as tres faixas seria
 * duplicar as medidas (fontSize 132, lineHeight 0.88, filete de 220px) num
 * lugar onde nada avisa que elas divergiram: satori nao reflui texto e nao
 * emite erro, entao um `fontSize` que ficou 6px maior so numa das linguas sai
 * como uma linha CORTADA no preview — e ninguem olha o preview em ingles.
 *
 * O QUE CADA ROTA AINDA DECLARA SOZINHA: `runtime`, `size`, `contentType` e o
 * `alt`. O `alt` porque o contrato do Next exige uma CONSTANTE estatica por
 * arquivo — nao aceita funcao —, entao cada rota exporta o alt do SEU idioma,
 * que vem de dict[lang].meta.ogAlt.
 *
 * A fonte vem de public/fonts/ por rede porque satori so aceita buffer de
 * fonte, nunca uma familia CSS. Se o fetch falhar (rede fora, deploy novo,
 * cold start em regiao sem saida), o MESMO JSX e renderizado sem o array
 * `fonts` e satori cai na fonte embutida: a rota NUNCA quebra, e a identidade
 * continua legivel por cor + caixa alta + tracking + filete, so perdendo a
 * serifa.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// Paleta do sistema, repetida aqui em hex porque `next/og` renderiza fora do
// Tailwind: satori nao enxerga nem as classes nem as variaveis do next/font.
const CARVAO = "#1C1A17";
const CREME = "#F5F3EE"; // 15.66:1 sobre o carvao
const CREME_600 = "#D8D4C8"; // 11.72:1 sobre o carvao
const FILETE = "rgba(245,243,238,0.45)";

type Fonte = {
  name: string;
  data: ArrayBuffer;
  weight: 400;
  style: "normal";
};

export async function quadroOg(lang: Lang): Promise<ImageResponse> {
  const d = dict[lang];

  let fonts: Fonte[] | undefined;
  try {
    const res = await fetch(
      new URL("/fonts/InstrumentSerif-Regular.ttf", SITE_URL),
    );
    if (!res.ok) throw new Error(`fonte indisponivel: HTTP ${res.status}`);
    const data = await res.arrayBuffer();
    fonts = [{ name: "Instrument Serif", data, weight: 400, style: "normal" }];
  } catch {
    fonts = undefined;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: CARVAO,
          padding: "0 84px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: CREME_600,
          }}
        >
          {d.meta.ogSelo}
        </div>

        <div
          style={{
            display: "flex",
            width: 220,
            borderTop: `2px dashed ${FILETE}`,
            marginTop: 24,
            marginBottom: 36,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "Instrument Serif",
            fontSize: 132,
            textTransform: "uppercase",
            letterSpacing: "2px",
            lineHeight: 0.88,
            color: CREME,
          }}
        >
          {/* Nome proprio: as duas linhas sao iguais nas duas linguas, mas vem
              do dicionario mesmo assim — a quebra "Leonardo / Souza" e uma
              decisao de composicao que ja esta escrita em hero.nome, e uma
              terceira copia dela aqui seria a que ficaria para tras. */}
          {d.hero.nome.map((linha) => (
            <div key={linha} style={{ display: "flex" }}>
              {linha}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 34,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: CREME,
            marginTop: 36,
          }}
        >
          {d.hero.subtitulo}
        </div>

        <div
          style={{
            display: "flex",
            width: 220,
            borderTop: `2px dashed ${FILETE}`,
            marginTop: 40,
            marginBottom: 24,
          }}
        />

        <div style={{ display: "flex", fontSize: 24, color: CREME_600 }}>
          {d.meta.ogStack}
        </div>
      </div>
    ),
    { ...OG_SIZE, ...(fonts ? { fonts } : {}) },
  );
}
