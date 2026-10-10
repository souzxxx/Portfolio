import fs from "node:fs";
import path from "node:path";

/**
 * As dimensões reais de uma captura em public/, lidas do cabeçalho do arquivo.
 *
 * Existem para a galeria das páginas de case, que mostra cada chapa na SUA
 * proporção (a do celular é retrato 780×1688, as de desktop 16:10) — com um
 * `aspect-ratio` fixo, a captura do celular viraria uma faixa recortada. Ler o
 * cabeçalho no build dá a proporção certa no HTML do servidor, então a altura
 * é reservada antes de a imagem chegar e não há salto de layout.
 *
 * Sem dependência: PNG guarda largura e altura nos bytes 16–23 do IHDR, e WebP
 * nos três formatos de chunk (VP8, VP8L, VP8X) em posições fixas. Formato
 * desconhecido devolve `null` e quem chama cai numa proporção padrão.
 *
 * SÓ SERVIDOR: usa `fs`. Rodar isto em componente de cliente quebraria o build.
 */
export function dimensoesDaImagem(
  src: string,
): { w: number; h: number } | null {
  let buf: Buffer;
  try {
    const arquivo = path.join(process.cwd(), "public", src.replace(/^\//, ""));
    const fd = fs.openSync(arquivo, "r");
    buf = Buffer.alloc(32);
    fs.readSync(fd, buf, 0, 32, 0);
    fs.closeSync(fd);
  } catch {
    return null;
  }

  // PNG: assinatura de 8 bytes, depois o chunk IHDR.
  if (buf.readUInt32BE(0) === 0x89504e47) {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }

  // WebP: "RIFF" .... "WEBP" e então o primeiro chunk.
  if (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    const chunk = buf.toString("ascii", 12, 16);
    if (chunk === "VP8 ") {
      return {
        w: buf.readUInt16LE(26) & 0x3fff,
        h: buf.readUInt16LE(28) & 0x3fff,
      };
    }
    if (chunk === "VP8L") {
      const b = buf.readUInt32LE(21);
      return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
    }
    if (chunk === "VP8X") {
      return {
        w: buf.readUIntLE(24, 3) + 1,
        h: buf.readUIntLE(27, 3) + 1,
      };
    }
  }

  return null;
}
