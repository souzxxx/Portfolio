import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Leonardo Souza — Backend, Web & IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SITE_URL = "https://portfolio-souzxxxs-projects.vercel.app";

// Paleta do sistema, repetida aqui em hex porque `next/og` renderiza fora do
// Tailwind: satori nao enxerga nem as classes nem as variaveis do next/font.
const AZUL = "#1620DC";
const CREME = "#F5F3EE"; // 8.33:1 sobre o azul
const CREME_600 = "#D8D4C8"; // 6.23:1 sobre o azul
const FILETE = "rgba(245,243,238,0.45)";

type Fonte = {
  name: string;
  data: ArrayBuffer;
  weight: 400;
  style: "normal";
};

/**
 * opengraph-image — o preview de TODO link compartilhado (LinkedIn, WhatsApp,
 * Slack). E a primeira coisa que um recrutador ve, antes de abrir o site: por
 * isso ela carrega a identidade inteira em um quadro — campo azul chapado (zero
 * gradiente), nome em serifa display caixa alta com tracking POSITIVO e dois
 * filetes tracejados creme.
 *
 * A fonte vem de public/fonts/ por rede porque satori so aceita buffer de fonte,
 * nunca uma familia CSS. Se o fetch falhar (rede fora, deploy novo, cold start
 * em regiao sem saida), o MESMO JSX e renderizado sem o array `fonts` e satori
 * cai na fonte embutida: a rota NUNCA quebra, e a identidade continua legivel
 * por cor + caixa alta + tracking + filete, so perdendo a serifa.
 */
export default async function OpengraphImage() {
  let fonts: Fonte[] | undefined;
  try {
    const res = await fetch(
      new URL("/fonts/InstrumentSerif-Regular.ttf", SITE_URL),
    );
    if (!res.ok) throw new Error(`fonte indisponivel: HTTP ${res.status}`);
    const data = await res.arrayBuffer();
    fonts = [
      { name: "Instrument Serif", data, weight: 400, style: "normal" },
    ];
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
          backgroundColor: AZUL,
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
          Portfólio · São Paulo, BR · 2026
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
          <div style={{ display: "flex" }}>Leonardo</div>
          <div style={{ display: "flex" }}>Souza</div>
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
          Backend, Web &amp; IA
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
          Java · Spring Boot · Python · TypeScript · Next.js · IA em produção ·
          São Paulo
        </div>
      </div>
    ),
    { ...size, ...(fonts ? { fonts } : {}) },
  );
}
