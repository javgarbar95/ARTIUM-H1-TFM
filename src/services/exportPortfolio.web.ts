import { PortfolioDocument } from "../domain/models";
import { resolveMediaUri } from "./media";
import { renderPortfolioHtml, ResolvedImage } from "./pdfHtml";
export type ExportStage = "preparing" | "generating" | "sharing" | "done";
export async function exportPortfolio(
  document: PortfolioDocument,
  onStage: (stage: ExportStage) => void,
): Promise<string> {
  onStage("preparing");
  const images: ResolvedImage[] = [];
  for (const { media } of document.works) {
    const uri = await resolveMediaUri(media);
    const img = new Image();
    img.src = uri;
    await img.decode();
    const scale = Math.min(
      1,
      1200 / Math.max(img.naturalWidth, img.naturalHeight),
    );
    const canvas = window.document.createElement("canvas");
    canvas.width = img.naturalWidth * scale;
    canvas.height = img.naturalHeight * scale;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se puede preparar la imagen.");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    images.push({
      id: media.id,
      dataUri: canvas.toDataURL("image/jpeg", 0.8),
      width: canvas.width,
      height: canvas.height,
    });
  }
  onStage("generating");
  const html = renderPortfolioHtml(document, images);
  window.document.getElementById("artium-print")?.remove();
  const frame = window.document.createElement("iframe");
  frame.id = "artium-print";
  frame.title = "Documento para imprimir";
  frame.style.cssText =
    "position:fixed;left:-10000px;width:794px;height:1123px;border:0";
  window.document.body.appendChild(frame);
  await new Promise<void>((resolve, reject) => {
    frame.onload = async () => {
      try {
        await Promise.all(
          Array.from(frame.contentDocument!.images).map((i) => i.decode()),
        );
        await frame.contentDocument!.fonts.ready;
        resolve();
      } catch {
        reject(new Error("No se pudo preparar el documento de impresión."));
      }
    };
    frame.srcdoc = html;
  });
  onStage("sharing");
  frame.contentWindow?.print();
  onStage("done");
  return "Se ha abierto la impresión del navegador. Elige Guardar como PDF si está disponible. Esta vista auxiliar no genera ni comparte un archivo nativo Android/iOS.";
}
export async function printPortfolio(document: PortfolioDocument) {
  await exportPortfolio(document, () => {});
}
