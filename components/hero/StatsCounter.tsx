/**
 * StatsCounter — os quatro numeros do hero. ESTATICO.
 *
 * Antes: quatro componentes client com `useInView` + `useMotionValue` fazendo
 * count-up, ou seja ~96 re-renders cada na entrada, tudo isso para chegar num
 * numero que ja estava no HTML do servidor. O count-up e o gesto mais datado
 * que uma landing page tem: anuncia o dado em vez de afirmar o dado.
 *
 * Agora nao ha "use client", nao ha estado, nao ha framer-motion e nao ha
 * efeito — o valor final e renderizado no servidor e fica parado. Assinatura
 * inalterada: `{ value, label, suffix }`.
 *
 * ── AS LINHAS ───────────────────────────────────────────────────────────────
 * Os filetes usam `max-sm:` e `sm:` em vez de `first:` sozinho porque as duas
 * regras precisam viver em media queries MUTUAMENTE EXCLUSIVAS: `nth-child` e
 * `first-child` tem a mesma especificidade, e sem a exclusao a celula 3 herda a
 * regra do mobile dentro do desktop (a especificidade ganha da media query).
 *
 *   ate 639px  → grade 2x2: filete vertical entre as colunas (celulas pares) e
 *                horizontal entre as linhas (celulas 3 e 4) = uma cruz;
 *   >= 640px   → fila de 4: filete vertical entre todas, e a primeira alinha
 *                flush com o H1 e o paragrafo (sem `pl`).
 */
export function StatsCounter({
  value,
  label,
  suffix = "",
}: {
  value: number;
  label: string;
  suffix?: string;
}) {
  return (
    <div className="border-dashed border-cream/25 px-4 py-5 max-sm:[&:nth-child(2n)]:border-l max-sm:[&:nth-child(2n+1)]:pl-0 max-sm:[&:nth-child(n+3)]:border-t sm:border-l sm:first:border-l-0 sm:first:pl-0">
      <div className="font-mono text-[clamp(1.85rem,3.4vw,3rem)] leading-none tabular-nums text-cream">
        {value}
        {/* O sufixo perde a cor de acento: sobre azul existe UMA cor de texto,
            e o "k" e parte do numero, nao um enfeite. */}
        <span>{suffix}</span>
      </div>
      {/* cream-600 sobre azul = 6.23:1. NUNCA cream-700 aqui: da 3.71:1 e
          reprova AA — cream-700 e exclusivo de fundo breu. */}
      <div className="mt-2 font-mono text-tag uppercase text-cream-600">
        {label}
      </div>
    </div>
  );
}
