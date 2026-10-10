"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Dict } from "@/lib/dict";
import { CV_PDF, hrefProjeto } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

/**
 * Terminal — um shell de verdade, pequeno, dentro da janela do hero.
 *
 * Aceita os comandos nas DUAS línguas (projetos/projects, sobre/about,
 * contato/contact): quem chega pela versão em inglês e digita "projetos"
 * porque leu no GitHub também é atendido. Histórico com ↑/↓, como no zsh.
 *
 * As duas primeiras linhas (whoami e ls) já saem no HTML do servidor: sem JS a
 * janela continua dizendo quem é e o que tem, só não responde.
 */
type Linha = { id: number; tipo: "cmd" | "out"; conteudo: ReactNode };

const EMAIL = "leonardosouzasilva9@gmail.com";
const PROMPT = "leonardo@souzxxx ~ %";

export function Terminal({
  lang,
  d,
  projetos,
  className,
}: {
  lang: Lang;
  d: Dict["os"]["terminal"];
  projetos: { slug: string; name: string; apelido: string }[];
  className?: string;
}) {
  const proximo = useRef(2);
  const listaProjetos = (
    <span className="grid grid-cols-[auto_1fr] gap-x-3">
      {projetos.map((p) => (
        <a
          key={p.slug}
          href={hrefProjeto(lang, p.slug)}
          className="col-span-2 grid grid-cols-subgrid underline-offset-2 hover:bg-cream hover:text-carvao"
        >
          <span className="opacity-60">{p.apelido}/</span>
          <span>{p.name}</span>
        </a>
      ))}
    </span>
  );

  const [linhas, setLinhas] = useState<Linha[]>([
    { id: 0, tipo: "cmd", conteudo: "whoami" },
    { id: 1, tipo: "out", conteudo: d.whoami },
  ]);
  const [valor, setValor] = useState("");
  const [historico, setHistorico] = useState<string[]>([]);
  const [pos, setPos] = useState(-1);
  const tela = useRef<HTMLDivElement>(null);
  const entrada = useRef<HTMLInputElement>(null);

  useEffect(() => {
    tela.current?.scrollTo({ top: tela.current.scrollHeight });
  }, [linhas]);

  function rodar(bruto: string) {
    const texto = bruto.trim();
    const [cmd = "", ...args] = texto.split(/\s+/);
    const c = cmd.toLowerCase();
    const saida: ReactNode[] = [];
    const abrir = (url: string, nova = false) => {
      saida.push(`${d.abrindo} ${url}`);
      window.setTimeout(() => {
        if (nova) window.open(url, "_blank", "noopener");
        else window.location.href = url;
      }, 450);
    };

    switch (c) {
      case "":
        break;
      case "help":
      case "ajuda":
        saida.push(
          <span className="grid grid-cols-[auto_1fr] gap-x-4">
            {d.ajuda.map(([k, v]) => (
              <span key={k} className="contents">
                <span>{k}</span>
                <span className="opacity-60">{v}</span>
              </span>
            ))}
          </span>,
        );
        break;
      case "whoami":
        saida.push(d.whoami);
        break;
      case "ls":
      case "projetos":
      case "projects":
        saida.push(listaProjetos);
        break;
      case "open":
      case "abrir":
      case "cd": {
        const alvo = (args[0] ?? "").toLowerCase().replace(/\/$/, "");
        const p = projetos.find(
          (x) => x.apelido === alvo || x.slug === alvo || x.name.toLowerCase().startsWith(alvo),
        );
        if (alvo && p) abrir(hrefProjeto(lang, p.slug));
        else saida.push(`${d.naoEncontrado} ${alvo || "?"}`);
        break;
      }
      case "sobre":
      case "about":
        saida.push(d.sobre);
        break;
      case "contato":
      case "contact":
        saida.push(
          <span className="flex flex-col">
            <a className="hover:bg-cream hover:text-carvao" href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>
            <a className="hover:bg-cream hover:text-carvao" href="https://github.com/souzxxx" target="_blank" rel="noreferrer">
              github.com/souzxxx
            </a>
            <a className="hover:bg-cream hover:text-carvao" href="https://www.linkedin.com/in/leonardo-souzx" target="_blank" rel="noreferrer">
              linkedin.com/in/leonardo-souzx
            </a>
          </span>,
        );
        break;
      case "cv":
      case "resume":
        abrir(CV_PDF[lang], true);
        break;
      case "github":
        abrir("https://github.com/souzxxx", true);
        break;
      case "date":
        saida.push(
          new Date().toLocaleString(lang === "pt" ? "pt-BR" : "en-US", {
            timeZone: "America/Sao_Paulo",
          }),
        );
        break;
      case "echo":
        saida.push(args.join(" "));
        break;
      case "sudo":
        saida.push(d.sudo);
        window.setTimeout(() => (window.location.href = `mailto:${EMAIL}`), 700);
        break;
      case "rm":
        saida.push(d.rm);
        break;
      case "clear":
      case "limpar":
        setLinhas([]);
        return;
      default:
        saida.push(`${d.naoEncontrado} ${cmd}`);
    }

    setLinhas((atual) => [
      ...atual,
      { id: proximo.current++, tipo: "cmd", conteudo: texto },
      ...saida.map((s) => ({ id: proximo.current++, tipo: "out" as const, conteudo: s })),
    ]);
  }

  return (
    <div
      className={`flex h-full flex-col bg-carvao font-mono text-[12.5px] leading-[1.55] text-cream ${className ?? ""}`}
      onClick={() => entrada.current?.focus({ preventScroll: true })}
    >
      <div ref={tela} className="min-h-0 flex-1 overflow-y-auto px-3 pt-2 [scrollbar-width:thin]">
        {linhas.map((l) =>
          l.tipo === "cmd" ? (
            <p key={l.id}>
              <span className="text-cream-700">{PROMPT}</span> {l.conteudo}
            </p>
          ) : (
            <div key={l.id} className="mb-1 text-cream-600">
              {l.conteudo}
            </div>
          ),
        )}
        <form
          className="flex items-center gap-2 pb-2"
          onSubmit={(e) => {
            e.preventDefault();
            rodar(valor);
            if (valor.trim()) setHistorico((h) => [valor, ...h]);
            setValor("");
            setPos(-1);
          }}
        >
          <label htmlFor="sx-terminal" className="shrink-0 text-cream-700">
            {PROMPT}
          </label>
          <input
            id="sx-terminal"
            ref={entrada}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp" && historico.length) {
                e.preventDefault();
                const n = Math.min(pos + 1, historico.length - 1);
                setPos(n);
                setValor(historico[n]);
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                const n = pos - 1;
                setPos(Math.max(n, -1));
                setValor(n >= 0 ? historico[n] : "");
              }
            }}
            aria-label={d.rotulo}
            placeholder={d.dica}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-cream caret-gold outline-none placeholder:text-cream-700/70"
          />
        </form>
      </div>
    </div>
  );
}
