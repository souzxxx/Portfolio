const dev = process.env.NODE_ENV === "development";

/**
 * Content-Security-Policy. Tudo que o site carrega vem da própria origem: as
 * fontes são do next/font (servidas daqui), as imagens passam pelo /_next/image
 * e os links externos (GitHub, LinkedIn) são só navegação.
 *
 * `script-src 'unsafe-inline'` é o preço de as páginas serem ESTÁTICAS: o Next
 * escreve scripts inline (o payload RSC, o script do boot) e um nonce exigiria
 * renderizar cada página por request. `style-src 'unsafe-inline'` cobre os
 * atributos `style` que o React escreve no HTML. `data:` em img-src é o cursor
 * de seta e as texturas de padrão, que são SVG em data URI. Em dev, o React usa
 * eval para as pilhas de erro e o HMR fala por websocket.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${dev ? " ws: wss:" : ""}`,
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Larguras que o portfólio realmente serve. 390 cobre o viewport de celular
    // (o menor default do Next era 640, que entregava imagem grande demais em
    // 3G móvel); os demais degraus acompanham os breakpoints do layout.
    deviceSizes: [390, 640, 828, 1080, 1280, 1920],
    // Cota do plano free: cada combinação url × largura × qualidade × formato
    // que o /_next/image aceita é uma otimização nova. Uma qualidade só (a
    // padrão do <Image>, nenhum componente passa `quality`) — outro `q` dá 400
    // —, e só as capturas de public/projects/, sem query string.
    qualities: [75],
    localPatterns: [{ pathname: "/projects/**", search: "" }],
    // As capturas não mudam entre deploys; 31 dias em vez das 4 h padrão
    // evita refazer a mesma otimização várias vezes por dia. Trocar uma
    // imagem = trocar o nome do arquivo, como já é o costume aqui.
    minimumCacheTTL: 2678400,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    // app/global-not-found.tsx: a 404 de endereço inexistente sai estática do
    // build em vez de passar por uma rota pega-tudo dinâmica. Ver o arquivo.
    globalNotFound: true,
  },
};

export default config;
