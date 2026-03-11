import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get("better-auth.session_token")?.value;
  const isAuthenticated = !!sessionToken;

  const isAuthRoute = pathname.startsWith("/auth");

  const isExactPublic = pathname === "/" || pathname === "/inventory";

  const isViewingPublic =
    pathname.startsWith("/inventory/") &&
    !pathname.includes("/create") &&
    !pathname.includes("/update-inventory") &&
    !pathname.includes("/update-item") &&
    !pathname.includes("/profile");

  const isPublicRoute = isExactPublic || isViewingPublic || isAuthRoute;

  if (!isPublicRoute && !isAuthenticated) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
