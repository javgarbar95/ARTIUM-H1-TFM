import { PortfolioDocument, accents } from "../domain/models";
export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
export type ResolvedImage = {
  id: string;
  dataUri: string;
  width: number;
  height: number;
};
export function renderPortfolioHtml(
  document: PortfolioDocument,
  images: ResolvedImage[],
  fonts?: { regular: string; semibold: string },
): string {
  if (!document.works.length)
    throw new Error("Selecciona al menos una obra para exportar.");
  if (document.works.length > 12)
    throw new Error("El límite es de doce obras.");
  if (document.works.some((w) => w.artwork.ownerId !== document.author.id))
    throw new Error("El portfolio contiene una obra ajena.");
  const gallery = document.config.templateId === "gallery";
  const accent = accents.includes(document.config.accentColor)
    ? document.config.accentColor
    : accents[0];
  const e = escapeHtml;
  const cards = document.works.map(({ artwork, media }, i) => {
    const image = images.find((m) => m.id === media.id);
    if (
      !image ||
      !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(
        image.dataUri,
      ) ||
      image.width <= 0 ||
      image.height <= 0
    )
      throw new Error(
        `No se ha podido preparar la imagen de «${artwork.title}».`,
      );
    return `<article><div class="image"><img src="${image.dataUri}" width="${image.width}" height="${image.height}" alt="${e(artwork.altText)}"></div><div class="caption"><span class="number">${String(i + 1).padStart(2, "0")}</span><h2>${e(artwork.title)}</h2><p class="meta">${e(artwork.technique)} · ${artwork.year}</p><p class="description">${e(artwork.description)}</p></div></article>`;
  });
  let pages = "";
  const step = gallery ? 2 : 1;
  for (let i = 0; i < cards.length; i += step)
    pages += `<section class="page ${gallery ? "gallery" : "editorial"}"><header>${e(document.author.displayName)} <span>PORTFOLIO / ${Math.floor(i / step) + 1}</span></header><div class="works">${cards.slice(i, i + step).join("")}</div></section>`;
  const fontCss = fonts
    ? `@font-face{font-family:Poppins;src:url(data:font/ttf;base64,${fonts.regular})}@font-face{font-family:Poppins;src:url(data:font/ttf;base64,${fonts.semibold});font-weight:600}`
    : "";
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Portfolio · ${e(document.author.displayName)}</title><style>${fontCss}
 @page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;color:#211c30;font-family:Poppins,Arial,sans-serif;font-size:10pt;-webkit-print-color-adjust:exact;print-color-adjust:exact} .page{width:210mm;height:297mm;padding:16mm;page-break-after:always;break-after:page;overflow:hidden}.page:last-child{page-break-after:auto;break-after:auto}header{font-size:9pt;border-bottom:1px solid #ddd;padding-bottom:4mm;margin-bottom:7mm}header span{float:right;color:#666}.cover{display:flex;flex-direction:column;justify-content:space-between;background:#faf9fc;border-top:4mm solid ${accent}}.brand{letter-spacing:3px;color:${accent};font-size:15pt}.eyebrow{font-size:10pt;letter-spacing:2px;color:${accent}}h1{font-size:36pt;line-height:1.2;margin:8mm 0;overflow-wrap:anywhere}.intro{font-size:13pt;line-height:1.7;max-width:150mm;white-space:pre-wrap;overflow-wrap:anywhere}.foot{font-size:9pt;color:#686071}.works{display:flex;flex-direction:column;gap:9mm}article{break-inside:avoid;page-break-inside:avoid}.image{position:relative;background:#f4f1ed;display:flex;align-items:center;justify-content:center}.image img{position:absolute;inset:0;object-fit:contain;max-width:100%;max-height:100%;width:100%;height:100%}.gallery article{height:119mm;display:flex;flex-direction:column}.gallery .image{height:auto;flex:1;min-height:30mm}.editorial .image{height:169mm}.caption{flex-shrink:0;position:relative;padding-top:4mm;padding-left:9mm}.number{position:absolute;left:0;top:4mm;color:${accent};font-size:9pt}h2{font-weight:600;font-size:13pt;line-height:1.3;margin:0 0 1.5mm;overflow-wrap:anywhere}.meta{font-size:9pt;color:#686071;margin:0 0 2mm;overflow-wrap:anywhere}.description{font-size:9pt;line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere;margin:0}.editorial .description{font-size:11pt;line-height:1.6}
 </style></head><body><section class="page cover"><div class="brand">ARTIUM</div><div><div class="eyebrow">PORTFOLIO DE OBRA</div><h1>${e(document.author.displayName)}</h1><p class="intro">${e(document.config.intro)}</p></div><p class="foot">Selección personal · ${document.works.length} obras<br>Perfil ficticio de demostración · ${gallery ? "Galería" : "Editorial"}</p></section>${pages}</body></html>`;
}
