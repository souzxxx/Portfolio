import { notFound } from "next/navigation";

/**
 * Pega-tudo de endereço inexistente. Com dois layouts-raiz (pt e en) não existe
 * um `app/not-found.tsx` global que funcione, e o Next cairia na 404 crua dele;
 * passando por aqui, o `notFound()` renderiza a 404 do souzxxx OS dentro do
 * layout em português, com fontes e estilos.
 */
export default function Inexistente() {
  notFound();
}
