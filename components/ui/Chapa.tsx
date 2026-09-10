import Image from "next/image";
import clsx from "clsx";
import type { CSSProperties } from "react";

/**
 * Chapa — a captura de tela real de um projeto, EM COR NATURAL.
 *
 * API:
 *   <Chapa
 *     src={string} alt={string}
 *     ratio={string}      // "16 / 10", "4 / 3", "var(--capa)" — vai direto no aspect-ratio
 *     sizes={string}      // media query de larguras para o next/image
 *     priority?={boolean}
 *     className?={string} // sangria, largura e A MOLDURA (cor da borda) vem do call site
 *   />
 *
 * ELE SUBSTITUI O <DuotoneImage>, que aplicava uma cianotipia (base azul,
 * `mix-blend-mode: screen`, camada creme em `multiply` e hachura diagonal) e
 * devolvia a cor real so no hover — com um botao `[ COR ]` no mobile, onde
 * hover nao existe. O tratamento saiu inteiro, e a razao e de conteudo, nao de
 * gosto: um screenshot de produto e PROVA de que a coisa existe e funciona.
 * Tingir a prova de azul e cobri-la de listras diagonais faz o leitor gastar
 * atencao decodificando o efeito em vez de lendo a interface — e ainda esconde
 * exatamente o que o portfolio esta afirmando. A gravura de duas cores continua
 * onde ela e DESENHO e nao registro: o objeto GLSL do hero e a capa procedural
 * dos projetos sem screenshot (<ProjectCover>).
 *
 * O QUE SOBROU DE TRATAMENTO e uma moldura de 1px — e nada mais. Sem tint, sem
 * trama, sem sombra, sem canto arredondado, sem hover. A cor da moldura vem do
 * `className` do call site porque ela depende do campo de cor onde a chapa cai:
 * `border-carvao` sobre papel (15.66:1), `border-cream/20` sobre carvao. Deixar
 * a borda aqui dentro com um default obrigaria o call site a sobrescrever cor
 * de borda por ordem de classe no CSS gerado, que e disputa que ninguem ganha
 * de forma previsivel.
 *
 * SERVER COMPONENT, de proposito. O DuotoneImage era "use client" so por causa
 * do `useState` do toggle de cor; sem toggle, a chapa nao precisa de estado
 * nenhum e sai inteira no HTML — o <ProjectGrid>, que renderiza 14 miniaturas,
 * deixa de arrastar um componente de cliente por linha.
 *
 * `aspectRatio` inline reserva a altura antes de o primeiro byte da imagem
 * chegar → zero CLS, com ou sem `priority`. `ratio` aceita `var(--capa)`, que e
 * como o <FeaturedCard> troca retrato (mobile) por quadrado (desktop) com uma
 * unica instancia de next/image.
 */
export function Chapa({
  src,
  alt,
  ratio,
  sizes,
  priority,
  className,
}: {
  src: string;
  alt: string;
  ratio: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure
      className={clsx("relative overflow-hidden", className)}
      style={{ aspectRatio: ratio } as CSSProperties}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover object-top"
        priority={priority}
        loading={priority ? undefined : "lazy"}
      />
    </figure>
  );
}
