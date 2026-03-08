import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get("better-auth.session_token")?.value;
  const isAuthenticated = !!sessionToken;

  // 1. Define Auth Routes (Crucial to prevent loops!)
  const isAuthRoute = pathname.startsWith("/auth");

  const isExactPublic = pathname === "/" || pathname === "/inventory";

  const isViewingPublic =
    pathname.startsWith("/inventory/") &&
    !pathname.includes("/create") &&
    !pathname.includes("/update-inventory") &&
    !pathname.includes("/update-item") &&
    !pathname.includes("/profile");

  // Add isAuthRoute here
  const isPublicRoute = isExactPublic || isViewingPublic || isAuthRoute;

  // 3. The Security Gate
  if (!isPublicRoute && !isAuthenticated) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Optimization: If user IS authenticated, don't let them go to /login
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// 5. The Matcher (Performance)
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
