import { Asset } from "expo-asset";
import * as Picker from "expo-image-picker";
import { MediaAsset, limits } from "../domain/models";
import { bundledAssets } from "./bundledAssets";
const urls = new Map<string, string>();
async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("artium-images", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("images");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () =>
      reject(
        new Error(
          "No se puede acceder al almacenamiento de imágenes del navegador.",
        ),
      );
  });
}
async function readBlob(id: string): Promise<Blob> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("images", "readonly");
    const req = tx.objectStore("images").get(id);
    req.onsuccess = () =>
      req.result
        ? resolve(req.result)
        : reject(
            new Error("La imagen no está disponible. Vuelve a seleccionarla."),
          );
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}
export async function resolveMediaUri(media: MediaAsset): Promise<string> {
  if (media.bundledKey) {
    const source = bundledAssets[media.bundledKey];
    if (!source) throw new Error("Imagen no disponible.");
    return Asset.fromModule(source).uri;
  }
  if (!media.localUri?.startsWith("idb:"))
    throw new Error("Imagen no disponible en este navegador.");
  const id = media.localUri.slice(4);
  if (!urls.has(id)) urls.set(id, URL.createObjectURL(await readBlob(id)));
  return urls.get(id)!;
}
export async function pickAndStoreImage(): Promise<MediaAsset | null> {
  const result = await Picker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 1,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset) throw new Error("No se recibió la imagen.");
  const blob = asset.file ?? (await (await fetch(asset.uri)).blob());
  if (!["image/jpeg", "image/png", "image/webp"].includes(blob.type))
    throw new Error("Usa JPEG, PNG o WebP.");
  if (blob.size > limits.imageMB * 1024 * 1024)
    throw new Error("La imagen supera 20 MB.");
  if (!asset.width || !asset.height || asset.width * asset.height > 50_000_000)
    throw new Error("Imagen no válida o mayor de 50 megapíxeles.");
  const id = `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const db = await database();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("images", "readwrite");
    tx.objectStore("images").put(blob, id);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(
        new Error(
          "No se ha podido guardar la imagen. Comprueba el espacio del navegador.",
        ),
      );
    };
  });
  return {
    id,
    localUri: `idb:${id}`,
    width: asset.width,
    height: asset.height,
    mimeType: blob.type as MediaAsset["mimeType"],
  };
}
