# Leonardo Souza — Portfolio

Personal portfolio site, built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, and React Three Fiber.

## Development

```bash
npm install
npm run dev          # http://localhost:3000
npm run build
npm start
```

## Capturing fresh screenshots

The script `scripts/capture.ts` uses Playwright to capture screenshots from every deployed Vercel site and saves them to `public/projects/<slug>/cover.png` and `mobile.png`.

```bash
npx playwright install chromium
npm run capture
```

## Deploy

```bash
vercel --prod
```
