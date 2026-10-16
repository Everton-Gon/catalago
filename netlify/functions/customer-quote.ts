import { quoteR2, privateBucket } from "./_lib/quote-r2";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import type { Config } from "@netlify/functions";
import { getCatalogStore, readProducts } from "./_lib/catalog-store";
import {
  quoteKey,
  readCustomerQuote,
  type CustomerQuote,
  type QuoteFile,
} from "./_lib/customer-quotes";
import { PRODUCTS } from "../../src/data/products";
import {
  calculateUnitPrice,
  getDefaultSelections,
  isPriceOnRequest,
} from "../../src/utils/cart";
import { buildWhatsAppUrl } from "../../src/utils/whatsapp";
import { formatPrice } from "../../src/utils/format";
import type { Product } from "../../src/types";
import type { AdminOrder } from "../../src/types/admin";

class InvalidQuote extends Error {}
const text = (value: unknown, max: number) => {
  if (value === undefined) return "";
  if (typeof value !== "string" || value.length > max)
    throw new InvalidQuote("Revise os textos do orçamento.");
  return value.trim();
};
const response = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
export default async function handler(request: Request) {
  if (request.method !== "POST")
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return response({ error: "Origem não autorizada." }, 403);
  if (Number(request.headers.get("content-length") ?? 0) > 4.5 * 1024 * 1024)
    return response(
      { error: "As imagens do orçamento devem somar até 4 MB." },
      413,
    );
  const uploaded: QuoteFile[] = [];
  let client: ReturnType<typeof quoteR2> | undefined;
  let committed = false;
  let candidate: { id: string; fingerprint: string } | undefined;
  try {
    const form = await request.formData();
    const raw = form.get("payload");
    if (typeof raw !== "string" || raw.length > 50000)
      throw new InvalidQuote("Orçamento inválido.");
    const input = JSON.parse(raw);
    if (!input || typeof input !== "object")
      throw new InvalidQuote("Orçamento inválido.");
    if (
      !/^[a-f0-9-]{36}$/.test(input.submissionId) ||
      !Array.isArray(input.items) ||
      !input.items.length ||
      input.items.length > 20 ||
      input.website
    )
      throw new InvalidQuote("Revise os itens do orçamento (máximo 20).");
    const customer = text(input.customer, 100),
      phone = text(input.phone, 20).replace(/\D/g, ""),
      notes = text(input.notes, 1000);
    if (!customer || !/^\d{10,15}$/.test(phone))
      throw new InvalidQuote("Informe seu nome e WhatsApp com DDD.");
    const source = ((await readProducts()) ?? PRODUCTS) as Product[];
    const files: { file: File; bytes: Uint8Array; index: number }[] = [];
    const items: AdminOrder["items"] = input.items.map(
      (item: Record<string, unknown>, index: number) => {
        const product = source.find(
          (p) => p.id === item.productId && p.available && p.status !== "draft",
        );
        if (
          !product ||
          !Number.isInteger(item.quantity) ||
          Number(item.quantity) < 1 ||
          Number(item.quantity) > 999
        )
          throw new InvalidQuote(
            "Um produto não está disponível. Atualize a sacola.",
          );
        const options = getDefaultSelections(product);
        if (
          !item.options ||
          typeof item.options !== "object" ||
          Array.isArray(item.options)
        )
          throw new InvalidQuote("Opções inválidas.");
        for (const [id, value] of Object.entries(item.options)) {
          const dimension = product.variants.find((v) => v.id === id);
          if (
            !dimension ||
            typeof value !== "string" ||
            (!dimension.options.some((o) => o.label === value) &&
              !(id === "cor" && product.colors?.some((c) => c.name === value)))
          )
            throw new InvalidQuote(
              "Uma opção mudou. Edite o produto na sacola.",
            );
          options[id] = value;
        }
        const priceOnRequest = isPriceOnRequest(product, options);
        const unitPrice = priceOnRequest
          ? 0
          : calculateUnitPrice(product, options);
        if (!Number.isFinite(unitPrice) || (!priceOnRequest && unitPrice <= 0))
          throw new InvalidQuote("Produto sem preço disponível.");
        const personal = item.personalization as
          Record<string, unknown> | undefined;
        const itemNotes = [
          personal?.name ? `Nome: ${text(personal.name, 200)}` : "",
          personal?.text ? `Texto: ${text(personal.text, 1000)}` : "",
          text(item.notes, 1000),
        ]
          .filter(Boolean)
          .join("\n");
        const file = form.get(`file-${index}`);
        if (item.hasImage && !(file instanceof File))
          throw new InvalidQuote("Uma imagem está faltando. Anexe novamente.");
        if (file instanceof File)
          files.push({ file, bytes: new Uint8Array(), index });
        return {
          productId: product.id,
          name: product.name,
          quantity: Number(item.quantity),
          unitPrice,
          priceOnRequest,
          options,
          notes: itemNotes,
          attachments: [],
        };
      },
    );
    if (
      new Set(form.keys()).size !== [...form.keys()].length ||
      [...form.keys()].some(
        (key) => key !== "payload" && !/^file-\d+$/.test(key),
      ) ||
      [...form.keys()].some(
        (key) =>
          key.startsWith("file-") && Number(key.slice(5)) >= items.length,
      )
    )
      throw new InvalidQuote("Arquivo sem produto associado ou duplicado.");
    let totalSize = 0;
    for (const entry of files) {
      const { file } = entry;
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        !file.size ||
        file.size > 3 * 1024 * 1024
      )
        throw new InvalidQuote("Use imagens JPG, PNG ou WebP de até 3 MB.");
      totalSize += file.size;
      if (totalSize > 4 * 1024 * 1024)
        throw new InvalidQuote(
          "As imagens do orçamento devem somar até 4 MB. Reduza os arquivos ou divida o pedido.",
        );
      entry.bytes = new Uint8Array(await file.arrayBuffer());
      const b = entry.bytes;
      const valid =
        file.type === "image/png"
          ? Buffer.from(b.subarray(0, 8)).equals(
              Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
            )
          : file.type === "image/jpeg"
            ? b[0] === 255 && b[1] === 216 && b[2] === 255
            : Buffer.from(b.subarray(0, 4)).toString() === "RIFF" &&
              Buffer.from(b.subarray(8, 12)).toString() === "WEBP";
      if (!valid)
        throw new InvalidQuote(
          "Um arquivo não corresponde a uma imagem válida.",
        );
    }
    const fingerprint = createHash("sha256")
      .update(
        JSON.stringify({
          customer,
          phone,
          notes,
          items,
          files: files.map((f) => ({
            index: f.index,
            name: f.file.name,
            hash: createHash("sha256").update(f.bytes).digest("hex"),
          })),
        }),
      )
      .digest("hex");
    const id = `web-${input.submissionId}`;
    const previous = await readCustomerQuote(id);
    if (previous) {
      if (previous.fingerprint !== fingerprint)
        return response(
          { error: "O pedido mudou. Tente registrar novamente." },
          409,
        );
      return response(previous.receipt);
    }
    const token = randomBytes(32).toString("hex"),
      number = `FP-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomBytes(4).toString("hex").toUpperCase()}`;
    if (files.length) {
      const bucket = privateBucket();
      client = quoteR2();
      for (const entry of files) {
        const file: QuoteFile = {
          bucket,
          key: `quotes/${id}/${randomUUID()}`,
          name: entry.file.name.slice(0, 150),
          type: entry.file.type,
          item: entry.index,
        };
        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: file.key,
            Body: entry.bytes,
            ContentType: file.type,
            CacheControl: "private, no-store",
          }),
        );
        uploaded.push(file);
      }
    }
    const attachments = uploaded.map((file, index) => {
      const url = new URL("/api/quote-image", request.url);
      url.search = new URLSearchParams({
        quote: id,
        file: String(index),
        token,
      }).toString();
      items[file.item].attachments!.push(url.href);
      return url.href;
    });
    const now = new Date().toISOString();
    const order: AdminOrder = {
      id,
      number,
      customer,
      phone,
      createdAt: now,
      items,
      notes,
      attachments,
      source: "storefront",
      status: "pending",
      payment: "unconfirmed",
      totalKind: "estimated",
      history: [
        {
          at: now,
          actor: "Cliente pelo site",
          message:
            "Orçamento solicitado pelo site. Arquivos salvos; envio da mensagem pelo WhatsApp e pagamento não confirmados.",
        },
      ],
    };
    const message = [
      "Olá! Gostaria de solicitar um orçamento na Fé & Propósito.",
      "",
      `*Orçamento: ${number}*`,
      `Cliente: ${customer}`,
      ...items.flatMap((item, index) => [
        "",
        `*${index + 1}. ${item.name}*`,
        `Quantidade: ${item.quantity}`,
        ...Object.entries(item.options).map(
          ([key, value]) =>
            `${source.find((p) => p.id === item.productId)?.variants.find((v) => v.id === key)?.name ?? key}: ${value}`,
        ),
        item.notes,
        ...(item.attachments?.length
          ? ["Imagem de referência anexada ao orçamento:", ...item.attachments]
          : []),
        `Subtotal estimado: ${item.priceOnRequest ? "Sob consulta" : formatPrice(item.unitPrice * item.quantity)}`,
      ]),
      ...(notes ? ["", `Observações gerais: ${notes}`] : []),
      "",
      `*TOTAL ESTIMADO: ${items.some((item) => item.priceOnRequest) ? "Sob consulta (há opções sem preço definido)" : formatPrice(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0))}*`,
      "Aguardo a confirmação do valor final, prazo e entrega.",
      ...(files.length
        ? [
            "As imagens estão disponíveis pelos links acima; não são anexos diretos do WhatsApp.",
          ]
        : []),
    ]
      .filter((line) => line !== undefined)
      .join("\n");
    const receipt = {
      number,
      whatsappUrl: buildWhatsAppUrl(message),
      hasImages: files.length > 0,
    };
    const saved: CustomerQuote = {
      order,
      token,
      fingerprint,
      files: uploaded,
      receipt,
    };
    candidate = { id, fingerprint };
    const result = await getCatalogStore().setJSON(quoteKey(id), saved, {
      onlyIfNew: true,
    });
    if (!result.modified) {
      const winner = await readCustomerQuote(id);
      if (!winner || winner.fingerprint !== fingerprint)
        throw new InvalidQuote("O pedido mudou. Tente novamente.");
      if (client)
        await Promise.allSettled(
          uploaded.map((f) =>
            client!.send(
              new DeleteObjectCommand({ Bucket: f.bucket, Key: f.key }),
            ),
          ),
        );
      return response(winner.receipt);
    }
    committed = true;
    return response(receipt);
  } catch (error) {
    // A lost write acknowledgement must not cause deletion of a saved order's files.
    if (candidate) {
      try {
        const existing = await readCustomerQuote(candidate.id);
        if (existing?.fingerprint === candidate.fingerprint) {
          if (client)
            await Promise.allSettled(
              uploaded
                .filter(
                  (file) =>
                    !existing.files.some((saved) => saved.key === file.key),
                )
                .map((file) =>
                  client!.send(
                    new DeleteObjectCommand({
                      Bucket: file.bucket,
                      Key: file.key,
                    }),
                  ),
                ),
            );
          return response(existing.receipt);
        }
      } catch {
        committed = true; // Leave files intact until the idempotent retry can resolve the write.
      }
    }
    if (!committed && client)
      await Promise.allSettled(
        uploaded.map((f) =>
          client!.send(
            new DeleteObjectCommand({ Bucket: f.bucket, Key: f.key }),
          ),
        ),
      );
    const invalid =
      error instanceof InvalidQuote || error instanceof SyntaxError;
    return response(
      {
        error: invalid
          ? error.message
          : "Não foi possível salvar o orçamento e suas imagens. Tente novamente ou fale com o atendimento.",
      },
      invalid ? 400 : 503,
    );
  }
}
export const config: Config = {
  path: "/api/customer-quote",
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
