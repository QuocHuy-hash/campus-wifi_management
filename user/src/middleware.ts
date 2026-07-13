import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_KEY } from "@/constants/appKeys";

const PUBLIC_PATHS = ["/login", "/auth/success", "/api/"];

function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get(AUTH_COOKIE_KEY)?.value;
  return Boolean(token);
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasToken = isAuthenticated(request);

  // Allow public paths
  if (isPublicPath(pathname)) {
    // CRITICAL FIX: Only redirect /login -> /session if token exists AND pathname is exactly /login
    // This prevents redirect loop when interceptor redirects to /login with returnUrl
    if (pathname === "/login" && hasToken && !search.includes("returnUrl")) {
      const sessionUrl = new URL("/session", request.url);
      sessionUrl.search = search;
      return NextResponse.redirect(sessionUrl);
    }
    return NextResponse.next();
  }

  // Handle /guest/* catch-all: forward captive params to /login
  if (pathname.startsWith("/guest/")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.search = search;
    return NextResponse.redirect(loginUrl);
  }

  // Protected paths: require auth
  if (!hasToken) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("returnUrl", pathname + search);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Root path: redirect to /session if authenticated
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/session", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - _next/data (RSC data requests for client navigation)
     * - favicon.ico (favicon)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
