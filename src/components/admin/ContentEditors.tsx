import { useEffect, useState } from "react";
import type { Collection, ManagedBanner } from "@/data/storefrontContent";
import { Field, AdminDrawer } from "./shared";
import { imageSize, uploadAdminImage } from "@/utils/admin-api";
import { slugify } from "@/utils/admin-validation";
function useUnsaved(dirty: boolean) {
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}
export function CollectionEditor({
  collection,
  onSave,
  onClose,
}: {
  collection: Collection;
  onSave: (c: Collection) => Promise<void>;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(() => structuredClone(collection)),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const dirty = JSON.stringify(draft) !== JSON.stringify(collection);
  useUnsaved(dirty);
  const close = () => {
    if (
      !busy &&
      (!dirty || window.confirm("Descartar as alterações da coleção?"))
    )
      onClose();
  };
  async function save() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await onSave(draft);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  }
  async function upload(file: File) {
    setBusy(true);
    try {
      const image = await uploadAdminImage(file, "colecoes");
      await imageSize(image);
      setDraft((d) => ({ ...d, image }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no envio.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <AdminDrawer title="Editar coleção" onClose={close}>
      <div className="admin-form">
        <Field label="Nome *">
          <input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </Field>
        <Field label="Endereço *">
          <input
            value={draft.slug}
            onChange={(e) =>
              setDraft({ ...draft, slug: slugify(e.target.value, false) })
            }
          />
        </Field>
        <Field label="Descrição">
          <textarea
            value={draft.description}
            onChange={(e) =>
              setDraft({ ...draft, description: e.target.value })
            }
          />
        </Field>
        <Field label="Imagem">
          <input
            value={draft.image}
            onChange={(e) => setDraft({ ...draft, image: e.target.value })}
          />
        </Field>
        <Field label="Enviar imagem">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={busy}
            onChange={(e) => {
              if (e.target.files?.[0]) void upload(e.target.files[0]);
              e.target.value = "";
            }}
          />
        </Field>
        {draft.image && (
          <img
            className="admin-cover-preview"
            src={draft.image}
            alt={draft.name}
          />
        )}
        <label className="admin-check">
          <input
            type="checkbox"
            checked={draft.active}
            onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
          />
          Coleção ativa
        </label>
        <p>
          O identificador e os vínculos dos produtos serão preservados.
          Desativar oculta a coleção, sem excluir os produtos.
        </p>
        {error && (
          <p className="admin-field-error" role="alert">
            {error}
          </p>
        )}
        <div className="admin-actions">
          <button
            className="admin-button"
            disabled={busy}
            onClick={() => void save()}
          >
            {busy ? "Salvando…" : "Salvar coleção"}
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
export function BannerEditor({
  banner,
  onSave,
  onClose,
}: {
  banner: ManagedBanner;
  onSave: (b: ManagedBanner) => Promise<void>;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(() => structuredClone(banner)),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [mobile, setMobile] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(banner);
  useUnsaved(dirty);
  const close = () => {
    if (
      !busy &&
      (!dirty || window.confirm("Descartar as alterações do banner?"))
    )
      onClose();
  };
  async function save() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      let next = { ...draft };
      if (next.image) {
        const size = await imageSize(next.image);
        next = { ...next, ...size };
      }
      if (next.mobileImage) await imageSize(next.mobileImage);
      await onSave(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  }
  async function upload(file: File, mobileImage: boolean) {
    setBusy(true);
    try {
      const image = await uploadAdminImage(file, "banners");
      const size = await imageSize(image);
      setDraft((d) =>
        mobileImage
          ? { ...d, mobileImage: image }
          : { ...d, image, ...size, cropLeft: undefined },
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no envio.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <AdminDrawer wide title={`Banner · ${banner.name}`} onClose={close}>
      <div className="admin-form">
        <div className="admin-two">
          <Field label="Nome interno *">
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </Field>
          <Field label="Contraste do texto">
            <select
              value={draft.tone || "light"}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  tone: e.target.value as ManagedBanner["tone"],
                })
              }
            >
              <option value="light">Texto escuro</option>
              <option value="dark">Texto claro</option>
            </select>
          </Field>
        </div>
        <Field label="Título *">
          <input
            value={draft.title}
            onChange={(e) =>
              setDraft({ ...draft, title: e.target.value, emphasis: undefined })
            }
          />
        </Field>
        <Field label="Descrição">
          <textarea
            value={draft.description}
            onChange={(e) =>
              setDraft({ ...draft, description: e.target.value })
            }
          />
        </Field>
        <Field label="Texto alternativo *">
          <input
            value={draft.imageAlt}
            onChange={(e) => setDraft({ ...draft, imageAlt: e.target.value })}
          />
        </Field>
        <div className="admin-two">
          {(["image", "mobileImage"] as const).map((key) => (
            <fieldset key={key}>
              <legend>
                {key === "image"
                  ? "Imagem desktop"
                  : "Imagem celular (opcional)"}
              </legend>
              <Field label="Endereço da imagem">
                <input
                  disabled={draft.id === "gospel" && key === "image"}
                  value={draft[key] || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, [key]: e.target.value || undefined })
                  }
                />
              </Field>
              <Field label="Enviar imagem">
                <input
                  type="file"
                  disabled={busy || (draft.id === "gospel" && key === "image")}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    if (e.target.files?.[0])
                      void upload(e.target.files[0], key === "mobileImage");
                    e.target.value = "";
                  }}
                />
              </Field>
              {draft.id === "gospel" && key === "image" && (
                <small>
                  Mantenha a foto principal aprovada da camisa Fé e caneca
                  Propósito.
                </small>
              )}
            </fieldset>
          ))}
        </div>
        {draft.cropLeft !== undefined && (
          <label className="admin-check">
            <input
              type="checkbox"
              checked={Boolean(draft.cropLeft)}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  cropLeft: e.target.checked ? 0.47 : undefined,
                })
              }
            />
            Ocultar a frase gravada na parte esquerda da arte original
          </label>
        )}
        <div className="admin-two">
          {(["primary", "secondary"] as const).map((key) => (
            <fieldset key={key}>
              <legend>
                {key === "primary" ? "Botão principal" : "Botão secundário"}
              </legend>
              <Field label="Texto *">
                <input
                  value={draft[key].label}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      [key]: { ...draft[key], label: e.target.value },
                    })
                  }
                />
              </Field>
              <Field label="Destino *">
                <input
                  value={draft[key].href}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      [key]: { ...draft[key], href: e.target.value },
                    })
                  }
                />
              </Field>
            </fieldset>
          ))}
        </div>
        <p>
          Use uma página real da loja ou um endereço HTTPS. Exemplos: /produtos,
          /categoria/canecas e o WhatsApp configurado.
        </p>
        <label className="admin-check">
          <input
            type="checkbox"
            checked={draft.active}
            disabled={draft.id === "gospel"}
            onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
          />
          {draft.id === "gospel"
            ? "Principal · sempre ativo e primeiro"
            : "Banner ativo"}
        </label>
        <div className="admin-actions">
          <button
            className={`admin-button ${mobile ? "secondary" : ""}`}
            onClick={() => setMobile(false)}
            aria-pressed={!mobile}
          >
            Prévia desktop
          </button>
          <button
            className={`admin-button ${mobile ? "" : "secondary"}`}
            onClick={() => setMobile(true)}
            aria-pressed={mobile}
          >
            Prévia celular
          </button>
        </div>
        <div
          className={`admin-banner-preview ${mobile ? "mobile" : ""} ${draft.tone === "dark" ? "dark" : ""}`}
        >
          <div>
            <h3>{draft.title}</h3>
            <p>{draft.description}</p>
            <div className="admin-actions">
              <a
                className="admin-button"
                href={
                  draft.primary.href.startsWith("https://") ||
                  (draft.primary.href.startsWith("/") &&
                    !draft.primary.href.startsWith("//"))
                    ? draft.primary.href
                    : undefined
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                {draft.primary.label}
              </a>
              <a
                className="admin-button secondary"
                href={
                  draft.secondary.href.startsWith("https://") ||
                  (draft.secondary.href.startsWith("/") &&
                    !draft.secondary.href.startsWith("//"))
                    ? draft.secondary.href
                    : undefined
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                {draft.secondary.label}
              </a>
            </div>
          </div>
          {(mobile ? draft.mobileImage || draft.image : draft.image) && (
            <div className="admin-preview-photo">
              <img
                src={(mobile ? draft.mobileImage || draft.image : draft.image)!}
                alt={draft.imageAlt}
                style={
                  draft.cropLeft && !draft.mobileImage
                    ? {
                        width: `${100 / (1 - draft.cropLeft)}%`,
                        maxWidth: "none",
                        marginLeft: `-${(100 * draft.cropLeft) / (1 - draft.cropLeft)}%`,
                      }
                    : undefined
                }
              />
            </div>
          )}
        </div>
        {error && (
          <p className="admin-field-error" role="alert">
            {error}
          </p>
        )}
        <div className="admin-actions">
          <button
            className="admin-button"
            disabled={busy}
            onClick={() => void save()}
          >
            {busy ? "Salvando…" : "Salvar banner"}
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
