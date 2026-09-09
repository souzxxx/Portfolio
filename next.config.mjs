/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Larguras que o portfólio realmente serve. 390 cobre o viewport de celular
    // (o menor default do Next era 640, que entregava imagem grande demais em
    // 3G móvel); os demais degraus acompanham os breakpoints do layout.
    deviceSizes: [390, 640, 828, 1080, 1280, 1920],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default config;
