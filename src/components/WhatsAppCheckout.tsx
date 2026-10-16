import { useRef, useState } from "react";
import WhatsAppIcon from "./icons/WhatsAppIcon";
import { readArtwork } from "@/utils/artwork";
import { track } from "@/utils/analytics";
import type { CartItem } from "@/types";
interface Props {
  items: CartItem[];
  notes?: string;
  source: "drawer" | "cart_page" | "product_page";
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}
interface Receipt {
  number: string;
  whatsappUrl: string;
  hasImages: boolean;
}
export default function WhatsAppCheckout({
  items,
  notes = "",
  source,
  className = "",
  children = "Enviar pedido pelo WhatsApp",
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [customer, setCustomer] = useState(""),
    [phone, setPhone] = useState(""),
    [receipt, setReceipt] = useState<Receipt | null>(null);
  const attempt = useRef({ fingerprint: "", id: "" }),
    lock = useRef(false);
  const snapshot = JSON.stringify({
    items: items.map((item) => ({
      productId: item.product.id,
      options: item.selectedVariants,
      quantity: item.quantity,
      personalization: item.personalization,
      notes: item.notes,
    })),
    notes,
    customer,
    phone,
  });
  const receiptFingerprint = useRef("");
  const currentReceipt =
    receiptFingerprint.current === snapshot ? receipt : null;
  if (!items.length) return null;
  return (
    <div className={className}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#17633c] px-5 py-4 text-center text-sm font-semibold text-white hover:bg-[#124e30]"
      >
        <WhatsAppIcon className="size-5 shrink-0" />
        {children}
      </button>
      <p className="mt-2 text-center text-xs leading-relaxed text-ink-500">
        Primeiro registramos o orçamento. As imagens seguem por link protegido,
        não como fotos anexadas ao WhatsApp.
      </p>
      {open && (
        <form
          className="mt-4 space-y-3 rounded-xl border border-brand-100 bg-white p-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (lock.current || currentReceipt || disabled) return;
            lock.current = true;
            setBusy(true);
            setError("");
            try {
              if (attempt.current.fingerprint !== snapshot)
                attempt.current = {
                  fingerprint: snapshot,
                  id: crypto.randomUUID(),
                };
              const form = new FormData();
              let total = 0;
              for (const [index, item] of items.entries()) {
                if (!item.personalization.image) continue;
                const file = await readArtwork(item.personalization.image.id);
                total += file.size;
                if (total > 4 * 1024 * 1024)
                  throw new Error(
                    "As imagens devem somar até 4 MB. Reduza os arquivos ou divida o pedido.",
                  );
                form.append(
                  "file-" + index,
                  file,
                  item.personalization.image.name,
                );
              }
              form.append(
                "payload",
                JSON.stringify({
                  submissionId: attempt.current.id,
                  customer,
                  phone,
                  notes,
                  items: items.map((item) => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    options: item.selectedVariants,
                    notes: item.notes,
                    personalization: {
                      name: item.personalization.name,
                      text: item.personalization.text,
                    },
                    hasImage: Boolean(item.personalization.image),
                  })),
                }),
              );
              const response = await fetch("/api/customer-quote", {
                method: "POST",
                body: form,
              });
              const data = await response.json().catch(() => null);
              if (response.status === 409)
                attempt.current = { fingerprint: "", id: "" };
              if (!response.ok || !data?.number || !data?.whatsappUrl)
                throw new Error(
                  data?.error ||
                    "Não foi possível registrar. Seus itens e imagens continuam na sacola. Tente novamente.",
                );
              const url = new URL(data.whatsappUrl);
              if (url.protocol !== "https:" || url.hostname !== "wa.me")
                throw new Error("O link de atendimento recebido é inválido.");
              receiptFingerprint.current = snapshot;
              setReceipt(data);
              track("begin_whatsapp_quote", { source, items: items.length });
            } catch (reason) {
              setError(
                reason instanceof Error
                  ? reason.message
                  : "Não foi possível registrar o orçamento.",
              );
            } finally {
              lock.current = false;
              setBusy(false);
            }
          }}
        >
          <p className="text-sm font-semibold">Seus dados para o orçamento</p>
          <label className="block text-sm">
            Seu nome
            <input
              required
              maxLength={100}
              autoComplete="name"
              disabled={busy || Boolean(currentReceipt)}
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-3"
            />
          </label>
          <label className="block text-sm">
            Seu WhatsApp com DDD
            <input
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={20}
              pattern={'[+\\(\\) 0-9\\-]{10,20}'}
              disabled={busy || Boolean(currentReceipt)}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(85) 99999-9999"
              className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-3"
            />
          </label>
          <p className="text-xs text-ink-500">
            Nome, contato e arquivos serão usados para atender seu orçamento.
            Quem receber o link poderá consultar a imagem. Não há confirmação de
            venda ou pagamento.
          </p>
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
          {currentReceipt ? (
            <div role="status" className="space-y-3 text-sm text-brand-800">
              <p>
                Orçamento nº {currentReceipt.number} registrado
                {currentReceipt.hasImages ? " com sua imagem" : ""}.
              </p>
              <p>
                Agora abra o WhatsApp e toque em Enviar para encaminhar a
                mensagem ao atendimento.
              </p>
              <a
                href={currentReceipt.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg bg-[#17633c] p-3 text-center font-semibold text-white"
              >
                Continuar no WhatsApp
              </a>
            </div>
          ) : (
            <button
              disabled={busy || disabled}
              className="w-full rounded-lg bg-brand-700 p-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Salvando orçamento e imagens…" : "Registrar orçamento"}
            </button>
          )}
        </form>
      )}
    </div>
  );
}
