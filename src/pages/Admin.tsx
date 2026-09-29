import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  acceptInvite,
  getUser,
  handleAuthCallback,
  login,
  logout,
  onAuthChange,
  updateUser,
  type User,
} from '@netlify/identity'
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  ImagePlus,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  PackagePlus,
  Save,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCatalog } from '@/contexts/CatalogContext'
import { CATEGORIES } from '@/data/categories'
import { formatPrice } from '@/utils/format'
import type { CategorySlug, Product } from '@/types'

type Notice = { tone: 'success' | 'error' | 'info'; text: string }

function slugify(value: string): string {
  return value
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function newProduct(position: number): Product {
  const id = `produto-${crypto.randomUUID()}`
  return {
    id,
    name: 'Novo produto',
    slug: id,
    shortDescription: 'Descrição curta do produto.',
    description: 'Descrição completa do produto.',
    category: 'personalizados',
    images: [],
    price: 0,
    featured: false,
    available: true,
    status: 'draft',
    stock: 0,
    order: position,
    salesRank: 1,
    variants: [],
    personalization: { enabled: true },
    createdAt: new Date().toISOString().slice(0, 10),
  }
}

function LoginScreen({ onAuthenticated }: { onAuthenticated: (user: User) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      onAuthenticated(await login(email, password))
    } catch {
      setError('Não foi possível entrar. Confira o e-mail e a senha.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-brand-950 via-brand-800 to-brand-700 px-4 py-10">
      <section className="w-full max-w-md rounded-[1.75rem] bg-white p-7 shadow-2xl sm:p-9">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-100 text-brand-700">
          <LockKeyhole className="size-7" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-center font-display text-2xl font-extrabold text-ink-900">
          Painel administrativo
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-ink-500">
          Entre com uma conta autorizada para atualizar o catálogo.
        </p>

        <form className="mt-7 space-y-4" onSubmit={submit}>
          <label className="block text-sm font-semibold text-ink-700">
            E-mail
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-3 font-normal outline-none focus:border-brand-500"
            />
          </label>
          <label className="block text-sm font-semibold text-ink-700">
            Senha
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-3 font-normal outline-none focus:border-brand-500"
            />
          </label>
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-700 px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {submitting ? <LoaderCircle className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
            Entrar
          </button>
        </form>

        <Link to="/" className="mt-6 block text-center text-sm font-semibold text-brand-700 hover:text-brand-900">
          Voltar para a loja
        </Link>
      </section>
    </main>
  )
}

function CreatePasswordScreen({
  token,
  onAuthenticated,
}: {
  token: string
  onAuthenticated: (user: User) => void
}) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('A senha precisa ter pelo menos 8 caracteres.')
      return
    }
    if (password !== confirmation) {
      setError('As duas senhas precisam ser iguais.')
      return
    }

    setSubmitting(true)
    try {
      onAuthenticated(await acceptInvite(token, password))
      window.history.replaceState(null, '', '/admin')
    } catch {
      setError('Não foi possível criar a senha. O convite pode ter expirado ou já ter sido usado.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-brand-950 via-brand-800 to-brand-700 px-4 py-10">
      <section className="w-full max-w-md rounded-[1.75rem] bg-white p-7 shadow-2xl sm:p-9">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-100 text-brand-700">
          <LockKeyhole className="size-7" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-center font-display text-2xl font-extrabold text-ink-900">
          Crie sua senha de administrador
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-ink-500">
          Esta senha será usada junto com o e-mail que recebeu o convite.
        </p>

        <form className="mt-7 space-y-4" onSubmit={submit}>
          <label className="block text-sm font-semibold text-ink-700">
            Nova senha
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-3 font-normal outline-none focus:border-brand-500"
            />
          </label>
          <label className="block text-sm font-semibold text-ink-700">
            Confirme a senha
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-3 font-normal outline-none focus:border-brand-500"
            />
          </label>
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-700 px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {submitting ? <LoaderCircle className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
            Criar senha e entrar
          </button>
        </form>
      </section>
    </main>
  )
}

function ResetPasswordScreen({ onAuthenticated }: { onAuthenticated: (user: User) => void }) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('A senha precisa ter pelo menos 8 caracteres.')
      return
    }
    if (password !== confirmation) {
      setError('As duas senhas precisam ser iguais.')
      return
    }

    setSubmitting(true)
    try {
      const current = await updateUser({ password })
      onAuthenticated(current)
      window.history.replaceState(null, '', '/admin')
    } catch {
      setError('Não foi possível alterar a senha. Solicite um novo link de recuperação.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-brand-950 via-brand-800 to-brand-700 px-4 py-10">
      <section className="w-full max-w-md rounded-[1.75rem] bg-white p-7 shadow-2xl sm:p-9">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-100 text-brand-700">
          <LockKeyhole className="size-7" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-center font-display text-2xl font-extrabold text-ink-900">
          Crie uma nova senha
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-ink-500">
          Digite e confirme a nova senha da sua conta administrativa.
        </p>

        <form className="mt-7 space-y-4" onSubmit={submit}>
          <label className="block text-sm font-semibold text-ink-700">
            Nova senha
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-3 font-normal outline-none focus:border-brand-500"
            />
          </label>
          <label className="block text-sm font-semibold text-ink-700">
            Confirme a nova senha
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-3 font-normal outline-none focus:border-brand-500"
            />
          </label>
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-700 px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {submitting ? <LoaderCircle className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
            Salvar nova senha
          </button>
        </form>
      </section>
    </main>
  )
}

export default function Admin() {
  const { products: fallbackProducts, refresh } = useCatalog()
  const [user, setUser] = useState<User | null>(null)
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const [passwordRecovery, setPasswordRecovery] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [loadingCatalog, setLoadingCatalog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>([])
  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#2563EB')
  const [generating, setGenerating] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const initializedUser = useRef<string | null>(null)

  useEffect(() => {
    document.title = 'Administração | Fé & Propósito'
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'robots'
      document.head.append(meta)
    }
    meta.content = 'noindex,nofollow'
  }, [])

  useEffect(() => {
    let active = true

    async function initializeAuthentication() {
      try {
        const callback = await handleAuthCallback()
        if (!active) return

        if (callback?.type === 'invite' && callback.token) {
          setInviteToken(callback.token)
          setUser(null)
        } else if (callback?.type === 'recovery') {
          setPasswordRecovery(true)
          setUser(callback.user ?? (await getUser()))
        } else {
          setUser(callback?.user ?? (await getUser()))
        }
      } catch {
        if (active) setUser(await getUser())
      } finally {
        if (active) setAuthLoading(false)
      }
    }

    void initializeAuthentication()
    const unsubscribe = onAuthChange((_event, current) => {
      if (active) setUser(current)
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const isAdmin = Boolean(user?.roles?.includes('admin'))

  useEffect(() => {
    if (!user || !isAdmin || initializedUser.current === user.id) return
    initializedUser.current = user.id
    setLoadingCatalog(true)
    fetch('/api/admin/products', { headers: { Accept: 'application/json' } })
      .then(async (response) => {
        if (!response.ok) throw new Error('Falha ao carregar o catálogo.')
        const stored: unknown = await response.json()
        const initial = Array.isArray(stored) ? (stored as Product[]) : fallbackProducts
        setProducts(initial.map((product, index) => ({ ...product, order: product.order ?? index })))
        setSelectedId(initial[0]?.id ?? null)
      })
      .catch(() => {
        setProducts(fallbackProducts.map((product, index) => ({ ...product, order: index })))
        setSelectedId(fallbackProducts[0]?.id ?? null)
        setNotice({ tone: 'info', text: 'Usando o catálogo local. Publique para criar a versão administrativa.' })
      })
      .finally(() => setLoadingCatalog(false))
  }, [user, isAdmin, fallbackProducts])

  const selected = products.find((product) => product.id === selectedId)

  useEffect(() => {
    setSelectedColorIds([])
    setShowGenerator(false)
  }, [selectedId])

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('pt-BR')
    if (!term) return products
    return products.filter((product) =>
      `${product.name} ${product.slug} ${product.category}`.toLocaleLowerCase('pt-BR').includes(term),
    )
  }, [products, query])

  function editSelected(patch: Partial<Product>) {
    if (!selectedId) return
    setProducts((current) =>
      current.map((product) => (product.id === selectedId ? { ...product, ...patch } : product)),
    )
  }

  function addProduct() {
    const product = newProduct(products.length)
    setProducts((current) => [...current, product])
    setSelectedId(product.id)
    setNotice({ tone: 'info', text: 'Produto criado como rascunho. Preencha os dados e publique.' })
  }

  function removeSelected() {
    if (!selected || !window.confirm(`Excluir “${selected.name}” do catálogo administrativo?`)) return
    setProducts((current) => current.filter((product) => product.id !== selected.id))
    setSelectedId(products.find((product) => product.id !== selected.id)?.id ?? null)
  }

  function duplicateSelected() {
    if (!selected) return
    const copy: Product = {
      ...structuredClone(selected),
      id: `produto-${crypto.randomUUID()}`,
      name: `${selected.name} (cópia)`,
      slug: `${selected.slug}-copia-${Date.now().toString().slice(-5)}`,
      status: 'draft',
      featured: false,
      order: products.length,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setProducts((current) => [...current, copy])
    setSelectedId(copy.id)
    setNotice({ tone: 'info', text: 'Cópia criada como rascunho com todas as variações.' })
  }

  function moveSelected(direction: -1 | 1) {
    if (!selected) return
    const index = products.findIndex((product) => product.id === selected.id)
    const target = index + direction
    if (target < 0 || target >= products.length) return
    const next = [...products]
    ;[next[index], next[target]] = [next[target], next[index]]
    setProducts(next.map((product, order) => ({ ...product, order })))
  }

  function addColor() {
    if (!selected || !newColorName.trim() || !/^#[0-9A-F]{6}$/i.test(newColorHex)) return
    const idBase = slugify(newColorName) || `cor-${Date.now()}`
    const id = (selected.colors ?? []).some((color) => color.id === idBase)
      ? `${idBase}-${Date.now().toString().slice(-4)}`
      : idBase
    const nextColor = {
      id,
      name: newColorName.trim(),
      hex: newColorHex.toUpperCase(),
      checkContrast: 'light' as const,
    }
    const hasColorVariant = selected.variants.some((variant) => variant.id === 'cor')
    editSelected({
      colors: [...(selected.colors ?? []), nextColor],
      variants: hasColorVariant
        ? selected.variants
        : [
            ...selected.variants,
            { id: 'cor', name: 'Cor', required: true, options: [{ label: 'Conforme a foto' }] },
          ],
    })
    setSelectedColorIds((current) => [...current, id])
    setNewColorName('')
  }

  async function generateColorVariations() {
    if (!selected?.images[0]) {
      setNotice({ tone: 'error', text: 'Envie uma imagem original antes de gerar cores.' })
      return
    }
    const chosen = (selected.colors ?? []).filter((color) => selectedColorIds.includes(color.id))
    if (chosen.length === 0) {
      setNotice({ tone: 'error', text: 'Selecione pelo menos uma cor.' })
      return
    }

    setGenerating(true)
    let nextColors = [...(selected.colors ?? [])]
    let cachedCount = 0
    try {
      for (const color of chosen) {
        setNotice({ tone: 'info', text: `Gerando ${color.name}…` })
        const response = await fetch('/api/admin/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: selected.id,
            sourceImage: selected.images[0],
            colorName: color.name,
            colorHex: color.hex,
          }),
        })
        const payload = (await response.json()) as { url?: string; cached?: boolean; error?: string }
        if (!response.ok || !payload.url) throw new Error(payload.error ?? `Falha ao gerar ${color.name}.`)
        if (payload.cached) cachedCount += 1
        nextColors = nextColors.map((item) =>
          item.id === color.id ? { ...item, previewImage: payload.url } : item,
        )
        setProducts((current) =>
          current.map((product) =>
            product.id === selected.id ? { ...product, colors: nextColors } : product,
          ),
        )
      }
      setNotice({
        tone: 'success',
        text: `${chosen.length} variação(ões) pronta(s) para revisão${cachedCount ? `; ${cachedCount} vieram do cache` : ''}. Clique em Publicar somente após aprovar.`,
      })
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'Falha na geração.' })
    } finally {
      setGenerating(false)
    }
  }

  async function uploadImage(file: File) {
    if (!selected) return
    setUploading(true)
    setNotice(null)
    try {
      const body = new FormData()
      body.set('file', file)
      body.set('category', selected.category)
      const response = await fetch('/api/admin/images', { method: 'POST', body })
      const payload = (await response.json()) as { url?: string; error?: string }
      if (!response.ok || !payload.url) throw new Error(payload.error ?? 'Falha no envio.')
      editSelected({ images: [...selected.images, payload.url] })
      setNotice({ tone: 'success', text: 'Imagem enviada ao Cloudflare R2.' })
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'Falha no envio.' })
    } finally {
      setUploading(false)
    }
  }

  async function publishCatalog() {
    const published = products.filter((product) => product.status !== 'draft')
    const duplicateSlug = published.find(
      (product, index) => published.findIndex((candidate) => candidate.slug === product.slug) !== index,
    )
    const incomplete = published.find(
      (product) => !product.name.trim() || !product.slug.trim() || product.images.length === 0,
    )
    if (duplicateSlug) {
      setNotice({ tone: 'error', text: `O endereço “${duplicateSlug.slug}” está duplicado.` })
      return
    }
    if (incomplete) {
      setSelectedId(incomplete.id)
      setNotice({ tone: 'error', text: `Complete nome, endereço e imagem de “${incomplete.name}”.` })
      return
    }
    setSaving(true)
    setNotice(null)
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(products.map((product, order) => ({ ...product, order }))),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(payload.error ?? 'Não foi possível publicar.')
      await refresh()
      setNotice({ tone: 'success', text: 'Catálogo publicado com sucesso.' })
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'Falha ao publicar.' })
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) {
    return <div className="grid min-h-screen place-items-center"><LoaderCircle className="size-8 animate-spin text-brand-700" /></div>
  }
  if (inviteToken) {
    return (
      <CreatePasswordScreen
        token={inviteToken}
        onAuthenticated={(current) => {
          setInviteToken(null)
          setUser(current)
        }}
      />
    )
  }
  if (passwordRecovery) {
    return (
      <ResetPasswordScreen
        onAuthenticated={(current) => {
          setPasswordRecovery(false)
          setUser(current)
        }}
      />
    )
  }
  if (!user) return <LoginScreen onAuthenticated={setUser} />
  if (!isAdmin) {
    return (
      <main className="grid min-h-screen place-items-center bg-ink-50 px-4">
        <section className="max-w-md rounded-card bg-white p-8 text-center shadow-soft">
          <LockKeyhole className="mx-auto size-10 text-red-600" />
          <h1 className="mt-4 text-2xl font-extrabold">Acesso não autorizado</h1>
          <p className="mt-2 text-sm text-ink-500">Sua conta não possui a função administrativa.</p>
          <button onClick={() => void logout()} className="mt-6 rounded-full bg-ink-900 px-6 py-3 text-sm font-bold text-white">Sair</button>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-ink-50">
      <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[96rem] items-center gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-extrabold text-ink-900">Fé & Propósito Admin</p>
            <p className="truncate text-xs text-ink-500">{user.email}</p>
          </div>
          <Link to="/" target="_blank" className="hidden items-center gap-2 rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50 sm:flex">
            <Eye className="size-4" /> Ver loja
          </Link>
          <button onClick={() => void publishCatalog()} disabled={saving} className="flex items-center gap-2 rounded-full bg-brand-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-800 disabled:opacity-60">
            {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
            Publicar
          </button>
          <button onClick={() => void logout()} className="rounded-full p-2.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900" aria-label="Sair"><LogOut className="size-5" /></button>
        </div>
      </header>

      {notice && (
        <div className={`mx-auto mt-4 max-w-[96rem] rounded-xl px-4 py-3 text-sm sm:px-6 ${notice.tone === 'success' ? 'bg-emerald-50 text-emerald-800' : notice.tone === 'error' ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
          {notice.text}
        </div>
      )}

      <div className="mx-auto grid max-w-[96rem] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className="rounded-card border border-ink-200 bg-white shadow-soft lg:sticky lg:top-20 lg:h-[calc(100vh-6.5rem)]">
          <div className="border-b border-ink-200 p-4">
            <button onClick={addProduct} className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 py-3 text-sm font-bold text-white hover:bg-ink-800">
              <PackagePlus className="size-4" /> Novo produto
            </button>
            <label className="mt-3 flex items-center gap-2 rounded-xl border border-ink-200 px-3 py-2.5">
              <Search className="size-4 text-ink-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar no catálogo" className="w-full text-sm outline-none" />
            </label>
          </div>
          <div className="max-h-[calc(100vh-14.5rem)] overflow-y-auto p-2">
            {loadingCatalog ? <LoaderCircle className="mx-auto mt-10 size-7 animate-spin text-brand-700" /> : filtered.map((product) => (
              <button key={product.id} onClick={() => setSelectedId(product.id)} className={`mb-1 flex w-full items-center gap-3 rounded-xl p-2.5 text-left ${product.id === selectedId ? 'bg-brand-50 ring-1 ring-brand-200' : 'hover:bg-ink-50'}`}>
                <img src={product.images[0] || '/og-image.svg'} alt="" className="size-12 rounded-lg bg-ink-100 object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink-800">{product.name}</span>
                  <span className="mt-0.5 flex items-center gap-2 text-xs text-ink-500">
                    {formatPrice(product.price)}
                    <span className={`size-1.5 rounded-full ${product.status === 'draft' ? 'bg-amber-500' : product.available ? 'bg-emerald-500' : 'bg-ink-300'}`} />
                    {product.status === 'draft' ? 'Rascunho' : product.available ? 'Publicado' : 'Oculto'}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        {selected ? (
          <section className="min-w-0 rounded-card border border-ink-200 bg-white p-5 shadow-soft sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-200 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Editando produto</p>
                <h1 className="mt-1 text-2xl font-extrabold">{selected.name}</h1>
              </div>
              <div className="flex gap-2">
                <button onClick={duplicateSelected} className="rounded-lg border border-ink-200 p-2 text-ink-600 hover:bg-ink-50" aria-label="Duplicar produto"><Copy className="size-4" /></button>
                <button onClick={() => moveSelected(-1)} className="rounded-lg border border-ink-200 p-2 text-ink-600 hover:bg-ink-50" aria-label="Mover para cima"><ArrowUp className="size-4" /></button>
                <button onClick={() => moveSelected(1)} className="rounded-lg border border-ink-200 p-2 text-ink-600 hover:bg-ink-50" aria-label="Mover para baixo"><ArrowDown className="size-4" /></button>
                <button onClick={removeSelected} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50" aria-label="Excluir produto"><Trash2 className="size-4" /></button>
              </div>
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-ink-700 sm:col-span-2">Nome
                  <input value={selected.name} onChange={(event) => editSelected({ name: event.target.value })} onBlur={() => selected.slug.startsWith('produto-') && editSelected({ slug: slugify(selected.name) })} className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-3 font-normal outline-none focus:border-brand-500" />
                </label>
                <label className="text-sm font-semibold text-ink-700">Endereço (slug)
                  <input value={selected.slug} onChange={(event) => editSelected({ slug: slugify(event.target.value) })} className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-3 font-normal outline-none focus:border-brand-500" />
                </label>
                <label className="text-sm font-semibold text-ink-700">Categoria
                  <select value={selected.category} onChange={(event) => editSelected({ category: event.target.value as CategorySlug })} className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-4 py-3 font-normal outline-none focus:border-brand-500">
                    {CATEGORIES.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
                  </select>
                </label>
                <label className="text-sm font-semibold text-ink-700">Preço
                  <input type="number" min="0" step="0.01" value={selected.price} onChange={(event) => editSelected({ price: Number(event.target.value) })} className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-3 font-normal outline-none focus:border-brand-500" />
                </label>
                <label className="text-sm font-semibold text-ink-700">Estoque
                  <input type="number" min="0" value={selected.stock ?? ''} onChange={(event) => editSelected({ stock: event.target.value === '' ? undefined : Number(event.target.value) })} className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-3 font-normal outline-none focus:border-brand-500" />
                </label>
                <label className="text-sm font-semibold text-ink-700 sm:col-span-2">Descrição curta
                  <input value={selected.shortDescription} onChange={(event) => editSelected({ shortDescription: event.target.value })} className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-3 font-normal outline-none focus:border-brand-500" />
                </label>
                <label className="text-sm font-semibold text-ink-700 sm:col-span-2">Descrição completa
                  <textarea rows={5} value={selected.description} onChange={(event) => editSelected({ description: event.target.value })} className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-3 font-normal outline-none focus:border-brand-500" />
                </label>
                <label className="text-sm font-semibold text-ink-700">Status
                  <select value={selected.status ?? 'published'} onChange={(event) => editSelected({ status: event.target.value as Product['status'] })} className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-4 py-3 font-normal">
                    <option value="published">Publicado</option><option value="draft">Rascunho</option>
                  </select>
                </label>
                <label className="text-sm font-semibold text-ink-700">Etiqueta
                  <input value={selected.badge ?? ''} onChange={(event) => editSelected({ badge: event.target.value || undefined })} placeholder="Ex.: Mais vendido" className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-3 font-normal" />
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-ink-700"><input type="checkbox" checked={selected.available} onChange={(event) => editSelected({ available: event.target.checked })} className="size-4 accent-brand-700" /> Disponível na loja</label>
                <label className="flex items-center gap-2 text-sm font-semibold text-ink-700"><input type="checkbox" checked={selected.featured} onChange={(event) => editSelected({ featured: event.target.checked })} className="size-4 accent-brand-700" /> Produto em destaque</label>
              </div>

              <aside>
                <div className="overflow-hidden rounded-2xl border border-ink-200 bg-ink-50">
                  <img src={selected.images[0] || '/og-image.svg'} alt="Pré-visualização" className="aspect-square w-full object-contain" />
                  <div className="p-4"><p className="font-semibold text-ink-900">{selected.name}</p><p className="mt-1 text-sm text-brand-700">{formatPrice(selected.price)}</p></div>
                </div>
                <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-brand-300 bg-brand-50 px-4 py-4 text-sm font-bold text-brand-700 hover:bg-brand-100">
                  {uploading ? <LoaderCircle className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                  Enviar imagem
                  <input type="file" accept="image/*" disabled={uploading} className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); event.target.value = '' }} />
                </label>
                <div className="mt-3 space-y-2">
                  {selected.images.map((image, index) => (
                    <div key={`${image}-${index}`} className="flex items-center gap-2 rounded-lg border border-ink-200 p-2">
                      <img src={image} alt="" className="size-10 rounded-md object-cover" />
                      <span className="min-w-0 flex-1 truncate text-xs text-ink-500">{image}</span>
                      <button onClick={() => editSelected({ images: selected.images.filter((_, imageIndex) => imageIndex !== index) })} className="p-1 text-red-600" aria-label="Remover imagem"><Trash2 className="size-4" /></button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShowGenerator((current) => !current)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-bold text-white hover:from-violet-700 hover:to-fuchsia-700"
                >
                  <Sparkles className="size-4" /> Gerar cores com Gemini
                </button>

                {showGenerator && (
                  <div className="mt-3 rounded-2xl border border-violet-200 bg-violet-50/60 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-violet-800">
                      Cores da camiseta
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-500">
                      A imagem principal será usada como original. As variações só entram na loja após clicar em Publicar.
                    </p>

                    <div className="mt-3 max-h-52 space-y-2 overflow-y-auto">
                      {(selected.colors ?? []).map((color) => (
                        <label key={color.id} className="flex cursor-pointer items-center gap-2 rounded-lg bg-white p-2 ring-1 ring-ink-200">
                          <input
                            type="checkbox"
                            checked={selectedColorIds.includes(color.id)}
                            onChange={(event) =>
                              setSelectedColorIds((current) =>
                                event.target.checked
                                  ? [...current, color.id]
                                  : current.filter((id) => id !== color.id),
                              )
                            }
                            className="size-4 accent-violet-700"
                          />
                          <span className="size-6 rounded-md border border-ink-200" style={{ backgroundColor: color.hex }} />
                          <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ink-700">{color.name}</span>
                          {color.previewImage && <img src={color.previewImage} alt="" className="size-8 rounded-md object-cover" />}
                        </label>
                      ))}
                    </div>

                    <div className="mt-3 grid grid-cols-[1fr_4.5rem] gap-2">
                      <input
                        value={newColorName}
                        onChange={(event) => setNewColorName(event.target.value)}
                        placeholder="Nova cor"
                        className="min-w-0 rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs outline-none focus:border-violet-500"
                      />
                      <input
                        type="color"
                        value={newColorHex}
                        onChange={(event) => setNewColorHex(event.target.value)}
                        className="h-9 w-full cursor-pointer rounded-lg border border-ink-200 bg-white p-1"
                        aria-label="Cor hexadecimal"
                      />
                    </div>
                    <button type="button" onClick={addColor} disabled={!newColorName.trim()} className="mt-2 w-full rounded-lg border border-violet-300 bg-white px-3 py-2 text-xs font-bold text-violet-700 disabled:opacity-50">
                      Adicionar cor
                    </button>
                    <button type="button" onClick={() => void generateColorVariations()} disabled={generating || selectedColorIds.length === 0} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-700 px-3 py-2.5 text-xs font-bold text-white disabled:opacity-50">
                      {generating ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                      Gerar {selectedColorIds.length || ''} variação(ões)
                    </button>
                  </div>
                )}
              </aside>
            </div>
          </section>
        ) : (
          <section className="grid min-h-96 place-items-center rounded-card border border-ink-200 bg-white p-8 text-center shadow-soft"><div><PackagePlus className="mx-auto size-10 text-ink-300" /><p className="mt-3 text-sm text-ink-500">Selecione ou adicione um produto.</p></div></section>
        )}
      </div>
    </main>
  )
}
