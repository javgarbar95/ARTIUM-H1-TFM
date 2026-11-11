import { Asset } from "expo-asset";
import { Directory, File, Paths } from "expo-file-system";
import * as Picker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { Platform } from "react-native";
import { MediaAsset, limits } from "../domain/models";
import { bundledAssets } from "./bundledAssets";
export async function resolveMediaUri(media: MediaAsset): Promise<string> {
  if (media.bundledKey) {
    const module = bundledAssets[media.bundledKey];
    if (!module) throw new Error("Recurso de muestra no disponible.");
    const asset = Asset.fromModule(module);
    await asset.downloadAsync();
    return asset.localUri ?? asset.uri;
  }
  if (!media.localUri || !new File(media.localUri).exists)
    throw new Error(
      "No se encuentra la imagen. Vuelve a seleccionarla desde tu biblioteca.",
    );
  return media.localUri;
}
export async function pickAndStoreImage(): Promise<MediaAsset | null> {
  // Android photo picker needs no broad library permission. iOS requests access at use.
  if (Platform.OS === "ios") {
    const permission = await Picker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted)
      throw new Error(
        "Permiso de fotos no concedido. Puedes habilitarlo en Ajustes y reintentar.",
      );
  }
  const result = await Picker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 1,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset) throw new Error("No se ha recibido ninguna imagen.");
  if (asset.fileSize && asset.fileSize > limits.imageMB * 1024 * 1024)
    throw new Error(
      "La imagen supera 20 MB. Selecciona una versión más pequeña.",
    );
  const mime =
    asset.mimeType ??
    (/\.png(?:\?|$)/i.test(asset.uri)
      ? "image/png"
      : /\.jpe?g(?:\?|$)/i.test(asset.uri)
        ? "image/jpeg"
        : "");
  if (!["image/jpeg", "image/png", "image/webp"].includes(mime))
    throw new Error(
      "Formato no admitido. Usa una imagen JPEG, PNG o WebP (no HEIC, GIF o vídeo).",
    );
  if (!asset.width || !asset.height || asset.width * asset.height > 50_000_000)
    throw new Error("La imagen no es válida o supera 50 megapíxeles.");
  let temporary: string | undefined;
  try {
    const context = ImageManipulator.manipulate(asset.uri);
    if (Math.max(asset.width, asset.height) > 1600)
      context.resize(
        asset.width >= asset.height ? { width: 1600 } : { height: 1600 },
      );
    const rendered = await context.renderAsync();
    const saved = await rendered.saveAsync({
      format: mime === "image/jpeg" ? SaveFormat.JPEG : SaveFormat.PNG,
      compress: 0.88,
    });
    temporary = saved.uri;
    const dir = new Directory(Paths.document, "artium-media");
    dir.create({ idempotent: true, intermediates: true });
    const id = `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const file = new File(
      dir,
      `${id}.${mime === "image/jpeg" ? "jpg" : "png"}`,
    );
    new File(saved.uri).copy(file);
    if (!file.exists || file.size === 0) throw new Error("Copia vacía.");
    return {
      id,
      localUri: file.uri,
      width: saved.width,
      height: saved.height,
      mimeType: mime === "image/jpeg" ? "image/jpeg" : "image/png",
    };
  } catch {
    throw new Error(
      "No se ha podido copiar la imagen al almacenamiento de Artium. Comprueba el espacio y reintenta.",
    );
  } finally {
    if (temporary) {
      try {
        new File(temporary).delete();
      } catch {
        /* cache can be cleared by OS */
      }
    }
  }
}
