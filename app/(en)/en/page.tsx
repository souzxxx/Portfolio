import { Home } from "@/components/Home";

/**
 * "/en" — a home em inglês. Mesmos blocos, mesma ordem, outra língua: o
 * componente é o mesmo de "/", só o parâmetro muda.
 */
export default function HomeEn() {
  return <Home lang="en" />;
}
