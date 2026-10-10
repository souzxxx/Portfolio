"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";

/**
 * Relógio da barra de menu — sempre a hora de São Paulo, não a do visitante.
 * É a única coisa "ao vivo" do topo e diz, sem frase nenhuma, onde o Leonardo
 * está e se é horário comercial lá.
 *
 * O servidor não sabe a hora em que a página vai ser lida (o HTML é estático),
 * então o primeiro render sai com traços e a hora entra depois da montagem —
 * sem mismatch de hidratação. Atualiza a cada 15 s: a barra mostra minutos, e
 * acordar a página por segundo seria gasto de bateria sem nada para mostrar.
 */
export function Relogio({
  lang,
  rotulo,
  comDia = true,
  className,
}: {
  lang: Lang;
  rotulo: string;
  comDia?: boolean;
  className?: string;
}) {
  const [agora, setAgora] = useState<Date | null>(null);

  useEffect(() => {
    setAgora(new Date());
    const id = window.setInterval(() => setAgora(new Date()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  const locale = lang === "pt" ? "pt-BR" : "en-US";
  const hora = agora
    ? new Intl.DateTimeFormat(locale, {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(agora)
    : "--:--";
  const dia = agora
    ? new Intl.DateTimeFormat(locale, {
        timeZone: "America/Sao_Paulo",
        weekday: "short",
        day: "2-digit",
        month: "short",
      })
        .format(agora)
        .replace(/\./g, "")
    : "";

  return (
    <time
      aria-label={`${rotulo}: ${hora}`}
      dateTime={agora?.toISOString()}
      className={className}
      suppressHydrationWarning
    >
      {comDia && dia ? <span className="mr-2 hidden xl:inline">{dia}</span> : null}
      {hora}
    </time>
  );
}
