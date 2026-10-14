export async function adminRequest<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch(`/api/admin/${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new Error(
      "O servidor administrativo está indisponível. Nenhuma alteração foi confirmada.",
    );
  }
  if (!response.ok)
    throw new Error(
      (result as { error?: string })?.error ||
        `Falha no servidor (${response.status}).`,
    );
  return result as T;
}
export async function uploadAdminImage(
  file: File,
  category: string,
): Promise<string> {
  if (
    !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)
  )
    throw new Error("Use JPG, PNG, WebP ou GIF.");
  if (file.size > 10 * 1024 * 1024 || !file.size)
    throw new Error("Cada imagem deve ter entre 1 byte e 10 MB.");
  const data = new FormData();
  data.set("file", file);
  data.set("category", category);
  const response = await fetch("/api/admin/images", {
    method: "POST",
    body: data,
  });
  let result: { url?: string; error?: string };
  try {
    result = await response.json();
  } catch {
    throw new Error(
      "Falha no upload. Confira a integração R2 e tente novamente.",
    );
  }
  if (!response.ok || !result.url)
    throw new Error(result.error || "Falha no upload. Tente novamente.");
  return result.url;
}
export async function imageSize(src: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () =>
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () =>
      reject(new Error(`Não foi possível carregar a imagem: ${src}`));
    image.src = src;
  });
}
