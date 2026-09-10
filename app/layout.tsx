import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { Instrument_Serif, Courier_Prime, Silkscreen } from "next/font/google";
import "./globals.css";

// Tres familias novas (o teto do sistema), subset latin, display swap.
// `preload` so na display: ela e a unica que participa do LCP, que continua
// sendo o <h1> de texto renderizado no servidor. `adjustFontFallback` gera as
// metricas do fallback local, matando FOUT e CLS na troca.
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
  variable: "--font-display",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  fallback: ["Times New Roman", "Times", "serif"],
});

// Mono de maquina de escrever: e o `font-mono` do site inteiro (dado real,
// comandos, rotulos de metadado).
//
// GEIST MONO SAIU DO <html>. MEDIDO no HTML de producao: ela entrava como o
// segundo dos tres `<link rel="preload" as="font">` — 71 kB no caminho critico,
// com prioridade alta, disputando banda com a Instrument Serif (15 kB) que e a
// fonte do LCP — para nao pintar UM glifo: `font-code` (o unico token que
// apontava para `--font-geist-mono`) tem zero call site em app/ e components/.
// O token `font-code` continua declarado no tailwind.config.ts, agora sobre a
// mono do sistema. Quando existir um bloco de codigo REAL, o caminho e trazer
// Geist Mono de volta aqui com `preload: false` e re-apontar o token.
const typewriter = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-typewriter",
  display: "swap",
  preload: false,
  fallback: ["Courier New", "Courier", "monospace"],
});

// Bitmap 8-bit: exclusiva do banner do footer, nada mais no site.
const bitmap = Silkscreen({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bitmap",
  display: "swap",
  preload: false,
  fallback: ["Courier New", "monospace"],
});

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
  // Carvao de assinatura: e a primeira diferenca que aparece no celular, na
  // barra do navegador do Android, antes mesmo do primeiro scroll. E o MESMO
  // valor do `bg-carvao` do hero, entao a barra do sistema e o topo da pagina
  // leem como um campo continuo em vez de dois retangulos escuros diferentes.
  themeColor: "#1C1A17",
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
      className={`${GeistSans.variable} ${display.variable} ${typewriter.variable} ${bitmap.variable}`}
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
