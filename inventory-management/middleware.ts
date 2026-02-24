import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Route Configuration ──────────────────────────────────────────────────────

/**
 * Public paths that anyone (unauthenticated) may access.
 * Everything else is treated as private.
 */
const PUBLIC_PATHS = ["/auth/login", "/auth/register", "/auth/callback"];

/**
 * Paths that require the ADMIN role.
 * Access by a non-admin authenticated user redirects to /.
 */
const ADMIN_PATHS = ["/admin"];

// ─── Cookie helpers ───────────────────────────────────────────────────────────

/**
 * Extract the better-auth session token from the request cookies.
 * better-auth stores its session token in "better-auth.session_token".
 */
function getSessionToken(req: NextRequest): string | undefined {
  return (
    req.cookies.get("better-auth.session_token")?.value ??
    req.cookies.get("better-auth.session_token.0")?.value // chunked cookie fallback
  );
}

/**
 * Fast-path role check: we store a "x-user-role" cookie set by the backend
 * (see auth middleware) OR we can read it from the access-token cookie payload.
 *
 * For a lightweight edge check we decode the JWT without verification
 * (full verification is done on the server for every API call).
 * This is safe for UI gating — the server still rejects unauthorised requests.
 */
function getRoleFromCookies(req: NextRequest): string {
  const accessToken = req.cookies.get("accessToken")?.value;
  if (!accessToken) return "USER";

  try {
    // JWT is three base64url segments; we only need the payload (middle)
    const payloadBase64 = accessToken.split(".")[1];
    if (!payloadBase64) return "USER";

    const padded =
      payloadBase64 + "=".repeat((4 - (payloadBase64.length % 4)) % 4);
    const decoded = JSON.parse(
      Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(
        "utf-8",
      ),
    );
    return (decoded.role as string) ?? "USER";
  } catch {
    return "USER";
  }
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Static assets / Next internals — always allow
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Public paths — always allow
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 3. Check authentication (presence of session cookie is the fast gate)
  const sessionToken = getSessionToken(req);
  if (!sessionToken) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Role-based check for admin paths
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    const role = getRoleFromCookies(req);
    if (role !== "ADMIN") {
      const homeUrl = req.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.searchParams.set("error", "forbidden");
      return NextResponse.redirect(homeUrl);
    }
  }

  // 5. Authenticated & authorised — let the request through
  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths EXCEPT:
   *  - api routes      (handled by server)
   *  - _next/static    (static assets)
   *  - _next/image     (image optimisation)
   *  - favicon.ico
   */
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
