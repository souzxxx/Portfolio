"use client";

import { useEffect, useState } from "react";
import { Github, Mail } from "lucide-react";
import clsx from "clsx";

const links = [
  { href: "#projects", label: "Work" },
  { href: "#academic", label: "Academic" },
  { href: "#stack", label: "Stack" },
  { href: "#about", label: "Contact" },
];

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "py-3" : "py-5",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-12">
        <a
          href="#top"
          className="group inline-flex items-center gap-2 font-mono text-sm font-semibold tracking-tight text-fg"
        >
          <span
            className={clsx(
              "flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-500/40 bg-gradient-to-br from-indigo-500/30 to-purple-500/20 text-fg backdrop-blur-xl transition",
              "group-hover:border-indigo-400 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]",
            )}
          >
            LS
          </span>
          <span className="hidden sm:inline">souzxx</span>
        </a>

        <nav
          className={clsx(
            "hidden items-center gap-1 rounded-full border border-border/60 bg-surface/60 px-2 py-1.5 backdrop-blur-xl md:flex",
          )}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-1.5 text-sm text-fg/70 transition hover:bg-elevated/80 hover:text-fg"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/souzxxx"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-surface/60 text-fg backdrop-blur-xl transition hover:border-indigo-500/50 hover:bg-surface"
          >
            <Github className="h-4 w-4" />
          </a>
          <a
            href="mailto:leonardosouzasilva9@gmail.com"
            aria-label="Email"
            className="hidden h-9 items-center justify-center gap-2 rounded-full border border-indigo-500/40 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 px-4 text-sm font-medium text-fg backdrop-blur-xl transition hover:from-indigo-500/30 hover:to-purple-500/30 sm:inline-flex"
          >
            <Mail className="h-4 w-4" />
            Contact
          </a>
        </div>
      </div>
    </header>
  );
}
