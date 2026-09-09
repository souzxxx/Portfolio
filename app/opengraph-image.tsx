import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Leonardo Souza — Backend & AI Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#0a0a0f",
          backgroundImage:
            "radial-gradient(ellipse at 50% -10%, rgba(99, 102, 241, 0.32) 0%, rgba(10, 10, 15, 0) 62%)",
          padding: "0 84px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 96,
            height: 4,
            borderRadius: 4,
            backgroundColor: "#6366f1",
            marginBottom: 44,
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 92,
            fontWeight: 600,
            color: "#e4e4e7",
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
          }}
        >
          Leonardo Souza
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 46,
            fontWeight: 500,
            color: "#818cf8",
            letterSpacing: "-0.01em",
            marginTop: 18,
          }}
        >
          Backend &amp; AI Engineer
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "#a1a1aa",
            letterSpacing: "0.02em",
            marginTop: 40,
          }}
        >
          Java · Spring Boot · Python · TypeScript · LLM em produção · São Paulo
        </div>
      </div>
    ),
    size,
  );
}
