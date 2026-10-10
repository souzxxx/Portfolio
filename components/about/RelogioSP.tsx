"use client";

import { useEffect, useState } from "react";

/**
 * RelogioSP — "SÃO PAULO · 14:32 BRT", ao vivo.
 *
 * O SERVIDOR NÃO SABE QUE HORAS SÃO. A home é estática (ISR de 24h): uma hora
 * escrita no build estaria errada para todo visitante. Então o HTML sai com
 * "--:--" e o relógio só aparece depois de montar, no fuso fixo de São Paulo
 * — não no do visitante, que é a graça: quem lê em Lisboa vê a hora de lá
 * daqui.
 *
 * BRT É CONSTANTE desde 2019 (o Brasil aboliu o horário de verão), então o
 * rótulo não precisa ser calculado.
 *
 * Atualiza alinhado à virada do minuto, não a cada segundo: a tela só mostra
 * HH:MM, e 59 re-renders por minuto para não mudar nada seria desperdício.
 */
export function RelogioSP({ cidade }: { cidade: string }) {
  const [hora, setHora] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Sao_Paulo",
    });
    let t: ReturnType<typeof setTimeout>;
    const tique = () => {
      setHora(fmt.format(new Date()));
      t = setTimeout(tique, 60000 - (Date.now() % 60000) + 50);
    };
    tique();
    return () => clearTimeout(t);
  }, []);

  return (
    <span>
      {cidade} · <time className="tabular-nums">{hora ?? "--:--"}</time> BRT
    </span>
  );
}
