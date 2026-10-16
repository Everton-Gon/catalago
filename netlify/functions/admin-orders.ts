import type { Config } from "@netlify/functions";
import { requireAdmin, getAdminSessionUser } from "./_lib/auth";
import { getCatalogStore } from "./_lib/catalog-store";
import { ORDER_LABELS, type AdminOrder } from "../../src/types/admin";
import { safeAsset } from "../../src/utils/admin-validation";
import { readAllOrders, readCustomerQuote, quoteKey } from './_lib/customer-quotes';
export default async function handler(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const store = getCatalogStore();
  if (request.method === "GET")
    return Response.json(await readAllOrders(), {
      headers: { "Cache-Control": "no-store" },
    });
  if (request.method !== "POST" && request.method !== "PUT")
    return new Response(null, {
      status: 405,
      headers: { Allow: "GET, POST, PUT" },
    });
  try {
    const order = (await request.json()) as AdminOrder;
    if (
      !order.customer?.trim() ||
      !/^\d{10,15}$/.test(order.phone) ||
      !Array.isArray(order.items) ||
      !order.items.length ||
      order.items.length > 100 ||
      order.items.some(
        (i) =>
          !i.name?.trim() ||
          !Number.isInteger(i.quantity) ||
          i.quantity <= 0 ||
          !Number.isFinite(i.unitPrice) ||
          i.unitPrice < 0 ||
          typeof i.options !== "object",
      ) ||
      !["pending", "approved", "production", "completed", "cancelled"].includes(
        order.status,
      ) ||
      !["unconfirmed", "confirmed"].includes(order.payment) ||
      !["estimated", "confirmed"].includes(order.totalKind) ||
      !Array.isArray(order.attachments) ||
      order.attachments.some((url) => !safeAsset(url))
    )
      throw new Error("Orçamento inválido.");
    const orders = ((await store.get("orders", { type: "json" })) ||
      []) as AdminOrder[];
    const customerQuote = request.method === 'PUT' && order.id.startsWith('web-') ? await readCustomerQuote(order.id) : null;
    const previous = customerQuote?.order ?? orders.find((o) => o.id === order.id);
    if (request.method === "PUT" && !previous)
      return Response.json(
        { error: "Orçamento não encontrado." },
        { status: 404 },
      );
    const user = await getAdminSessionUser(request);
    const now = new Date().toISOString();
    const message = previous
      ? `Atualizado: andamento ${ORDER_LABELS[order.status]}; pagamento ${order.payment === "confirmed" ? "confirmado" : "não confirmado"}; valor ${order.totalKind === "confirmed" ? "confirmado" : "estimado"}.`
      : "Orçamento registrado manualmente pelo administrador.";
    const saved: AdminOrder = {
      ...order,
      source: customerQuote ? 'storefront' : previous?.source,
      id: previous?.id || crypto.randomUUID(),
      number: previous?.number || `FP-${Date.now()}`,
      createdAt: previous?.createdAt || now,
      history: [
        ...(previous?.history || []),
        { at: now, actor: user?.email || "Administrador", message },
      ],
    };
    if (customerQuote) await store.setJSON(quoteKey(saved.id), { ...customerQuote, order: saved });
    else await store.setJSON(
      "orders",
      previous
        ? orders.map((o) => (o.id === saved.id ? saved : o))
        : [...orders, saved],
    );
    return Response.json(saved);
  } catch {
    return Response.json(
      {
        error:
          "Orçamento inválido. Informe cliente, telefone, itens e valores válidos.",
      },
      { status: 400 },
    );
  }
}
export const config: Config = { path: "/api/admin/orders" };
