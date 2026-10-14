import type { Config } from "@netlify/functions";
import { getCatalogStore } from "./_lib/catalog-store";
import type { StorefrontContent } from "../../src/data/storefrontContent";
export default async function handler(request: Request) {
  if (request.method !== "GET")
    return new Response(null, { status: 405, headers: { Allow: "GET" } });
  const content = (await getCatalogStore().get("content", {
    type: "json",
  })) as StorefrontContent | null;
  return Response.json(
    content
      ? {
          ...content,
          banners: content.banners.filter((b) => b.active && b.image),
          collections: content.collections.filter((c) => c.active),
        }
      : null,
    { headers: { "Cache-Control": "public, max-age=30" } },
  );
}
export const config: Config = { path: "/api/storefront" };
