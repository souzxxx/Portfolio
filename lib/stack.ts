export interface Tech {
  name: string;
  category: "frontend" | "backend" | "ml" | "infra" | "language";
  /**
   * A cor de marca da tecnologia — HOJE SEM NENHUM CONSUMIDOR. Quem lia este
   * campo era a bolinha colorida da fita rolante; a fita saiu na wave visual e
   * a tabela que ficou no lugar (components/stack/StackMarquee.tsx) pinta todo
   * nome em `carvao`, porque ~20 cores de marca numa seção só eram mais cores
   * do que o site inteiro usa. O campo continua aqui por ser barato de manter e
   * caro de reconstituir, mas quem acrescentar uma tecnologia não deve esperar
   * ver essa cor na tela.
   */
  color: string;
}

export const stack: Tech[] = [
  { name: "TypeScript", category: "language", color: "#3178c6" },
  { name: "Python", category: "language", color: "#3776ab" },
  { name: "Java", category: "language", color: "#ed8b00" },
  { name: "JavaScript", category: "language", color: "#f7df1e" },
  { name: "Prolog", category: "language", color: "#74283c" },
  { name: "C", category: "language", color: "#a8b9cc" },
  { name: "C++", category: "language", color: "#00599c" },

  { name: "Next.js", category: "frontend", color: "#ffffff" },
  { name: "React", category: "frontend", color: "#61dafb" },
  { name: "Three.js", category: "frontend", color: "#ffffff" },
  { name: "R3F", category: "frontend", color: "#ffffff" },
  { name: "Tailwind", category: "frontend", color: "#06b6d4" },
  { name: "Framer Motion", category: "frontend", color: "#bb4b96" },
  { name: "GLSL Shaders", category: "frontend", color: "#5586a4" },
  { name: "Vite", category: "frontend", color: "#646cff" },
  { name: "LVGL", category: "frontend", color: "#4c9aff" },

  // Node.js abre a coluna de back-end por ser o runtime embaixo do resto dela:
  // Next.js, Drizzle e praticamente todo o TypeScript deste portfólio rodam
  // nele. A ordem do array é a ordem da coluna na tabela da seção de stack.
  { name: "Node.js", category: "backend", color: "#5fa04e" },
  { name: "FastAPI", category: "backend", color: "#009688" },
  { name: "Spring", category: "backend", color: "#6db33f" },
  { name: "WebSocket", category: "backend", color: "#4fb3d9" },
  { name: "REST APIs", category: "backend", color: "#ff6b35" },
  { name: "PostgreSQL", category: "backend", color: "#336791" },
  { name: "pgvector", category: "backend", color: "#3a86ff" },
  { name: "Drizzle ORM", category: "backend", color: "#c5f74f" },

  { name: "XGBoost", category: "ml", color: "#f59e0b" },
  { name: "Pandas", category: "ml", color: "#150458" },
  { name: "NumPy", category: "ml", color: "#013243" },
  { name: "Scikit-Learn", category: "ml", color: "#f7931e" },
  { name: "RAG", category: "ml", color: "#10b981" },
  { name: "Embeddings", category: "ml", color: "#8b5cf6" },

  { name: "Docker", category: "infra", color: "#2496ed" },
  { name: "Vercel", category: "infra", color: "#ffffff" },
  { name: "Turbo", category: "infra", color: "#ff1e56" },
  { name: "GitHub Actions", category: "infra", color: "#2088ff" },
  { name: "Render", category: "infra", color: "#46e3b7" },
];
