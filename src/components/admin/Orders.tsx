import { useEffect, useState } from "react";
import type { Product } from "@/types";
import { ORDER_LABELS, type AdminOrder } from "@/types/admin";
import { calculateUnitPrice, getDefaultSelections } from "@/utils/cart";
import { formatPrice } from "@/utils/format";
import { adminRequest } from "@/utils/admin-api";
import { AdminDrawer, Empty, Field } from "./shared";

export default function Orders({
  orders,
  products,
  ready,
  onSaved,
}: {
  orders: AdminOrder[];
  products: Product[];
  ready: boolean;
  onSaved: (order: AdminOrder) => void;
}) {
  const [editing, setEditing] = useState<AdminOrder | null>(null),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState("");
  const shown = orders.filter(
    (o) =>
      (!status || o.status === status) &&
      `${o.number} ${o.customer} ${o.phone}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  function create() {
    setEditing({
      id: "",
      number: "Novo orçamento",
      customer: "",
      phone: "",
      createdAt: new Date().toISOString(),
      items: [],
      notes: "",
      attachments: [],
      status: "pending",
      payment: "unconfirmed",
      totalKind: "estimated",
      history: [],
    });
  }
  return (
    <>
      <div className="admin-section-heading">
        <div>
          <h2>Pedidos e orçamentos</h2>
          <p>
            Registros manuais de atendimentos reais. Abrir o WhatsApp não
            confirma venda ou pagamento.
          </p>
        </div>
        <button className="admin-button" disabled={!ready} onClick={create}>
          Registrar orçamento
        </button>
      </div>
      <div className="admin-toolbar">
        <Field label="Buscar orçamento">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Número, cliente ou telefone"
          />
        </Field>
        <Field label="Andamento">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(ORDER_LABELS).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {!ready ? (
        <Empty title="Registros indisponíveis">
          <p>
            Confira a conexão com o servidor antes de registrar um atendimento.
          </p>
        </Empty>
      ) : !shown.length ? (
        <Empty title="Nenhum orçamento encontrado">
          <p>
            Cadastre os atendimentos recebidos pelo WhatsApp para acompanhar
            itens, andamento e confirmação de pagamento.
          </p>
        </Empty>
      ) : (
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Itens</th>
                <th>Valor</th>
                <th>Andamento</th>
                <th>Pagamento</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {shown
                .slice()
                .reverse()
                .map((order) => (
                  <tr key={order.id}>
                    <td>{order.number}</td>
                    <td>{order.customer}</td>
                    <td>
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td>{order.items.reduce((n, i) => n + i.quantity, 0)}</td>
                    <td>
                      {formatPrice(
                        order.items.reduce(
                          (n, i) => n + i.quantity * i.unitPrice,
                          0,
                        ),
                      )}
                      <small>
                        {order.totalKind === "estimated"
                          ? "Estimado"
                          : "Confirmado"}
                      </small>
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${order.status === "completed" ? "success" : "attention"}`}
                      >
                        {ORDER_LABELS[order.status]}
                      </span>
                    </td>
                    <td>
                      {order.payment === "confirmed"
                        ? "Confirmado"
                        : "Não confirmado"}
                    </td>
                    <td>
                      <button
                        className="admin-button secondary small"
                        onClick={() => setEditing(order)}
                      >
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && (
        <OrderEditor
          order={editing}
          products={products}
          onClose={() => setEditing(null)}
          onSaved={(order) => {
            onSaved(order);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
function OrderEditor({
  order,
  products,
  onClose,
  onSaved,
}: {
  order: AdminOrder;
  products: Product[];
  onClose: () => void;
  onSaved: (o: AdminOrder) => void;
}) {
  const [draft, setDraft] = useState(() => structuredClone(order)),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [productId, setProductId] = useState(products[0]?.id || ""),
    [fileUrl, setFileUrl] = useState(""),
    [paymentConfirm, setPaymentConfirm] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(order);
  const close = () => {
    if (
      !busy &&
      (!dirty || window.confirm("Descartar as alterações do orçamento?"))
    )
      onClose();
  };
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function summary() {
    return `${draft.number}\n${draft.customer}\n${draft.items
      .map(
        (i) =>
          `${i.quantity} × ${i.name}: ${formatPrice(i.unitPrice)}\n${Object.entries(
            i.options,
          )
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ")}\n${i.notes}`,
      )
      .join(
        "\n",
      )}\n${draft.notes}\nTotal ${draft.totalKind === "estimated" ? "estimado" : "confirmado"}: ${formatPrice(draft.items.reduce((n, i) => n + i.quantity * i.unitPrice, 0))}`;
  }
  async function save() {
    if (busy) return;
    if (
      draft.payment === "confirmed" &&
      order.payment !== "confirmed" &&
      !paymentConfirm
    ) {
      setError("Confirme que o pagamento foi verificado antes de registrá-lo.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const saved = await adminRequest<AdminOrder>(
        "orders",
        order.id ? "PUT" : "POST",
        draft,
      );
      onSaved(saved);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <AdminDrawer title={order.number} onClose={close}>
      <div className="admin-form">
        <div className="admin-actions">
          <button
            className="admin-button secondary small"
            onClick={() =>
              void navigator.clipboard
                .writeText(summary())
                .then(() => setError("Resumo copiado."))
                .catch(() => setError("Não foi possível copiar o resumo."))
            }
          >
            Copiar resumo
          </button>
          {/^\d{10,15}$/.test(draft.phone) && (
            <a
              className="admin-button secondary small"
              href={`https://wa.me/${draft.phone}?text=${encodeURIComponent(summary())}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir WhatsApp
            </a>
          )}
        </div>
        <Field label="Cliente *">
          <input
            value={draft.customer}
            onChange={(e) => setDraft({ ...draft, customer: e.target.value })}
          />
        </Field>
        <Field label="WhatsApp com país e DDD *">
          <input
            inputMode="tel"
            value={draft.phone}
            onChange={(e) =>
              setDraft({ ...draft, phone: e.target.value.replace(/\D/g, "") })
            }
            placeholder="55 + DDD + número"
          />
        </Field>
        <fieldset>
          <legend>Itens e opções</legend>
          <div className="admin-actions">
            <select
              aria-label="Produto para orçamento"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button
              className="admin-button secondary small"
              onClick={() => {
                const p = products.find((p) => p.id === productId);
                if (p) {
                  const options = getDefaultSelections(p, true);
                  setDraft({
                    ...draft,
                    items: [
                      ...draft.items,
                      {
                        productId: p.id,
                        name: p.name,
                        quantity: 1,
                        unitPrice: calculateUnitPrice(p, options),
                        options,
                        notes: "",
                      },
                    ],
                  });
                }
              }}
            >
              Adicionar item
            </button>
          </div>
          {draft.items.map((item, index) => {
            const p = products.find((p) => p.id === item.productId);
            const patch = (value: Partial<typeof item>) =>
              setDraft((d) => ({
                ...d,
                items: d.items.map((i, n) =>
                  n === index ? { ...i, ...value } : i,
                ),
              }));
            return (
              <fieldset key={index}>
                <legend>{item.name}</legend>
                {Object.keys(item.options).length > 0 && (
                  <p>
                    Opções registradas:{" "}
                    {Object.entries(item.options)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(" · ")}
                  </p>
                )}
                <small>
                  O preço unitário é editável. Confira o valor negociado ao
                  alterar as opções.
                </small>
                <div className="admin-two">
                  <Field label="Quantidade">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        patch({ quantity: Number(e.target.value) })
                      }
                    />
                  </Field>
                  <Field label="Preço unitário R$">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        patch({ unitPrice: Number(e.target.value) })
                      }
                    />
                  </Field>
                </div>
                {p?.variants.map((v) => (
                  <Field key={v.id} label={v.name}>
                    <select
                      value={item.options[v.id] || ""}
                      onChange={(e) =>
                        patch({
                          options: { ...item.options, [v.id]: e.target.value },
                        })
                      }
                    >
                      <option value="">Não definido</option>
                      {v.options.map((o) => (
                        <option key={o.label} value={o.label}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                ))}
                <Field label="Personalização e observações">
                  <textarea
                    value={item.notes}
                    onChange={(e) => patch({ notes: e.target.value })}
                  />
                </Field>
                <button
                  className="admin-button secondary small danger"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      items: draft.items.filter((_, i) => i !== index),
                    })
                  }
                >
                  Remover item
                </button>
              </fieldset>
            );
          })}
        </fieldset>
        <Field label="Observações gerais">
          <textarea
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          />
        </Field>
        <div className="admin-two">
          <Field label="Andamento">
            <select
              value={draft.status}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  status: e.target.value as AdminOrder["status"],
                })
              }
            >
              {Object.entries(ORDER_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Natureza do valor">
            <select
              value={draft.totalKind}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  totalKind: e.target.value as AdminOrder["totalKind"],
                })
              }
            >
              <option value="estimated">Estimado</option>
              <option value="confirmed">Confirmado com o cliente</option>
            </select>
          </Field>
        </div>
        <Field label="Pagamento">
          <select
            value={draft.payment}
            onChange={(e) =>
              setDraft({
                ...draft,
                payment: e.target.value as AdminOrder["payment"],
              })
            }
          >
            <option value="unconfirmed">Não confirmado</option>
            <option value="confirmed">Confirmado</option>
          </select>
        </Field>
        {draft.payment === "confirmed" && order.payment !== "confirmed" && (
          <label className="admin-check">
            <input
              type="checkbox"
              checked={paymentConfirm}
              onChange={(e) => setPaymentConfirm(e.target.checked)}
            />
            Verifiquei o recebimento do pagamento.
          </label>
        )}
        <fieldset>
          <legend>Arquivos do cliente</legend>
          <p>
            Registre os links reais dos arquivos recebidos. A sacola pública não
            envia arquivos ao servidor.
          </p>
          {draft.attachments.map((url, index) => (
            <div className="admin-actions" key={url}>
              <a
                className="admin-button secondary small"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                Baixar arquivo {index + 1}
              </a>
              <button
                className="admin-icon danger"
                aria-label={`Remover arquivo ${index + 1}`}
                onClick={() =>
                  setDraft({
                    ...draft,
                    attachments: draft.attachments.filter(
                      (_, i) => i !== index,
                    ),
                  })
                }
              >
                ×
              </button>
            </div>
          ))}
          <Field label="Link HTTPS do arquivo">
            <input
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />
          </Field>
          <button
            className="admin-button secondary small"
            disabled={!fileUrl.startsWith("https://")}
            onClick={() => {
              setDraft({
                ...draft,
                attachments: [...draft.attachments, fileUrl],
              });
              setFileUrl("");
            }}
          >
            Adicionar arquivo
          </button>
        </fieldset>
        <fieldset>
          <legend>Histórico</legend>
          {draft.history.length ? (
            draft.history.map((h, i) => (
              <p key={i}>
                <strong>{new Date(h.at).toLocaleString("pt-BR")}</strong>
                <br />
                {h.actor}: {h.message}
              </p>
            ))
          ) : (
            <p>
              O histórico começa após o primeiro registro confirmado pelo
              servidor.
            </p>
          )}
        </fieldset>
        {error && (
          <p className={error === "Resumo copiado." ? "admin-success" : "admin-field-error"} role="status">
            {error}
          </p>
        )}
        <div className="admin-actions">
          <button
            className="admin-button"
            disabled={busy}
            onClick={() => void save()}
          >
            {busy ? "Salvando…" : "Salvar orçamento"}
          </button>
          <button
            className="admin-button secondary"
            disabled={busy}
            onClick={close}
          >
            Cancelar
          </button>
        </div>
      </div>
    </AdminDrawer>
  );
}
