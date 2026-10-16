import { getCatalogStore } from "./catalog-store";
import type { AdminOrder } from "../../../src/types/admin";

export interface QuoteFile {
  key: string;
  bucket: string;
  name: string;
  type: string;
  item: number;
}
export interface CustomerQuote {
  order: AdminOrder;
  token: string;
  fingerprint: string;
  files: QuoteFile[];
  receipt: { number: string; whatsappUrl: string; hasImages: boolean };
}
export const QUOTE_PREFIX = "customer-quotes/";
export function quoteKey(id: string) {
  return `${QUOTE_PREFIX}${id}`;
}
export async function readCustomerQuote(id: string) {
  return (await getCatalogStore().get(quoteKey(id), {
    type: "json",
    consistency: "strong",
  })) as CustomerQuote | null;
}
export async function readAllOrders(): Promise<AdminOrder[]> {
  const store = getCatalogStore();
  const manual = (await store.get("orders", {
    type: "json",
    consistency: "strong",
  })) as AdminOrder[] | null;
  const result = [...(manual ?? [])];
  for await (const page of store.list({
    prefix: QUOTE_PREFIX,
    paginate: true,
  })) {
    const quotes = await Promise.all(
      page.blobs.map(
        (blob) =>
          store.get(blob.key, {
            type: "json",
            consistency: "strong",
          }) as Promise<CustomerQuote | null>,
      ),
    );
    result.push(...quotes.flatMap((quote) => (quote ? [quote.order] : [])));
  }
  return result.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
