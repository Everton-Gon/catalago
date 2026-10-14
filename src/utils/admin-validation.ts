import type { Product } from "../types";
import type { StorefrontContent } from "../data/storefrontContent";

export function slugify(value: string, trim = true) {
  const slug = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-");
  return trim ? slug.replace(/^-+|-+$/g, "") : slug;
}
export function safeAsset(value: unknown): value is string {
  if (typeof value !== "string" || !value || value.length > 2000) return false;
  if (value.startsWith("/") && !value.startsWith("//") && !/[\\\s]/.test(value))
    return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
export function validDestination(
  value: unknown,
  products: Product[],
  content: StorefrontContent,
): boolean {
  if (typeof value !== "string") return false;
  if (value.startsWith("https://")) {
    try {
      return Boolean(new URL(value).hostname);
    } catch {
      return false;
    }
  }
  if (!value.startsWith("/") || value.startsWith("//")) return false;
  const path = value.split(/[?#]/)[0];
  if (["/", "/produtos", "/contato", "/como-funciona"].includes(path))
    return true;
  if (
    /^\/categoria\/(canecas|camisetas|copos|kits|quadros|personalizados)$/.test(
      path,
    )
  )
    return true;
  if (path.startsWith("/produto/"))
    return products.some(
      (p) => p.slug === path.slice(9) && p.status !== "draft" && p.available,
    );
  if (path.startsWith("/colecao/"))
    return content.collections.some(
      (c) => c.slug === path.slice(9) && c.active,
    );
  return false;
}
export function productErrors(
  product: Product,
  all: Product[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!product.name?.trim()) errors.name = "Informe o nome.";
  if (!product.slug || slugify(product.slug) !== product.slug)
    errors.slug = "Use um endereço com letras, números e hífens.";
  else if (all.some((p) => p.id !== product.id && p.slug === product.slug))
    errors.slug = "Este endereço já pertence a outro produto.";
  if (
    !Number.isFinite(product.price) ||
    product.price < 0 ||
    (product.status !== "draft" && product.price <= 0)
  )
    errors.price = "Informe um preço válido, maior que zero para publicar.";
  if (
    product.oldPrice !== undefined &&
    (!Number.isFinite(product.oldPrice) || product.oldPrice < 0)
  )
    errors.oldPrice = "Informe um preço anterior válido.";
  if (
    product.stock !== undefined &&
    (!Number.isInteger(product.stock) || product.stock < 0)
  )
    errors.stock = "Use uma quantidade inteira, sem valores negativos.";
  if (product.status !== "draft" && !product.images?.length)
    errors.images = "Envie pelo menos uma foto para publicar.";
  if (product.images?.some((image) => !safeAsset(image)))
    errors.images = "Há um endereço de foto inválido.";
  if (
    product.variants?.some(
      (v) =>
        !v.id ||
        !v.name?.trim() ||
        !Array.isArray(v.options) ||
        v.options.some(
          (o) =>
            !o.label?.trim() ||
            [o.price, o.oldPrice].some(
              (value) =>
                value !== undefined && (!Number.isFinite(value) || value < 0),
            ) ||
            (o.priceDelta !== undefined && !Number.isFinite(o.priceDelta)),
        ),
    )
  )
    errors.variants = "Revise os nomes e preços das opções.";
  if (
    product.variants &&
    new Set(product.variants.map((v) => v.id)).size !== product.variants.length
  )
    errors.variants = "Cada dimensão deve ter um identificador próprio.";
  return errors;
}
export function contentErrors(
  content: StorefrontContent,
  products: Product[],
): string[] {
  const errors: string[] = [];
  if (
    !Number.isInteger(content.intervalMs) ||
    content.intervalMs < 5000 ||
    content.intervalMs > 7000
  )
    errors.push("O intervalo deve ficar entre 5 e 7 segundos.");
  if (!content.banners.some((b) => b.id === "gospel" && b.active && b.image))
    errors.push("O banner Gospel deve permanecer ativo como principal.");
  if (
    content.banners.find((b) => b.id === "gospel")?.image !==
    "/brand/banner-fe-proposito-wide.webp"
  )
    errors.push(
      "Preserve a imagem aprovada da camisa Fé e caneca Propósito no banner principal.",
    );
  for (const banner of content.banners) {
    if (!banner.id || !banner.name?.trim())
      errors.push("Informe o nome interno de cada banner.");
    if (
      banner.active &&
      (!banner.title?.trim() ||
        !banner.imageAlt?.trim() ||
        !safeAsset(banner.image))
    )
      errors.push(
        `${banner.name}: informe título, imagem e texto alternativo.`,
      );
    if (banner.mobileImage && !safeAsset(banner.mobileImage))
      errors.push(`${banner.name}: imagem de celular inválida.`);
    if (
      banner.active &&
      [banner.primary, banner.secondary].some(
        (a) =>
          !a?.label?.trim() || !validDestination(a.href, products, content),
      )
    )
      errors.push(`${banner.name}: revise o texto e o destino dos botões.`);
    if (
      !Number.isFinite(banner.order) ||
      !Number.isFinite(banner.width) ||
      !Number.isFinite(banner.height) ||
      banner.width <= 0 ||
      banner.height <= 0
    )
      errors.push(`${banner.name}: dimensões ou ordem inválidas.`);
    if (
      banner.cropLeft !== undefined &&
      (banner.cropLeft < 0 || banner.cropLeft >= 0.8)
    )
      errors.push(`${banner.name}: enquadramento inválido.`);
  }
  for (const collection of content.collections) {
    if (
      !collection.id ||
      !collection.name?.trim() ||
      !collection.slug ||
      slugify(collection.slug) !== collection.slug
    )
      errors.push("Coleção com nome ou endereço inválido.");
    if (collection.image && !safeAsset(collection.image))
      errors.push(`${collection.name}: imagem inválida.`);
  }
  if (
    new Set(content.banners.map((b) => b.id)).size !== content.banners.length ||
    new Set(content.collections.map((c) => c.id)).size !==
      content.collections.length ||
    new Set(content.collections.map((c) => c.slug)).size !==
      content.collections.length
  )
    errors.push("Há identificadores ou endereços duplicados.");
  return errors;
}
