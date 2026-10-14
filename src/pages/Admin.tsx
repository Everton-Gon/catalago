import { useEffect, useState, type FormEvent } from "react";
import {
  acceptInvite,
  getUser,
  handleAuthCallback,
  login,
  logout,
  onAuthChange,
  updateUser,
  type User,
} from "@netlify/identity";
import { LoaderCircle, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import AdminWorkspace from "@/components/admin/AdminWorkspace";

function LoginScreen({
  onAuthenticated,
}: {
  onAuthenticated: (user: User) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      onAuthenticated(await login(email, password));
    } catch {
      setError("Não foi possível entrar. Confira o e-mail e a senha.");
    } finally {
      setSubmitting(false);
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
          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-700 px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {submitting ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <LockKeyhole className="size-4" />
            )}
            Entrar
          </button>
        </form>

        <Link
          to="/"
          className="mt-6 block text-center text-sm font-semibold text-brand-700 hover:text-brand-900"
        >
          Voltar para a loja
        </Link>
      </section>
    </main>
  );
}

function CreatePasswordScreen({
  token,
  onAuthenticated,
}: {
  token: string;
  onAuthenticated: (user: User) => void;
}) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setError("As duas senhas precisam ser iguais.");
      return;
    }

    setSubmitting(true);
    try {
      onAuthenticated(await acceptInvite(token, password));
      window.history.replaceState(null, "", "/admin");
    } catch {
      setError(
        "Não foi possível criar a senha. O convite pode ter expirado ou já ter sido usado.",
      );
    } finally {
      setSubmitting(false);
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
          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-700 px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {submitting ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <LockKeyhole className="size-4" />
            )}
            Criar senha e entrar
          </button>
        </form>
      </section>
    </main>
  );
}

function ResetPasswordScreen({
  onAuthenticated,
}: {
  onAuthenticated: (user: User) => void;
}) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setError("As duas senhas precisam ser iguais.");
      return;
    }

    setSubmitting(true);
    try {
      const current = await updateUser({ password });
      onAuthenticated(current);
      window.history.replaceState(null, "", "/admin");
    } catch {
      setError(
        "Não foi possível alterar a senha. Solicite um novo link de recuperação.",
      );
    } finally {
      setSubmitting(false);
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
          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-700 px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {submitting ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <LockKeyhole className="size-4" />
            )}
            Salvar nova senha
          </button>
        </form>
      </section>
    </main>
  );
}

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  useEffect(() => {
    document.title = "Administração | Fé & Propósito";
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.append(meta);
    }
    meta.content = "noindex,nofollow";
  }, []);

  useEffect(() => {
    let active = true;

    async function initializeAuthentication() {
      try {
        const callback = await handleAuthCallback();
        if (!active) return;

        if (callback?.type === "invite" && callback.token) {
          setInviteToken(callback.token);
          setUser(null);
        } else if (callback?.type === "recovery") {
          setPasswordRecovery(true);
          setUser(callback.user ?? (await getUser()));
        } else {
          setUser(callback?.user ?? (await getUser()));
        }
      } catch {
        if (active) setUser(await getUser());
      } finally {
        if (active) setAuthLoading(false);
      }
    }

    void initializeAuthentication();
    const unsubscribe = onAuthChange((_event, current) => {
      if (active) setUser(current);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const isAdmin = Boolean(user?.roles?.includes("admin"));
  if (authLoading)
    return (
      <div className="grid min-h-screen place-items-center">
        <LoaderCircle
          className="size-8 animate-spin text-brand-700"
          aria-label="Carregando autenticação"
        />
      </div>
    );
  if (inviteToken)
    return (
      <CreatePasswordScreen
        token={inviteToken}
        onAuthenticated={(current) => {
          setInviteToken(null);
          setUser(current);
        }}
      />
    );
  if (passwordRecovery)
    return (
      <ResetPasswordScreen
        onAuthenticated={(current) => {
          setPasswordRecovery(false);
          setUser(current);
        }}
      />
    );
  if (!user) return <LoginScreen onAuthenticated={setUser} />;
  if (!isAdmin)
    return (
      <main className="grid min-h-screen place-items-center bg-ink-50">
        <section className="rounded-card bg-white p-8">
          <h1>Acesso não autorizado</h1>
          <p>Sua conta não possui a função administrativa.</p>
          <button onClick={() => void logout()}>Sair</button>
        </section>
      </main>
    );
  return (
    <AdminWorkspace key={user.id} user={user} onLogout={() => void logout()} />
  );
}
