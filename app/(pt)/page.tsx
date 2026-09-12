import { Home } from "@/components/Home";

/**
 * "/" — a home em português.
 *
 * A rota é só o endereço: a ordem dos blocos e a partitura de cor moram em
 * components/Home.tsx, escritas uma vez para as duas línguas. Ver lá o porquê.
 *
 * `metadata` desta página não existe de propósito: ela herda inteiro o do
 * layout-raiz do grupo (app/(pt)/layout.tsx), que já é o metadata da home.
 * Declarar um aqui só criaria um segundo lugar para o <title> divergir.
 */
export default function HomePt() {
  return <Home lang="pt" />;
}
