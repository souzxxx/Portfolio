import { Github, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 md:flex-row md:items-center md:px-12">
        <div className="flex items-center gap-3 font-mono text-sm text-muted">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-indigo-500/40 bg-indigo-500/10 text-xs text-fg">
            LS
          </span>
          <span>© {new Date().getFullYear()} Leonardo Souza</span>
        </div>

        <div className="flex items-center gap-5 text-sm text-muted">
          <a
            href="https://github.com/souzxxx"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 transition hover:text-fg"
          >
            <Github className="h-4 w-4" />
            github.com/souzxxx
          </a>
          <a
            href="mailto:leonardosouzasilva9@gmail.com"
            className="inline-flex items-center gap-2 transition hover:text-fg"
          >
            <Mail className="h-4 w-4" />
            Email
          </a>
        </div>

        <div className="font-mono text-xs text-muted">
          Crafted in Next.js · Three.js · ☕ · São Paulo
        </div>
      </div>
    </footer>
  );
}
