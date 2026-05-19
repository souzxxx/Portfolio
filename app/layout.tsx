import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leonardo Souza — Software Engineer @ Insper",
  description:
    "Engineer building full-stack systems — from real-time 3D dashboards and distributed microservices to ML prediction models. Insper BCC · São Paulo.",
  metadataBase: new URL("https://souzxx.vercel.app"),
  openGraph: {
    title: "Leonardo Souza — Software Engineer @ Insper",
    description:
      "Engineer building full-stack systems — 3D dashboards, microservices, ML.",
    type: "website",
    siteName: "Leonardo Souza",
  },
  twitter: {
    card: "summary_large_image",
    title: "Leonardo Souza — Software Engineer @ Insper",
    description:
      "Engineer building full-stack systems — 3D dashboards, microservices, ML.",
  },
  authors: [{ name: "Leonardo Souza", url: "https://github.com/souzxxx" }],
  creator: "Leonardo Souza",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
