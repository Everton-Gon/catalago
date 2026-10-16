import { quoteR2 } from "./_lib/quote-r2";
import { timingSafeEqual } from "node:crypto";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import type { Config } from "@netlify/functions";
import { readCustomerQuote } from "./_lib/customer-quotes";
export default async function handler(request: Request) {
  const headers = {
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": "default-src 'none'; sandbox",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
  };
  if (request.method !== "GET")
    return new Response(null, {
      status: 405,
      headers: { ...headers, Allow: "GET" },
    });
  const url = new URL(request.url),
    id = url.searchParams.get("quote") ?? "",
    token = url.searchParams.get("token") ?? "",
    index = Number(url.searchParams.get("file"));
  if (
    !/^web-[a-f0-9-]{36}$/.test(id) ||
    !/^[a-f0-9]{64}$/.test(token) ||
    !url.searchParams.has("file") ||
    !Number.isInteger(index) ||
    index < 0
  )
    return new Response("Arquivo indisponível.", { status: 404, headers });
  try {
    const quote = await readCustomerQuote(id);
    if (
      !quote ||
      !timingSafeEqual(Buffer.from(token), Buffer.from(quote.token)) ||
      !quote.files[index]
    )
      return new Response("Arquivo indisponível.", { status: 404, headers });
    const file = quote.files[index];
    const result = await quoteR2().send(
      new GetObjectCommand({ Bucket: file.bucket, Key: file.key }),
    );
    if (!result.Body) throw new Error("Arquivo ausente");
    const bytes = await result.Body.transformToByteArray();
    return new Response(new Uint8Array(bytes).buffer, {
      headers: {
        ...headers,
        "Content-Type": file.type,
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      },
    });
  } catch {
    return new Response("Arquivo temporariamente indisponível.", {
      status: 503,
      headers,
    });
  }
}
export const config: Config = {
  path: "/api/quote-image",
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
