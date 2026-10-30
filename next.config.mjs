/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
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
