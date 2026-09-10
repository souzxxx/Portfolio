"use client";

import { Component, type ReactNode } from "react";

/**
 * CanvasBoundary — rede de seguranca do WebGL.
 *
 * Bug reproduzido: em `chromium --disable-gpu` (e em qualquer maquina sem
 * contexto WebGL disponivel) o R3F lanca na criacao do contexto. Sem limite de
 * erro, o throw sobe ate a raiz e o Next troca a PAGINA INTEIRA pela tela de
 * erro — o portfolio inteiro cai por causa de um ornamento.
 *
 * Aqui o hero degrada para azul chapado, que continua sendo o desenho: a
 * identidade e o bloco de cor + a serifa, nao o objeto. Custa ~0.4KB.
 */
export class CanvasBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    // Silencioso de proposito: o usuario nao perdeu informacao nenhuma.
    this.setState({ failed: true });
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
