import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE_NAME = "govstay_admin_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isLoginPage = pathname === "/admin/login";

  // If user has a token and is visiting /admin/login, redirect to dashboard
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Allow access to /admin/login without a token
  if (isLoginPage) {
    return NextResponse.next();
  }

  // For all other /admin routes, require the token cookie
  if (!token) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
