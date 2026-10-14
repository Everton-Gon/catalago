import type { Config } from "@netlify/functions";
import { requireAdmin } from "./_lib/auth";
import { getCatalogStore, readProducts } from "./_lib/catalog-store";
import { contentErrors } from "../../src/utils/admin-validation";
import type { StorefrontContent } from "../../src/data/storefrontContent";
import type { Product } from "../../src/types";

export default async function handler(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const store = getCatalogStore();
  if (request.method === "GET")
    return Response.json(await store.get("content", { type: "json" }), {
      headers: { "Cache-Control": "no-store" },
    });
  if (request.method !== "PUT")
    return new Response(null, { status: 405, headers: { Allow: "GET, PUT" } });
  try {
    const content = (await request.json()) as StorefrontContent;
    if (
      !content ||
      !Array.isArray(content.banners) ||
      !Array.isArray(content.collections) ||
      content.banners.length > 100 ||
      content.collections.length > 200
    )
      throw new Error("Conteúdo inválido.");
    const products = (await readProducts()) as Product[] | null;
    const errors = contentErrors(content, products || []);
    if (errors.length)
      return Response.json({ error: errors.join(" ") }, { status: 400 });
    const current = (await store.get("content", {
      type: "json",
    })) as StorefrontContent | null;
    const removed =
      current?.collections.filter(
        (c) => !content.collections.some((next) => next.id === c.id),
      ) || [];
    if (
      removed.some((c) => products?.some((p) => p.collections?.includes(c.id)))
    )
      return Response.json(
        {
          error:
            "Uma coleção vinculada a produtos deve ser desativada, não removida.",
        },
        { status: 400 },
      );
    await store.setJSON("content", content);
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "Conteúdo inválido. Verifique os campos e tente novamente." },
      { status: 400 },
    );
  }
}
export const config: Config = { path: "/api/admin/content" };
