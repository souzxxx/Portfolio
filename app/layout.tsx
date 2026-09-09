import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const SITE_URL = "https://portfolio-souzxxxs-projects.vercel.app";
const TITLE = "Leonardo Souza — Backend & AI Engineer";
const SHORT_DESCRIPTION =
  "Backend e sistemas de IA em produção. Ciência da Computação no Insper, São Paulo.";

export const metadata: Metadata = {
  title: TITLE,
  description:
    "Backend e sistemas de IA em produção: assistente LLM sobre dados do usuário, fila outbox com retry e idempotência, rate limit em Redis com circuit breaker e streaming por WebSocket. Ciência da Computação no Insper, São Paulo.",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: TITLE,
    description: SHORT_DESCRIPTION,
    type: "website",
    locale: "pt_BR",
    siteName: "Leonardo Souza",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SHORT_DESCRIPTION,
  },
  authors: [{ name: "Leonardo Souza", url: "https://github.com/souzxxx" }],
  creator: "Leonardo Souza",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Leonardo Souza",
  jobTitle: "Backend & AI Engineer",
  url: SITE_URL,
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Insper",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "São Paulo",
    addressCountry: "BR",
  },
  knowsAbout: [
    "TypeScript",
    "Python",
    "Java",
    "LLM",
    "FastAPI",
    "Spring Boot",
    "PostgreSQL",
    "Redis",
  ],
  sameAs: ["https://github.com/souzxxx"],
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
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
