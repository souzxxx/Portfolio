import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

/**
 * Lint do site. O Next 16 tirou o `next lint`, e o preset dele agora é flat
 * config — este arquivo substitui o antigo .eslintrc.json com as mesmas regras
 * (core-web-vitals).
 *
 * `.claude/` guarda worktrees de agentes (cópias inteiras do repositório) e
 * `.superpowers/` o companheiro visual do brainstorming: nenhum dos dois é
 * código do site, e lintá-los dobraria cada erro.
 *
 * As três regras rebaixadas para aviso vieram com o eslint-plugin-react-hooks
 * 7 (o do React Compiler, que este site não liga). Elas apontam padrões que já
 * existiam e funcionam: uniform do three mutado dentro do useFrame
 * (`immutability`, falso positivo clássico do R3F), refs do pet lidas no
 * render (`refs`) e reset de estado em efeito (`set-state-in-effect`).
 * Reescrever o pet para agradá-las é trabalho com teste próprio, não parte do
 * upgrade — ficam visíveis como aviso até lá.
 */
export default defineConfig([
  ...nextVitals,
  {
    rules: {
      "react-hooks/immutability": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".claude/**",
    ".superpowers/**",
  ]),
]);
