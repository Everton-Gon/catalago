import { refreshSession } from "@netlify/identity";

let renewal: Promise<unknown> | null = null;
function tokenCookie(): string | null {
  if (typeof document === "undefined") return null;
  const value = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("nf_jwt="))
    ?.slice(7);
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
async function renew() {
  if (typeof window === "undefined") return;
  if (!renewal)
    renewal = Promise.resolve()
      .then(() => refreshSession())
      .catch(() => null)
      .finally(() => {
        renewal = null;
      });
  await renewal;
}
/** Only administrative same-origin endpoints may receive the Identity token. */
export async function adminFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  if (
    typeof input !== "string" ||
    !input.startsWith("/api/admin/") ||
    input.startsWith("//")
  )
    throw new Error("Destino administrativo inválido.");
  await renew();
  const send = () => {
    const headers = new Headers(init.headers);
    const token = tokenCookie();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    else headers.delete("Authorization");
    return fetch(input, {
      ...init,
      credentials: "same-origin",
      cache: "no-store",
      headers,
    });
  };
  const before = tokenCookie();
  let response = await send();
  if (response.status === 401) {
    await renew();
    if (tokenCookie() && tokenCookie() !== before) response = await send();
  }
  if (response.status === 401) throw new Error(ADMIN_SESSION_MESSAGE);
  return response;
}
export const ADMIN_SESSION_MESSAGE =
  "Sua sessão administrativa expirou ou não foi reconhecida. Saia e entre novamente no painel. Nenhuma alteração desta solicitação foi gravada.";
