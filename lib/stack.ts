export interface Tech {
  name: string;
  category: "frontend" | "backend" | "ml" | "infra" | "language";
  color: string;
}

export const stack: Tech[] = [
  { name: "TypeScript", category: "language", color: "#3178c6" },
  { name: "Python", category: "language", color: "#3776ab" },
  { name: "Java", category: "language", color: "#ed8b00" },
  { name: "JavaScript", category: "language", color: "#f7df1e" },
  { name: "Prolog", category: "language", color: "#74283c" },
  { name: "C", category: "language", color: "#a8b9cc" },

  { name: "Next.js", category: "frontend", color: "#ffffff" },
  { name: "React", category: "frontend", color: "#61dafb" },
  { name: "Three.js", category: "frontend", color: "#ffffff" },
  { name: "R3F", category: "frontend", color: "#ffffff" },
  { name: "Tailwind", category: "frontend", color: "#06b6d4" },
  { name: "Framer Motion", category: "frontend", color: "#bb4b96" },
  { name: "GLSL Shaders", category: "frontend", color: "#5586a4" },
  { name: "Vite", category: "frontend", color: "#646cff" },

  { name: "FastAPI", category: "backend", color: "#009688" },
  { name: "Spring", category: "backend", color: "#6db33f" },
  { name: "WebSocket", category: "backend", color: "#4fb3d9" },
  { name: "REST APIs", category: "backend", color: "#ff6b35" },

  { name: "XGBoost", category: "ml", color: "#f59e0b" },
  { name: "Pandas", category: "ml", color: "#150458" },
  { name: "NumPy", category: "ml", color: "#013243" },
  { name: "Scikit-Learn", category: "ml", color: "#f7931e" },

  { name: "Docker", category: "infra", color: "#2496ed" },
  { name: "Vercel", category: "infra", color: "#ffffff" },
  { name: "Turbo", category: "infra", color: "#ff1e56" },
  { name: "GitHub Actions", category: "infra", color: "#2088ff" },
  { name: "Render", category: "infra", color: "#46e3b7" },
];
