import {
  cloneElement,
  isValidElement,
  useId,
  type ReactNode,
  type ReactElement,
} from "react";
import { X, LoaderCircle } from "lucide-react";
import { useDialogFocus } from "@/utils/useDialogFocus";
export function AdminDrawer({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useDialogFocus(true, onClose);
  return (
    <div className="admin-overlay">
      <button
        className="admin-scrim"
        aria-label="Fechar painel"
        onClick={onClose}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`admin-drawer${wide ? " wide" : ""}`}
        tabIndex={-1}
      >
        <header>
          <div>
            <p className="admin-eyebrow">Fé &amp; Propósito</p>
            <h2>{title}</h2>
          </div>
          <button
            className="admin-icon"
            onClick={onClose}
            aria-label="Fechar painel"
          >
            <X size={20} />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
export function Busy({ label = "Carregando…" }: { label?: string }) {
  return (
    <span className="admin-busy" role="status">
      <LoaderCircle size={18} className="animate-spin" />
      {label}
    </span>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="admin-empty">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  const id = useId();
  const direct =
    isValidElement(children) &&
    typeof children.type === "string" &&
    ["input", "select", "textarea"].includes(children.type);
  const control = direct
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id,
        "aria-labelledby": `${id}-label`,
        "aria-invalid": Boolean(error),
        ...(error ? { "aria-describedby": `${id}-error` } : {}),
      })
    : children;
  return (
    <label className="admin-field" htmlFor={direct ? id : undefined}>
      <span id={`${id}-label`}>{label}</span>
      {control}
      {error && (
        <small id={`${id}-error`} className="admin-field-error" role="alert">
          {error}
        </small>
      )}
    </label>
  );
}
export function Confirm({
  message,
  onConfirm,
  onClose,
  busy = false,
}: {
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  busy?: boolean;
}) {
  return (
    <AdminDrawer
      title="Confirmar alteração"
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <div className="admin-form">
        <p>{message}</p>
        <div className="admin-actions">
          <button disabled={busy} className="admin-button" onClick={onConfirm}>
            {busy ? "Aplicando…" : "Confirmar"}
          </button>
          <button
            disabled={busy}
            className="admin-button secondary"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </AdminDrawer>
  );
}
