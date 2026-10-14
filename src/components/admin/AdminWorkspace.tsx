import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Package,
  Tags,
  Images,
  ClipboardList,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  ExternalLink,
  LogOut,
  Plus,
  Search,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Copy,
  Eye,
  Power,
} from "lucide-react";
import type { User } from "@netlify/identity";
import { useCatalog } from "@/contexts/CatalogContext";
import { CATEGORIES } from "@/data/categories";
import {
  DEFAULT_CONTENT,
  type Collection,
  type ManagedBanner,
  type StorefrontContent,
} from "@/data/storefrontContent";
import type { Product } from "@/types";
import type { AdminOrder } from "@/types/admin";
import { CONTACT, WHATSAPP_NUMBER } from "@/config/site";
import { formatPrice } from "@/utils/format";
import { adminRequest, imageSize } from "@/utils/admin-api";
import { contentErrors, productErrors } from "@/utils/admin-validation";
import { fetchR2Models, importR2Models } from "@/utils/r2-import";
import { generalWhatsAppUrl } from "@/utils/whatsapp";
import { calculateStartingPrice } from "@/utils/cart";
import Logo from "@/components/Logo";
import ProductEditor from "./ProductEditor";
import { BannerEditor, CollectionEditor } from "./ContentEditors";
import Orders from "./Orders";
import { AdminDrawer, Busy, Confirm, Empty, Field } from "./shared";
import "./admin.css";

const MODULES = [
  { id: "overview", name: "Visão geral", icon: LayoutDashboard },
  { id: "products", name: "Produtos", icon: Package },
  { id: "collections", name: "Categorias e coleções", icon: Tags },
  { id: "banners", name: "Banners", icon: Images },
  { id: "orders", name: "Pedidos e orçamentos", icon: ClipboardList },
  { id: "settings", name: "Configurações", icon: Settings },
];
function createProduct(position: number): Product {
  const id = `produto-${crypto.randomUUID()}`;
  return {
    id,
    name: "Novo produto",
    slug: id,
    shortDescription: "",
    description: "",
    category: "personalizados",
    images: [],
    price: 0,
    featured: false,
    available: true,
    status: "draft",
    order: position,
    salesRank: 1,
    variants: [],
    personalization: { enabled: true },
    createdAt: new Date().toISOString().slice(0, 10),
  };
}
const stateLabel = (p: Product) =>
  p.status === "draft" ? "Rascunho" : p.available ? "Ativo" : "Inativo";
export default function AdminWorkspace({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const { products: fallback, refresh } = useCatalog();
  const [products, setProducts] = useState<Product[]>(fallback),
    [content, setContent] = useState<StorefrontContent>(() =>
      structuredClone(DEFAULT_CONTENT),
    ),
    [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ready, setReady] = useState({
      products: false,
      content: false,
      orders: false,
    }),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState<{ tone: string; text: string } | null>(null);
  const [module, setModule] = useState("overview"),
    [collapsed, setCollapsed] = useState(
      () => localStorage.getItem("fp-admin-collapsed") === "true",
    ),
    [mobileMenu, setMobileMenu] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null),
    [editBanner, setEditBanner] = useState<ManagedBanner | null>(null),
    [editCollection, setEditCollection] = useState<Collection | null>(null);
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState(""),
    [status, setStatus] = useState(""),
    [collection, setCollection] = useState(""),
    [sort, setSort] = useState("order"),
    [page, setPage] = useState(1),
    [selection, setSelection] = useState<string[]>([]),
    [batchCategory, setBatchCategory] = useState("");
  const [confirmation, setConfirmation] = useState<{
    message: string;
    run: () => Promise<void>;
  } | null>(null);
  const writeLock = useRef(false);
  const currentProducts = useRef(products);
  currentProducts.current = products;
  const discoveryController = useRef<AbortController | null>(null);
  useEffect(() => () => discoveryController.current?.abort(), []);
  useEffect(() => {
    let active = true;
    async function load() {
      const results = await Promise.allSettled([
        adminRequest<Product[] | null>("products"),
        adminRequest<StorefrontContent | null>("content"),
        adminRequest<AdminOrder[]>("orders"),
      ]);
      if (!active) return;
      const [p, c, o] = results;
      if (p.status === "fulfilled") {
        setProducts(p.value ?? fallback);
        setReady((r) => ({ ...r, products: true }));
      }
      if (c.status === "fulfilled") {
        setContent(c.value ?? structuredClone(DEFAULT_CONTENT));
        setReady((r) => ({ ...r, content: true }));
      }
      if (o.status === "fulfilled") {
        setOrders(o.value);
        setReady((r) => ({ ...r, orders: true }));
      }
      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length)
        setNotice({
          tone: "error",
          text: "Alguns dados não puderam ser carregados. Os módulos afetados ficam somente para consulta; nenhuma alteração será gravada até restabelecer a conexão.",
        });
      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, [user.id]); // A login starts one authoritative load; public fallback is read-only on API errors.
  useEffect(() => {
    setPage(1);
    setSelection([]);
  }, [query, category, status, collection, sort]);
  function navigate(next: string) {
    setModule(next);
    setMobileMenu(false);
  }
  async function persistProducts(next: Product[]) {
    if (!ready.products)
      throw new Error(
        "O catálogo do servidor não foi carregado. Recarregue antes de salvar.",
      );
    if (writeLock.current) throw new Error("Há uma operação em andamento.");
    for (const product of next) {
      const errors = productErrors(product, next);
      if (Object.keys(errors).length)
        throw new Error(`${product.name}: ${Object.values(errors).join(" ")}`);
    }
    writeLock.current = true;
    setBusy(true);
    try {
      await adminRequest("products", "PUT", next);
      setProducts(next);
      await refresh();
      setNotice({
        tone: "success",
        text: "Alteração salva e confirmada pelo servidor.",
      });
    } finally {
      writeLock.current = false;
      setBusy(false);
    }
  }
  async function persistContent(next: StorefrontContent) {
    if (!ready.content)
      throw new Error("O conteúdo do servidor não foi carregado.");
    if (writeLock.current) throw new Error("Há uma operação em andamento.");
    const errors = contentErrors(next, products);
    if (errors.length) throw new Error(errors.join(" "));
    writeLock.current = true;
    setBusy(true);
    try {
      await Promise.all(
        next.banners
          .filter((b) => b.active)
          .flatMap((b) => [b.image!, ...(b.mobileImage ? [b.mobileImage] : [])])
          .map((src) => imageSize(src)),
      );
      await adminRequest("content", "PUT", next);
      setContent(next);
      setNotice({
        tone: "success",
        text: "Conteúdo salvo e confirmado pelo servidor. Abra ou recarregue a loja para conferir (cache de até 30 segundos).",
      });
    } finally {
      writeLock.current = false;
      setBusy(false);
    }
  }
  function report(error: unknown) {
    setNotice({
      tone: "error",
      text:
        error instanceof Error
          ? error.message
          : "Não foi possível concluir a operação.",
    });
  }
  async function saveProduct(product: Product) {
    const next = products.some((p) => p.id === product.id)
      ? products.map((p) => (p.id === product.id ? product : p))
      : [...products, product];
    await persistProducts(next);
    setEditing(null);
  }
  function duplicate(product: Product) {
    const id = `produto-${crypto.randomUUID()}`;
    const copy = {
      ...structuredClone(product),
      id,
      slug: `${product.slug}-copia-${crypto.randomUUID().slice(0, 8)}`,
      name: `${product.name} (cópia)`,
      status: "draft" as const,
      featured: false,
      order: products.length,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    void persistProducts([...products, copy])
      .then(() => setEditing(copy))
      .catch(report);
  }
  function toggle(product: Product) {
    setConfirmation({
      message: `${product.available ? "Desativar" : "Ativar"} “${product.name}”? ${product.status === "draft" ? "Ele continuará em rascunho." : ""}`,
      run: () =>
        persistProducts(
          products.map((p) =>
            p.id === product.id ? { ...p, available: !p.available } : p,
          ),
        ),
    });
  }
  function moveProduct(product: Product, delta: -1 | 1) {
    const ordered = [...products].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
    const index = ordered.findIndex((p) => p.id === product.id),
      target = index + delta;
    if (target < 0 || target >= ordered.length) return;
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    void persistProducts(ordered.map((p, order) => ({ ...p, order }))).catch(
      report,
    );
  }
  function batch(action: "activate" | "deactivate" | "category") {
    setConfirmation({
      message: `${action === "category" ? `Alterar a categoria para ${CATEGORIES.find((c) => c.slug === batchCategory)?.shortName}` : action === "activate" ? "Ativar" : "Desativar"} ${selection.length} produto(s) selecionado(s)? Os rascunhos continuarão em rascunho.`,
      run: async () => {
        await persistProducts(
          products.map((p) =>
            selection.includes(p.id)
              ? {
                  ...p,
                  ...(action === "category"
                    ? { category: batchCategory as Product["category"] }
                    : { available: action === "activate" }),
                }
              : p,
          ),
        );
        setSelection([]);
      },
    });
  }
  async function discover() {
    if (busy) return;
    setBusy(true);
    const controller = new AbortController();
    discoveryController.current = controller;
    try {
      const models = await fetchR2Models(controller.signal);
      if (controller.signal.aborted) return;
      const result = importR2Models(
        currentProducts.current,
        models,
        new Date().toISOString().slice(0, 10),
      );
      setBusy(false);
      if (result.additions.length) {
        await persistProducts(result.products);
        setNotice({
          tone: "success",
          text: `${result.additions.length} modelo(s) importado(s) como rascunho. Confira os preços antes de publicar.`,
        });
      } else
        setNotice({
          tone: "info",
          text: "Nenhum novo modelo foi encontrado no R2.",
        });
    } catch (error) {
      report(error);
    } finally {
      setBusy(false);
    }
  }
  const filtered = products
    .filter(
      (p) =>
        `${p.name} ${p.slug}`.toLowerCase().includes(query.toLowerCase()) &&
        (!category || p.category === category) &&
        (!status || stateLabel(p) === status) &&
        (!collection || p.collections?.includes(collection)),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name, "pt-BR")
        : sort === "price"
          ? calculateStartingPrice(a) - calculateStartingPrice(b)
          : sort === "recent"
            ? b.createdAt.localeCompare(a.createdAt)
            : (a.order ?? 0) - (b.order ?? 0),
    );
  const pages = Math.max(1, Math.ceil(filtered.length / 12)),
    currentPage = Math.min(page, pages),
    shown = filtered.slice((currentPage - 1) * 12, currentPage * 12);
  const active = products.filter(
      (p) => p.status !== "draft" && p.available,
    ).length,
    drafts = products.filter((p) => p.status === "draft").length,
    inactive = products.filter(
      (p) => p.status !== "draft" && !p.available,
    ).length,
    promos = products.filter(
      (p) =>
        p.status !== "draft" &&
        p.available &&
        ((p.oldPrice ?? 0) > p.price ||
          p.variants.some((v) =>
            v.options.some((o) => (o.oldPrice ?? 0) > (o.price ?? p.price)),
          )),
    ).length;
  const noPhotos = products.filter((p) => !p.images.length),
    bannerIssues = contentErrors(content, products);
  function reorder(
    type: "banners" | "collections",
    index: number,
    delta: number,
  ) {
    const list = [...content[type]].sort((a, b) => a.order - b.order);
    const target = index + delta;
    if (
      target < 0 ||
      target >= list.length ||
      (type === "banners" &&
        (list[index].id === "gospel" || list[target].id === "gospel"))
    )
      return;
    [list[index], list[target]] = [list[target], list[index]];
    const next = {
      ...content,
      [type]: list.map((item, order) => ({ ...item, order })),
    };
    void persistContent(next).catch(report);
  }
  const nav = (
    <>
      <div className="admin-brand">
        <Logo />
        <small>Administração</small>
      </div>
      <nav aria-label="Módulos administrativos">
        {MODULES.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={module === item.id ? "active" : ""}
            title={item.name}
            aria-label={item.name}
            aria-current={module === item.id ? "page" : undefined}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
      <div className="admin-nav-bottom">
        <a href="/" target="_blank" rel="noopener noreferrer" title="Ver loja">
          <ExternalLink size={19} />
          <span>Ver loja</span>
        </a>
        <button onClick={onLogout} title="Sair">
          <LogOut size={19} />
          <span>Sair</span>
        </button>
      </div>
    </>
  );
  return (
    <main className={`admin-app${collapsed ? " collapsed" : ""}`}>
      <aside className="admin-sidebar">
        {nav}
        <button
          className="admin-collapse"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          onClick={() => {
            setCollapsed(!collapsed);
            localStorage.setItem("fp-admin-collapsed", String(!collapsed));
          }}
        >
          {collapsed ? (
            <PanelLeftOpen size={20} />
          ) : (
            <PanelLeftClose size={20} />
          )}
        </button>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-icon admin-mobile-toggle"
            aria-label="Abrir menu administrativo"
            onClick={() => setMobileMenu(true)}
          >
            <Menu size={22} />
          </button>
          <div>
            <p className="admin-eyebrow">Área administrativa</p>
            <strong>{MODULES.find((m) => m.id === module)?.name}</strong>
          </div>
          <div className="admin-account">
            <span>{user.email}</span>
            <span className="admin-avatar">
              {user.email?.slice(0, 1).toUpperCase()}
            </span>
          </div>
        </header>
        <div className="admin-content">
          {notice && (
            <div
              className={`admin-notice ${notice.tone}`}
              role={notice.tone === "error" ? "alert" : "status"}
            >
              {notice.text}
              <button
                className="admin-icon"
                aria-label="Dispensar mensagem"
                onClick={() => setNotice(null)}
              >
                ×
              </button>
            </div>
          )}
          {loading ? (
            <Busy label="Carregando dados reais do servidor…" />
          ) : (
            <>
              {module === "overview" && (
                <>
                  <div className="admin-section-heading">
                    <div>
                      <p className="admin-eyebrow">Seu trabalho, organizado</p>
                      <h1>Visão geral</h1>
                      <p>
                        Catálogo, conteúdo da loja e atendimentos em um só
                        lugar.
                      </p>
                    </div>
                    <button
                      className="admin-button"
                      disabled={!ready.products}
                      onClick={() => setEditing(createProduct(products.length))}
                    >
                      <Plus size={18} />
                      Novo produto
                    </button>
                  </div>
                  <div className="admin-metrics">
                    {[
                      {
                        label: "Produtos ativos",
                        value: active,
                        action: () => {
                          setStatus("Ativo");
                          navigate("products");
                        },
                      },
                      {
                        label: "Rascunhos",
                        value: drafts,
                        action: () => {
                          setStatus("Rascunho");
                          navigate("products");
                        },
                      },
                      {
                        label: "Produtos inativos",
                        value: inactive,
                        action: () => {
                          setStatus("Inativo");
                          navigate("products");
                        },
                      },
                      {
                        label: "Em promoção",
                        value: promos,
                        action: () => navigate("products"),
                      },
                      {
                        label: "Banners ativos",
                        value: content.banners.filter((b) => b.active).length,
                        action: () => navigate("banners"),
                      },
                      {
                        label: "Orçamentos pendentes",
                        value: ready.orders
                          ? orders.filter((o) => o.status === "pending").length
                          : "—",
                        action: () => navigate("orders"),
                      },
                    ].map((metric) => (
                      <button
                        key={metric.label}
                        onClick={metric.action}
                        className="admin-metric"
                      >
                        <span>{metric.label}</span>
                        <strong>{metric.value}</strong>
                        <small>Ver registros →</small>
                      </button>
                    ))}
                  </div>
                  <div className="admin-dashboard-grid">
                    <section className="admin-panel">
                      <h2>Atalhos</h2>
                      <div className="admin-shortcuts">
                        <button
                          className="admin-button secondary"
                          disabled={!ready.products}
                          onClick={() =>
                            setEditing(createProduct(products.length))
                          }
                        >
                          <Package size={18} />
                          Novo produto
                        </button>
                        <button
                          className="admin-button secondary"
                          disabled={!ready.content}
                          onClick={() => {
                            navigate("banners");
                            setEditBanner({
                              id: `banner-${crypto.randomUUID()}`,
                              name: "Novo banner",
                              title: "",
                              description: "",
                              image: null,
                              imageAlt: "",
                              width: 2078,
                              height: 757,
                              primary: {
                                label: "Explorar produtos",
                                href: "/produtos",
                              },
                              secondary: {
                                label: "Pedir pelo WhatsApp",
                                href: generalWhatsAppUrl(),
                              },
                              active: false,
                              order: content.banners.length,
                            });
                          }}
                        >
                          <Images size={18} />
                          Novo banner
                        </button>
                        <button
                          className="admin-button secondary"
                          onClick={() => navigate("collections")}
                        >
                          <Tags size={18} />
                          Gerenciar coleções
                        </button>
                        <a
                          href="/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-button secondary"
                        >
                          <ExternalLink size={18} />
                          Ver loja
                        </a>
                      </div>
                    </section>
                    <section className="admin-panel">
                      <h2>Pendências acionáveis</h2>
                      <p>
                        {noPhotos.length} produto(s) sem foto ·{" "}
                        {bannerIssues.length} pendência(s) de banners ou
                        coleções
                      </p>
                      {noPhotos.slice(0, 5).map((p) => (
                        <button
                          className="admin-pending"
                          key={p.id}
                          onClick={() => setEditing(p)}
                          disabled={!ready.products}
                        >
                          <span>{p.name}</span>
                          <span className="admin-badge attention">
                            Sem foto
                          </span>
                        </button>
                      ))}
                      {bannerIssues.map((issue, index) => (
                        <button
                          className="admin-pending"
                          key={index}
                          onClick={() => navigate("banners")}
                        >
                          {issue}
                        </button>
                      ))}
                      {!noPhotos.length && !bannerIssues.length && (
                        <p className="admin-success">
                          Nenhuma pendência de foto ou conteúdo.
                        </p>
                      )}
                    </section>
                  </div>
                  <section className="admin-panel">
                    <h2>Atendimentos pelo WhatsApp</h2>
                    <p>
                      Os indicadores consideram apenas orçamentos registrados no
                      painel. Cliques, sacolas e conversas não representam
                      vendas confirmadas.
                    </p>
                    <button
                      className="admin-button secondary"
                      onClick={() => navigate("orders")}
                    >
                      Acompanhar atendimentos
                    </button>
                  </section>
                </>
              )}
              {module === "products" && (
                <>
                  <div className="admin-section-heading">
                    <div>
                      <h1>Produtos</h1>
                      <p>
                        {products.length} registros · dados e opções preservados
                      </p>
                    </div>
                    <div className="admin-actions">
                      <button
                        className="admin-button secondary"
                        disabled={!ready.products || busy}
                        onClick={() => void discover()}
                      >
                        Buscar modelos no R2
                      </button>
                      <button
                        className="admin-button"
                        disabled={!ready.products || busy}
                        onClick={() =>
                          setEditing(createProduct(products.length))
                        }
                      >
                        <Plus size={18} />
                        Novo produto
                      </button>
                    </div>
                  </div>
                  <div className="admin-toolbar">
                    <Field label="Busca">
                      <div className="admin-search">
                        <Search size={17} />
                        <input
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Nome ou endereço"
                        />
                      </div>
                    </Field>
                    <Field label="Categoria">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="">Todas</option>
                        {CATEGORIES.map((c) => (
                          <option value={c.slug} key={c.slug}>
                            {c.shortName}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Coleção">
                      <select
                        value={collection}
                        onChange={(e) => setCollection(e.target.value)}
                      >
                        <option value="">Todas</option>
                        {content.collections.map((c) => (
                          <option value={c.id} key={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Situação">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="">Todas</option>
                        {["Ativo", "Inativo", "Rascunho"].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Ordenação">
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                      >
                        <option value="order">Ordem do catálogo</option>
                        <option value="name">Nome A a Z</option>
                        <option value="recent">Mais recentes</option>
                        <option value="price">Menor preço</option>
                      </select>
                    </Field>
                    <button
                      className="admin-button secondary small"
                      onClick={() => {
                        setQuery("");
                        setCategory("");
                        setCollection("");
                        setStatus("");
                        setSort("order");
                      }}
                    >
                      Limpar
                    </button>
                  </div>
                  {selection.length > 0 && (
                    <div className="admin-batch">
                      <strong>{selection.length} selecionado(s)</strong>
                      <button
                        disabled={busy || !ready.products}
                        className="admin-button secondary small"
                        onClick={() => batch("activate")}
                      >
                        Ativar
                      </button>
                      <button
                        disabled={busy || !ready.products}
                        className="admin-button secondary small"
                        onClick={() => batch("deactivate")}
                      >
                        Desativar
                      </button>
                      <select
                        aria-label="Categoria para alteração em lote"
                        value={batchCategory}
                        onChange={(e) => setBatchCategory(e.target.value)}
                      >
                        <option value="">Escolher categoria</option>
                        {CATEGORIES.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.shortName}
                          </option>
                        ))}
                      </select>
                      <button
                        disabled={!batchCategory || busy || !ready.products}
                        className="admin-button secondary small"
                        onClick={() => batch("category")}
                      >
                        Alterar categoria
                      </button>
                      <button
                        className="admin-button secondary small"
                        onClick={() => setSelection([])}
                      >
                        Desmarcar
                      </button>
                    </div>
                  )}
                  {!shown.length ? (
                    <Empty title="Nenhum produto encontrado">
                      <p>Ajuste a busca ou os filtros.</p>
                    </Empty>
                  ) : (
                    <div className="admin-table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>
                              <input
                                type="checkbox"
                                aria-label="Selecionar produtos desta página"
                                checked={
                                  shown.length > 0 &&
                                  shown.every((p) => selection.includes(p.id))
                                }
                                onChange={(e) =>
                                  setSelection(
                                    e.target.checked
                                      ? [
                                          ...new Set([
                                            ...selection,
                                            ...shown.map((p) => p.id),
                                          ]),
                                        ]
                                      : selection.filter(
                                          (id) =>
                                            !shown.some((p) => p.id === id),
                                        ),
                                  )
                                }
                              />
                            </th>
                            <th>Produto</th>
                            <th>Categoria</th>
                            <th>Tema / coleção</th>
                            <th>Preço atual</th>
                            <th>Situação</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shown.map((p) => (
                            <tr key={p.id}>
                              <td>
                                <input
                                  type="checkbox"
                                  aria-label={`Selecionar ${p.name}`}
                                  checked={selection.includes(p.id)}
                                  onChange={(e) =>
                                    setSelection(
                                      e.target.checked
                                        ? [...selection, p.id]
                                        : selection.filter((id) => id !== p.id),
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <div className="admin-product-cell">
                                  {p.images[0] ? (
                                    <img
                                      src={p.images[0]}
                                      alt=""
                                      loading="lazy"
                                    />
                                  ) : (
                                    <span className="admin-no-photo">
                                      <Package size={20} />
                                    </span>
                                  )}
                                  <div>
                                    <strong>{p.name}</strong>
                                    <small>/{p.slug}</small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                {
                                  CATEGORIES.find((c) => c.slug === p.category)
                                    ?.shortName
                                }
                              </td>
                              <td>
                                {p.collections
                                  ?.map(
                                    (id) =>
                                      content.collections.find(
                                        (c) => c.id === id,
                                      )?.name || id,
                                  )
                                  .join(", ") || "Sem coleção"}
                              </td>
                              <td>
                                <strong>
                                  {formatPrice(calculateStartingPrice(p))}
                                </strong>
                                {p.oldPrice && p.oldPrice > p.price && (
                                  <small>
                                    <del>{formatPrice(p.oldPrice)}</del>{" "}
                                    <span className="admin-badge success">
                                      Promoção
                                    </span>
                                  </small>
                                )}
                              </td>
                              <td>
                                <span
                                  className={`admin-badge ${p.status === "draft" ? "attention" : p.available ? "success" : "neutral"}`}
                                >
                                  {stateLabel(p)}
                                </span>
                              </td>
                              <td>
                                <div className="admin-row-actions">
                                  <button
                                    className="admin-button secondary small"
                                    disabled={!ready.products || busy}
                                    onClick={() => setEditing(p)}
                                  >
                                    Editar
                                  </button>
                                  <details>
                                    <summary
                                      className="admin-icon"
                                      aria-label={`Mais ações para ${p.name}`}
                                    >
                                      <MoreHorizontal size={18} />
                                    </summary>
                                    <div
                                      className="admin-row-menu"
                                      onClickCapture={(e) => {
                                        if (
                                          (e.target as HTMLElement).closest(
                                            "a,button",
                                          )
                                        )
                                          e.currentTarget
                                            .closest("details")
                                            ?.removeAttribute("open");
                                      }}
                                    >
                                      {p.status !== "draft" && p.available && (
                                        <a
                                          href={`/produto/${p.slug}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <Eye size={16} />
                                          Visualizar na loja
                                        </a>
                                      )}
                                      <button
                                        disabled={!ready.products || busy}
                                        onClick={() => duplicate(p)}
                                      >
                                        <Copy size={16} />
                                        Duplicar em rascunho
                                      </button>
                                      <button
                                        disabled={!ready.products || busy}
                                        onClick={() => toggle(p)}
                                      >
                                        <Power size={16} />
                                        {p.available ? "Desativar" : "Ativar"}
                                      </button>
                                      <button
                                        disabled={
                                          !ready.products ||
                                          busy ||
                                          [...products].sort(
                                            (a, b) =>
                                              (a.order ?? 0) - (b.order ?? 0),
                                          )[0]?.id === p.id
                                        }
                                        onClick={() => moveProduct(p, -1)}
                                      >
                                        <ArrowUp size={16} />
                                        Mover acima no catálogo
                                      </button>
                                      <button
                                        disabled={
                                          !ready.products ||
                                          busy ||
                                          [...products]
                                            .sort(
                                              (a, b) =>
                                                (a.order ?? 0) - (b.order ?? 0),
                                            )
                                            .at(-1)?.id === p.id
                                        }
                                        onClick={() => moveProduct(p, 1)}
                                      >
                                        <ArrowDown size={16} />
                                        Mover abaixo no catálogo
                                      </button>
                                    </div>
                                  </details>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="admin-pagination">
                    <span>
                      {filtered.length} resultado(s) · página {currentPage} de{" "}
                      {pages}
                    </span>
                    <button
                      className="admin-button secondary small"
                      disabled={currentPage === 1}
                      onClick={() => setPage(currentPage - 1)}
                    >
                      Anterior
                    </button>
                    <button
                      className="admin-button secondary small"
                      disabled={currentPage === pages}
                      onClick={() => setPage(currentPage + 1)}
                    >
                      Próxima
                    </button>
                  </div>
                </>
              )}
              {module === "collections" && (
                <>
                  <div className="admin-section-heading">
                    <div>
                      <h1>Categorias e coleções</h1>
                      <p>
                        Categoria identifica o tipo de produto. Coleções agrupam
                        temas e podem ter vários vínculos.
                      </p>
                    </div>
                    <button
                      className="admin-button"
                      disabled={!ready.content || busy}
                      onClick={() =>
                        setEditCollection({
                          id: `colecao-${crypto.randomUUID()}`,
                          slug: `colecao-${crypto.randomUUID().slice(0, 8)}`,
                          name: "Nova coleção",
                          description: "",
                          image: "",
                          active: false,
                          order: content.collections.length,
                        })
                      }
                    >
                      <Plus size={18} />
                      Nova coleção
                    </button>
                  </div>
                  <section className="admin-panel">
                    <h2>Tipos de produto</h2>
                    <div className="admin-category-summary">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c.slug}
                          onClick={() => {
                            setCategory(c.slug);
                            navigate("products");
                          }}
                        >
                          <strong>{c.shortName}</strong>
                          <span>
                            {
                              products.filter((p) => p.category === c.slug)
                                .length
                            }{" "}
                            produtos
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                  <section className="admin-panel">
                    <h2>Coleções e temas</h2>
                    <p>
                      Os temas iniciais não foram atribuídos automaticamente aos
                      produtos.
                    </p>
                    <div className="admin-table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Coleção</th>
                            <th>Vínculos</th>
                            <th>Situação</th>
                            <th>Ordem</th>
                            <th>Ação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {content.collections
                            .slice()
                            .sort((a, b) => a.order - b.order)
                            .map((c, index) => (
                              <tr key={c.id}>
                                <td>
                                  <div className="admin-product-cell">
                                    {c.image && <img src={c.image} alt="" />}
                                    <div>
                                      <strong>{c.name}</strong>
                                      <small>/colecao/{c.slug}</small>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  {
                                    products.filter((p) =>
                                      p.collections?.includes(c.id),
                                    ).length
                                  }
                                </td>
                                <td>
                                  <span
                                    className={`admin-badge ${c.active ? "success" : "neutral"}`}
                                  >
                                    {c.active ? "Ativa" : "Inativa"}
                                  </span>
                                </td>
                                <td>
                                  <div className="admin-actions">
                                    <button
                                      className="admin-icon"
                                      disabled={
                                        index === 0 || busy || !ready.content
                                      }
                                      onClick={() =>
                                        reorder("collections", index, -1)
                                      }
                                      aria-label={`Subir coleção ${c.name}`}
                                    >
                                      <ArrowUp size={16} />
                                    </button>
                                    <button
                                      className="admin-icon"
                                      disabled={
                                        index ===
                                          content.collections.length - 1 ||
                                        busy ||
                                        !ready.content
                                      }
                                      onClick={() =>
                                        reorder("collections", index, 1)
                                      }
                                      aria-label={`Descer coleção ${c.name}`}
                                    >
                                      <ArrowDown size={16} />
                                    </button>
                                  </div>
                                </td>
                                <td>
                                  <button
                                    className="admin-button secondary small"
                                    disabled={!ready.content || busy}
                                    onClick={() => setEditCollection(c)}
                                  >
                                    Editar
                                  </button>
                                  {c.active && (
                                    <a
                                      className="admin-icon"
                                      href={`/colecao/${c.slug}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      aria-label={`Ver coleção ${c.name}`}
                                    >
                                      <ExternalLink size={16} />
                                    </a>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              )}
              {module === "banners" && (
                <>
                  <div className="admin-section-heading">
                    <div>
                      <h1>Banners</h1>
                      <p>
                        O Gospel permanece como principal. Textos e botões são
                        independentes da fotografia.
                      </p>
                    </div>
                    <button
                      className="admin-button"
                      disabled={!ready.content || busy}
                      onClick={() =>
                        setEditBanner({
                          id: `banner-${crypto.randomUUID()}`,
                          name: "Novo banner",
                          title: "",
                          description: "",
                          image: null,
                          imageAlt: "",
                          width: 2078,
                          height: 757,
                          primary: {
                            label: "Explorar produtos",
                            href: "/produtos",
                          },
                          secondary: {
                            label: "Pedir pelo WhatsApp",
                            href: generalWhatsAppUrl(),
                          },
                          active: false,
                          order: content.banners.length,
                        })
                      }
                    >
                      <Plus size={18} />
                      Novo banner
                    </button>
                  </div>
                  <section className="admin-panel">
                    <Field label="Intervalo automático">
                      <select
                        value={content.intervalMs}
                        disabled={!ready.content || busy}
                        onChange={(e) =>
                          void persistContent({
                            ...content,
                            intervalMs: Number(e.target.value),
                          }).catch(report)
                        }
                      >
                        {[5000, 6000, 7000].map((ms) => (
                          <option key={ms} value={ms}>
                            {ms / 1000} segundos
                          </option>
                        ))}
                      </select>
                    </Field>
                    <div className="admin-banner-list">
                      {content.banners
                        .slice()
                        .sort((a, b) =>
                          a.id === "gospel"
                            ? -1
                            : b.id === "gospel"
                              ? 1
                              : a.order - b.order,
                        )
                        .map((banner, index) => (
                          <div key={banner.id} className="admin-banner-row">
                            {banner.image ? (
                              <img src={banner.image} alt={banner.imageAlt} />
                            ) : (
                              <span className="admin-no-photo">
                                <Images size={24} />
                              </span>
                            )}
                            <div>
                              <strong>{banner.name}</strong>
                              <small>
                                {banner.id === "gospel"
                                  ? "Principal · sempre primeiro"
                                  : banner.title}
                              </small>
                              <span
                                className={`admin-badge ${banner.active ? "success" : "neutral"}`}
                              >
                                {banner.active ? "Ativo" : "Inativo"}
                              </span>
                            </div>
                            <div className="admin-actions">
                              <button
                                disabled={busy || !ready.content || index <= 1}
                                className="admin-icon"
                                onClick={() => reorder("banners", index, -1)}
                                aria-label={`Subir banner ${banner.name}`}
                              >
                                <ArrowUp size={17} />
                              </button>
                              <button
                                disabled={
                                  busy ||
                                  !ready.content ||
                                  index === 0 ||
                                  index === content.banners.length - 1
                                }
                                className="admin-icon"
                                onClick={() => reorder("banners", index, 1)}
                                aria-label={`Descer banner ${banner.name}`}
                              >
                                <ArrowDown size={17} />
                              </button>
                              <button
                                className="admin-button secondary small"
                                disabled={!ready.content || busy}
                                onClick={() => setEditBanner(banner)}
                              >
                                Editar
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </section>
                </>
              )}
              {module === "orders" && (
                <Orders
                  orders={orders}
                  products={products}
                  ready={ready.orders}
                  onSaved={(order) => {
                    setOrders((previous) =>
                      previous.some((o) => o.id === order.id)
                        ? previous.map((o) => (o.id === order.id ? order : o))
                        : [...previous, order],
                    );
                    setNotice({
                      tone: "success",
                      text: "Orçamento salvo e confirmado pelo servidor.",
                    });
                  }}
                />
              )}
              {module === "settings" && (
                <>
                  <div className="admin-section-heading">
                    <div>
                      <h1>Configurações</h1>
                      <p>Integrações e informações atuais da loja.</p>
                    </div>
                  </div>
                  <div className="admin-dashboard-grid">
                    <section className="admin-panel">
                      <h2>Atendimento</h2>
                      <dl>
                        <dt>WhatsApp</dt>
                        <dd>
                          {CONTACT.phoneDisplay} · {WHATSAPP_NUMBER}
                        </dd>
                        <dt>E-mail</dt>
                        <dd>{CONTACT.email}</dd>
                        <dt>Conta administrativa</dt>
                        <dd>{user.email}</dd>
                      </dl>
                      <a
                        href={generalWhatsAppUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-button secondary"
                      >
                        Abrir atendimento
                      </a>
                    </section>
                    <section className="admin-panel">
                      <h2>Integrações existentes</h2>
                      <p>
                        Netlify Identity protege o acesso e as operações no
                        servidor. Catálogo, banners, coleções e orçamentos são
                        persistidos no Netlify Blobs. Fotos usam Cloudflare R2.
                      </p>
                      <p>
                        Upload requer as credenciais R2 configuradas. Prévias de
                        cores requerem a integração Gemini existente. Não há
                        cobrança ou confirmação automática de pagamentos.
                      </p>
                      <button
                        className="admin-button secondary"
                        onClick={() => navigate("banners")}
                      >
                        Configurar carrossel
                      </button>
                    </section>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      {mobileMenu && (
        <AdminDrawer title="Navegação" onClose={() => setMobileMenu(false)}>
          <div className="admin-mobile-nav">{nav}</div>
        </AdminDrawer>
      )}
      {editing && (
        <ProductEditor
          product={editing}
          products={products}
          collections={content.collections}
          onSave={saveProduct}
          onClose={() => setEditing(null)}
        />
      )}
      {editCollection && (
        <CollectionEditor
          collection={editCollection}
          onClose={() => setEditCollection(null)}
          onSave={async (next) => {
            await persistContent({
              ...content,
              collections: content.collections.some((c) => c.id === next.id)
                ? content.collections.map((c) => (c.id === next.id ? next : c))
                : [...content.collections, next],
            });
            setEditCollection(null);
          }}
        />
      )}
      {editBanner && (
        <BannerEditor
          banner={editBanner}
          onClose={() => setEditBanner(null)}
          onSave={async (next) => {
            await persistContent({
              ...content,
              banners: content.banners.some((b) => b.id === next.id)
                ? content.banners.map((b) => (b.id === next.id ? next : b))
                : [...content.banners, next],
            });
            setEditBanner(null);
          }}
        />
      )}
      {confirmation && (
        <Confirm
          message={confirmation.message}
          busy={busy}
          onClose={() => setConfirmation(null)}
          onConfirm={() => {
            if (!busy)
              void confirmation
                .run()
                .then(() => setConfirmation(null))
                .catch((error) => {
                  report(error);
                  setConfirmation(null);
                });
          }}
        />
      )}
    </main>
  );
}
