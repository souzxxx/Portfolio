import { MenuBar } from "./MenuBar";
import { dict } from "@/lib/dict";
import { FEATURED_ORDER, getProjects } from "@/lib/projects";
import { hrefHome, outro, type Lang } from "@/lib/i18n";

/**
 * Os destaques no formato curto que a barra de menu e o terminal usam: nome,
 * slug e o apelido de linha de comando ("tecna", "financehub", "portal"…).
 */
export function resumoDestaques(lang: Lang) {
  const todos = getProjects(lang);
  return FEATURED_ORDER.flatMap((slug) => {
    const p = todos.find((x) => x.slug === slug);
    return p ? [{ slug: p.slug, name: p.name, apelido: slug.split("-")[0] }] : [];
  });
}

/**
 * A barra de menu montada no servidor para qualquer página: resolve a fatia do
 * dicionário e a lista de destaques aqui, e o componente de cliente recebe só
 * o que pinta. `outroIdioma` default é a home da outra língua; um case passa o
 * endereço do mesmo case.
 */
export function BarraDoSite({
  lang,
  naHome = false,
  outroIdioma,
}: {
  lang: Lang;
  naHome?: boolean;
  outroIdioma?: string;
}) {
  const d = dict[lang];
  return (
    <MenuBar
      lang={lang}
      nav={d.nav}
      os={d.os.menu}
      projetos={resumoDestaques(lang)}
      base={naHome ? "" : hrefHome(lang)}
      outroIdioma={outroIdioma ?? hrefHome(outro(lang))}
    />
  );
}
