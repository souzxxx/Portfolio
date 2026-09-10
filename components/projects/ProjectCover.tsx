import clsx from "clsx";
import { Meta } from "../ui/Meta";

/**
 * ProjectCover — a capa dos projetos que nao tem screenshot.
 *
 * API (contrato entre os itens da wave, nao mude): mesmo nome, mesmas props.
 *   <ProjectCover slug name language? className? />
 *
 * Saiu o bloco com dois `radial-gradient` sorteados entre 7 paletas (roxo,
 * ciano, rosa, ambar, verde…) e as iniciais em gradiente — sozinho ele
 * introduzia ~14 cores fora do sistema. Entrou uma GRAVURA PROCEDURAL: raios
 * retos de 1px em creme irradiando de um foco abaixo da borda inferior, sobre
 * azul chapado, com as iniciais em serifa caixa alta por cima. Mesmo motivo do
 * halo de xilogravura, desenhado aqui em SVG — nenhum asset externo, ~0.6KB de
 * markup, zero request, e nada de gradiente.
 *
 * DETERMINISTICO POR CONSTRUCAO: toda a geometria sai de `hash(slug)`, nunca de
 * `Math.random()`. O mesmo slug produz exatamente o mesmo SVG no servidor e no
 * cliente — se um numero fosse sorteado, a hidratacao acusaria mismatch e o
 * React repintaria a capa inteira no primeiro paint.
 *
 * A malha (numero de raios, abertura do leque, deslocamento do foco e
 * comprimento de cada raio) muda de projeto para projeto, entao duas capas
 * vizinhas no indice nunca saem iguais — mas cada uma e estavel entre builds.
 */

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

const RAD = Math.PI / 180;

export function ProjectCover({
  slug,
  name,
  language,
  className,
}: {
  slug: string;
  name: string;
  language?: string;
  className?: string;
}) {
  const h = hash(slug);

  // 28 a 44 raios: abaixo disso o leque le como "algumas linhas soltas", acima
  // disso as linhas encostam perto do foco e viram uma mancha chapada.
  const rays = 28 + (h % 17);
  // Foco deslocado para a esquerda e ABAIXO da borda de baixo (y = 280 num
  // viewBox de altura 250): o leque entra na capa ja aberto, sem o ponto de
  // convergencia aparecer — e o ponto de fuga que fica fora do papel, como numa
  // gravura de raios de sol.
  const fx = 200 - (h % 90);
  const fy = 280;
  // Abertura entre raios vizinhos: 2.2, 2.6 ou 3.0 graus.
  const step = 2.2 + (h % 3) * 0.4;

  const initials = name
    .split(/[\s\-—]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div
      className={clsx(
        "relative flex flex-col items-center justify-center overflow-hidden bg-blue text-cream",
        // Altura: quem chama manda (o indice pede `aspect-[4/3]` na miniatura,
        // a fita editorial pede quadrado). So quando o call site nao declara
        // nem proporcao nem altura e que a capa cai no 8/5 padrao — assim o
        // default nunca disputa especificidade com a classe de quem chama.
        !/\baspect-|\bh-/.test(className ?? "") && "aspect-[8/5]",
        className,
      )}
    >
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 250"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {Array.from({ length: rays }, (_, i) => {
          const angle = (-90 + (i - rays / 2) * step) * RAD;
          const len = 260 + ((i * 37) % 9) * 24;
          return (
            <line
              key={i}
              x1={fx}
              y1={fy}
              x2={(fx + Math.cos(angle) * len).toFixed(2)}
              y2={(fy + Math.sin(angle) * len).toFixed(2)}
              stroke="#F5F3EE"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              opacity="0.55"
            />
          );
        })}
      </svg>

      <span className="relative font-display text-[clamp(2.5rem,9vw,4.5rem)] uppercase leading-none text-cream">
        {initials}
      </span>
      {language && (
        <Meta items={[language]} className="relative mt-2 text-cream-600" />
      )}
    </div>
  );
}
