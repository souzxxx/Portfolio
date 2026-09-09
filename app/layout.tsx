import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const SITE_URL = "https://portfolio-souzxxxs-projects.vercel.app";
const TITLE = "Leonardo Souza — Backend, Web & IA";
const SHORT_DESCRIPTION =
  "Backend, web e IA aplicada em produção. Ciência da Computação no Insper, São Paulo.";

export const metadata: Metadata = {
  title: TITLE,
  description:
    "Backend, web e IA aplicada em produção: assistente LLM sobre dados do usuário, busca vetorial em Postgres com pgvector, fila outbox com retry e idempotência, rate limit em Redis com circuit breaker e front-end Next.js em sistema com usuário real. Ciência da Computação no Insper, São Paulo.",
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
  jobTitle: "Engenheiro de software — backend, web e IA",
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
    "Next.js",
    "React",
    "LLM",
    "pgvector",
    "FastAPI",
    "Spring Boot",
    "PostgreSQL",
    "Redis",
  ],
  sameAs: [
    "https://github.com/souzxxx",
    "https://www.linkedin.com/in/leonardo-souzx",
  ],
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
