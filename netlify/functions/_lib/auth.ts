import { getUser, verifyRequestOrigin } from "@netlify/identity";

interface SessionUser {
  id: string;
  email?: string;
  roles: string[];
}
const verifiedRequests = new WeakMap<Request, Promise<SessionUser | null>>();
export function getAdminSessionUser(
  request: Request,
): Promise<SessionUser | null> {
  const cached = verifiedRequests.get(request);
  if (cached) return cached;
  const verification = (async () => {
    const user = await getUser().catch(() => null);
    if (user)
      return { id: user.id, email: user.email, roles: user.roles ?? [] };
    // Compatibility for runtimes where Identity's request cookie context is absent.
    // The Identity API verifies the token; no locally decoded claims grant access.
    let token = request.headers
      .get("authorization")
      ?.match(/^Bearer (\S+)$/i)?.[1];
    if (!token) {
      const cookie = request.headers
        .get("cookie")
        ?.split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith("nf_jwt="))
        ?.slice(7);
      try {
        if (cookie) token = decodeURIComponent(cookie);
      } catch {
        return null;
      }
    }
    if (!token || token.length > 16384) return null;
    try {
      const identityUrl = new URL(
        "/.netlify/identity/user",
        process.env.URL || new URL(request.url).origin,
      );
      const response = await fetch(identityUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) return null;
      const verified = await response.json();
      if (typeof verified?.id !== "string") return null;
      return {
        id: verified.id,
        email: typeof verified.email === "string" ? verified.email : undefined,
        roles: Array.isArray(verified.app_metadata?.roles)
          ? verified.app_metadata.roles.filter(
              (role: unknown): role is string => typeof role === "string",
            )
          : [],
      };
    } catch {
      return null;
    }
  })();
  verifiedRequests.set(request, verification);
  return verification;
}

export async function requireAdmin(request: Request): Promise<Response | null> {
  const user = await getAdminSessionUser(request);
  if (!user)
    return Response.json({ error: "Não autenticado." }, { status: 401 });
  if (!user.roles?.includes("admin")) {
    return Response.json(
      { error: "Acesso restrito a administradores." },
      { status: 403 },
    );
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    try {
      verifyRequestOrigin(request);
    } catch {
      return Response.json(
        { error: "Origem da solicitação não autorizada." },
        { status: 403 },
      );
    }
  }
  return null;
}
