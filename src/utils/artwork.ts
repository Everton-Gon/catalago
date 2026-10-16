import type { Personalization } from "@/types";
export type Artwork = NonNullable<Personalization["image"]>;
export const MAX_ARTWORK_SIZE = 3 * 1024 * 1024;
export const ARTWORK_TYPES = ["image/jpeg", "image/png", "image/webp"];

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("feproposito-artworks", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("files");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error("Não foi possível guardar a imagem neste navegador."));
  });
}
export async function saveArtwork(file: File): Promise<Artwork> {
  if (!ARTWORK_TYPES.includes(file.type))
    throw new Error("Use uma imagem JPG, PNG ou WebP.");
  if (!file.size || file.size > MAX_ARTWORK_SIZE)
    throw new Error("A imagem deve ter até 3 MB.");
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("Não foi possível abrir essa imagem.");
  });
  bitmap.close();
  const artwork = {
    id: crypto.randomUUID(),
    name: file.name.slice(0, 150),
    type: file.type,
    size: file.size,
  };
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("files", "readwrite");
      transaction.objectStore("files").put(file, artwork.id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = transaction.onabort = () =>
        reject(
          new Error(
            "Não foi possível guardar a imagem. Tente um arquivo menor.",
          ),
        );
    });
  } finally {
    db.close();
  }
  return artwork;
}
export async function readArtwork(id: string): Promise<File> {
  const db = await database();
  try {
    return await new Promise<File>((resolve, reject) => {
      const request = db.transaction("files").objectStore("files").get(id);
      request.onsuccess = () =>
        request.result instanceof Blob
          ? resolve(request.result as File)
          : reject(
              new Error(
                "A imagem não está mais neste navegador. Edite o item e anexe novamente.",
              ),
            );
      request.onerror = () =>
        reject(
          new Error("Não foi possível recuperar a imagem. Anexe novamente."),
        );
    });
  } finally {
    db.close();
  }
}
