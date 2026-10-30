import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { dict } from "@/lib/dict";
import { type Lang } from "@/lib/i18n";
import { pixelPaths, type NomeIcone } from "@/components/os/PixelIcon";

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
 * O QUE CADA ROTA AINDA DECLARA SOZINHA: `size`, `contentType` e o `alt`. O `alt` porque o contrato do Next exige uma CONSTANTE estatica por
 * arquivo — nao aceita funcao —, entao cada rota exporta o alt do SEU idioma,
 * que vem de dict[lang].meta.ogAlt.
 *
 * As rotas rodam no runtime Node (o Edge ficou deprecated no Next 16) e por
 * isso saem ESTATICAS: a arte e gerada uma vez no build e servida pela CDN,
 * em vez de virar uma funcao a cada crawler que abre o preview. A fonte e
 * lida de public/fonts/ no disco — satori so aceita buffer de fonte, nunca
 * uma familia CSS. Se a leitura falhar, o MESMO JSX e renderizado sem o array
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

type Fonte = {
  name: string;
  data: Buffer;
  weight: 400;
  style: "normal";
};

export async function quadroOg(lang: Lang): Promise<ImageResponse> {
  const d = dict[lang];

  let fonts: Fonte[] | undefined;
  try {
    const data = await readFile(
      join(process.cwd(), "public/fonts/InstrumentSerif-Regular.ttf"),
    );
    fonts = [{ name: "Instrument Serif", data, weight: 400, style: "normal" }];
  } catch {
    fonts = undefined;
  }

  // O cartão é a própria mesa do souzxxx OS: barra de menu de papel, mesa
  // carvão e a janela LEIA-ME com o nome. Os filetes da barra de título são
  // seis <div> de 1 px — o satori não garante `repeating-linear-gradient`.
  const filetes = Array.from({ length: 6 }, (_, i) => (
    <div key={i} style={{ display: "flex", height: 2, backgroundColor: CARVAO, marginTop: i ? 3 : 0 }} />
  ));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: CARVAO,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 44,
            padding: "0 28px",
            backgroundColor: CREME,
            borderBottom: `2px solid ${CARVAO}`,
            color: CARVAO,
            fontSize: 18,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex", gap: 34 }}>
            <div style={{ display: "flex", fontWeight: 700 }}>souzxxx</div>
            {d.nav.links.map((l) => (
              <div key={l.href} style={{ display: "flex" }}>
                {l.label}
              </div>
            ))}
          </div>
          <div style={{ display: "flex" }}>{d.os.menu.disponivel}</div>
        </div>

        <div style={{ display: "flex", flex: 1, padding: "46px 64px", alignItems: "flex-start" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 820,
              backgroundColor: CREME,
              border: `2px solid ${CARVAO}`,
              boxShadow: "12px 12px 0 0 #0F0E0C",
            }}
          >
            <div
              style={{
                display: "flex",
                position: "relative",
                height: 40,
                padding: "8px 10px",
                borderBottom: `2px solid ${CARVAO}`,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>{filetes}</div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    backgroundColor: CREME,
                    padding: "0 16px",
                    fontSize: 18,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: CARVAO,
                  }}
                >
                  {d.os.janelas.leiame}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", padding: "30px 44px 40px" }}>
              <div style={{ display: "flex", fontSize: 18, letterSpacing: "0.16em", textTransform: "uppercase", color: "#5A5750" }}>
                {d.meta.ogSelo}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  fontFamily: "Instrument Serif",
                  fontSize: 150,
                  textTransform: "uppercase",
                  lineHeight: 0.84,
                  marginTop: 20,
                  color: CARVAO,
                }}
              >
                {d.hero.nome.map((linha) => (
                  <div key={linha} style={{ display: "flex" }}>
                    {linha}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 28 }}>
                <div
                  style={{
                    display: "flex",
                    backgroundColor: CARVAO,
                    color: CREME,
                    padding: "6px 12px",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    fontSize: 20,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}
                >
                  {d.hero.subtitulo}
                </div>
                <div style={{ display: "flex", fontSize: 20, color: "#3C3A34" }}>{d.meta.ogStack}</div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26, marginLeft: "auto", marginTop: 4 }}>
            {(
              [
                ["pasta", d.os.icones.projetos],
                ["predio", d.os.icones.tecna],
                ["grafico", d.os.icones.financehub],
                ["documento", d.os.icones.curriculo],
              ] as [NomeIcone, string][]
            ).map(([nome, rotulo]) => {
              const p = pixelPaths(nome);
              return (
                <div key={nome} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <svg width={64} height={64} viewBox="0 0 16 16" shapeRendering="crispEdges">
                    <path d={p.miolo} fill={CREME} />
                    <path d={p.tinta} fill={CARVAO} />
                  </svg>
                  <div style={{ display: "flex", fontSize: 16, letterSpacing: "0.12em", textTransform: "uppercase", color: CREME }}>
                    {rotulo}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, ...(fonts ? { fonts } : {}) },
  );
}
