import { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowDown, ImagePlus, Trash2, Sparkles } from "lucide-react";
import type { Product, Variant } from "@/types";
import type { Collection } from "@/data/storefrontContent";
import { CATEGORIES } from "@/data/categories";
import { formatPrice } from "@/utils/format";
import { calculateStartingPrice } from "@/utils/cart";
import { productErrors, slugify } from "@/utils/admin-validation";
import { adminRequest, uploadAdminImage } from "@/utils/admin-api";
import { AdminDrawer, Busy, Field } from "./shared";

const TABS = [
  "Informações",
  "Fotos",
  "Preços",
  "Opções e personalização",
  "Organização e publicação",
];
export default function ProductEditor({
  product,
  products,
  collections,
  onSave,
  onClose,
}: {
  product: Product;
  products: Product[];
  collections: Collection[];
  onSave: (p: Product) => Promise<void>;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(() => structuredClone(product));
  const [tab, setTab] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [colorName, setColorName] = useState(""),
    [colorHex, setColorHex] = useState("#704289");
  const [chosenColors, setChosenColors] = useState<string[]>([]);
  const lock = useRef(false),
    previewRefs = useRef<string[]>([]),
    autoSlug = useRef(
      !products.some((p) => p.id === product.id) &&
        product.slug.startsWith("produto-"),
    );
  const dirty = JSON.stringify(product) !== JSON.stringify(draft);
  function patch(value: Partial<Product>) {
    setDraft((current) => ({ ...current, ...value }));
  }
  function close() {
    if (
      !busy &&
      !uploading &&
      (!dirty ||
        window.confirm("Descartar as alterações não salvas deste produto?"))
    )
      onClose();
  }
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
  useEffect(
    () => () => previewRefs.current.forEach((url) => URL.revokeObjectURL(url)),
    [],
  );
  async function save(asDraft = false) {
    if (lock.current || uploading) return;
    const next = {
      ...draft,
      status: asDraft ? ("draft" as const) : draft.status,
    };
    const found = productErrors(next, products);
    setErrors(found);
    if (Object.keys(found).length) {
      setMessage("Revise os campos indicados.");
      setTab(
        found.name || found.slug
          ? 0
          : found.images
            ? 1
            : found.variants
              ? 3
              : 2,
      );
      return;
    }
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      await onSave(next);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao salvar.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function upload(files: File[]) {
    if (uploading || lock.current) return;
    const invalid = files.find(
      (f) =>
        !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
          f.type,
        ) ||
        !f.size ||
        f.size > 10 * 1024 * 1024,
    );
    if (invalid) {
      setErrors({
        images: `${invalid.name}: use JPG, PNG, WebP ou GIF até 10 MB.`,
      });
      return;
    }
    setUploading(true);
    setErrors({});
    setMessage("");
    const urls = files.map((f) => URL.createObjectURL(f));
    previewRefs.current.push(...urls);
    setPreviews(urls);
    let count = 0;
    try {
      for (const file of files) {
        const url = await uploadAdminImage(file, draft.category);
        setDraft((current) => ({
          ...current,
          images: [...current.images, url],
        }));
        count++;
      }
      setMessage(
        `${count} foto(s) enviada(s). Salve o produto para confirmar as alterações.`,
      );
    } catch (error) {
      setErrors({
        images: `${count} foto(s) enviada(s); ${error instanceof Error ? error.message : "falha no upload"}`,
      });
    } finally {
      setUploading(false);
      setPreviews([]);
      urls.forEach((url) => URL.revokeObjectURL(url));
      previewRefs.current = previewRefs.current.filter(
        (url) => !urls.includes(url),
      );
    }
  }
  function moveImage(index: number, target: number) {
    const images = [...draft.images];
    const [image] = images.splice(index, 1);
    images.splice(target, 0, image);
    patch({ images });
  }
  function editVariant(index: number, next: Variant) {
    patch({ variants: draft.variants.map((v, i) => (i === index ? next : v)) });
  }
  async function generate() {
    if (!draft.images[0] || !chosenColors.length || lock.current) return;
    lock.current = true;
    setBusy(true);
    setMessage("Gerando prévias de cores…");
    try {
      for (const color of (draft.colors || []).filter((c) =>
        chosenColors.includes(c.id),
      )) {
        const result = await adminRequest<{ url: string }>("gemini", "POST", {
          productId: draft.id,
          sourceImage: draft.images[0],
          colorName: color.name,
          colorHex: color.hex,
        });
        setDraft((current) => ({
          ...current,
          colors: current.colors?.map((c) =>
            c.id === color.id ? { ...c, previewImage: result.url } : c,
          ),
        }));
      }
      setMessage(
        "Prévias prontas para revisar. Salve o produto após conferir.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha na geração.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <AdminDrawer
      wide
      title={
        product.name === "Novo produto"
          ? "Novo produto"
          : `Editar ${product.name}`
      }
      onClose={close}
    >
      <div
        className="admin-editor-tabs"
        role="tablist"
        aria-label="Seções do produto"
      >
        {TABS.map((label, index) => (
          <button
            key={label}
            role="tab"
            aria-selected={tab === index}
            aria-controls={`product-panel-${index}`}
            id={`product-tab-${index}`}
            onClick={() => setTab(index)}
            onKeyDown={(e) => {
              if (["ArrowRight", "ArrowLeft"].includes(e.key)) {
                e.preventDefault();
                const next =
                  (index + (e.key === "ArrowRight" ? 1 : -1) + TABS.length) %
                  TABS.length;
                setTab(next);
                document.getElementById(`product-tab-${next}`)?.focus();
              }
            }}
            tabIndex={tab === index ? 0 : -1}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="admin-editor-body" inert={busy || uploading}>
        <div
          role="tabpanel"
          id={`product-panel-${tab}`}
          aria-labelledby={`product-tab-${tab}`}
          className="admin-form"
        >
          {tab === 0 && (
            <>
              <Field label="Nome *" error={errors.name}>
                <input
                  value={draft.name}
                  onChange={(e) =>
                    patch({
                      name: e.target.value,
                      ...(autoSlug.current
                        ? { slug: slugify(e.target.value) }
                        : {}),
                    })
                  }
                />
              </Field>
              <Field label="Endereço do produto *" error={errors.slug}>
                <input
                  value={draft.slug}
                  onChange={(e) => {
                    autoSlug.current = false;
                    patch({ slug: slugify(e.target.value, false) });
                  }}
                />
              </Field>
              <Field label="Descrição curta">
                <input
                  value={draft.shortDescription}
                  onChange={(e) => patch({ shortDescription: e.target.value })}
                />
              </Field>
              <Field label="Descrição completa">
                <textarea
                  rows={5}
                  value={draft.description}
                  onChange={(e) => patch({ description: e.target.value })}
                />
              </Field>
            </>
          )}
          {tab === 1 && (
            <>
              <p>
                JPG, PNG, WebP ou GIF, até 10 MB por foto. A primeira foto é a
                principal.
              </p>
              <label className="admin-upload">
                <ImagePlus size={20} />
                {uploading ? "Enviando fotos…" : "Selecionar várias fotos"}
                <input
                  aria-label="Enviar fotos do produto"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  disabled={busy || uploading}
                  onChange={(e) => {
                    if (e.target.files) void upload(Array.from(e.target.files));
                    e.target.value = "";
                  }}
                />
              </label>
              {errors.images && (
                <p className="admin-field-error" role="alert">
                  {errors.images}
                </p>
              )}
              <div className="admin-photo-list">
                {previews.map((url) => (
                  <div key={url}>
                    <img src={url} alt="Prévia da foto em envio" />
                    <Busy label="Enviando" />
                  </div>
                ))}
                {draft.images.map((url, index) => (
                  <div key={`${url}-${index}`}>
                    <img src={url} alt={`Foto ${index + 1}`} />
                    <strong>
                      {index === 0 ? "Principal" : `Foto ${index + 1}`}
                    </strong>
                    <div className="admin-actions">
                      <button
                        className="admin-icon"
                        disabled={index === 0 || uploading}
                        onClick={() => moveImage(index, index - 1)}
                        aria-label={`Mover foto ${index + 1} para cima`}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        className="admin-icon"
                        disabled={
                          index === draft.images.length - 1 || uploading
                        }
                        onClick={() => moveImage(index, index + 1)}
                        aria-label={`Mover foto ${index + 1} para baixo`}
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        className="admin-button secondary small"
                        disabled={index === 0 || uploading}
                        onClick={() => moveImage(index, 0)}
                      >
                        Principal
                      </button>
                      <button
                        className="admin-icon danger"
                        disabled={uploading}
                        onClick={() =>
                          patch({
                            images: draft.images.filter((_, i) => i !== index),
                          })
                        }
                        aria-label={`Remover foto ${index + 1}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {tab === 2 && (
            <>
              <div className="admin-two">
                <Field label="Preço atual (R$) *" error={errors.price}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={draft.price}
                    onChange={(e) => patch({ price: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Preço anterior (R$)" error={errors.oldPrice}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={draft.oldPrice ?? ""}
                    onChange={(e) =>
                      patch({
                        oldPrice:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                  />
                </Field>
              </div>
              <Field label="Estoque (opcional)" error={errors.stock}>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={draft.stock ?? ""}
                  onChange={(e) =>
                    patch({
                      stock:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    })
                  }
                />
              </Field>
              <p>
                Valores das opções são editados na seção de opções. Nenhum preço
                é ajustado automaticamente.
              </p>
            </>
          )}
          {tab === 3 && (
            <>
              {errors.variants && (
                <p className="admin-field-error" role="alert">
                  {errors.variants}
                </p>
              )}
              <p>
                Tecido, modelo (incluindo Oversized), tamanho e cor são
                dimensões separadas. Mantenha os identificadores existentes para
                preservar as seleções.
              </p>
              {draft.category === "canecas" && (
                <Field label="Tipo da caneca">
                  <select
                    value={draft.mugType ?? ""}
                    onChange={(e) =>
                      patch({
                        mugType: (e.target.value ||
                          undefined) as Product["mugType"],
                      })
                    }
                  >
                    <option value="">Não informado</option>
                    <option value="porcelana">Porcelana</option>
                    <option value="magica">Mágica</option>
                    <option value="colorir">Para colorir</option>
                  </select>
                </Field>
              )}
              {draft.variants.map((variant, index) => (
                <fieldset key={`${index}-${variant.id}`}>
                  <legend>
                    {variant.name} · {variant.id}
                  </legend>
                  <div className="admin-two">
                    <Field label="Nome da dimensão">
                      <input
                        value={variant.name}
                        onChange={(e) =>
                          editVariant(index, {
                            ...variant,
                            name: e.target.value,
                          })
                        }
                      />
                    </Field>
                    <label className="admin-check">
                      <input
                        type="checkbox"
                        checked={Boolean(variant.required)}
                        onChange={(e) =>
                          editVariant(index, {
                            ...variant,
                            required: e.target.checked,
                          })
                        }
                      />
                      Escolha obrigatória
                    </label>
                  </div>
                  {variant.options.map((option, oi) => (
                    <div className="admin-option-row" key={oi}>
                      <Field label="Opção">
                        <input
                          value={option.label}
                          onChange={(e) =>
                            editVariant(index, {
                              ...variant,
                              options: variant.options.map((o, i) =>
                                i === oi ? { ...o, label: e.target.value } : o,
                              ),
                            })
                          }
                        />
                      </Field>
                      {(["price", "oldPrice", "priceDelta"] as const).map(
                        (key) => (
                          <Field
                            key={key}
                            label={
                              {
                                price: "Preço-base R$",
                                oldPrice: "Anterior R$",
                                priceDelta: "Acréscimo R$",
                              }[key]
                            }
                          >
                            <input
                              type="number"
                              step="0.01"
                              value={option[key] ?? ""}
                              onChange={(e) =>
                                editVariant(index, {
                                  ...variant,
                                  options: variant.options.map((o, i) =>
                                    i === oi
                                      ? {
                                          ...o,
                                          [key]:
                                            e.target.value === ""
                                              ? undefined
                                              : Number(e.target.value),
                                        }
                                      : o,
                                  ),
                                })
                              }
                            />
                          </Field>
                        ),
                      )}
                      <label className="admin-check">
                        <input
                          type="checkbox"
                          checked={Boolean(option.priceOnRequest)}
                          onChange={(e) =>
                            editVariant(index, {
                              ...variant,
                              options: variant.options.map((o, i) =>
                                i === oi
                                  ? { ...o, priceOnRequest: e.target.checked }
                                  : o,
                              ),
                            })
                          }
                        />
                        Sob consulta
                      </label>
                      <button
                        className="admin-icon danger"
                        aria-label={`Remover opção ${option.label}`}
                        onClick={() =>
                          editVariant(index, {
                            ...variant,
                            options: variant.options.filter((_, i) => i !== oi),
                          })
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    className="admin-button secondary small"
                    onClick={() =>
                      editVariant(index, {
                        ...variant,
                        options: [...variant.options, { label: "Nova opção" }],
                      })
                    }
                  >
                    Adicionar opção
                  </button>
                </fieldset>
              ))}
              <div className="admin-actions">
                {["tecido", "modelo", "tamanho", "cor", "tipo"]
                  .filter((id) => !draft.variants.some((v) => v.id === id))
                  .map((id) => (
                    <button
                      key={id}
                      className="admin-button secondary small"
                      onClick={() =>
                        patch({
                          variants: [
                            ...draft.variants,
                            {
                              id,
                              name: {
                                tecido: "Tecido",
                                modelo: "Modelo",
                                tamanho: "Tamanho",
                                cor: "Cor",
                                tipo: "Tipo",
                              }[id]!,
                              required: true,
                              options: [],
                            },
                          ],
                        })
                      }
                    >
                      Adicionar {id}
                    </button>
                  ))}
              </div>
              <fieldset>
                <legend>Personalização</legend>
                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={draft.personalization.enabled}
                    onChange={(e) =>
                      patch({
                        personalization: {
                          ...draft.personalization,
                          enabled: e.target.checked,
                        },
                      })
                    }
                  />
                  Aceita personalização
                </label>
                {(["nameField", "textField"] as const).map((key) => (
                  <div key={key}>
                    <label className="admin-check">
                      <input
                        type="checkbox"
                        checked={Boolean(draft.personalization[key])}
                        onChange={(e) =>
                          patch({
                            personalization: {
                              ...draft.personalization,
                              [key]: e.target.checked
                                ? {
                                    label:
                                      key === "nameField"
                                        ? "Nome para personalização"
                                        : "Texto / frase",
                                    placeholder: "",
                                    maxLength: 80,
                                  }
                                : undefined,
                            },
                          })
                        }
                      />
                      {key === "nameField"
                        ? "Solicitar nome"
                        : "Solicitar texto"}
                    </label>
                    {draft.personalization[key] && (
                      <Field label="Rótulo do campo">
                        <input
                          value={draft.personalization[key]!.label}
                          onChange={(e) =>
                            patch({
                              personalization: {
                                ...draft.personalization,
                                [key]: {
                                  ...draft.personalization[key]!,
                                  label: e.target.value,
                                },
                              },
                            })
                          }
                        />
                      </Field>
                    )}
                  </div>
                ))}
              </fieldset>
              {draft.category === "camisetas" && (
                <fieldset>
                  <legend>Cores e prévias</legend>
                  {draft.colors?.map((c) => (
                    <label className="admin-color admin-check" key={c.id}>
                      <input
                        type="checkbox"
                        checked={chosenColors.includes(c.id)}
                        onChange={(e) =>
                          setChosenColors((current) =>
                            e.target.checked
                              ? [...current, c.id]
                              : current.filter((id) => id !== c.id),
                          )
                        }
                      />
                      <span style={{ background: c.hex }} />
                      {c.name}
                      {c.previewImage && (
                        <img src={c.previewImage} alt={`Prévia ${c.name}`} />
                      )}
                    </label>
                  ))}
                  <div className="admin-two">
                    <Field label="Nome da nova cor">
                      <input
                        value={colorName}
                        onChange={(e) => setColorName(e.target.value)}
                      />
                    </Field>
                    <Field label="Cor">
                      <input
                        type="color"
                        value={colorHex}
                        onChange={(e) => setColorHex(e.target.value)}
                      />
                    </Field>
                  </div>
                  <div className="admin-actions">
                    <button
                      className="admin-button secondary"
                      disabled={!colorName.trim()}
                      onClick={() => {
                        patch({
                          variants: draft.variants.some((v) => v.id === "cor")
                            ? draft.variants
                            : [
                                ...draft.variants,
                                {
                                  id: "cor",
                                  name: "Cor",
                                  required: true,
                                  options: [{ label: "Conforme a foto" }],
                                },
                              ],
                          colors: [
                            ...(draft.colors || []),
                            {
                              id: `cor-${crypto.randomUUID()}`,
                              name: colorName.trim(),
                              hex: colorHex,
                              checkContrast: "light",
                            },
                          ],
                        });
                        setColorName("");
                      }}
                    >
                      Adicionar cor
                    </button>
                    <button
                      className="admin-button secondary"
                      disabled={
                        busy || !draft.images[0] || !chosenColors.length
                      }
                      onClick={() => void generate()}
                    >
                      <Sparkles size={16} />
                      Gerar {chosenColors.length} prévia(s) com Gemini
                    </button>
                  </div>
                  <small>
                    Revise as imagens geradas antes de salvar. Requer a
                    integração Gemini configurada.
                  </small>
                </fieldset>
              )}
            </>
          )}
          {tab === 4 && (
            <>
              <Field label="Categoria *">
                <select
                  value={draft.category}
                  onChange={(e) =>
                    patch({ category: e.target.value as Product["category"] })
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.shortName}
                    </option>
                  ))}
                </select>
              </Field>
              <fieldset>
                <legend>Coleções e temas</legend>
                {collections.map((c) => (
                  <label key={c.id} className="admin-check">
                    <input
                      type="checkbox"
                      checked={draft.collections?.includes(c.id) || false}
                      onChange={(e) =>
                        patch({
                          collections: e.target.checked
                            ? [...(draft.collections || []), c.id]
                            : (draft.collections || []).filter(
                                (id) => id !== c.id,
                              ),
                        })
                      }
                    />
                    {c.name}
                    {!c.active ? " (inativa)" : ""}
                  </label>
                ))}
                {draft.collections
                  ?.filter((id) => !collections.some((c) => c.id === id))
                  .map((id) => (
                    <p key={id}>Vínculo preservado: {id}</p>
                  ))}
              </fieldset>
              <Field label="Situação editorial">
                <select
                  value={draft.status ?? "published"}
                  onChange={(e) =>
                    patch({ status: e.target.value as Product["status"] })
                  }
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                </select>
              </Field>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={draft.available}
                  onChange={(e) => patch({ available: e.target.checked })}
                />
                Ativo na loja
              </label>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={draft.featured}
                  onChange={(e) => patch({ featured: e.target.checked })}
                />
                Em destaque
              </label>
              <Field label="Etiqueta">
                <input
                  value={draft.badge || ""}
                  onChange={(e) =>
                    patch({ badge: e.target.value || undefined })
                  }
                />
              </Field>
            </>
          )}
        </div>
        <aside className="admin-card-preview">
          <p className="admin-eyebrow">Prévia do card</p>
          {draft.images[0] ? (
            <img src={draft.images[0]} alt={draft.name} />
          ) : (
            <div>Sem foto</div>
          )}
          <h3>{draft.name}</h3>
          <p>{draft.shortDescription}</p>
          {draft.oldPrice && draft.oldPrice > draft.price && (
            <del>{formatPrice(draft.oldPrice)}</del>
          )}
          <strong>{formatPrice(calculateStartingPrice(draft))}</strong>
          <small>
            {draft.status === "draft"
              ? "Rascunho"
              : draft.available
                ? "Ativo"
                : "Inativo"}
          </small>
        </aside>
      </div>
      {message && (
        <p className="admin-editor-message" role="status">
          {message}
        </p>
      )}
      <footer className="admin-editor-footer">
        <span>{dirty ? "Alterações não salvas" : "Sem alterações"}</span>
        <button
          className="admin-button secondary"
          disabled={busy || uploading}
          onClick={close}
        >
          Cancelar
        </button>
        <button
          className="admin-button secondary"
          disabled={busy || uploading}
          onClick={() => void save(true)}
        >
          Salvar rascunho
        </button>
        <button
          className="admin-button"
          disabled={busy || uploading}
          onClick={() => void save()}
        >
          {busy ? "Salvando…" : "Salvar"}
        </button>
      </footer>
    </AdminDrawer>
  );
}
