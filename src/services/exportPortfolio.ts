import { Asset } from "expo-asset";
import { File } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
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
  const temporary: string[] = [];
  try {
    for (const { media, artwork } of document.works) {
      try {
        const uri = await resolveMediaUri(media);
        const context = ImageManipulator.manipulate(uri);
        context.resize(
          media.width >= media.height
            ? { width: Math.min(1200, media.width) }
            : { height: Math.min(1200, media.height) },
        );
        const rendered = await context.renderAsync();
        const image = await rendered.saveAsync({
          format:
            media.mimeType === "image/jpeg" ? SaveFormat.JPEG : SaveFormat.PNG,
          compress: 0.8,
          base64: true,
        });
        temporary.push(image.uri);
        if (!image.base64) throw new Error();
        images.push({
          id: media.id,
          dataUri: `data:${media.mimeType === "image/jpeg" ? "image/jpeg" : "image/png"};base64,${image.base64}`,
          width: image.width,
          height: image.height,
        });
      } catch {
        throw new Error(
          `No se puede preparar «${artwork.title}». Revisa su imagen en la biblioteca y reintenta.`,
        );
      }
    }
    const font = async (module: number) => {
      const asset = Asset.fromModule(module);
      await asset.downloadAsync();
      return new File(asset.localUri ?? asset.uri).base64();
    };
    const [regular, semibold] = await Promise.all([
      font(require("../../assets/fonts/Poppins-Regular.ttf")),
      font(require("../../assets/fonts/Poppins-SemiBold.ttf")),
    ]);
    const html = renderPortfolioHtml(document, images, { regular, semibold });
    onStage("generating");
    const result = await Print.printToFileAsync({
      html,
      width: 595.28,
      height: 841.89,
      base64: false,
    });
    if (!(await Sharing.isAvailableAsync())) {
      onStage("done");
      return "PDF generado en la caché de Artium. No hay un servicio de compartir disponible. Puedes usar las opciones de impresión del sistema con el botón inferior.";
    }
    onStage("sharing");
    await Sharing.shareAsync(result.uri, {
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
      dialogTitle: "Compartir portfolio de Artium",
    });
    onStage("done");
    return "PDF generado. Se ha abierto el diálogo del sistema; el destino o la cancelación dependen de tu elección. Puedes volver a exportarlo.";
  } finally {
    for (const uri of temporary) {
      try {
        new File(uri).delete();
      } catch {
        /* best-effort transient cleanup */
      }
    }
  }
}
export async function printPortfolio(
  document: PortfolioDocument,
): Promise<void> {
  const images: ResolvedImage[] = [];
  for (const { media } of document.works) {
    const uri = await resolveMediaUri(media);
    const context = ImageManipulator.manipulate(uri);
    context.resize(
      media.width >= media.height
        ? { width: Math.min(1200, media.width) }
        : { height: Math.min(1200, media.height) },
    );
    const image = await (
      await context.renderAsync()
    ).saveAsync({
      format:
        media.mimeType === "image/jpeg" ? SaveFormat.JPEG : SaveFormat.PNG,
      compress: 0.8,
      base64: true,
    });
    images.push({
      id: media.id,
      dataUri: `data:${media.mimeType === "image/jpeg" ? "image/jpeg" : "image/png"};base64,${image.base64}`,
      width: image.width,
      height: image.height,
    });
    try {
      new File(image.uri).delete();
    } catch {}
  }
  await Print.printAsync({ html: renderPortfolioHtml(document, images) });
}
